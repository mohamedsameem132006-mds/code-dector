const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const { pool } = require('../config/database');
const { detectLanguage, SUPPORTED_LANGUAGES } = require('../utils/languageDetector');
const { calculateQualityMetrics } = require('../utils/metricsCalculator');
const { analyzeCode } = require('../services/aiService');
const { runInSandbox } = require('../services/sandboxService');
const { generateAnalysisReport } = require('../services/pdfService');

/**
 * Analyses Controller
 * Handles analysis creation, listing, detail retrieval, deletion, validation, and PDF export
 */

// POST /api/analyses
async function createAnalysis(req, res) {
  try {
    const { code, filename, manualLanguage, explanationLanguage = 'en' } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Source code is required' });
    }

    if (code.length > 300000) { // ~300KB limit
      return res.status(413).json({ error: 'Payload Too Large', message: 'Submitted code exceeds 300KB size limit' });
    }

    // Language detection
    const detected = detectLanguage(code, filename);
    const chosenLanguage = manualLanguage && SUPPORTED_LANGUAGES.includes(manualLanguage.toLowerCase())
      ? manualLanguage.toLowerCase()
      : detected.language;

    const analysisId = uuidv4();
    const userId = req.user.id;

    // AI Analysis Execution
    let aiResult;
    try {
      aiResult = await analyzeCode({
        code,
        language: chosenLanguage,
        explanationLanguage
      });
    } catch (aiErr) {
      console.error('[AI SERVICE FAILURE]', aiErr.message);
      return res.status(502).json({
        error: 'AI Provider Failure',
        message: `Failed to complete AI static analysis: ${aiErr.message}`
      });
    }

    // Calculate quality score & metrics
    const metrics = calculateQualityMetrics(aiResult.issues, code);

    // Persist Analysis in MySQL
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `INSERT INTO analyses (
          id, user_id, detected_language, language_confidence,
          original_source, corrected_source, analysis_summary,
          teaching_notes_en, teaching_notes_ta, status,
          quality_score, metrics_json, verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'analyzed', ?, ?, 'syntax_checked')`,
        [
          analysisId,
          userId,
          chosenLanguage,
          manualLanguage ? 1.0 : detected.confidence,
          code,
          aiResult.corrected_code,
          aiResult.summary,
          aiResult.teaching_notes_en,
          aiResult.teaching_notes_ta,
          metrics.overallScore,
          JSON.stringify(metrics)
        ]
      );

      // Insert Issues
      if (aiResult.issues && aiResult.issues.length > 0) {
        const issueValues = aiResult.issues.map(iss => [
          analysisId,
          iss.category,
          iss.severity,
          iss.line_number,
          iss.column_number,
          iss.message.substring(0, 500),
          iss.explanation_en,
          iss.explanation_ta,
          iss.suggested_fix,
          iss.affected_code,
          iss.verification_status || 'ai_suggestion'
        ]);

        await conn.query(
          `INSERT INTO issues (
            analysis_id, category, severity, line_number, column_number,
            message, explanation_en, explanation_ta, suggested_fix,
            affected_code, verification_status
          ) VALUES ?`,
          [issueValues]
        );
      }

      await conn.commit();
    } catch (dbErr) {
      await conn.rollback();
      throw dbErr;
    } finally {
      conn.release();
    }

    // Return structured payload
    res.status(201).json({
      success: true,
      data: {
        id: analysisId,
        language: chosenLanguage,
        languageConfidence: manualLanguage ? 1.0 : detected.confidence,
        detectionSource: detected.source,
        summary: aiResult.summary,
        qualityScore: metrics.overallScore,
        metrics,
        issues: aiResult.issues,
        originalCode: code,
        correctedCode: aiResult.corrected_code,
        teachingNotes: {
          en: aiResult.teaching_notes_en,
          ta: aiResult.teaching_notes_ta
        },
        verificationStatus: 'syntax_checked'
      }
    });
  } catch (err) {
    console.error('[CREATE ANALYSIS ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
}

// GET /api/analyses
async function listAnalyses(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, detected_language, quality_score, status, verification_status,
              analysis_summary, created_at
       FROM analyses
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    // Also get statistics
    const [stats] = await pool.query(
      `SELECT COUNT(*) as total_analyses,
              ROUND(AVG(quality_score), 1) as avg_score,
              COUNT(DISTINCT detected_language) as languages_count
       FROM analyses
       WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: rows,
      statistics: stats[0] || { total_analyses: 0, avg_score: 0, languages_count: 0 }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
}

// GET /api/analyses/:id
async function getAnalysisById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      'SELECT * FROM analyses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Analysis not found or access denied' });
    }

    const analysis = rows[0];

    const [issues] = await pool.query(
      'SELECT * FROM issues WHERE analysis_id = ? ORDER BY line_number ASC',
      [id]
    );

    res.json({
      success: true,
      data: {
        id: analysis.id,
        language: analysis.detected_language,
        languageConfidence: analysis.language_confidence,
        originalCode: analysis.original_source,
        correctedCode: analysis.corrected_source,
        summary: analysis.analysis_summary,
        teachingNotes: {
          en: analysis.teaching_notes_en,
          ta: analysis.teaching_notes_ta
        },
        qualityScore: analysis.quality_score,
        metrics: typeof analysis.metrics_json === 'string' ? JSON.parse(analysis.metrics_json) : analysis.metrics_json,
        verificationStatus: analysis.verification_status,
        executionOutput: analysis.execution_output,
        issues,
        createdAt: analysis.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
}

// DELETE /api/analyses/:id
async function deleteAnalysis(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      'DELETE FROM analyses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Analysis not found or unauthorized' });
    }

    res.json({ success: true, message: 'Analysis deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
}

// POST /api/analyses/:id/validate (Safe Sandbox Execution)
async function validateAnalysis(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { target = 'corrected' } = req.body; // 'original' or 'corrected'

    const [rows] = await pool.query(
      'SELECT * FROM analyses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Analysis not found' });
    }

    const analysis = rows[0];
    const codeToRun = target === 'original' ? analysis.original_source : (analysis.corrected_source || analysis.original_source);

    const execResult = await runInSandbox({
      code: codeToRun,
      language: analysis.detected_language
    });

    // Save run history
    await pool.query(
      `INSERT INTO analysis_runs (
        analysis_id, execution_environment, exit_code,
        stdout_output, stderr_output, execution_time_ms, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        execResult.executionEnvironment,
        execResult.exitCode,
        execResult.stdout,
        execResult.stderr,
        execResult.durationMs,
        execResult.status
      ]
    );

    // Update analysis verification status if run succeeded
    const newStatus = execResult.success ? 'sandbox_passed' : (execResult.status === 'disabled' ? analysis.verification_status : 'sandbox_failed');
    await pool.query(
      'UPDATE analyses SET verification_status = ?, execution_output = ? WHERE id = ?',
      [newStatus, execResult.stdout || execResult.stderr, id]
    );

    res.json({
      success: true,
      data: execResult
    });
  } catch (err) {
    res.status(500).json({ error: 'Execution Error', message: err.message });
  }
}

// POST /api/analyses/:id/reports
async function createReport(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { language = 'en' } = req.body; // 'en' or 'ta'

    const [rows] = await pool.query(
      'SELECT * FROM analyses WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Analysis not found' });
    }

    const analysis = rows[0];
    const [issues] = await pool.query('SELECT * FROM issues WHERE analysis_id = ?', [id]);

    const reportFile = await generateAnalysisReport({
      analysis,
      issues,
      user: req.user,
      language
    });

    // Record report
    await pool.query(
      `INSERT INTO reports (id, analysis_id, user_id, report_language, file_path, file_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reportFile.reportId, id, userId, language, reportFile.filePath, reportFile.fileName]
    );

    res.status(201).json({
      success: true,
      data: {
        reportId: reportFile.reportId,
        fileName: reportFile.fileName,
        downloadUrl: `/api/reports/${reportFile.reportId}/download`
      }
    });
  } catch (err) {
    console.error('[REPORT GENERATION ERROR]', err);
    res.status(500).json({ error: 'Report Generation Failed', message: err.message });
  }
}

module.exports = {
  createAnalysis,
  listAnalyses,
  getAnalysisById,
  deleteAnalysis,
  validateAnalysis,
  createReport
};
