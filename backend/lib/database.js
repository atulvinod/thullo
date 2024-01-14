const BaseDb = require('../util/BaseDB');

const database = new BaseDb('db', String(process.env.DATABASE_CLIENT || 'mysql2'));

module.exports = database;