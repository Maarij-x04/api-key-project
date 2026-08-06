const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../api-keys/apiKey.middleware');
const { rateLimit } = require('./rateLimit.middleware');
const { logUsage } = require('./logUsage.middleware');

router.use(validateApiKey, rateLimit, logUsage);

router.get('/ping', (req, res) => {
  res.json({ message: 'pong', scopes: req.apiKey.scopes });  
});

module.exports = router;