const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const usageController = require('./usage.controller');

router.use(requireAuth);

router.get('/', usageController.list);

module.exports = router;