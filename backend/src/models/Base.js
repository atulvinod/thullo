const database = require('../../lib/database');

class Base {
    constructor(logger) {
        this.logger = logger;
    }

    getSlaveDatabase() {
        return database.slave(this.logger);
    }

    getMasterDatabase() {
        return database.master(this.logger);
    }

    getRawDatabase() {
        return database;
    }

    async insertToDb(table_name, object) {
        const [id] = await this.getMasterDatabase()
            .table(table_name)
            .insert(object)
            .returning('id');
        if (typeof id === 'object') {
            return id.id;
        }
        return id;
    }
}

module.exports = Base;
