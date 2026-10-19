const { pool } = require('../config/database');

/**
 * Database Explorer Controller
 * Allows developer to view all records in MySQL tables directly from UI
 */
async function getDatabaseTables(req, res) {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    const stats = {};
    for (const name of tableNames) {
      const [countResult] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${name}\``);
      stats[name] = countResult[0]?.cnt || 0;
    }

    res.json({
      success: true,
      database: 'codesense_db',
      tables: tableNames,
      counts: stats
    });
  } catch (err) {
    res.status(500).json({ error: 'Database Error', message: err.message });
  }
}

async function getTableData(req, res) {
  try {
    const { table } = req.params;
    const allowedTables = ['analyses', 'issues', 'users', 'reports', 'analysis_runs'];

    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid Table', message: 'Table not allowed or does not exist.' });
    }

    const [columns] = await pool.query(`DESCRIBE \`${table}\``);
    const [rows] = await pool.query(`SELECT * FROM \`${table}\` ORDER BY 1 DESC LIMIT 100`);

    res.json({
      success: true,
      table,
      columns: columns.map(c => ({ name: c.Field, type: c.Type })),
      rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Database Error', message: err.message });
  }
}

module.exports = {
  getDatabaseTables,
  getTableData
};
