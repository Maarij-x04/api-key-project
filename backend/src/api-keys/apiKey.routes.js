const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const apiKeyController = require('./apiKey.controller');

router.use(requireAuth);

router.get('/:id', apiKeyController.getOne);
router.patch('/:id', apiKeyController.update);
router.post('/:id/rotate', apiKeyController.rotate);
router.patch('/:id/revoke', apiKeyController.revokeKey);
router.patch('/:id/restore', apiKeyController.restoreKey);
router.delete('/:id', apiKeyController.remove);

module.exports = router;