const db = require("../database/connection");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");
// const multer = require('multer');
// const sharp = require('sharp');
// const multerStorage = multer.memoryStorage();

const {
  getAll,
  getOne,
  deleteAll,
  deleteOne,
  activate,
  deactivate,
} = require("./handlerFactory");

module.exports = {
  // getAll: getAll('autoshow'),
  getOne: getOne("autoshow"),
  deleteAll: deleteAll("autoshow"),
  deleteOne: deleteOne("autoshow"),
  deactivate: deactivate("autoshow"),
  activate: activate("autoshow"),
  getAll: catchAsync(async (req, res, next) => {
    // const phoneNum = await knex.raw('');
    const users = await db("autoshow").select().where("deleted", "!=", 1);
    res.status(200).json({
      status: "success",
      length: users.length,
      users,
    });
  }),
  createOne: catchAsync(async (req, res, next) => {
    const { body } = req;
    const insertObj = {
      name: body.name,
      username: body.username,
      password: await bcrypt.hash(body.password, 12),
      email: body.email,
      longitude: body.longitude,
      latitude: body.latitude,
      open_at: body.open_at,
      close_at: body.close_at,
      day_open: body.day_open,
      day_close: body.day_close,
      about: body.about,
      created_at: db.fn.now(),
      deleted: 0,
    };
    await db("autoshow").insert(insertObj);
    res.status(201).json({
      status: "success",
      message: "created",
    });
  }),
};
