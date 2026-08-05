const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const authController = require('./auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);
router.patch('/change-password', requireAuth, authController.changePassword);

module.exports = router;