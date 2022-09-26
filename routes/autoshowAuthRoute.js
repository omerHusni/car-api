const express = require('express');

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controller/autoshowAuthController');
const { protect } = require('../controller/autoshowAuthController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);

module.exports = router;
