const express = require('express');
const {
  getAll,
  createOne,
  deleteAll,
  updateMe,
  uploadPhoto,
  resizeUserPhoto,
  getUserById,
  getAllDeleted,
  deleteOne,
  activateOne,
  userActivity,
  getUserActivity,
} = require('../controller/userController');
const { protect, restrictTo } = require('../controller/userAuthController');

const router = express.Router();

router.get('/getAll', protect, userActivity, getAll);
router.get('/getAllDeleted', protect, getAllDeleted);
router.post('/create', protect, restrictTo('admin'), createOne);
router.delete('/deleteAll', protect, restrictTo('admin'), deleteAll);
router.patch('/updateMe', protect, uploadPhoto, resizeUserPhoto, updateMe);
router.get('/getUserActivity', protect, getUserActivity);
router.get('/getUserById/:id', getUserById);
router.patch('/deleteOne/:id', deleteOne);
router.patch('/activateOne/:id', activateOne);
// router.patch('/uploadPhoto', protect, uploadPhoto, resizeUserPhoto, updateMe);
module.exports = router;
