const { Knex } = require('knex');

function appendCommonColumns(knex, table) {
    table.dateTime('created').defaultTo(knex.fn.now());
    table.dateTime('modified').defaultTo(knex.fn.now());
    table.increments('id', { primaryKey: true }).notNullable();
}

/**
 *
 * @param {Knex} knex
 */
exports.up = function (knex) {
    return knex.schema.createTableIfNotExists(
        'forgot_password_tokens',
        (table) => {
            appendCommonColumns(knex, table);
            table.text('token').notNullable();
            table.integer('user_id').notNullable();
            table.boolean('is_used').defaultTo(false).notNullable();
        },
    );
};

/**

 *

 * @param {Knex} knex

 */

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('forgot_password_tokens');
};
