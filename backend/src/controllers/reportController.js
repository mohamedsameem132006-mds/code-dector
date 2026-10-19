const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');

/**
 * Reports Controller
 * Securely handles report listing and file download with ownership verification
 */

// GET /api/reports/:id/download
async function downloadReport(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM reports WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Report not found or unauthorized' });
    }

    const report = rows[0];
    const filePath = path.resolve(report.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File Missing', message: 'The report file has expired or was removed' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.file_name}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
}

// GET /api/reports
async function listUserReports(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT r.id, r.analysis_id, r.report_language, r.file_name, r.created_at,
              a.detected_language, a.quality_score
       FROM reports r
       JOIN analyses a ON r.analysis_id = a.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
}

module.exports = {
  downloadReport,
  listUserReports
};
