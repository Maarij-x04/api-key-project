const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middleware/auth.middleware');
const usageController = require('./usage.controller');

router.use(requireAuth);
router.get('/', usageController.listForApplication);

module.exports = router;