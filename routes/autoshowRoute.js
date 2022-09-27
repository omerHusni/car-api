const express = require('express');

const {
  createOne,
  deleteAll,
  getAll,
  getOne,
  deactivate,
  activate,
  setLocation,
  setWorkingHours,
  setWorkingDays,
  setAbout,
} = require('../controller/autoshowController');
const { protect } = require('../controller/autoshowAuthController');

const router = express.Router();

router.get('/getAll', getAll);
router.get('/getOne/:id', getOne);
router.post('/create', createOne);
router.delete('/deleteAll', deleteAll);
router.patch('/deactivate', protect, deactivate);
router.patch('/activate', protect, activate);
router.patch('/setLocation', protect, setLocation);
router.patch('/setWorkingHours', protect, setWorkingHours);
router.patch('/setWorkingDays', protect, setWorkingDays);
router.patch('/setAbout', protect, setAbout);

module.exports = router;
