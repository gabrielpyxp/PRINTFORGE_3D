const { Pool } = require('pg');
const { config } = require('../config/env');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000
});

pool.on('error', (error) => {
  // Evita que uma conexão ociosa derrube o processo sem registrar a causa.
  console.error('Erro inesperado no pool PostgreSQL:', error.message);
});

function query(text, params) {
  return pool.query(text, params);
}

async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
