const express = require('express');

const { create, deleteAll, getAll } = require('../controller/carController');
const { protect } = require('../controller/autoshowAuthController');

const router = express.Router();

router.post('/create', protect, create);
router.delete('/deleteAll', deleteAll);
router.get('/getAll', getAll);

module.exports = router;
