const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const authController = require('./auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);
router.patch('/change-password', requireAuth, authController.changePassword);
// Add this to auth.routes.js
router.get('/', (req, res) => {
  res.json({ message: 'Auth service is running' });
});

module.exports = router;