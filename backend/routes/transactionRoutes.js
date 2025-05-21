'use strict';

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireRole } = require('../middlewares/authMiddleware');

// Create a new transaction (type-specific)
router.post('/', requireRole('cashier'), transactionController.createTransaction);

// Get all transactions with filters (manager or higher)
router.get('/', requireRole('manager'), transactionController.getTransactions);

// Get pending redemption transactions (cashier+)
router.get('/pending-redemptions', requireRole('cashier'), transactionController.getPendingRedemptions);

// Lookup a redemption transaction for processing (cashier+)
router.get('/lookup-redemption/:transactionId', requireRole('cashier'), transactionController.lookupRedemptionTransaction);

// Get a specific transaction (manager or higher)
router.get('/:transactionId', requireRole('manager'), transactionController.getTransaction);

// Update transaction suspicious status (manager or higher)
router.patch('/:transactionId/suspicious', requireRole('manager'), transactionController.updateTransactionSuspicious);

// Process a redemption transaction (cashier or higher)
router.patch('/:transactionId/processed', requireRole('cashier'), transactionController.processRedemption);

// Get redemptions by utorid (cashier+)
router.get('/redemptions/by-utorid/:utorid', requireRole('cashier'), transactionController.getRedemptionsByUtorid);

module.exports = router;