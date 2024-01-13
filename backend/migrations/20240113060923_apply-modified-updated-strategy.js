const { Knex } = require('knex');
const TABLE_NAMES = require('./_table_names');

function updateColumnModifiedQuery(tablename) {
    return `ALTER TABLE ${tablename} MODIFY COLUMN modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`;
}

async function executeQueryForPostgres(knex) {
    await knex.raw(`
        CREATE OR REPLACE FUNCTION update_changetimestamp_column()
        RETURNS TRIGGER AS $$
        BEGIN
           NEW.modified = now(); 
           RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_ab_changetimestamp BEFORE UPDATE
        ON ab FOR EACH ROW EXECUTE PROCEDURE 
        update_changetimestamp_column()
        `);
}

async function executeQueryForMySQL(knex) {
    for (let i = 0; i < TABLE_NAMES.length; i += 1) {
        await knex.raw(updateColumnModifiedQuery(TABLE_NAMES[i]));
    }
}

/**
 *
 * @param {Knex} knex
 */
exports.up = async function (knex) {
    if (process.env.DATABASE_CLIENT === 'pg') {
        await executeQueryForPostgres(knex);
    } else {
        await executeQueryForMySQL(knex);
    }
    return null;
};

exports.down = function (knex) { };
