// Mock external dependencies
jest.mock('@prisma/client');

const mockPrisma = {
    $transaction: jest.fn(),
    transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    promotion: {
        findMany: jest.fn(),
        update: jest.fn(),
    },
    promotionUsage: {
        create: jest.fn(),
        findMany: jest.fn(),
    },
    promotionTransaction: {
        findMany: jest.fn(),
        create: jest.fn(),
    },
};

// Mock PrismaClient
const { PrismaClient } = require('@prisma/client');
PrismaClient.mockImplementation(() => mockPrisma);

// Import after mocking
const transactionService = require('../../services/transactionService');

describe('TransactionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('createPurchase', () => {
        test('should create a purchase transaction successfully', async () => {
            const purchaseData = {
                utorid: 'testus01',
                type: 'purchase',
                spent: 20.00,
                remark: 'Test purchase'
            };

            const mockUser = {
                id: 1,
                utorid: 'testus01'
            };

            const mockCashier = {
                id: 2,
                utorid: 'cashie01',
                suspicious: false,
                role: 'cashier'
            };

            const mockCreatedTransaction = {
                id: 1,
                userId: 1,
                type: 'purchase',
                spent: 20.00,
                amount: 80,
                remark: 'Test purchase',
                suspicious: false,
                createdBy: 2
            };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(mockCashier);
            mockPrisma.promotion.findMany.mockResolvedValue([]);
            mockPrisma.promotionUsage.findMany.mockResolvedValue([]);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.create.mockResolvedValue(mockCreatedTransaction);

            const result = await transactionService.createPurchase(purchaseData, 2, []);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                utorid: 'testus01',
                type: 'purchase',
                spent: 20.00,
                earned: 80
            }));
        });

        test('should throw error for invalid transaction type', async () => {
            const purchaseData = {
                utorid: 'testus01',
                type: 'invalid',
                spent: 20.00
            };

            await expect(
                transactionService.createPurchase(purchaseData, 1, [])
            ).rejects.toThrow('Transaction type must be "purchase"');
        });

        test('should throw error for invalid spent amount', async () => {
            const purchaseData = {
                utorid: 'testus01',
                type: 'purchase',
                spent: -10
            };

            await expect(
                transactionService.createPurchase(purchaseData, 1, [])
            ).rejects.toThrow('Spent amount must be a positive number');
        });

        test('should throw error for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                transactionService.createPurchase({ utorid: 'nonexistent', type: 'purchase', spent: 20 }, 1)
            ).rejects.toThrow('User not found');
        });

        test('should throw error for non-existent cashier', async () => {
            const mockUser = { id: 1, utorid: 'testus01' };
            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(null);

            await expect(
                transactionService.createPurchase({ utorid: 'testus01', type: 'purchase', spent: 20 }, 999)
            ).rejects.toThrow('Cashier not found');
        });

        test('should handle promotions correctly', async () => {
            const purchaseData = {
                utorid: 'testus01',
                type: 'purchase',
                spent: 100.00,
                remark: 'Test purchase with promotions'
            };

            const mockUser = { id: 1, utorid: 'testus01' };
            const mockCashier = { id: 2, utorid: 'cashie01', suspicious: false, role: 'cashier' };
            const mockPromotions = [
                { id: 1, type: 'automatic', rate: 0.02, points: null },
                { id: 2, type: 'one-time', rate: null, points: 50 }
            ];

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(mockCashier);
            mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions);
            mockPrisma.promotionTransaction.findMany.mockResolvedValue([]);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                // Mock the transaction context object with promotion.update
                const txMock = {
                    ...mockPrisma,
                    promotion: {
                        ...mockPrisma.promotion,
                        update: jest.fn().mockResolvedValue({})
                    }
                };
                return await callback(txMock);
            });
            mockPrisma.transaction.create.mockResolvedValue({ id: 1 });

            await transactionService.createPurchase(purchaseData, 2, [1, 2]);

            expect(mockPrisma.promotion.findMany).toHaveBeenCalled();
        });

        test('should throw error for already used one-time promotion', async () => {
            const mockUser = { id: 1, utorid: 'testus01' };
            const mockCashier = { id: 2, utorid: 'cashie01', suspicious: false, role: 'cashier' };
            const mockPromotions = [{ id: 1, type: 'one-time', points: 50 }];
            const mockUsedPromotions = [{ promotionId: 1 }];

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(mockCashier);
            mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions);
            mockPrisma.promotionTransaction.findMany.mockResolvedValue(mockUsedPromotions);

            await expect(
                transactionService.createPurchase({ utorid: 'testus01', type: 'purchase', spent: 20 }, 2, [1])
            ).rejects.toThrow('Promotion already used');
        });

        test('should handle suspicious cashier', async () => {
            const mockUser = { id: 1, utorid: 'testus01' };
            const mockCashier = { id: 2, utorid: 'cashie01', suspicious: true, role: 'cashier' };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(mockCashier);
            mockPrisma.promotion.findMany.mockResolvedValue([]);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.create.mockResolvedValue({ id: 1, suspicious: true });

            const result = await transactionService.createPurchase(
                { utorid: 'testus01', type: 'purchase', spent: 20 }, 2, []
            );

            expect(result).toBeDefined();
        });
    });

    describe('createAdjustment', () => {
        test('should create an adjustment transaction successfully', async () => {
            const adjustmentData = {
                utorid: 'testus01',
                type: 'adjustment',
                amount: -50,
                relatedId: 123,
                remark: 'Test adjustment'
            };

            const mockUser = { id: 1, utorid: 'testus01' };
            const mockCreator = { id: 2, utorid: 'manage01', role: 'manager' };
            const mockRelatedTransaction = { id: 123, type: 'purchase' };
            const mockCreatedTransaction = {
                id: 2,
                type: 'adjustment',
                amount: -50,
                relatedId: 123,
                remark: 'Test adjustment'
            };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(mockCreator);
            mockPrisma.transaction.findUnique.mockResolvedValue(mockRelatedTransaction);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.create.mockResolvedValue(mockCreatedTransaction);

            const result = await transactionService.createAdjustment(adjustmentData, 2);

            expect(result).toEqual(expect.objectContaining({
                utorid: 'testus01',
                type: 'adjustment',
                amount: -50,
                relatedId: 123
            }));
        });

        test('should throw error for invalid transaction type', async () => {
            await expect(
                transactionService.createAdjustment({ type: 'invalid' }, 1)
            ).rejects.toThrow('Transaction type must be "adjustment"');
        });

        test('should throw error for invalid amount', async () => {
            await expect(
                transactionService.createAdjustment({ type: 'adjustment', amount: 'invalid' }, 1)
            ).rejects.toThrow('Amount must be a number');
        });

        test('should throw error for missing related transaction ID', async () => {
            await expect(
                transactionService.createAdjustment({ type: 'adjustment', amount: -50 }, 1)
            ).rejects.toThrow('Related transaction ID is required');
        });

        test('should throw error for invalid related transaction ID', async () => {
            await expect(
                transactionService.createAdjustment({ type: 'adjustment', amount: -50, relatedId: 'invalid' }, 1)
            ).rejects.toThrow('Invalid related transaction ID');
        });

        test('should throw error for non-existent related transaction', async () => {
            const mockUser = { id: 1, utorid: 'testus01' };
            const mockCreator = { id: 2, utorid: 'manage01', role: 'manager' };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(mockCreator);
            mockPrisma.transaction.findUnique.mockResolvedValue(null);

            await expect(
                transactionService.createAdjustment({ utorid: 'testus01', type: 'adjustment', amount: -50, relatedId: 999 }, 2)
            ).rejects.toThrow('Related transaction not found');
        });
    });

    describe('createRedemption', () => {
        test('should create a redemption transaction successfully', async () => {
            const redemptionData = {
                type: 'redemption',
                amount: 1000,
                remark: 'Test redemption'
            };

            const mockUser = {
                id: 1,
                utorid: 'testus01',
                points: 1500,
                verified: true
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.transaction.findMany.mockResolvedValue([]);
            mockPrisma.transaction.create.mockResolvedValue({
                id: 3,
                type: 'redemption',
                amount: -1000,
                remark: 'Test redemption'
            });

            const result = await transactionService.createRedemption(redemptionData, 1);

            expect(result).toEqual(expect.objectContaining({
                id: 3,
                utorid: 'testus01',
                type: 'redemption',
                amount: 1000,
                processedBy: null
            }));
        });

        test('should throw error for invalid transaction type', async () => {
            await expect(
                transactionService.createRedemption({ type: 'invalid' }, 1)
            ).rejects.toThrow('Transaction type must be "redemption"');
        });

        test('should throw error for invalid amount', async () => {
            await expect(
                transactionService.createRedemption({ type: 'redemption', amount: -100 }, 1)
            ).rejects.toThrow('Amount must be a positive number');
        });

        test('should throw error for insufficient points', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                points: 500,
                verified: true
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.transaction.findMany.mockResolvedValue([]);

            await expect(
                transactionService.createRedemption({ type: 'redemption', amount: 1000 }, 1)
            ).rejects.toThrow('Insufficient points');
        });

        test('should throw error for unverified user', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                points: 1500,
                verified: false
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(
                transactionService.createRedemption({ type: 'redemption', amount: 1000 }, 1)
            ).rejects.toThrow('User is not verified');
        });

        test('should consider pending redemptions when checking available balance', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                points: 1500,
                verified: true
            };

            const mockPendingRedemptions = [
                { redeemed: 800 }
            ];

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.transaction.findMany.mockResolvedValue(mockPendingRedemptions);

            await expect(
                transactionService.createRedemption({ type: 'redemption', amount: 800 }, 1)
            ).rejects.toThrow('Insufficient points');
        });
    });

    describe('processRedemption', () => {
        test('should process a redemption transaction successfully', async () => {
            const mockTransaction = {
                id: 3,
                type: 'redemption',
                processedBy: null,
                amount: -1000,
                userId: 1,
                user: { 
                    id: 1, 
                    points: 1500,
                    utorid: 'testus01'
                }
            };

            const mockProcessor = {
                id: 2,
                utorid: 'cashie01',
                role: 'cashier'
            };

            mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);
            mockPrisma.user.findUnique.mockResolvedValue(mockProcessor);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.update.mockResolvedValue({
                ...mockTransaction,
                processedBy: 2
            });
            // Mock user.update to return user with updated points
            mockPrisma.user.update.mockResolvedValue({
                points: 500 // 1500 - 1000 = 500
            });

            const result = await transactionService.processRedemption(3, 2);

            expect(result).toEqual(expect.objectContaining({
                id: 3,
                utorid: 'testus01',
                type: 'redemption',
                processedBy: 'cashie01',
                redeemed: 1000
            }));
        });

        test('should throw error for non-existent transaction', async () => {
            mockPrisma.transaction.findUnique.mockResolvedValue(null);

            await expect(
                transactionService.processRedemption(999, 1)
            ).rejects.toThrow('Transaction not found');
        });

        test('should throw error for non-redemption transaction', async () => {
            const mockTransaction = {
                id: 1,
                type: 'purchase',
                user: { utorid: 'testus01' }
            };

            mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);

            await expect(
                transactionService.processRedemption(1, 1)
            ).rejects.toThrow('Transaction is not a redemption');
        });

        test('should throw error for already processed transaction', async () => {
            const mockTransaction = {
                id: 3,
                type: 'redemption',
                processedBy: 1,
                user: { utorid: 'testus01' }
            };

            mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);

            await expect(
                transactionService.processRedemption(3, 1)
            ).rejects.toThrow('Transaction has already been processed');
        });

        test('should throw error for unauthorized processor', async () => {
            const mockTransaction = {
                id: 3,
                type: 'redemption',
                processedBy: null,
                user: { utorid: 'testus01' }
            };

            const mockProcessor = {
                id: 2,
                utorid: 'regular01',
                role: 'regular'
            };

            mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);
            mockPrisma.user.findUnique.mockResolvedValue(mockProcessor);

            await expect(
                transactionService.processRedemption(3, 2)
            ).rejects.toThrow('Unauthorized to process redemptions');
        });
    });

    describe('createTransfer', () => {
        test('should create transfer transactions successfully', async () => {
            const transferData = {
                type: 'transfer',
                amount: 500,
                remark: 'Test transfer'
            };

            const mockSender = {
                id: 1,
                utorid: 'sender01',
                points: 1000,
                verified: true
            };

            const mockRecipient = {
                id: 2,
                utorid: 'recipie01'
            };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockSender)
                .mockResolvedValueOnce(mockRecipient);

            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.create.mockResolvedValue({ id: 4 });
            // Mock user.update for sender (decrement points) and recipient (increment points)
            mockPrisma.user.update
                .mockResolvedValueOnce({ points: 500 }) // Sender: 1000 - 500 = 500
                .mockResolvedValueOnce({ points: 500 }); // Recipient: 0 + 500 = 500

            const result = await transactionService.createTransfer(transferData, 1, 'recipie01');

            expect(result).toEqual(expect.objectContaining({
                sender: 'sender01',
                recipient: 'recipie01',
                type: 'transfer',
                sent: 500
            }));
        });

        test('should throw error for invalid transaction type', async () => {
            await expect(
                transactionService.createTransfer({ type: 'invalid' }, 1, 'recipie01')
            ).rejects.toThrow('Transaction type must be "transfer"');
        });

        test('should throw error for invalid amount', async () => {
            await expect(
                transactionService.createTransfer({ type: 'transfer', amount: -100 }, 1, 'recipie01')
            ).rejects.toThrow('Amount must be a positive number');
        });

        test('should throw error for unverified sender', async () => {
            const mockSender = {
                id: 1,
                utorid: 'sender01',
                points: 1000,
                verified: false
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockSender);

            await expect(
                transactionService.createTransfer({ type: 'transfer', amount: 500 }, 1, 'recipie01')
            ).rejects.toThrow('Sender is not verified');
        });

        test('should throw error for insufficient points', async () => {
            const mockSender = {
                id: 1,
                utorid: 'sender01',
                points: 100,
                verified: true
            };
            
            const mockRecipient = {
                id: 2,
                utorid: 'recipie01',
                points: 0,
                verified: true
            };

            // Mock different users for sender and recipient lookups
            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockSender)   // First call: lookup sender by ID
                .mockResolvedValueOnce(mockRecipient); // Second call: lookup recipient by utorid

            await expect(
                transactionService.createTransfer({ type: 'transfer', amount: 500 }, 1, 'recipie01')
            ).rejects.toThrow('Insufficient points');
        });

        test('should throw error for non-existent recipient', async () => {
            const mockSender = {
                id: 1,
                utorid: 'sender01',
                points: 1000,
                verified: true
            };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockSender)
                .mockResolvedValueOnce(null);

            await expect(
                transactionService.createTransfer({ type: 'transfer', amount: 500 }, 1, 'nonexistent')
            ).rejects.toThrow('Recipient not found');
        });

        test('should throw error for self-transfer', async () => {
            const mockUser = {
                id: 1,
                utorid: 'user01',
                points: 1000,
                verified: true
            };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce(mockUser);

            await expect(
                transactionService.createTransfer({ type: 'transfer', amount: 500 }, 1, 'user01')
            ).rejects.toThrow('Cannot transfer points to yourself');
        });
    });

    describe('getTransactions', () => {
        test('should get paginated list of transactions', async () => {
            const mockTransactions = [
                {
                    id: 1,
                    type: 'purchase',
                    amount: 80,
                    spent: 20,
                    suspicious: false,
                    remark: '',
                    createdAt: new Date(),
                    relatedId: null,
                    processedBy: null,
                    creator: { utorid: 'cashie01' },
                    user: { utorid: 'testus01', name: 'Test User', email: 'test@mail.utoronto.ca' },
                    processor: null,
                    promotions: []
                }
            ];

            mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
            mockPrisma.transaction.count.mockResolvedValue(1);

            const result = await transactionService.getTransactions({}, 1, 10);

            expect(result).toEqual({
                count: 1,
                results: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        type: 'purchase',
                        amount: 80,
                        spent: 20
                    })
                ])
            });
        });

        test('should filter transactions by various criteria', async () => {
            const filters = {
                name: 'test',
                createdBy: 'cashier',
                suspicious: 'true',
                promotionId: 1,
                type: 'purchase',
                amount: 100,
                operator: 'gte'
            };

            mockPrisma.transaction.findMany.mockResolvedValue([]);
            mockPrisma.transaction.count.mockResolvedValue(0);

            await transactionService.getTransactions(filters, 1, 10);

            expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        type: 'purchase',
                        suspicious: true,
                        amount: { gte: 100 }
                    })
                })
            );
        });

        test('should handle transfer transactions with related user info', async () => {
            const mockTransactions = [
                {
                    id: 1,
                    type: 'transfer',
                    amount: -500,
                    relatedId: 2,
                    suspicious: false,
                    remark: 'Test transfer',
                    createdAt: new Date(),
                    processedBy: null,
                    creator: { utorid: 'sender01' },
                    user: { utorid: 'sender01', name: 'Sender', email: 'sender@mail.utoronto.ca' },
                    processor: null,
                    promotions: []
                }
            ];

            const mockRelatedUser = {
                utorid: 'recipient01',
                name: 'Recipient',
                email: 'recipient@mail.utoronto.ca'
            };

            mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
            mockPrisma.transaction.count.mockResolvedValue(1);
            mockPrisma.user.findUnique.mockResolvedValue(mockRelatedUser);

            const result = await transactionService.getTransactions({}, 1, 10);

            expect(result.results[0]).toHaveProperty('relatedUser');
        });
    });

    describe('getTransaction', () => {
        test('should get a specific transaction', async () => {
            const mockTransaction = {
                id: 1,
                type: 'purchase',
                amount: 80,
                spent: 20,
                suspicious: false,
                remark: '',
                createdAt: new Date(),
                processedBy: null,
                creator: { utorid: 'cashie01' },
                user: { utorid: 'testus01' },
                processor: null,
                promotions: []
            };

            mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);

            const result = await transactionService.getTransaction(1);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                type: 'purchase',
                amount: 80,
                spent: 20
            }));
        });

        test('should throw error for non-existent transaction', async () => {
            mockPrisma.transaction.findUnique.mockResolvedValue(null);

            await expect(
                transactionService.getTransaction(999)
            ).rejects.toThrow('Transaction not found');
        });
    });

    describe('updateTransactionSuspicious', () => {
        test('should update transaction suspicious status', async () => {
            const mockTransaction = {
                id: 1,
                type: 'purchase',
                amount: 80,
                suspicious: false,
                userId: 1,
                user: { 
                    id: 1, 
                    points: 180,
                    utorid: 'testus01'
                }
            };

            const mockUpdatedTransaction = {
                ...mockTransaction,
                suspicious: true,
                createdAt: new Date(),
                creator: { utorid: 'cashie01' },
                promotions: []
            };

            mockPrisma.transaction.findUnique
                .mockResolvedValueOnce(mockTransaction)
                .mockResolvedValueOnce(mockUpdatedTransaction);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.update.mockResolvedValue(mockUpdatedTransaction);

            const result = await transactionService.updateTransactionSuspicious(1, true);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                suspicious: true
            }));
        });

        test('should return transaction when status unchanged', async () => {
            const mockTransaction = {
                id: 1,
                type: 'purchase',
                amount: 80,
                suspicious: true,
                userId: 1,
                createdAt: new Date(),
                user: { 
                    id: 1, 
                    points: 180,
                    utorid: 'testus01'
                },
                creator: { utorid: 'cashie01' },
                processor: null,
                promotions: []
            };

            // Mock both calls: one for updateTransactionSuspicious, one for getTransaction
            mockPrisma.transaction.findUnique
                .mockResolvedValueOnce(mockTransaction) // First call in updateTransactionSuspicious
                .mockResolvedValueOnce(mockTransaction); // Second call in getTransaction

            const result = await transactionService.updateTransactionSuspicious(1, true);

            expect(result).toBeDefined();
        });

        test('should throw error for non-existent transaction', async () => {
            mockPrisma.transaction.findUnique.mockResolvedValue(null);

            await expect(
                transactionService.updateTransactionSuspicious(999, true)
            ).rejects.toThrow('Transaction not found');
        });
    });

    describe('getUserTransactions', () => {
        test('should get user transactions with filtering', async () => {
            const mockTransactions = [
                {
                    id: 1,
                    type: 'purchase',
                    amount: 80,
                    spent: 20,
                    remark: '',
                    createdAt: new Date(),
                    processedBy: null,
                    creator: { utorid: 'cashie01' },
                    user: { utorid: 'testus01' },
                    processor: null,
                    promotions: []
                }
            ];

            mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
            mockPrisma.transaction.count.mockResolvedValue(1);

            const result = await transactionService.getUserTransactions(1, {}, 1, 10);

            expect(result).toEqual({
                count: 1,
                results: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        type: 'purchase',
                        amount: 80,
                        spent: 20
                    })
                ])
            });
        });

        test('should filter by type and relatedId', async () => {
            const filters = {
                type: 'transfer',
                relatedId: 2
            };

            mockPrisma.transaction.findMany.mockResolvedValue([]);
            mockPrisma.transaction.count.mockResolvedValue(0);

            await transactionService.getUserTransactions(1, filters, 1, 10);

            expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        userId: 1,
                        type: 'transfer',
                        relatedId: 2
                    })
                })
            );
        });

        test('should handle redemption transactions with processedBy info', async () => {
            const mockTransactions = [
                {
                    id: 1,
                    type: 'redemption',
                    amount: -1000,
                    redeemed: 1000,
                    processedBy: 2,
                    remark: '',
                    createdAt: new Date(),
                    relatedId: 2,
                    creator: { utorid: 'testus01' },
                    user: { utorid: 'testus01' },
                    processor: { utorid: 'cashie01' },
                    promotions: []
                }
            ];

            mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
            mockPrisma.transaction.count.mockResolvedValue(1);

            const result = await transactionService.getUserTransactions(1, {}, 1, 10);

            expect(result.results[0]).toHaveProperty('processedBy', 'cashie01');
        });
    });

    describe('getUserPendingRedemptionsTotal', () => {
        test('should get total pending redemptions for user', async () => {
            const mockPendingRedemptions = [
                { redeemed: 500 },
                { redeemed: 300 }
            ];

            mockPrisma.transaction.findMany.mockResolvedValue(mockPendingRedemptions);

            const result = await transactionService.getUserPendingRedemptionsTotal(1);

            expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                    type: 'redemption',
                    processedBy: null
                },
                select: {
                    redeemed: true
                }
            });

            expect(result).toBe(800);
        });

        test('should return 0 when no pending redemptions', async () => {
            mockPrisma.transaction.findMany.mockResolvedValue([]);

            const result = await transactionService.getUserPendingRedemptionsTotal(1);

            expect(result).toBe(0);
        });

        test('should handle null redeemed values', async () => {
            const mockPendingRedemptions = [
                { redeemed: 500 },
                { redeemed: null },
                { redeemed: 300 }
            ];

            mockPrisma.transaction.findMany.mockResolvedValue(mockPendingRedemptions);

            const result = await transactionService.getUserPendingRedemptionsTotal(1);

            expect(result).toBe(800);
        });
    });
}); 