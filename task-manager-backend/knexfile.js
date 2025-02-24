// knexfile.js
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres', // use your pgAdmin username
      password: process.env.DB_PASSWORD || 'mohi49',
      database: process.env.DB_NAME || 'taskmanager',
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    }
  }
};