const express = require('express');
const {
  signup,
  login,
  protect,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  deleteMe,
} = require('../controller/userAuthController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);
router.patch('/deactivate', protect, deleteMe);
module.exports = router;
