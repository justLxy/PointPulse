'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new purchase transaction
 */
const createPurchase = async (data, creatorId, promotionIds = []) => {
    console.log('\n===== TRANSACTION SERVICE: CREATE PURCHASE =====');
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Creator ID:', creatorId);
    console.log('Promotion IDs:', JSON.stringify(promotionIds, null, 2));
    
    const { utorid, type, spent, remark } = data;

    if (type !== 'purchase') {
        console.log('Invalid transaction type');
        console.log('===== TRANSACTION SERVICE: CREATE PURCHASE FAILED =====\n');
        throw new Error('Transaction type must be "purchase"');
    }

    if (!spent || isNaN(spent) || spent <= 0) {
        console.log('Invalid spent amount');
        console.log('===== TRANSACTION SERVICE: CREATE PURCHASE FAILED =====\n');
        throw new Error('Spent amount must be a positive number');
    }

    // Find the user
    console.log('Finding user with UTORid:', utorid);
    const user = await prisma.user.findUnique({
        where: { utorid },
        select: {
            id: true,
            utorid: true
        }
    });

    if (!user) {
        console.log('User not found');
        console.log('===== TRANSACTION SERVICE: CREATE PURCHASE FAILED =====\n');
        throw new Error('User not found');
    }
    console.log('User found:', JSON.stringify(user, null, 2));

    // Find the cashier
    console.log('Finding cashier with ID:', creatorId);
    const cashier = await prisma.user.findUnique({
        where: { id: creatorId },
        select: {
            id: true,
            utorid: true,
            suspicious: true,
            role: true
        }
    });

    if (!cashier) {
        console.log('Cashier not found');
        console.log('===== TRANSACTION SERVICE: CREATE PURCHASE FAILED =====\n');
        throw new Error('Cashier not found');
    }
    console.log('Cashier found:', JSON.stringify(cashier, null, 2));
    console.log('Cashier is suspicious:', cashier.suspicious);

    // Check promotions
    let appliedPromotions = [];

    if (promotionIds && promotionIds.length > 0) {
        console.log('Validating promotions');
        // Validate promotions
        appliedPromotions = await prisma.promotion.findMany({
            where: {
                id: { in: promotionIds.map(id => parseInt(id)) },
                startTime: { lte: new Date() },
                endTime: { gte: new Date() }
            }
        });
        console.log('Found promotions:', appliedPromotions.length);

        // Check if all requested promotions were found
        if (appliedPromotions.length !== promotionIds.length) {
            console.log('Not all promotions were found');
            console.log('===== TRANSACTION SERVICE: CREATE PURCHASE FAILED =====\n');
            throw new Error('Promotion not found');
        }

        // For one-time promotions, check if the user has already used them
        const oneTimePromotions = appliedPromotions.filter(p => p.type === 'one-time');
        console.log('One-time promotions:', oneTimePromotions.length);

        if (oneTimePromotions.length > 0) {
            console.log('Checking if user has already used one-time promotions');
            const usedPromotions = await prisma.promotionTransaction.findMany({
                where: {
                    promotionId: { in: oneTimePromotions.map(p => p.id) },
                    transaction: {
                        userId: user.id
                    }
                }
            });
            console.log('Used promotions:', usedPromotions.length);

            if (usedPromotions.length > 0) {
                console.log('User has already used one or more promotions');
                console.log('===== TRANSACTION SERVICE: CREATE PURCHASE FAILED =====\n');
                throw new Error('Promotion already used');
            }
        }

        // Check minimum spending requirements
        console.log('Checking minimum spending requirements');
        for (const promotion of appliedPromotions) {
            if (promotion.minSpending !== null && spent < promotion.minSpending) {
                console.log('Minimum spending not met for promotion:', promotion.id);
                console.log('Required:', promotion.minSpending, 'Actual:', spent);
                console.log('===== TRANSACTION SERVICE: CREATE PURCHASE FAILED =====\n');
                throw new Error('Minimum spending not met');
            }
        }
    }

    // Calculate points
    console.log('Calculating points');
    // Base rate: 1 point per 25 cents spent
    let pointsEarned = Math.round(spent * 100 / 25);
    console.log('Base points:', pointsEarned);

    // Apply automatic promotions
    for (const promotion of appliedPromotions) {
        console.log('Applying promotion:', promotion.id);
        // Apply rate-based promotions
        if (promotion.rate) {
            const promotionPoints = Math.round(spent * 100 * promotion.rate);
            console.log('Rate-based promotion points:', promotionPoints);
            pointsEarned += promotionPoints;
        }

        // Apply fixed-points promotions
        if (promotion.points) {
            console.log('Fixed-points promotion points:', promotion.points);
            pointsEarned += promotion.points;
        }
    }
    console.log('Total points earned:', pointsEarned);

    // Create the transaction
    console.log('Creating transaction');
    return prisma.$transaction(async (tx) => {
        // Create the transaction
        const transaction = await tx.transaction.create({
            data: {
                type,
                amount: pointsEarned,
                spent: parseFloat(spent),
                remark: remark || '',
                suspicious: cashier.suspicious,
                userId: user.id,
                createdBy: creatorId
            }
        });
        console.log('Transaction created:', transaction.id);

        // Create promotion transactions
        if (appliedPromotions.length > 0) {
            console.log('Creating promotion transactions');
            for (const promotion of appliedPromotions) {
                await tx.promotionTransaction.create({
                    data: {
                        transactionId: transaction.id,
                        promotionId: promotion.id
                    }
                });
                console.log('Promotion transaction created for promotion:', promotion.id);

                // Mark one-time promotions as used
                if (promotion.type === 'one-time') {
                    console.log('Marking one-time promotion as used:', promotion.id);
                    await tx.promotion.update({
                        where: { id: promotion.id },
                        data: {
                            users: {
                                connect: { id: user.id }
                            }
                        }
                    });
                }
            }
        }

        // Update user points
        if (!cashier.suspicious) {
            console.log('Cashier is not suspicious, updating user points');
            await tx.user.update({
                where: { id: user.id },
                data: {
                    points: {
                        increment: pointsEarned
                    }
                }
            });
            console.log('User points updated, added:', pointsEarned);
        } else {
            console.log('Cashier is suspicious, points are withheld');
        }

        const result = {
            id: transaction.id,
            utorid: user.utorid,
            type,
            spent,
            earned: cashier.suspicious ? 0 : pointsEarned,  // 如果收银员可疑，则返回0积分
            remark: transaction.remark,
            createdBy: cashier.utorid,
            promotionIds: appliedPromotions.map(p => p.id)
        };
        console.log('Result:', JSON.stringify(result, null, 2));
        console.log('===== TRANSACTION SERVICE: CREATE PURCHASE COMPLETED =====\n');
        return result;
    });
};

/**
 * Create an adjustment transaction
 */
const createAdjustment = async (data, creatorId) => {
    console.log('\n===== TRANSACTION SERVICE: CREATE ADJUSTMENT =====');
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Creator ID:', creatorId);
    
    const { utorid, type, amount, relatedId, promotionIds = [], remark } = data;

    if (type !== 'adjustment') {
        console.log('Invalid transaction type');
        console.log('===== TRANSACTION SERVICE: CREATE ADJUSTMENT FAILED =====\n');
        throw new Error('Transaction type must be "adjustment"');
    }

    if (!amount || isNaN(amount)) {
        console.log('Invalid amount');
        console.log('===== TRANSACTION SERVICE: CREATE ADJUSTMENT FAILED =====\n');
        throw new Error('Amount must be a number');
    }

    if (!relatedId) {
        console.log('Missing related transaction ID');
        console.log('===== TRANSACTION SERVICE: CREATE ADJUSTMENT FAILED =====\n');
        throw new Error('Related transaction ID is required');
    }

    const parsedRelatedId = parseInt(relatedId);
    if (isNaN(parsedRelatedId) || parsedRelatedId <= 0) {
        console.log('Invalid related transaction ID:', relatedId);
        console.log('===== TRANSACTION SERVICE: CREATE ADJUSTMENT FAILED =====\n');
        throw new Error('Invalid related transaction ID');
    }

    // Find the user
    console.log('Finding user with UTORid:', utorid);
    const user = await prisma.user.findUnique({
        where: { utorid },
        select: {
            id: true,
            utorid: true
        }
    });

    if (!user) {
        console.log('User not found');
        console.log('===== TRANSACTION SERVICE: CREATE ADJUSTMENT FAILED =====\n');
        throw new Error('User not found');
    }
    console.log('User found:', JSON.stringify(user, null, 2));

    // Find the creator (manager)
    console.log('Finding creator with ID:', creatorId);
    const creator = await prisma.user.findUnique({
        where: { id: creatorId },
        select: {
            id: true,
            utorid: true,
            role: true
        }
    });

    if (!creator) {
        console.log('Manager not found');
        console.log('===== TRANSACTION SERVICE: CREATE ADJUSTMENT FAILED =====\n');
        throw new Error('Manager not found');
    }
    console.log('Creator found:', JSON.stringify(creator, null, 2));

    // Check if the related transaction exists
    console.log('Checking if related transaction exists, ID:', parsedRelatedId);
    const relatedTransaction = await prisma.transaction.findUnique({
        where: { id: parsedRelatedId }
    });

    if (!relatedTransaction) {
        console.log('Related transaction not found');
        console.log('===== TRANSACTION SERVICE: CREATE ADJUSTMENT FAILED =====\n');
        throw new Error('Related transaction not found');
    }
    console.log('Related transaction found:', relatedTransaction.id);

    // 确保promotionIds是一个数组
    const safePromotionIds = Array.isArray(promotionIds) ? promotionIds : [];
    console.log('Safe promotion IDs:', safePromotionIds);

    // Begin transaction
    console.log('Starting database transaction');
    return prisma.$transaction(async (tx) => {
        // Create the adjustment transaction
        console.log('Creating adjustment transaction');
        const transaction = await tx.transaction.create({
            data: {
                type,
                amount,
                relatedId: parsedRelatedId,
                remark: remark || '',
                userId: user.id,
                createdBy: creatorId,
                // Create promotion relationships if any
                promotions: {
                    create: safePromotionIds.map(id => ({
                        promotion: {
                            connect: {id: parseInt(id)}
                        }
                    }))
                }
            }
        });
        console.log('Transaction created:', transaction.id);

        // Adjust the user's points
        console.log('Updating user points, amount:', amount);
        await tx.user.update({
            where: {id: user.id},
            data: {
                points: {
                    increment: amount
                }
            }
        });
        console.log('User points updated');

        const result = {
            id: transaction.id,
            utorid: user.utorid,
            amount,
            type: transaction.type,
            relatedId: parsedRelatedId,
            remark: transaction.remark,
            promotionIds: safePromotionIds,
            createdBy: creator.utorid
        };
        console.log('Result:', JSON.stringify(result, null, 2));
        console.log('===== TRANSACTION SERVICE: CREATE ADJUSTMENT COMPLETED =====\n');
        return result;
    });
};

/**
 * Create a redemption transaction
 */
const createRedemption = async (data, userId) => {
    const { type, amount, remark } = data;

    if (type !== 'redemption') {
        throw new Error('Transaction type must be "redemption"');
    }

    if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
    }

    // Find the user
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            utorid: true,
            points: true,
            verified: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Check if user is verified
    if (!user.verified) {
        throw new Error('User is not verified');
    }
    
    // Check if user has enough points
    if (user.points < amount) {
        throw new Error('Insufficient points');
    }

    // Create the redemption transaction
    const transaction = await prisma.transaction.create({
        data: {
            type,
            amount: -amount, // Negative amount for redemption
            remark: remark || '',
            userId: user.id,
            createdBy: userId,
            redeemed: amount
        }
    });

    // No longer updating user points here - points will be deducted when redemption is processed

    return {
        id: transaction.id,
        utorid: user.utorid,
        type: transaction.type,
        processedBy: null,
        amount,
        remark: transaction.remark,
        createdBy: user.utorid
    };
};

/**
 * Process a redemption transaction
 */
const processRedemption = async (transactionId, processorId) => {
    console.log('\n===== TRANSACTION SERVICE: PROCESS REDEMPTION =====');
    console.log('Transaction ID:', transactionId);
    console.log('Processor ID:', processorId);
    
    // Find the transaction
    console.log('Finding transaction');
    const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(transactionId) },
        include: {
            user: true
        }
    });

    if (!transaction) {
        console.log('Transaction not found');
        console.log('===== TRANSACTION SERVICE: PROCESS REDEMPTION FAILED =====\n');
        throw new Error('Transaction not found');
    }
    console.log('Transaction found:', JSON.stringify({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        userId: transaction.userId,
        processedBy: transaction.processedBy
    }, null, 2));
    console.log('User:', transaction.user.utorid);

    if (transaction.type !== 'redemption') {
        console.log('Transaction is not a redemption');
        console.log('===== TRANSACTION SERVICE: PROCESS REDEMPTION FAILED =====\n');
        throw new Error('Transaction is not a redemption');
    }

    if (transaction.processedBy !== null) {
        console.log('Transaction has already been processed');
        console.log('===== TRANSACTION SERVICE: PROCESS REDEMPTION FAILED =====\n');
        throw new Error('Transaction has already been processed');
    }

    // Find the processor (cashier)
    console.log('Finding processor with ID:', processorId);
    const processor = await prisma.user.findUnique({
        where: { id: processorId },
        select: {
            id: true,
            utorid: true,
            role: true
        }
    });

    if (!processor) {
        console.log('Processor not found');
        console.log('===== TRANSACTION SERVICE: PROCESS REDEMPTION FAILED =====\n');
        throw new Error('Processor not found');
    }
    console.log('Processor found:', JSON.stringify(processor, null, 2));
    
    // 检查处理者是否有权限
    if (!['cashier', 'manager', 'superuser'].includes(processor.role)) {
        console.log('Processor is not authorized to process redemptions');
        console.log('===== TRANSACTION SERVICE: PROCESS REDEMPTION FAILED =====\n');
        throw new Error('Unauthorized to process redemptions');
    }
    console.log('Processor has required role:', processor.role);

    // Begin transaction
    console.log('Starting database transaction');
    return prisma.$transaction(async (tx) => {
        // Update the transaction
        console.log('Updating transaction');
        const updatedTransaction = await tx.transaction.update({
            where: {id: parseInt(transactionId)},
            data: {
                processedBy: processorId,
                relatedId: processorId // Store processor ID as related ID for redemptions
            }
        });
        console.log('Transaction updated successfully');

        // Deduct points from user when redemption is processed
        console.log('Deducting points from user');
        await tx.user.update({
            where: { id: transaction.userId },
            data: {
                points: {
                    decrement: -transaction.amount // transaction.amount is negative, so we negate it
                }
            }
        });
        console.log('User points updated');

        const result = {
            id: updatedTransaction.id,
            utorid: transaction.user.utorid,
            type: updatedTransaction.type,
            processedBy: processor.utorid,
            redeemed: -updatedTransaction.amount, // Convert negative to positive for response
            remark: updatedTransaction.remark,
            createdBy: transaction.user.utorid
        };
        console.log('Result:', JSON.stringify(result, null, 2));
        console.log('===== TRANSACTION SERVICE: PROCESS REDEMPTION COMPLETED =====\n');
        return result;
    });
};

/**
 * Create a transfer transaction
 */
const createTransfer = async (data, senderId, recipientUtorid) => {
    const { type, amount, remark } = data;

    if (type !== 'transfer') {
        throw new Error('Transaction type must be "transfer"');
    }

    if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
    }

    // Find the sender
    const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: {
            id: true,
            utorid: true,
            points: true,
            verified: true
        }
    });

    if (!sender) {
        throw new Error('Sender not found');
    }

    // Check if sender is verified
    if (!sender.verified) {
        throw new Error('Sender is not verified');
    }
    
    // Check if sender has enough points
    if (sender.points < amount) {
        throw new Error('Insufficient points');
    }

    // Find the recipient using UTORid
    const recipient = await prisma.user.findUnique({
        where: { utorid: recipientUtorid },
        select: {
            id: true,
            utorid: true
        }
    });

    if (!recipient) {
        throw new Error('Recipient not found');
    }
    
    // Check if sender and recipient are the same
    if (sender.id === recipient.id) {
      throw new Error('Cannot transfer points to yourself');
    }

    // Begin transaction
    return prisma.$transaction(async (tx) => {
        // Create the sender's transaction (negative amount)
        const senderTransaction = await tx.transaction.create({
            data: {
                type,
                amount: -amount, // Negative amount for the sender
                remark: remark || '',
                userId: sender.id,
                createdBy: sender.id,
                relatedId: recipient.id // Store recipient ID as related ID
            }
        });

        // Create the recipient's transaction (positive amount)
        await tx.transaction.create({
            data: {
                type,
                amount: amount, // Positive amount for the recipient
                remark: remark || '',
                userId: recipient.id,
                createdBy: sender.id,
                relatedId: sender.id, // Store sender ID as related ID
                senderId: sender.id
            }
        });

        // Update the points for both users
        await tx.user.update({
            where: {id: sender.id},
            data: {
                points: {
                    decrement: amount
                }
            }
        });

        await tx.user.update({
            where: {id: recipient.id},
            data: {
                points: {
                    increment: amount
                }
            }
        });

        return {
            id: senderTransaction.id,
            sender: sender.utorid,
            recipient: recipient.utorid,
            type,
            sent: amount,
            remark: remark || '',
            createdBy: sender.utorid
        };
    });
};

/**
 * Get transactions with filtering
 */
const getTransactions = async (filters = {}, page = 1, limit = 10) => {
    const {
        name,
        createdBy,
        suspicious,
        promotionId,
        type,
        relatedId,
        amount,
        operator
    } = filters;

    // Build where clause
    const where = {};

    if (name) {
        where.user = {
            OR: [
                { utorid: { contains: name } },
                { name: { contains: name } }
            ]
        };
    }

    if (createdBy) {
        where.creator = {
            utorid: { contains: createdBy }
        };
    }

    if (suspicious !== undefined) {
        where.suspicious = suspicious === 'true';
    }

    if (promotionId) {
        where.promotions = {
            some: {
                promotionId: parseInt(promotionId)
            }
        };
    }

    if (type) {
        where.type = type;

        if (relatedId) {
            where.relatedId = parseInt(relatedId);
        }
    }

    if (amount && operator) {
        const amountValue = parseInt(amount);

        if (!isNaN(amountValue)) {
            if (operator === 'gte') {
                where.amount = {
                    gte: amountValue
                };
            } else if (operator === 'lte') {
                where.amount = {
                    lte: amountValue
                };
            }
        }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const count = await prisma.transaction.count({ where });

    // Get transactions
    const transactions = await prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
            user: {
                select: {
                    utorid: true
                }
            },
            creator: {
                select: {
                    utorid: true
                }
            },
            promotions: {
                select: {
                    promotionId: true
                }
            }
        },
    });

    // Format the transactions for response
    const results = transactions.map(tx => {
        const formattedTx = {
            id: tx.id,
            utorid: tx.user.utorid,
            amount: tx.amount,
            type: tx.type,
            suspicious: tx.suspicious,
            remark: tx.remark,
            createdBy: tx.creator.utorid,
            createdAt: tx.createdAt.toISOString(),
            promotionIds: tx.promotions.map(p => p.promotionId)
        };

        // Add transaction-specific fields
        if (tx.type === 'purchase') {
            formattedTx.spent = tx.spent;
        } else if (tx.type === 'redemption') {
            formattedTx.redeemed = tx.redeemed;
            formattedTx.relatedId = tx.relatedId;
        } else if (tx.type === 'adjustment' || tx.type === 'transfer' || tx.type === 'event') {
            formattedTx.relatedId = tx.relatedId;
        }

        return formattedTx;
    });

    return { count, results };
};

/**
 * Get a single transaction
 */
const getTransaction = async (transactionId) => {
    const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(transactionId) },
        include: {
            user: {
                select: {
                    utorid: true
                }
            },
            creator: {
                select: {
                    utorid: true
                }
            },
            promotions: {
                select: {
                    promotionId: true
                }
            }
        }
    });

    if (!transaction) {
        throw new Error('Transaction not found');
    }

    // Format the transaction for response
    const formattedTx = {
        id: transaction.id,
        utorid: transaction.user.utorid,
        type: transaction.type,
        amount: transaction.amount,
        suspicious: transaction.suspicious,
        remark: transaction.remark,
        createdBy: transaction.creator.utorid,
        createdAt: transaction.createdAt.toISOString(),
        promotionIds: transaction.promotions.map(p => p.promotionId)
    };

    // Add transaction-specific fields
    if (transaction.type === 'purchase') {
        formattedTx.spent = transaction.spent;
    } else if (transaction.type === 'redemption') {
        formattedTx.redeemed = transaction.redeemed;
        formattedTx.relatedId = transaction.relatedId;
    } else if (transaction.type === 'adjustment' || transaction.type === 'transfer' || transaction.type === 'event') {
        formattedTx.relatedId = transaction.relatedId;
    }

    return formattedTx;
};

/**
 * Update a transaction's suspicious status
 */
const updateTransactionSuspicious = async (transactionId, suspiciousStatus) => {
    console.log('\n===== TRANSACTION SERVICE: UPDATE TRANSACTION SUSPICIOUS =====');
    console.log('Transaction ID:', transactionId);
    console.log('New suspicious status:', suspiciousStatus);
    
    const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(transactionId) },
        include: {
            user: true
        }
    });

    if (!transaction) {
        console.log('Transaction not found');
        console.log('===== TRANSACTION SERVICE: UPDATE TRANSACTION SUSPICIOUS FAILED =====\n');
        throw new Error('Transaction not found');
    }
    console.log('Transaction found:', JSON.stringify({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        userId: transaction.userId,
        currentSuspicious: transaction.suspicious
    }, null, 2));
    console.log('User:', JSON.stringify({
        id: transaction.user.id,
        utorid: transaction.user.utorid,
        currentPoints: transaction.user.points
    }, null, 2));

    // If suspiciousStatus is unchanged, just return the transaction
    if (transaction.suspicious === suspiciousStatus) {
        console.log('Suspicious status unchanged, no update needed');
        console.log('===== TRANSACTION SERVICE: UPDATE TRANSACTION SUSPICIOUS COMPLETED (NO CHANGE) =====\n');
        return getTransaction(transactionId);
    }
    console.log('Suspicious status is changing from', transaction.suspicious, 'to', suspiciousStatus);

    // Begin transaction for atomicity
    console.log('Starting database transaction');
    return prisma.$transaction(async (tx) => {
        // Update the transaction
        console.log('Updating transaction suspicious status');
        await tx.transaction.update({
            where: {id: parseInt(transactionId)},
            data: {
                suspicious: suspiciousStatus
            }
        });
        console.log('Transaction suspicious status updated');

        // Update user points based on the new status
        // If marking as suspicious, deduct points (if previously credited)
        // If marking as not suspicious, credit points (if previously not credited)
        if (suspiciousStatus && !transaction.suspicious && transaction.amount > 0) {
            // Marking as suspicious, deduct points
            console.log('Marking as suspicious, deducting points:', transaction.amount);
            await tx.user.update({
                where: {id: transaction.userId},
                data: {
                    points: {
                        decrement: transaction.amount
                    }
                }
            });
            console.log('User points updated, deducted:', transaction.amount);
        } else if (!suspiciousStatus && transaction.suspicious && transaction.amount > 0) {
            // Marking as not suspicious, credit points
            console.log('Marking as not suspicious, crediting points:', transaction.amount);
            await tx.user.update({
                where: {id: transaction.userId},
                data: {
                    points: {
                        increment: transaction.amount
                    }
                }
            });
            console.log('User points updated, added:', transaction.amount);
        } else {
            console.log('No points adjustment needed for this transaction');
        }

        console.log('Fetching updated transaction details');
        const fullUpdatedTransaction = await tx.transaction.findUnique({
            where: { id: parseInt(transactionId) },
            include: {
                user: {
                    select: {
                        utorid: true,
                        points: true
                    }
                },
                creator: {
                    select: {
                        utorid: true
                    }
                },
                promotions: {
                    select: {
                        promotionId: true
                    }
                }
            }
        });
        console.log('Updated user points:', fullUpdatedTransaction.user.points);

        const result = {
            id: fullUpdatedTransaction.id,
            utorid: fullUpdatedTransaction.user.utorid,
            type: fullUpdatedTransaction.type,
            amount: fullUpdatedTransaction.amount,
            suspicious: fullUpdatedTransaction.suspicious,
            remark: fullUpdatedTransaction.remark,
            createdBy: fullUpdatedTransaction.creator.utorid,
            createdAt: fullUpdatedTransaction.createdAt.toISOString(),
            promotionIds: fullUpdatedTransaction.promotions.map(p => p.promotionId),
            ...(fullUpdatedTransaction.spent && { spent: fullUpdatedTransaction.spent }),
            ...(fullUpdatedTransaction.relatedId && { relatedId: fullUpdatedTransaction.relatedId }),
            ...(fullUpdatedTransaction.redeemed && { redeemed: fullUpdatedTransaction.redeemed })
        };
        console.log('Result:', JSON.stringify(result, null, 2));
        console.log('===== TRANSACTION SERVICE: UPDATE TRANSACTION SUSPICIOUS COMPLETED =====\n');
        return result;
    });
};

/**
 * Get user transactions with filtering
 */
const getUserTransactions = async (userId, filters = {}, page = 1, limit = 10) => {
    const { type, relatedId, promotionId, amount, operator } = filters;

    // Build where clause
    const where = {
        userId: userId
    };

    if (type) {
        where.type = type;

        if (relatedId) {
            where.relatedId = parseInt(relatedId);
        }
    }

    if (promotionId) {
        where.promotions = {
            some: {
                promotionId: parseInt(promotionId)
            }
        };
    }

    if (amount && operator) {
        const amountValue = parseInt(amount);

        if (!isNaN(amountValue)) {
            if (operator === 'gte') {
                where.amount = {
                    gte: amountValue
                };
            } else if (operator === 'lte') {
                where.amount = {
                    lte: amountValue
                };
            }
        }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const count = await prisma.transaction.count({ where });

    // Get transactions
    const transactions = await prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
            creator: {
                select: {
                    utorid: true
                }
            },
            promotions: {
                select: {
                    promotionId: true
                }
            },
            user: {
                select: {
                    utorid: true
                }
            },
            processor: {
                select: {
                    utorid: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Format the transactions for response (user view - more limited)
    const results = await Promise.all(transactions.map(async tx => {
        const formattedTx = {
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            remark: tx.remark,
            createdBy: tx.creator.utorid,
            promotionIds: tx.promotions.map(p => p.promotionId),
            createdAt: tx.createdAt.toISOString()
        };

        // Add transaction-specific fields
        if (tx.type === 'purchase') {
            formattedTx.spent = tx.spent;
        } else if (tx.type === 'redemption') {
            formattedTx.redeemed = tx.redeemed;
            formattedTx.relatedId = tx.relatedId;
            // Add processedBy field if this redemption has been processed
            if (tx.processedBy !== null) {
                formattedTx.processedBy = tx.processor?.utorid || 'cashier';
            }
        } else if (tx.type === 'transfer') {
            // 获取转账的相关用户信息
            if (tx.amount > 0) {
                // 这是接收方的记录，关联ID是发送方
                const sender = await prisma.user.findUnique({
                    where: { id: tx.relatedId },
                    select: { utorid: true, name: true }
                });
                if (sender) {
                    formattedTx.sender = sender.utorid;
                    formattedTx.senderName = sender.name;
                }
            } else {
                // 这是发送方的记录，关联ID是接收方
                const recipient = await prisma.user.findUnique({
                    where: { id: tx.relatedId },
                    select: { utorid: true, name: true }
                });
                if (recipient) {
                    formattedTx.recipient = recipient.utorid;
                    formattedTx.recipientName = recipient.name;
                }
            }
            formattedTx.relatedId = tx.relatedId;
        } else if (tx.type === 'adjustment' || tx.type === 'event') {
            formattedTx.relatedId = tx.relatedId;
        }

        return formattedTx;
    }));

    return { count, results };
};

module.exports = {
    createPurchase,
    createAdjustment,
    createRedemption,
    processRedemption,
    createTransfer,
    getTransactions,
    getTransaction,
    updateTransactionSuspicious,
    getUserTransactions
};