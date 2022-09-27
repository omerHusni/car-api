const db = require('../database/connection');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
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
} = require('./handlerFactory');

module.exports = {
  getAll: getAll('autoshow'),
  getOne: getOne('autoshow'),
  deleteAll: deleteAll('autoshow'),
  deleteOne: deleteOne('autoshow'),
  deactivate: deactivate('autoshow'),
  activate: activate('autoshow'),
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
    await db('autoshow').insert(insertObj);
    res.status(201).json({
      status: 'success',
      message: 'created',
    });
  }),
  setLocation: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { body } = req;
    const updateObj = {
      longitude: body.longitude,
      latitude: body.latitude,
    };
    if (!updateObj.longitude || !updateObj.latitude)
      return next(new AppError('please provide your location', 404));
    await db('autoshow').update(updateObj).where('id', id);
    res.status(200).json({ status: 'success', massage: 'inserted', updateObj });
  }),
  setWorkingHours: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { body } = req;
    const updateObj = {
      open_at: body.open_at,
      close_at: body.close_at,
    };
    if (!updateObj.open_at || !updateObj.close_at)
      return next(new AppError('please provide autoshow working hours', 404));
    await db('autoshow').where('id', id).update(updateObj);
    res.status(200).json({ status: 'success', massage: 'inserted', updateObj });
  }),
  setWorkingDays: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { body } = req;
    const updateObj = {
      day_open: body.day_open,
      day_close: body.day_close,
    };
    if (!updateObj.day_open || !updateObj.day_close)
      return next(new AppError('please provide autoshow working days', 404));
    await db('autoshow').where('id', id).update(updateObj);
    res.status(200).json({ status: 'success', massage: 'inserted', updateObj });
  }),
  setAbout: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { about } = req.body;
    if (!about)
      return next(new AppError('please provide an about section', 404));
    await db('autoshow').where('id', id).update('about', about);
    res.status(200).json({ status: 'success', massage: 'inserted', about });
  }),
};
