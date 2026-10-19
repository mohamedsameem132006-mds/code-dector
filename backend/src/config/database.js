const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool(config.db);

// Helper to test connectivity
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[DB] Connected to MySQL database successfully:', config.db.database);
    connection.release();
    return true;
  } catch (error) {
    console.error('[DB ERROR] Failed to connect to MySQL:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
