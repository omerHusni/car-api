const express = require('express');

const {
  createOne,
  deleteAll,
  getAll,
  getOne,
  deactivate,
  activate,
} = require('../controller/autoshowController');
const { protect } = require('../controller/autoshowAuthController');

const router = express.Router();

router.get('/getAll', getAll);
router.get('/getOne/:id', getOne);
router.post('/create', createOne);
router.delete('/deleteAll', deleteAll);
router.patch('/deactivate', protect, deactivate);
router.patch('/activate', protect, activate);
module.exports = router;
