'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authenticate a user and generate a JWT token (legacy password-based)
router.post('/tokens', authController.login);

// OTP-based email authentication
router.post('/otp/request', authController.requestOTP);
router.post('/otp/verify', authController.verifyOTP);

module.exports = router;