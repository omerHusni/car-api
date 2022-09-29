const db = require('../database/connection');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { deleteAll, getAll, getOne } = require('../controller/handlerFactory');

module.exports = {
  getAll: getAll('car'),
  deleteAll: deleteAll('car'),
  getOne: getOne('car'),
  create: catchAsync(async (req, res, next) => {
    const { body } = req;
    const { id } = req.user;
    const insertObj = {
      autoshow_id: id,
      brand: body.brand,
      model: body.model,
      type: body.type,
      model_year: body.model_year,
      price: body.price,
      trim: body.trim,
      engine_name: body.engine_name,
      engine_size: body.engine_size,
      pistons: body.pistons,
      horsepower: body.horsepower,
      torque: body.torque,
      millage: body.millage,
      gear_type: body.gear_type,
      fuel_type: body.fuel_type,
      changed_parts: body.changed_parts,
      seats_num: body.seats_num,
      seats_material: body.seats_material,
      plate_region: body.plate_region,
      built_for: body.built_for,
      about: body.about,
      created_by: id,
    };
    await db('car').insert(insertObj);
    res.status(201).json({
      status: 'success',
      massage: 'inserted',
      insertedData: insertObj,
    });
  }),
  soldCar: catchAsync(async (req, res, next) => {
    const autoshow_id = req.user.id;
    const car_id = req.params.id;
    const data = await db('car')
      .where('autoshow_id', autoshow_id)
      .andWhere('id', car_id)
      .update({ available: 0, sold_at: db.fn.now() })
      .select();
    if (!data) return next(new AppError('No car found!'));
    res.status(200).json({ status: 'success', massage: 'car marked as sold' });
  }),
  updateCar: catchAsync(async (req, res, next) => {
    const car_id = req.params.id;
    const { id } = req.user;
    const { body } = req;
    const updateObj = { ...body, updated_at: db.fn.now(), updated_by: id };
    const data = await db('car')
      .update(updateObj)
      .where('id', car_id)
      .andWhere('autoshow_id', id);
    if (!data) return next(new AppError('Car not updated! or not found'));
    res.status(200).json({ status: 'success', massage: 'updated' });
  }),
  getPhoneNumber: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await db('car').select().where('id', id).first();
    const phoneNumbers = await db('autoshow_phone_num')
      .select('phone_num')
      .where('autoshow_id', data.autoshow_id);
    res.status(200).json({ status: 'success', phoneNumbers });
  }),
  deleteCar: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await db('car')
      .where('id', id)
      .andWhere('deleted', '!=', 1)
      .update({ deleted: 1, updated_at: db.fn.now(), updated_by: req.user.id });
    if (!data)
      return next(
        new AppError(`No car found with that id or it's already deleted`, 404)
      );
    res.status(200).json({ status: 'success', massage: 'deleted' });
  }),
};
