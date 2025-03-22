'use strict';

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireRole } = require('../middlewares/authMiddleware');

// Create a new transaction (type-specific)
router.post('/', requireRole('cashier'), transactionController.createTransaction);

// Get all transactions with filters (manager or higher)
router.get('/', requireRole('manager'), transactionController.getTransactions);

// Get a specific transaction (manager or higher)
router.get('/:transactionId', requireRole('manager'), transactionController.getTransaction);

// Update transaction suspicious status (manager or higher)
router.patch('/:transactionId/suspicious', requireRole('manager'), transactionController.updateTransactionSuspicious);

// Process a redemption transaction (cashier or higher)
router.patch('/:transactionId/processed', requireRole('cashier'), transactionController.processRedemption);

module.exports = router;