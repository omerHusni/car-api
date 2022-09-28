const express = require('express');
const user = require('./userRoute');
const autoshow = require('./autoshowRoute');
const userAuthUser = require('./userAuthRoute');
const autoshowAuth = require('./autoshowAuthRoute');
const autoshowPhoneNum = require('./autoshowPhoneNumRoute');
const car = require('./carRoute');

const router = express.Router();

router.use('/user', user);
router.use('/authUser', userAuthUser);
router.use('/autoshow', autoshow);
router.use('/autoshowAuth', autoshowAuth);
router.use('/autoshowPhoneNumber', autoshowPhoneNum);
router.use('/car', car);

module.exports = router;
