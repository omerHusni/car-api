// const sha1 = require('sha1');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const db = require("../database/connection");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

const changedPasswordAfter = (JWTTimestamp, passwordChangedAt) => {
  if (passwordChangedAt) {
    const changedTimeStamp = passwordChangedAt / 1000;
    return JWTTimestamp < changedTimeStamp;
  }
  // False means not changed
  return false;
};

const createResetToken = (resetToken) => {
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // const passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return [passwordResetToken];
};

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
  });
};

module.exports = {
  signup: catchAsync(async (req, res) => {
    const { body } = req;
    const insertObj = {
      name: body.name,
      username: body.username,
      password: await bcrypt.hash(body.password, 12),
      email: body.email,
      phone_num: body.phone_num,
      created_at: db.fn.now(),
    };
    const newUser = await db("user").insert(insertObj);
    // const newUser = await db('user')
    //   .select('id')
    //   .where('username', body.username)
    //   .first();
    createSendToken(newUser, 201, res);
  }),
  login: catchAsync(async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return next(new AppError(`Please provide a username and password`, 400));
    }

    const user = await db("user").select().where("username", username).first();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError(`Username or Password is incorrect`, 400));
    }

    createSendToken(user, 200, res);
  }),
  logout: (req, res) => {
    res.cookie("jwt", "loggedOut", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: "success" });
  },
  protect: catchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token || token === "null" || jwt.verify === "jwt malformed")
      return next(
        new AppError(`You're not login, please login to access`, 401)
      );
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await db("user").where("id", decoded.id).first();

    if (!user || !user.id) {
      return next(new AppError(`This user does not exist`, 401));
    }

    const passwordChanged = await db("user")
      .select("password_changed_at")
      .where("id", user.id)
      .first();

    if (changedPasswordAfter(decoded.iat, passwordChanged.password_changed_at))
      return next(new AppError(`The password is changed. Try again`, 401));

    req.user = user;
    res.locals.user = user;
    next();
  }),
  restrictTo:
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError(`You do not have permission to perform this action`, 403)
        );
      }
      next();
    },
  forgotPassword: catchAsync(async (req, res, next) => {
    const user = await db("user")
      .select()
      .where("email", req.body.email)
      .first();

    if (!user || user.length === 0) {
      return next(
        new AppError(`No user found with email ${req.body.email}`, 401)
      );
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const [passwordResetToken] = createResetToken(resetToken);
    // console.log(passwordResetToken);

    await db("user")
      .update({
        password_reset_token: passwordResetToken,
        password_reset_expires: Date.now() + 10 * 60000,
      })
      .where("id", user.id);

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetpassword/${user.email}/${resetToken}`;

    const message = `Forgot your password ? please submit a patch request to ${resetURL} with your new password.`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Your password reset token is available for 10 minutes.`,
        message,
      });
      res.status(200).json({
        status: "success",
        message: `token sent to email`,
      });
    } catch (err) {
      return next(
        new AppError(
          `There was an error in sending the reset token, please try again later`,
          500
        )
      );
    }
  }),
  resetPassword: catchAsync(async (req, res, next) => {
    const password = await bcrypt.hash(req.body.password, 12);

    if (!password) {
      return next(new AppError("Please provide a password", 400));
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await db("user")
      .select()
      .where("password_reset_token", hashedToken)
      .andWhere("password_reset_expires", ">", Date.now())
      .first();

    if (!user) {
      return next(new AppError("Token is invalid or expired", 400));
    }

    await db("user")
      .where("id", user.id)
      .update({ password: password, password_changed_at: db.fn.now() });
    createSendToken(user, 200, res);
  }),

  updatePassword: catchAsync(async (req, res, next) => {
    let { password, newPassword } = req.body;
    const user = await db("user").where("id", req.user.id).first();
    if (
      !user ||
      !(await bcrypt.compare(password, user.password)) ||
      !newPassword
    ) {
      return next(
        new AppError(`Password is incorrect or provide a new password`, 400)
      );
    }
    newPassword = await bcrypt.hash(newPassword, 12);
    await db("user")
      .where("id", user.id)
      .update({ password: newPassword, password_changed_at: db.fn.now() });
    createSendToken(user, 200, res);
  }),
  deleteMe: catchAsync(async (req, res, next) => {
    await db("user").update("deleted", 1).where("id", req.user.id);
    console.log(req.user.id);
    res.status(200).json({
      status: "success",
      message: "deleted",
    });
  }),
};
// const userActivity = catchAsync(async (userId, username, item, method) => {
//   const comment = `user ${username} ${method} ${item}`;
//   const insertObj = {
//     userId: userId,
//     activity: comment,
//   };
//   await db('userActivityLogger').insert(insertObj);
// });
