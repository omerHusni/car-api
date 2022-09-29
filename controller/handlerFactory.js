const db = require('../database/connection');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');

const confirmPassword = async (password, id, model) => {
  const user = await db(model).select().where('id', id).first();
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return 0;
  } else return 1;
};
module.exports = {
  getAll: (model) =>
    catchAsync(async (req, res, next) => {
      const data = await db(model).select().where('deleted', '!=', 1);
      res.status(200).json({
        status: 'success',
        length: data.length,
        data,
      });
    }),
  getOne: (model) =>
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const data = await db(model)
        .select()
        .where('id', id)
        .andWhere('deleted', '!=', 1)
        .first();
      if (!data) return next(new AppError('No data found with that id', 404));
      res.status(200).json({
        status: 'success',
        data,
      });
    }),
  deleteAll: (model) =>
    catchAsync(async (req, res, next) => {
      await db(model).del();
      res.status(204).json({ status: 'success', massage: 'deleted' });
    }),
  deleteOne: (model) =>
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const user = await db(model).select().where('id', id).first().del();
      if (!user) return next(new AppError('This user does not exist', 400));
      res.status(204).json({ status: 'success', massage: 'deleted' });
    }),
  deactivate: (model) =>
    catchAsync(async (req, res, next) => {
      const { id } = req.user;
      const { password } = req.body;
      if (!confirmPassword(password, id, model))
        return next(new AppError('Incorrect password', 400));
      const user = await db(model)
        .update({
          deleted: 1,
          updated_at: db.fn.now(),
          updated_by: req.user.id,
        })
        .where('id', req.user.id)
        .andWhere('deleted', 0);
      if (!user)
        return next(
          new AppError(
            'This user is already deactivated or does not exist',
            400
          )
        );
      res.status(200).json({
        status: 'success',
        message: 'deleted',
        user,
      });
    }),
  activate: (model) =>
    catchAsync(async (req, res, next) => {
      const { id } = req.user;
      const { password } = req.body;
      if (!confirmPassword(password, id, model))
        return next(new AppError('Incorrect password', 400));
      const user = await db(model)
        .where('id', id)
        .andWhere('deleted', 1)
        .update({
          deleted: 0,
          updated_at: db.fn.now(),
          updated_by: req.user.id,
        });
      if (!user)
        return next(
          new AppError('This user is already activated or does not exist', 400)
        );
      res.status(200).json({
        status: 'success',
        massage: 'activated',
        user,
      });
    }),
};
