const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const analysisController = require('../controllers/analysisController');
const reportController = require('../controllers/reportController');
const databaseController = require('../controllers/databaseController');

// Analyses Routes
router.post('/analyses', requireAuth, analysisController.createAnalysis);
router.get('/analyses', requireAuth, analysisController.listAnalyses);
router.get('/analyses/:id', requireAuth, analysisController.getAnalysisById);
router.delete('/analyses/:id', requireAuth, analysisController.deleteAnalysis);
router.post('/analyses/:id/validate', requireAuth, analysisController.validateAnalysis);
router.post('/analyses/:id/reports', requireAuth, analysisController.createReport);

// Reports Routes
router.get('/reports', requireAuth, reportController.listUserReports);
router.get('/reports/:id/download', requireAuth, reportController.downloadReport);

// Database Viewer Routes
router.get('/database/tables', requireAuth, databaseController.getDatabaseTables);
router.get('/database/table/:table', requireAuth, databaseController.getTableData);

module.exports = router;
