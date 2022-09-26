const db = require('knex');

const conf = require('./knexfile');

module.exports = db(conf.production);
