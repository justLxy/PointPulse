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

module.exports = router;