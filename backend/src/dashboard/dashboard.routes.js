const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const dashboardController = require('./dashboard.controller');

router.use(requireAuth);

router.get('/', dashboardController.summary);
router.get('/request-chart', dashboardController.requestChart);
router.get('/status-chart', dashboardController.statusChart);
router.get('/top-applications', dashboardController.topApplications);
router.get('/top-endpoints', dashboardController.topEndpoints);

module.exports = router;