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
    return knex.schema
        .createTableIfNotExists('board_columns', (table) => {
            appendCommonColumns(knex, table);
            table.text('column_title').notNullable();
            table.integer('board_id').notNullable();
            table.tinyint('column_order_index').notNullable().defaultTo('1');
        })
        .createTableIfNotExists('board_members', (table) => {
            appendCommonColumns(knex, table);
            table.integer('user_id').notNullable();
            table.integer('board_id').notNullable();
        })
        .createTableIfNotExists('boards', (table) => {
            appendCommonColumns(knex, table);
            table.text('board_title').notNullable();
            table.boolean('is_private').defaultTo(false).notNullable();
            table.integer('created_by_user_id').notNullable();
            table.text('cover_url');
            table.text('description');
        })
        .createTableIfNotExists('card', (table) => {
            appendCommonColumns(knex, table);
            table.text('card_name').notNullable();
            table.integer('column_id').notNullable();
            table.integer('board_id').notNullable();
            table.text('card_description');
            table.text('cover_image_url');
            table.tinyint('column_order').notNullable().defaultTo('1');
        })
        .createTableIfNotExists('card_attachments', (table) => {
            appendCommonColumns(knex, table);
            table.integer('user_id');
            table.integer('card_id').notNullable();
            table.text('attachment_url');
            table.string('attachment_type', 100);
            table.text('attachment_title').notNullable();
        })
        .createTableIfNotExists('card_comments', (table) => {
            appendCommonColumns(knex, table);
            table.integer('user_id').notNullable();
            table.integer('card_id').notNullable();
            table.text('comment').notNullable();
        })
        .createTableIfNotExists('card_labels', (table) => {
            appendCommonColumns(knex, table);
            table.integer('card_id').notNullable();
            table.text('label_name').notNullable();
            table.string('label_color', 100).notNullable();
        })
        .createTableIfNotExists('card_members', (table) => {
            appendCommonColumns(knex, table);
            table.integer('user_id').notNullable();
            table.integer('card_id').notNullable();
        })
        .createTableIfNotExists('users', (table) => {
            appendCommonColumns(knex, table);
            table.string('name', 500).notNullable();
            table.text('image_url');
            table.text('password').notNullable();
            table.text('email').notNullable();
        });
};

/**
 *
 * @param {Knex} knex
 * @returns
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('board_columns')
        .dropTableIfExists('board_members')
        .dropTableIfExists('boards')
        .dropTableIfExists('card')
        .dropTableIfExists('card_attachments')
        .dropTableIfExists('card_comments')
        .dropTableIfExists('card_labels')
        .dropTableIfExists('card_members')
        .dropTableIfExists('users');
};
