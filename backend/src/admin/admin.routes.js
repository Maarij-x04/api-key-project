const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const adminController = require('./admin.controller');

router.use(requireAuth, requireAdmin); // every route below requires BOTH a valid login AND admin role

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/applications', adminController.listApplications);
router.get('/audit-logs', adminController.listAuditLogs);

module.exports = router;