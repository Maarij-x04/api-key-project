const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../api-keys/apiKey.middleware');
const { rateLimit } = require('../usage/rateLimit.middleware');
const { logUsage } = require('../usage/logUsage.middleware');
const productController = require('./product.controller');

// Protected by API key (not JWT) — this is the real resource keys guard.
router.use(validateApiKey, rateLimit, logUsage);

router.post('/', productController.create);
router.get('/', productController.list);
router.get('/:id', productController.getOne);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

module.exports = router;