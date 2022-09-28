const db = require('../database/connection');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { deleteAll, getAll } = require('../controller/handlerFactory');

module.exports = {
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
  deleteAll: deleteAll('car'),
  getAll: getAll('car'),
};
