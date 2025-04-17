'use strict';

const transactionService = require('../services/transactionService');
const { checkRole } = require('../middlewares/authMiddleware');
const { PrismaClient } = require('@prisma/client');
const userService = require('../services/userService');

const prisma = new PrismaClient();

/**
 * Create a new transaction (type-specific)
 */
const createTransaction = async (req, res) => {
    console.log('\n\n===== CREATE TRANSACTION REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('No transaction data provided');
            console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No transaction data provided' });
        }

        const { type } = req.body;
        console.log('Transaction type:', type);

        if (!type) {
            console.log('Transaction type is missing');
            console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Transaction type is required' });
        }

        // Different handling based on transaction type
        if (type === 'purchase') {
            console.log('Processing purchase transaction');
            // Cashier or higher role required
            const isCashier = checkRole(req.auth, 'cashier');
            console.log('User is cashier:', isCashier);
            
            if (!isCashier) {
                console.log('User is not authorized to create purchase transactions');
                console.log('===== CREATE TRANSACTION REQUEST END (403) =====\n\n');
                return res.status(403).json({ error: 'Unauthorized to create purchase transactions' });
            }

            // Validate required fields
            if (!req.body.utorid) {
                console.log('UTORid is missing');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'UTORid is required' });
            }
            console.log('UTORid:', req.body.utorid);
            
            if (req.body.spent === undefined) {
                console.log('Spent amount is missing');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Spent amount is required' });
            }
            console.log('Spent amount:', req.body.spent);
            
            if (isNaN(req.body.spent) || req.body.spent <= 0) {
                console.log('Invalid spent amount');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Spent amount must be a positive number' });
            }

            // Handle promotions if provided
            const promotionIds = req.body.promotionIds || [];
            console.log('Promotion IDs:', promotionIds);
            
            try {
                console.log('Calling transactionService.createPurchase');
                const result = await transactionService.createPurchase(req.body, req.auth.id, promotionIds);
                console.log('Purchase transaction created successfully:', JSON.stringify(result, null, 2));
                console.log('===== CREATE TRANSACTION REQUEST END (201) =====\n\n');
                return res.status(201).json(result);
            } catch (error) {
                console.log('Error creating purchase transaction:', error.message);
                console.log('Error stack:', error.stack);
                
                if (error.message === 'Promotion not found') {
                    console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                    return res.status(400).json({ error: 'One or more promotions not found' });
                }
                if (error.message === 'Promotion already used') {
                    console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                    return res.status(400).json({ error: 'One or more promotions have already been used' });
                }
                if (error.message === 'Minimum spending not met') {
                    console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                    return res.status(400).json({ error: 'Minimum spending requirement not met for one or more promotions' });
                }
                if (error.message === 'Cashier not found') {
                    console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                    return res.status(400).json({ error: 'Cashier not found' });
                }
                throw error;
            }
        } else if (type === 'adjustment') {
            console.log('Processing adjustment transaction');
            // Manager or higher role required
            const isManager = checkRole(req.auth, 'manager');
            console.log('User is manager:', isManager);
            
            if (!isManager) {
                console.log('User is not authorized to create adjustment transactions');
                console.log('===== CREATE TRANSACTION REQUEST END (403) =====\n\n');
                return res.status(403).json({ error: 'Unauthorized to create adjustment transactions' });
            }

            // Validate required fields
            if (!req.body.utorid) {
                console.log('UTORid is missing');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'UTORid is required' });
            }
            console.log('UTORid:', req.body.utorid);
            
            if (req.body.amount === undefined) {
                console.log('Amount is missing');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Amount is required' });
            }
            console.log('Amount:', req.body.amount);
            
            if (isNaN(req.body.amount)) {
                console.log('Invalid amount');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Amount must be a number' });
            }
            
            if (!req.body.relatedId) {
                console.log('Related transaction ID is missing');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Related transaction ID is required' });
            }
            console.log('Related transaction ID:', req.body.relatedId);

            // 确保promotionIds是一个数组
            const promotionIds = Array.isArray(req.body.promotionIds) ? req.body.promotionIds : [];
            console.log('Promotion IDs (processed):', promotionIds);

            try {
                const relatedId = parseInt(req.body.relatedId);
                if (isNaN(relatedId) || relatedId <= 0) {
                    console.log('Invalid related transaction ID');
                    console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                    return res.status(400).json({ error: 'Invalid related transaction ID' });
                }

                // 检查相关交易是否存在
                console.log('Checking if related transaction exists');
                const relatedTransaction = await prisma.transaction.findUnique({
                    where: { id: relatedId }
                });

                if (!relatedTransaction) {
                    console.log('Related transaction not found');
                    console.log('===== CREATE TRANSACTION REQUEST END (404) =====\n\n');
                    return res.status(404).json({ error: 'Related transaction not found' });
                }
                console.log('Related transaction found');

                // 创建一个新的请求体，确保promotionIds是一个数组
                const adjustmentData = {
                    ...req.body,
                    promotionIds
                };
                console.log('Adjustment data:', JSON.stringify(adjustmentData, null, 2));

                console.log('Calling transactionService.createAdjustment');
                const result = await transactionService.createAdjustment(adjustmentData, req.auth.id);
                console.log('Adjustment transaction created successfully:', JSON.stringify(result, null, 2));
                console.log('===== CREATE TRANSACTION REQUEST END (201) =====\n\n');
                return res.status(201).json(result);
            } catch (error) {
                console.log('Error creating adjustment transaction:', error.message);
                console.log('Error stack:', error.stack);
                
                if (error.message === 'Related transaction not found') {
                    console.log('===== CREATE TRANSACTION REQUEST END (404) =====\n\n');
                    return res.status(404).json({ error: 'Related transaction not found' });
                }
                throw error;
            }
        } else if (type === 'transfer') {
            console.log('Processing transfer transaction');
            // Validate required fields
            if (!req.body.utorid) {
                console.log('Recipient UTORid is missing');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Recipient UTORid is required' });
            }
            console.log('Recipient UTORid:', req.body.utorid);
            
            if (req.body.amount === undefined) {
                console.log('Amount is missing');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Amount is required' });
            }
            console.log('Amount:', req.body.amount);
            
            if (isNaN(req.body.amount) || req.body.amount <= 0) {
                console.log('Invalid amount');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Amount must be a positive number' });
            }

            console.log('Getting recipient user ID by UTORid');
            const recipientId = await userService.getUserIdByUtorid(req.body.utorid);
            console.log('Recipient user ID:', recipientId);
            
            console.log('Calling transactionService.createTransfer');
            const result = await transactionService.createTransfer(
                { 
                    type: 'transfer', 
                    amount: req.body.amount, 
                    remark: req.body.remark 
                }, 
                req.auth.id, 
                recipientId
            );
            console.log('Transfer transaction created successfully:', JSON.stringify(result, null, 2));
            console.log('===== CREATE TRANSACTION REQUEST END (201) =====\n\n');
            return res.status(201).json(result);
        } else if (type === 'redemption') {
            console.log('Processing redemption transaction');
            // 检查用户是否已验证
            console.log('Checking if user is verified');
            const user = await prisma.user.findUnique({
                where: { id: req.auth.id },
                select: { verified: true }
            });

            if (!user || !user.verified) {
                console.log('User is not verified');
                console.log('===== CREATE TRANSACTION REQUEST END (403) =====\n\n');
                return res.status(403).json({ error: 'User must be verified to create redemption transactions' });
            }
            console.log('User is verified');

            // Validate required fields
            if (req.body.amount === undefined) {
                console.log('Amount is missing');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Amount is required' });
            }
            console.log('Amount:', req.body.amount);
            
            if (isNaN(req.body.amount) || req.body.amount <= 0) {
                console.log('Invalid amount');
                console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Amount must be a positive number' });
            }

            console.log('Calling transactionService.createRedemption');
            const result = await transactionService.createRedemption(
                { 
                    type: 'redemption', 
                    amount: req.body.amount, 
                    remark: req.body.remark 
                }, 
                req.auth.id
            );
            console.log('Redemption transaction created successfully:', JSON.stringify(result, null, 2));
            console.log('===== CREATE TRANSACTION REQUEST END (201) =====\n\n');
            return res.status(201).json(result);
        } else {
            console.log('Invalid transaction type:', type);
            console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid transaction type' });
        }
    } catch (error) {
        console.log('Error creating transaction:', error.message);
        console.log('Error stack:', error.stack);
        
        if (error.message === 'User not found' || error.message === 'Related transaction not found') {
            console.log('===== CREATE TRANSACTION REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Insufficient balance') {
            console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        if (error.message === 'Promotion not found' || error.message === 'Promotion not active' || 
            error.message === 'Promotion already used' || error.message === 'Minimum spending not met') {
            console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: error.message });
        }
        console.error('Error creating transaction:', error);
        console.log('===== CREATE TRANSACTION REQUEST END (400) =====\n\n');
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get all transactions with filters (manager or higher role required)
 */
const getTransactions = async (req, res) => {
    console.log('\n\n===== GET TRANSACTIONS REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Query parameters:', JSON.stringify(req.query, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        // Verify that the requester has at least a manager role
        const isManager = checkRole(req.auth, 'manager');
        console.log('User is manager:', isManager);
        
        if (!isManager) {
            console.log('User is not authorized to view all transactions');
            console.log('===== GET TRANSACTIONS REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'Unauthorized to view all transactions' });
        }

        // 验证分页参数
        if (req.query.page && (isNaN(parseInt(req.query.page)) || parseInt(req.query.page) <= 0)) {
            console.log('Invalid page parameter:', req.query.page);
            console.log('===== GET TRANSACTIONS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Page must be a positive integer' });
        }

        if (req.query.limit && (isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) <= 0)) {
            console.log('Invalid limit parameter:', req.query.limit);
            console.log('===== GET TRANSACTIONS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Limit must be a positive integer' });
        }

        const filters = {
            name: req.query.name,
            createdBy: req.query.createdBy,
            suspicious: req.query.suspicious,
            promotionId: req.query.promotionId,
            type: req.query.type,
            relatedId: req.query.relatedId,
            amount: req.query.amount,
            operator: req.query.operator
        };
        
        console.log('Filters:', JSON.stringify(filters, null, 2));
        console.log('Page:', req.query.page || 1);
        console.log('Limit:', req.query.limit || 10);

        try {
            console.log('Calling transactionService.getTransactions');
            const result = await transactionService.getTransactions(
                filters,
                req.query.page || 1,
                req.query.limit || 10
            );

            console.log('Transactions retrieved successfully. Count:', result.count);
            console.log('===== GET TRANSACTIONS REQUEST END (200) =====\n\n');
            return res.status(200).json(result);
        } catch (error) {
            console.log('Error getting transactions:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message.includes('Invalid page') || error.message.includes('Invalid limit')) {
                console.log('===== GET TRANSACTIONS REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error getting transactions:', error);
        console.log('Error stack:', error.stack);
        console.log('===== GET TRANSACTIONS REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
};

/**
 * Get a specific transaction (manager or higher role required, or own transaction)
 */
const getTransaction = async (req, res) => {
    console.log('\n\n===== GET TRANSACTION REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const transactionId = parseInt(req.params.transactionId);
        console.log('Parsed transaction ID:', transactionId);

        if (isNaN(transactionId) || transactionId <= 0) {
            console.log('Invalid transaction ID');
            console.log('===== GET TRANSACTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        // 先获取交易信息，检查是否是用户自己的交易
        try {
            console.log('Checking transaction ownership and user permissions');
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
                select: { userId: true }
            });

            if (!transaction) {
                console.log('Transaction not found');
                console.log('===== GET TRANSACTION REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Transaction not found' });
            }
            console.log('Transaction found. User ID:', transaction.userId);

            // 允许用户查看自己的交易，或者管理员查看所有交易
            const isOwnTransaction = transaction.userId === req.auth.id;
            const isManager = checkRole(req.auth, 'manager');
            console.log('Is user\'s own transaction:', isOwnTransaction);
            console.log('Is user a manager:', isManager);

            if (!isOwnTransaction && !isManager) {
                console.log('User is not authorized to view this transaction');
                console.log('===== GET TRANSACTION REQUEST END (403) =====\n\n');
                return res.status(403).json({ error: 'Unauthorized to view transaction details' });
            }

            console.log('Calling transactionService.getTransaction');
            const transactionDetails = await transactionService.getTransaction(transactionId);
            console.log('Transaction details retrieved successfully');
            console.log('===== GET TRANSACTION REQUEST END (200) =====\n\n');
            return res.status(200).json(transactionDetails);
        } catch (error) {
            console.log('Error getting transaction details:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Transaction not found') {
                console.log('===== GET TRANSACTION REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Transaction not found' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error getting transaction:', error);
        console.log('Error stack:', error.stack);
        console.log('===== GET TRANSACTION REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to retrieve transaction' });
    }
};

/**
 * Update transaction suspicious status (manager or higher role required)
 */
const updateTransactionSuspicious = async (req, res) => {
    console.log('\n\n===== UPDATE TRANSACTION SUSPICIOUS REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const transactionId = parseInt(req.params.transactionId);
        console.log('Parsed transaction ID:', transactionId);

        if (isNaN(transactionId) || transactionId <= 0) {
            console.log('Invalid transaction ID');
            console.log('===== UPDATE TRANSACTION SUSPICIOUS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        // Verify that the requester has at least a manager role
        const isManager = checkRole(req.auth, 'manager');
        console.log('User is manager:', isManager);
        
        if (!isManager) {
            console.log('User is not authorized to update transaction status');
            console.log('===== UPDATE TRANSACTION SUSPICIOUS REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'Unauthorized to update transaction status' });
        }

        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('No data provided');
            console.log('===== UPDATE TRANSACTION SUSPICIOUS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No data provided' });
        }

        const { suspicious } = req.body;
        console.log('Suspicious status:', suspicious);

        if (suspicious === undefined) {
            console.log('Suspicious status is missing');
            console.log('===== UPDATE TRANSACTION SUSPICIOUS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Suspicious status is required' });
        }

        // 检查交易是否存在
        console.log('Checking if transaction exists');
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) {
            console.log('Transaction not found');
            console.log('===== UPDATE TRANSACTION SUSPICIOUS REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Transaction not found' });
        }
        console.log('Transaction found');

        try {
            console.log('Calling transactionService.updateTransactionSuspicious');
            const updatedTransaction = await transactionService.updateTransactionSuspicious(
                transactionId,
                suspicious === true
            );

            console.log('Transaction suspicious status updated successfully');
            console.log('===== UPDATE TRANSACTION SUSPICIOUS REQUEST END (200) =====\n\n');
            return res.status(200).json(updatedTransaction);
        } catch (error) {
            console.log('Error updating transaction suspicious status:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Transaction not found') {
                console.log('===== UPDATE TRANSACTION SUSPICIOUS REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Transaction not found' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error updating transaction suspicious status:', error);
        console.log('Error stack:', error.stack);
        console.log('===== UPDATE TRANSACTION SUSPICIOUS REQUEST END (400) =====\n\n');
        res.status(400).json({ error: error.message });
    }
};

/**
 * Process a redemption transaction (cashier or higher role required)
 */
const processRedemption = async (req, res) => {
    console.log('\n\n===== PROCESS REDEMPTION REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const transactionId = parseInt(req.params.transactionId);
        console.log('Parsed transaction ID:', transactionId);

        if (isNaN(transactionId) || transactionId <= 0) {
            console.log('Invalid transaction ID');
            console.log('===== PROCESS REDEMPTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        // Verify that the requester has at least a cashier role
        const isCashier = checkRole(req.auth, 'cashier');
        console.log('User is cashier:', isCashier);
        
        if (!isCashier) {
            console.log('User is not authorized to process redemptions');
            console.log('===== PROCESS REDEMPTION REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'Unauthorized to process redemptions' });
        }

        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('No data provided');
            console.log('===== PROCESS REDEMPTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No data provided' });
        }

        const { processed } = req.body;
        console.log('Processed status:', processed);

        if (processed === undefined || processed !== true) {
            console.log('Processed status must be true');
            console.log('===== PROCESS REDEMPTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Processed status must be true' });
        }

        // 先检查交易是否存在及其类型
        console.log('Checking if transaction exists and its type');
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: { type: true, processedBy: true }
        });

        if (!transaction) {
            console.log('Transaction not found');
            console.log('===== PROCESS REDEMPTION REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Transaction not found' });
        }
        console.log('Transaction found. Type:', transaction.type, 'ProcessedBy:', transaction.processedBy);

        if (transaction.type !== 'redemption') {
            console.log('Transaction is not a redemption');
            console.log('===== PROCESS REDEMPTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Transaction is not a redemption' });
        }

        if (transaction.processedBy !== null) {
            console.log('Transaction has already been processed');
            console.log('===== PROCESS REDEMPTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Transaction has already been processed' });
        }

        try {
            console.log('Calling transactionService.processRedemption');
            const result = await transactionService.processRedemption(transactionId, req.auth.id);
            console.log('Redemption processed successfully:', JSON.stringify(result, null, 2));
            console.log('===== PROCESS REDEMPTION REQUEST END (200) =====\n\n');
            return res.status(200).json(result);
        } catch (error) {
            console.log('Error processing redemption:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Transaction not found') {
                console.log('===== PROCESS REDEMPTION REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Transaction not found' });
            }
            if (error.message === 'Transaction is not a redemption') {
                console.log('===== PROCESS REDEMPTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Transaction is not a redemption' });
            }
            if (error.message === 'Transaction has already been processed') {
                console.log('===== PROCESS REDEMPTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Transaction has already been processed' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error processing redemption:', error);
        console.log('Error stack:', error.stack);
        console.log('===== PROCESS REDEMPTION REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to process redemption' });
    }
};

/**
 * Create a transfer transaction between users
 */
const createTransfer = async (req, res) => {
    console.log('\n\n===== CREATE TRANSFER REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log('No transaction data provided');
            console.log('===== CREATE TRANSFER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'No transaction data provided' });
        }

        const senderId = req.auth.id;
        // The userId parameter in the route actually represents the UTORid of the recipient
        const recipientUtorid = req.params.userId; 
        console.log('Sender ID:', senderId);
        console.log('Recipient UTORid:', recipientUtorid);
        
        // Basic validation for recipientUtorid
        if (!recipientUtorid || typeof recipientUtorid !== 'string' || recipientUtorid.trim() === '') {
            console.log('Invalid recipient UTORid provided in URL parameter');
            console.log('===== CREATE TRANSFER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid recipient UTORid in URL' });
        }
        
        const { type, amount, remark } = req.body;
        console.log('Request body parsed:', { type, amount, remark });

        if (type !== 'transfer') {
            console.log('Invalid transaction type:', type);
            console.log('===== CREATE TRANSFER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Transaction type must be "transfer"' });
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            console.log('Invalid amount:', amount);
            console.log('===== CREATE TRANSFER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        // Check if sender is verified (redundant check as service layer does it, but good for early exit)
        console.log('Fetching sender details for verification check');
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            select: { verified: true, points: true, utorid: true }
        });

        if (!sender) {
            console.log('Sender not found, ID:', senderId);
            console.log('===== CREATE TRANSFER REQUEST END (404) =====\n\n');
            return res.status(404).json({ error: 'Sender not found' });
        }
        console.log('Sender found:', sender.utorid, 'Verified:', sender.verified, 'Points:', sender.points);

        if (!sender.verified) {
            console.log('Sender is not verified');
            console.log('===== CREATE TRANSFER REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'User is not verified' });
        }

        // Check if sender has enough points (redundant check, service layer does it)
        if (sender.points < amount) {
            console.log('Insufficient points. Sender has:', sender.points, 'Amount needed:', amount);
            console.log('===== CREATE TRANSFER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Insufficient points' });
        }
        
        // Prevent self-transfer (redundant check, service layer does it)
        if (sender.utorid === recipientUtorid) {
            console.log('Attempting self-transfer');
            console.log('===== CREATE TRANSFER REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Cannot transfer points to yourself' });
        }

        try {
            console.log('Calling transactionService.createTransfer');
            const result = await transactionService.createTransfer(
                req.body, // Contains type, amount, remark
                senderId,
                recipientUtorid // Pass the UTORid from the URL
            );
            console.log('Transfer successful:', JSON.stringify(result, null, 2));
            console.log('===== CREATE TRANSFER REQUEST END (201) =====\n\n');
            return res.status(201).json(result);
        } catch (error) {
            console.log('Error during transfer service call:', error.message);
            console.log('Error stack:', error.stack);
            
            // Handle specific errors from the service layer
            if (error.message === 'Recipient not found') {
                console.log('===== CREATE TRANSFER REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Recipient not found' });
            }
            if (error.message === 'Insufficient points') {
                console.log('===== CREATE TRANSFER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Insufficient points' });
            }
            if (error.message === 'Sender is not verified') {
                console.log('===== CREATE TRANSFER REQUEST END (403) =====\n\n');
                return res.status(403).json({ error: 'User is not verified' });
            }
             if (error.message === 'Cannot transfer points to yourself') {
                console.log('===== CREATE TRANSFER REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Cannot transfer points to yourself' });
            }
            // Add other specific errors if needed
            
            console.log('Unknown error during transfer service');
            console.log('===== CREATE TRANSFER REQUEST END (500) =====\n\n');
            // Generic error for unexpected issues
            return res.status(500).json({ error: 'Failed to transfer points' });
        }
    } catch (error) {
        console.error('Unexpected error in createTransfer controller:', error);
        console.log('Error stack:', error.stack);
        console.log('===== CREATE TRANSFER REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to transfer points due to an unexpected error' });
    }
};

/**
 * Create a redemption transaction for the current user
 */
const createUserRedemption = async (req, res) => {
    try {
        // Check for empty payload
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'No transaction data provided' });
        }

        const userId = req.auth.id;
        const { type, amount, remark } = req.body;

        if (type !== 'redemption') {
            return res.status(400).json({ error: 'Transaction type must be "redemption"' });
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        // Check if user is verified and active
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { verified: true, points: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.verified) {
            return res.status(403).json({ error: 'User is not verified' });
        }

        // Check if user has enough points
        if (user.points < amount) {
            return res.status(400).json({ error: 'Insufficient points' });
        }

        try {
            const result = await transactionService.createRedemption(
                { type, amount, remark },
                userId
            );

            return res.status(201).json(result);
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            if (error.message === 'User is not verified') {
                return res.status(403).json({ error: 'User is not verified' });
            }
            if (error.message === 'Insufficient points') {
                return res.status(400).json({ error: 'Insufficient points' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error creating redemption:', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get current user's transactions
 */
const getUserTransactions = async (req, res) => {
    console.log('\n\n===== GET USER TRANSACTIONS REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Query parameters:', JSON.stringify(req.query, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        const userId = req.auth.id;
        console.log('User ID:', userId);

        const filters = {
            type: req.query.type,
            relatedId: req.query.relatedId,
            promotionId: req.query.promotionId,
            amount: req.query.amount,
            operator: req.query.operator
        };
        
        console.log('Filters:', JSON.stringify(filters, null, 2));

        // 检查分页参数
        if (req.query.page && (isNaN(parseInt(req.query.page)) || parseInt(req.query.page) <= 0)) {
            console.log('Invalid page parameter:', req.query.page);
            console.log('===== GET USER TRANSACTIONS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Page must be a positive integer' });
        }

        if (req.query.limit && (isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) <= 0)) {
            console.log('Invalid limit parameter:', req.query.limit);
            console.log('===== GET USER TRANSACTIONS REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Limit must be a positive integer' });
        }
        
        console.log('Page:', req.query.page || 1);
        console.log('Limit:', req.query.limit || 10);

        try {
            console.log('Calling transactionService.getUserTransactions');
            const result = await transactionService.getUserTransactions(
                userId,
                filters,
                req.query.page || 1,
                req.query.limit || 10
            );

            // 确保结果中至少有count和results字段
            const response = {
                count: result.count || 0,
                results: result.results || []
            };
            
            console.log('User transactions retrieved successfully. Count:', response.count);
            console.log('===== GET USER TRANSACTIONS REQUEST END (200) =====\n\n');
            return res.status(200).json(response);
        } catch (error) {
            console.log('Error getting user transactions:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message.includes('Invalid page') || error.message.includes('Invalid limit')) {
                console.log('===== GET USER TRANSACTIONS REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error getting user transactions:', error);
        console.log('Error stack:', error.stack);
        console.log('===== GET USER TRANSACTIONS REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
};

/**
 * Update current user password
 */
const updatePassword = async (req, res) => {
    try {
        const userId = req.auth.id;
        const { old, new: newPassword } = req.body;

        if (!old || !newPassword) {
            return res.status(400).json({ error: 'Both current and new passwords are required' });
        }

        await userService.updatePassword(userId, old, newPassword);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        if (error.message === 'Current password is incorrect') {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        res.status(400).json({ error: error.message });
    }
};

/**
 * Lookup a redemption transaction for processing - specifically for cashiers
 */
const lookupRedemptionTransaction = async (req, res) => {
    console.log('\n\n===== LOOKUP REDEMPTION TRANSACTION REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Params:', JSON.stringify(req.params, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        // Verify that the requester has at least a cashier role
        if (!checkRole(req.auth, 'cashier')) {
            console.log('User is not authorized to lookup redemption transactions');
            console.log('===== LOOKUP REDEMPTION TRANSACTION REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'Unauthorized to lookup redemption transactions' });
        }

        const transactionId = parseInt(req.params.transactionId);
        console.log('Parsed transaction ID:', transactionId);

        if (isNaN(transactionId) || transactionId <= 0) {
            console.log('Invalid transaction ID');
            console.log('===== LOOKUP REDEMPTION TRANSACTION REQUEST END (400) =====\n\n');
            return res.status(400).json({ error: 'Invalid transaction ID' });
        }

        try {
            // Verify that it's a redemption transaction
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
                select: { 
                    id: true,
                    type: true,
                    processedBy: true
                }
            });

            if (!transaction) {
                console.log('Transaction not found');
                console.log('===== LOOKUP REDEMPTION TRANSACTION REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Transaction not found' });
            }

            if (transaction.type !== 'redemption') {
                console.log('Transaction is not a redemption');
                console.log('===== LOOKUP REDEMPTION TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Transaction is not a redemption' });
            }

            if (transaction.processedBy !== null) {
                console.log('Redemption has already been processed');
                console.log('===== LOOKUP REDEMPTION TRANSACTION REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: 'Redemption has already been processed' });
            }

            // Get the full transaction details
            console.log('Getting transaction details');
            const transactionDetails = await transactionService.getTransaction(transactionId);
            
            console.log('Transaction details retrieved successfully');
            console.log('===== LOOKUP REDEMPTION TRANSACTION REQUEST END (200) =====\n\n');
            return res.status(200).json(transactionDetails);
        } catch (error) {
            console.log('Error getting transaction details:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message === 'Transaction not found') {
                console.log('===== LOOKUP REDEMPTION TRANSACTION REQUEST END (404) =====\n\n');
                return res.status(404).json({ error: 'Transaction not found' });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error looking up redemption transaction:', error);
        console.log('Error stack:', error.stack);
        console.log('===== LOOKUP REDEMPTION TRANSACTION REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to lookup redemption transaction' });
    }
};

/**
 * Get pending redemption transactions - specifically for cashiers
 */
const getPendingRedemptions = async (req, res) => {
    console.log('\n\n===== GET PENDING REDEMPTIONS REQUEST START =====');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', req.originalUrl);
    console.log('Method:', req.method);
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('Auth user:', JSON.stringify(req.auth, null, 2));
    
    try {
        // Verify that the requester has at least a cashier role
        if (!checkRole(req.auth, 'cashier')) {
            console.log('User is not authorized to get pending redemptions');
            console.log('===== GET PENDING REDEMPTIONS REQUEST END (403) =====\n\n');
            return res.status(403).json({ error: 'Unauthorized to view pending redemptions' });
        }

        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        
        console.log('Fetching pending redemptions with page:', page, 'limit:', limit);
        
        // Create filters for pending redemptions (type = redemption, processedBy = null)
        const filters = {
            type: 'redemption',
            processedBy: null
        };

        try {
            console.log('Calling transactionService.getTransactions');
            const result = await transactionService.getTransactions(
                filters,
                page,
                limit
            );

            console.log('Pending redemptions retrieved successfully. Count:', result.count);
            console.log('===== GET PENDING REDEMPTIONS REQUEST END (200) =====\n\n');
            return res.status(200).json(result);
        } catch (error) {
            console.log('Error getting pending redemptions:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.message.includes('Invalid page') || error.message.includes('Invalid limit')) {
                console.log('===== GET PENDING REDEMPTIONS REQUEST END (400) =====\n\n');
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error getting pending redemptions:', error);
        console.log('Error stack:', error.stack);
        console.log('===== GET PENDING REDEMPTIONS REQUEST END (500) =====\n\n');
        res.status(500).json({ error: 'Failed to retrieve pending redemptions' });
    }
};

module.exports = {
    createTransaction,
    getTransactions,
    getTransaction,
    updateTransactionSuspicious,
    processRedemption,
    createUserRedemption,
    getUserTransactions,
    createTransfer,
    lookupRedemptionTransaction,
    getPendingRedemptions
};