'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const transactionController = require('../controllers/transactionController');
const { requireRole } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/uploadConfig');

// Register a new user (cashier or higher)
router.post('/', requireRole('cashier'), userController.createUser);

// Get all users with filters (manager or higher)
router.get('/', requireRole('manager'), userController.getUsers);

// Get current user profile
router.get('/me', userController.getCurrentUser);

// Update current user profile
router.patch('/me', upload.single('avatar'), userController.updateCurrentUser);

// Update current user password
router.patch('/me/password', userController.updatePassword);

// Create a redemption transaction for current user
router.post('/me/transactions', requireRole('regular'), transactionController.createUserRedemption);

// Get current user's transactions
router.get('/me/transactions', requireRole('regular'), transactionController.getUserTransactions);

// Get current user's pending redemptions total
router.get('/me/pending-redemptions', requireRole('regular'), transactionController.getCurrentUserPendingRedemptionsTotal);

// Get a specific user
router.get('/:userId', requireRole('cashier'), userController.getUser);

// Update a user's status
router.patch('/:userId', requireRole('manager'), userController.updateUser);

// Create a transfer transaction between users
router.post('/:userId/transactions', requireRole('regular'), transactionController.createTransfer);

// Get a specific user by UTORid (cashier+)
router.get('/lookup/:utorid', requireRole('cashier'), userController.lookupUserByUtorid);

module.exports = router;