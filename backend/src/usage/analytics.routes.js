const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const usageController = require('./usage.controller');

router.get('/usage', requireAuth, usageController.analytics);

module.exports = router;