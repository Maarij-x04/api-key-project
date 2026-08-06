const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../api-keys/apiKey.middleware');
const { rateLimit } = require('../usage/rateLimit.middleware');
const { logUsage } = require('../usage/logUsage.middleware');
const orderController = require('./order.controller');

router.use(validateApiKey, rateLimit, logUsage);

router.post('/', orderController.create);
router.get('/', orderController.list);
router.get('/:id', orderController.getOne);

module.exports = router;