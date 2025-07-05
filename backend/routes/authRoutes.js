'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authenticate a user and generate a JWT token
router.post('/tokens', authController.login);

// Request password reset token
router.post('/resets', authController.requestReset);

// Reset password with token
router.post('/resets/:resetToken', authController.resetPassword);

// Email login (OTP)
router.post('/email-login', authController.requestEmailLogin);
router.post('/email-login/verify', authController.verifyEmailLogin);

module.exports = router;