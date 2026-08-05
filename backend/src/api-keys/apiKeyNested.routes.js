const express = require('express');
const router = express.Router({ mergeParams: true }); // lets this router read :id from the parent path
const { requireAuth } = require('../middleware/auth.middleware');
const apiKeyController = require('./apiKey.controller');

router.use(requireAuth);

router.post('/', apiKeyController.create);
router.get('/', apiKeyController.listForApplication);

module.exports = router;