/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = knex => knex.schema.createTable('tasks', table => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.boolean('isComplete').defaultTo(false);
    table.integer('userId').references('id').inTable('users');
  });

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
