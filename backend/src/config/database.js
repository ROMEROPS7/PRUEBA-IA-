const knex = require('knex');
const { logger } = require('../utils/logger');

const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'siniestrosai',
    user: process.env.DB_USER || 'siniestrosai_admin',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000
  },
  migrations: {
    directory: __dirname + '/../database/migrations'
  },
  seeds: {
    directory: __dirname + '/../database/seeds'
  }
};

const db = knex(config);

// Log de queries lentas en desarrollo
if (process.env.NODE_ENV === 'development') {
  db.on('query', (query) => {
    if (query.sql) {
      logger.debug(`SQL: ${query.sql.substring(0, 200)}`);
    }
  });
}

module.exports = db;
