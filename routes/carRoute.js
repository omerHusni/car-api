const express = require('express');

const {
  create,
  deleteAll,
  getAll,
  getOne,
  soldCar,
  updateCar,
  getPhoneNumber,
  deleteCar,
} = require('../controller/carController');
const { protect } = require('../controller/autoshowAuthController');

const router = express.Router();

router.post('/create', protect, create);
router.get('/getAll', getAll);
router.get('/getOne/:id', getOne);
router.get('/getPhoneNumber/:id', getPhoneNumber);
router.patch('/soldCar/:id', protect, soldCar);
router.patch('/updateCar/:id', protect, updateCar);
router.patch('/deleteCar/:id', protect, deleteCar);
router.delete('/deleteAll', deleteAll);

module.exports = router;
