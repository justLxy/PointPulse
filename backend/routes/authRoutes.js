'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Legacy password-based authentication (keeping for backward compatibility)
router.post('/tokens', authController.login);

// Email-based authentication
router.post('/email-login', authController.requestEmailLogin);
router.post('/verify-email', authController.verifyEmailLogin);

// Request password reset token
router.post('/resets', authController.requestReset);

// Reset password with token
router.post('/resets/:resetToken', authController.resetPassword);

module.exports = router;