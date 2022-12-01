const db = require('../database/connection');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const multerStorage = multer.memoryStorage();
const bcrypt = require('bcrypt');

const { getAll } = require('./handlerFactory');

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) return cb(null, true);

  cb(new AppError('Please select an image', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
module.exports = {
  createOne: catchAsync(async (req, res) => {
    const { body } = req;
    const insertObj = {
      name: body.name,
      username: body.username,
      img: body.img,
      password: await bcrypt.hash(body.password, 12),
      email: body.email,
      phone_num: body.phone_num,
      role: body.role,
      created_at: db.fn.now(),
    };

    const data = await db('user').insert(insertObj);
    res.status(200).json({
      msg: 'success',
      data,
    });
  }),
  getAll: getAll('user'),
  getAllDeleted: catchAsync(async (req, res, next) => {
    const data = await db('user').select().where({ deleted: 1 });
    res.status(204).json({ msg: 'success', dataNum: data.length, data });
    // next();
  }),
  deleteAll: catchAsync(async (req, res) => {
    await db('user').where('role', 'user').del();
    res.status(204).json({ status: 'success', massage: 'deleted' });
  }),
  deleteOne: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await db('user')
      .where('id', id)
      .andWhere('deleted', 0)
      .update('deleted', 1);
    if (!user) {
      return next(new AppError(`There is no active user with that id`, 400));
    }
    res.status(204).json({ status: 'success', massage: 'Account deleted' });
  }),
  activateOne: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await db('user')
      .select()
      .where('id', id)
      .andWhere('deleted', 1)
      .update('deleted', 0);
    if (!user) {
      return next(new AppError(`There is no deleted user with that id`, 400));
    }
    res.status(200).json({ status: 'success', massage: 'Account activated' });
  }),
  updateMe: catchAsync(async (req, res, next) => {
    const filteredBody = filteredObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;
    const { body } = req;
    const updateObj = {
      name: body.name,
      email: body.email,
      phone_num: body.phone_num,
      img: filteredBody.photo,
    };
    if (!updateObj) {
      return next(new AppError('please provide info to be updated', 400));
    }
    await db('user').update(updateObj).where('id', req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'user updated successfully',
    });
    next();
  }),
  uploadPhoto: upload.single('photo'),
  resizeUserPhoto: catchAsync(async (req, file, next) => {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`public/img/users/${req.file.filename}`);
    next();
  }),
  getUserById: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const user = await db('user')
      .select()
      .where('id', id)
      .andWhere({ deleted: 0 })
      .first();

    if (!user) return next(new AppError('There is no user with that id', 400));
    res.status(200).json({
      status: 'success',
      user,
    });
  }),
  userActivity: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { path } = req._parsedOriginalUrl;
    const { method } = req;

    const insertObj = {
      user_id: id,
      activity: path,
      method: method,
      created_at: db.fn.now(),
    };

    await db('user_activity_logger').insert(insertObj);

    next();
  }),
  getUserActivity: catchAsync(async (req, res, next) => {
    const { id } = req.query;
    const data = await db('user_activity_logger')
      .select()
      .where('user_id', id)
      .orderBy('created_at', 'desc');
    res.status(200).json({
      status: 'success',
      data,
    });
  }),
};
