const express = require('express');

const {
  addPhoneNumber,
  getPhoneNumber,
  deletePhoneNumber,
} = require('../controller/autoshowPhoneNumController');
const { protect } = require('../controller/autoshowAuthController');

const router = express.Router();

router.post('/addPhoneNumber', protect, addPhoneNumber);
router.patch('/deletePhoneNumber', protect, deletePhoneNumber);
router.get('/getPhoneNumber/:id', getPhoneNumber);
module.exports = router;
