const BaseDb = require('../util/BaseDB');

const database = new BaseDb('db', 'mysql2');

module.exports = database;