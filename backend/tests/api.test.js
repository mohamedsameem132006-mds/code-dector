const request = require('supertest');
const app = require('../src/app');
const { detectLanguage } = require('../src/utils/languageDetector');
const { calculateQualityMetrics } = require('../src/utils/metricsCalculator');
const { runInSandbox } = require('../src/services/sandboxService');

describe('CodeSense AI Backend Test Suite', () => {
  describe('Language Detection Unit Tests', () => {
    it('detects Python code from syntax heuristics', () => {
      const code = 'def compute_tax(income):\n    if income > 50000:\n        return income * 0.2\n    return 0.1';
      const result = detectLanguage(code);
      expect(result.language).toBe('python');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('detects JavaScript code from keywords and structure', () => {
      const code = 'const express = require("express");\nfunction start() { console.log("running"); }';
      const result = detectLanguage(code);
      expect(result.language).toBe('javascript');
    });

    it('detects SQL code from database query commands', () => {
      const code = 'SELECT id, email, created_at FROM users WHERE role = "admin"';
      const result = detectLanguage(code);
      expect(result.language).toBe('sql');
    });

    it('detects file extension overrides safely', () => {
      const result = detectLanguage('let x = 10;', 'script.rs');
      expect(result.language).toBe('rust');
    });
  });

  describe('Quality Score Metrics Calculation', () => {
    it('calculates score based on issues severity penalties', () => {
      const issues = [
        { category: 'syntax', severity: 'critical' },
        { category: 'security', severity: 'error' },
        { category: 'style', severity: 'warning' }
      ];
      const metrics = calculateQualityMetrics(issues, 'line1\nline2\nline3\nline4\nline5');
      expect(metrics.overallScore).toBeLessThan(80);
      expect(metrics.counts.critical).toBe(1);
      expect(metrics.counts.error).toBe(1);
      expect(metrics.counts.warning).toBe(1);
      expect(metrics.formula).toBeDefined();
    });

    it('does not award false 100 on empty code', () => {
      const metrics = calculateQualityMetrics([], 'single line');
      expect(metrics.overallScore).toBeLessThan(100);
      expect(metrics.overallScore).toBeGreaterThanOrEqual(95);
    });
  });

  describe('Isolated Sandbox Execution Tests', () => {
    it('safely runs valid python code and returns output', async () => {
      const code = 'print("CodeSense Sandbox Passed")';
      const res = await runInSandbox({ code, language: 'python' });
      expect(res.success).toBe(true);
      expect(res.stdout).toContain('CodeSense Sandbox Passed');
    }, 10000);

    it('intercepts dangerous system commands via defense-in-depth policy', async () => {
      const dangerousCode = 'import os\nos.system("dir")';
      const res = await runInSandbox({ code: dangerousCode, language: 'python' });
      expect(res.success).toBe(false);
      expect(res.stderr).toContain('Security Policy Violation');
    });

    it('safely declines execution for unsupported sandbox languages', async () => {
      const res = await runInSandbox({ code: 'SELECT * FROM users;', language: 'sql' });
      expect(res.status).toBe('disabled');
    });
  });

  describe('API Endpoints Integration Tests', () => {
    it('GET /api/health returns 200 with database and AI provider status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('connected');
      expect(res.body.aiModel).toBe('gemini-3.8-flash');
    });

    it('denies unauthenticated request to /api/analyses', async () => {
      const res = await request(app).get('/api/analyses');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('rejects empty code submission with 400', async () => {
      const res = await request(app)
        .post('/api/analyses')
        .set('Authorization', 'Bearer dev-token-codesense-admin')
        .send({ code: '   ' });
      expect(res.statusCode).toBe(400);
    });

    it('analyzes code, writes to MySQL, and returns structured findings with Gemini 3.8', async () => {
      const testCode = 'def add_vals(a, b):\n    return a + b\n\nprint(add_vals(5, 10))';
      const res = await request(app)
        .post('/api/analyses')
        .set('Authorization', 'Bearer dev-token-codesense-admin')
        .send({
          code: testCode,
          manualLanguage: 'python',
          explanationLanguage: 'ta'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.language).toBe('python');
      expect(res.body.data.qualityScore).toBeDefined();
      expect(res.body.data.teachingNotes).toBeDefined();

      const analysisId = res.body.data.id;

      // Check single analysis retrieval
      const getRes = await request(app)
        .get(`/api/analyses/${analysisId}`)
        .set('Authorization', 'Bearer dev-token-codesense-admin');
      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.data.originalCode).toBe(testCode);

      // Check PDF report generation
      const pdfRes = await request(app)
        .post(`/api/analyses/${analysisId}/reports`)
        .set('Authorization', 'Bearer dev-token-codesense-admin')
        .send({ language: 'ta' });
      expect(pdfRes.statusCode).toBe(201);
      expect(pdfRes.body.data.downloadUrl).toBeDefined();

      // Check PDF file download authorization
      const dlRes = await request(app)
        .get(pdfRes.body.data.downloadUrl)
        .set('Authorization', 'Bearer dev-token-codesense-admin');
      expect(dlRes.statusCode).toBe(200);
      expect(dlRes.headers['content-type']).toBe('application/pdf');
    }, 60000);
  });
});
