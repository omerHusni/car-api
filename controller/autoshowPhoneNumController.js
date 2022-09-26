const db = require('../database/connection');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

module.exports = {
  addPhoneNumber: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { phone_num } = req.body;
    if (
      !phone_num ||
      !(await db('autoshow').select().where('id', id).first())
    ) {
      return next(
        new AppError(
          'this user does not belong to an autoshow ,or please provide a valid phone number'
        ),
        400
      );
    }
    const insertObj = {
      autoshow_id: id,
      phone_num: phone_num,
    };
    await db('autoshow_phone_num').insert(insertObj);
    res
      .status(201)
      .json({ status: 'success', massage: 'Number added', insertObj });
  }),
  getPhoneNumber: catchAsync(async (req, res, next) => {
    const autoshow_id = req.params.id;
    const phone_num = await db('autoshow_phone_num')
      .select()
      .where('autoshow_id', '=', autoshow_id)
      .andWhere('deleted', '!=', 1);
    if (!phone_num || phone_num.length === 0)
      return next(new AppError('there is no phone number with that id'), 404);
    res.status(200).json({
      status: 'success',
      phone_num,
    });
  }),
  deletePhoneNumber: catchAsync(async (req, res, next) => {
    const { id } = req.user;
    const { phoneNumberId } = req.body;
    const result = await db('autoshow_phone_num')
      .update('deleted', 1)
      .where('id', phoneNumberId)
      .andWhere('autoshow_id', id)
      .andWhere('deleted', '!=', 1);
    if (!result) return next(new AppError('the number was not found', 404));
    res.status(200).json({
      status: 'success',
      message: 'deleted',
    });
  }),
};
