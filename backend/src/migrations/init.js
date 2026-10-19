const { pool } = require('../config/database');

const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) DEFAULT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_firebase_uid (firebase_uid),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analyses (
  id VARCHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  detected_language VARCHAR(50) NOT NULL,
  language_confidence FLOAT DEFAULT 1.0,
  original_source MEDIUMTEXT NOT NULL,
  corrected_source MEDIUMTEXT DEFAULT NULL,
  analysis_summary TEXT DEFAULT NULL,
  teaching_notes_en MEDIUMTEXT DEFAULT NULL,
  teaching_notes_ta MEDIUMTEXT DEFAULT NULL,
  status ENUM('pending', 'analyzed', 'failed') NOT NULL DEFAULT 'pending',
  quality_score INT DEFAULT NULL,
  metrics_json JSON DEFAULT NULL,
  verification_status ENUM('unverified', 'syntax_checked', 'sandbox_passed', 'sandbox_failed') DEFAULT 'unverified',
  execution_output MEDIUMTEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_analyses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_analyses_user_id (user_id),
  INDEX idx_analyses_language (detected_language),
  INDEX idx_analyses_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analysis_id VARCHAR(64) NOT NULL,
  category ENUM('syntax', 'type', 'logic', 'runtime', 'security', 'style', 'performance') NOT NULL,
  severity ENUM('critical', 'error', 'warning', 'info') NOT NULL,
  line_number INT DEFAULT NULL,
  column_number INT DEFAULT NULL,
  message VARCHAR(500) NOT NULL,
  explanation_en TEXT NOT NULL,
  explanation_ta TEXT DEFAULT NULL,
  suggested_fix TEXT DEFAULT NULL,
  affected_code TEXT DEFAULT NULL,
  verification_status ENUM('confirmed_tool', 'ai_suggestion', 'uncertain') NOT NULL DEFAULT 'ai_suggestion',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_issues_analysis FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE,
  INDEX idx_issues_analysis_id (analysis_id),
  INDEX idx_issues_severity (severity),
  INDEX idx_issues_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(64) PRIMARY KEY,
  analysis_id VARCHAR(64) NOT NULL,
  user_id INT NOT NULL,
  report_language ENUM('en', 'ta') NOT NULL DEFAULT 'en',
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_analysis FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_reports_analysis_id (analysis_id),
  INDEX idx_reports_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analysis_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analysis_id VARCHAR(64) NOT NULL,
  execution_environment VARCHAR(100) NOT NULL,
  exit_code INT DEFAULT NULL,
  stdout_output MEDIUMTEXT DEFAULT NULL,
  stderr_output MEDIUMTEXT DEFAULT NULL,
  execution_time_ms INT DEFAULT NULL,
  status ENUM('success', 'failed', 'timeout', 'disabled') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_runs_analysis FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE,
  INDEX idx_runs_analysis_id (analysis_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function runMigrations() {
  console.log('[MIGRATIONS] Executing MySQL database migrations...');
  const statements = MIGRATION_SQL.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const sql of statements) {
    try {
      await pool.query(sql);
    } catch (err) {
      console.error('[MIGRATIONS ERROR]', err.message, 'in statement:', sql.substring(0, 50));
      throw err;
    }
  }
  console.log('[MIGRATIONS] Database migrations completed successfully!');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runMigrations, MIGRATION_SQL };
