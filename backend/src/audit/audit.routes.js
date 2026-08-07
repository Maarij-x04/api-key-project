const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const auditController = require('./audit.controller');

router.use(requireAuth);

router.get('/', auditController.list);
router.get('/:id', auditController.getOne);

module.exports = router;