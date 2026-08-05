const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const applicationController = require('./application.controller');

const apiKeyNestedRoutes = require('../api-keys/apiKeyNested.routes');

router.use('/:id/api-keys', apiKeyNestedRoutes);

router.use(requireAuth); // every route below requires a logged-in user


router.post('/', applicationController.create);
router.get('/', applicationController.list);
router.get('/:id', applicationController.getOne);
router.patch('/:id', applicationController.update);
router.delete('/:id', applicationController.remove);

module.exports = router;