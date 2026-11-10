const { Pool } = require('pg');
const { config } = require('./config');

const pool = new Pool({
  ...(config.databaseUrl
    ? { connectionString: config.databaseUrl }
    : {
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
        user: config.postgres.user,
        password: config.postgres.password
      }),
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ...(config.postgres.ssl ? { ssl: { rejectUnauthorized: true } } : {})
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function connectDatabase({ maxAttempts = 5, retryDelayMs = 5000 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await pool.query('SELECT 1 AS connected');
      if (result.rows[0]?.connected !== 1) {
        throw new Error('PostgreSQL health check returned an unexpected result.');
      }
      console.log('Connected to PostgreSQL successfully.');
      return;
    } catch (error) {
      console.error(`PostgreSQL connection attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
      if (attempt === maxAttempts) {
        throw error;
      }
      await delay(retryDelayMs);
    }
  }
}

module.exports = { pool, connectDatabase };
