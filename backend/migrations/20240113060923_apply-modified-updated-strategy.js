const { Knex } = require('knex');
const TABLE_NAMES = require('./_table_names');

function updateColumnModifiedQuery(tablename, db_client = 'mysql') {
    if (db_client === 'pg') {
        return `
            CREATE TRIGGER update_${tablename}_changetimestamp 
            BEFORE UPDATE ON ${tablename} 
            FOR EACH ROW EXECUTE PROCEDURE update_changetimestamp_column()
        `;
    }
    return `ALTER TABLE ${tablename} MODIFY COLUMN modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`;
}

async function executeTableLevelChanges(knex) {
    for (let i = 0; i < TABLE_NAMES.length; i += 1) {
        await knex.raw(
            updateColumnModifiedQuery(
                TABLE_NAMES[i],
                process.env.DATABASE_CLIENT,
            ),
        );
    }
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
        `);
    await executeTableLevelChanges(knex);
}

async function executeQueryForMySQL(knex) {
    await executeTableLevelChanges(knex);
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
