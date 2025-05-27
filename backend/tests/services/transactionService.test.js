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
    },
    promotionUsage: {
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
                utorid: 'testus01',
                points: 100,
                verified: true
            };

            const mockCreatedTransaction = {
                id: 1,
                userId: 1,
                type: 'purchase',
                spent: 20.00,
                amount: 80,
                remark: 'Test purchase',
                creator: { utorid: 'cashie01' },
                user: { utorid: 'testus01' },
                promotions: []
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.create.mockResolvedValue(mockCreatedTransaction);

            const result = await transactionService.createPurchase(purchaseData, 1, []);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { utorid: 'testus01' }
                })
            );

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                utorid: 'testus01',
                type: 'purchase',
                spent: 20.00,
                earned: 80
            }));
        });

        test('should throw error for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                transactionService.createPurchase({ utorid: 'nonexistent', type: 'purchase', spent: 20 }, 1)
            ).rejects.toThrow('User not found');
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

            const mockUser = {
                id: 1,
                utorid: 'testus01',
                points: 100
            };

            const mockRelatedTransaction = {
                id: 123,
                type: 'purchase'
            };

            const mockCreatedTransaction = {
                id: 2,
                userId: 1,
                type: 'adjustment',
                amount: -50,
                relatedId: 123,
                remark: 'Test adjustment',
                creator: { utorid: 'manage01' },
                user: { utorid: 'testus01' },
                promotions: []
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.transaction.findUnique.mockResolvedValue(mockRelatedTransaction);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.create.mockResolvedValue(mockCreatedTransaction);

            const result = await transactionService.createAdjustment(adjustmentData, 1);

            expect(result).toEqual(expect.objectContaining({
                id: 2,
                utorid: 'testus01',
                type: 'adjustment',
                amount: -50,
                relatedId: 123
            }));
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

            const mockCreatedTransaction = {
                id: 3,
                userId: 1,
                type: 'redemption',
                amount: -1000,
                redeemed: 1000,
                processedBy: null,
                remark: 'Test redemption',
                creator: { utorid: 'testus01' },
                user: { utorid: 'testus01' }
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.transaction.findMany.mockResolvedValue([]); // No pending redemptions
            mockPrisma.transaction.create.mockResolvedValue(mockCreatedTransaction);

            const result = await transactionService.createRedemption(redemptionData, 1);

            expect(result).toEqual(expect.objectContaining({
                id: 3,
                utorid: 'testus01',
                type: 'redemption',
                amount: 1000,
                processedBy: null
            }));
        });

        test('should throw error for insufficient points', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                points: 500,
                verified: true
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.transaction.findMany.mockResolvedValue([]); // No pending redemptions

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
                id: 1,
                utorid: 'cashie01',
                role: 'cashier',
                suspicious: false
            };

            const mockProcessedTransaction = {
                ...mockTransaction,
                processedBy: 1,
                redeemed: 1000,
                remark: 'Test redemption',
                creator: { utorid: 'testus01' },
                processor: { utorid: 'cashie01' }
            };

            mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);
            mockPrisma.user.findUnique.mockResolvedValue(mockProcessor);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.update.mockResolvedValue({
                ...mockProcessedTransaction,
                redeemed: Math.abs(mockTransaction.amount) // Convert negative amount to positive redeemed value
            });

            const result = await transactionService.processRedemption(3, 1);

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

        test('should throw error for already processed transaction', async () => {
            const mockTransaction = {
                id: 3,
                type: 'redemption',
                processedBy: 1,
                user: { 
                    id: 1, 
                    points: 1500,
                    utorid: 'testus01'
                }
            };

            mockPrisma.transaction.findUnique.mockResolvedValue(mockTransaction);

            await expect(
                transactionService.processRedemption(3, 1)
            ).rejects.toThrow('Transaction has already been processed');
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
                utorid: 'recipie01',
                points: 100
            };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockSender) // sender lookup
                .mockResolvedValueOnce(mockRecipient); // recipient lookup

            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });

            const result = await transactionService.createTransfer(transferData, 1, 'recipie01');

            expect(result).toEqual(expect.objectContaining({
                sender: 'sender01',
                recipient: 'recipie01',
                type: 'transfer',
                sent: 500
            }));
        });

        test('should throw error for insufficient points', async () => {
            const mockSender = {
                id: 1,
                utorid: 'sender01',
                points: 100,
                verified: true
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockSender);

            await expect(
                transactionService.createTransfer({ type: 'transfer', amount: 500 }, 1, 'recipie01')
            ).rejects.toThrow('Insufficient points');
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
                    creator: { utorid: 'cashie01' },
                    user: { utorid: 'testus01' },
                    promotions: [],
                    createdAt: new Date()
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
    });

    describe('getTransaction', () => {
        test('should get a specific transaction', async () => {
            const mockTransaction = {
                id: 1,
                type: 'purchase',
                amount: 80,
                spent: 20,
                creator: { utorid: 'cashie01' },
                user: { utorid: 'testus01' },
                promotions: [],
                createdAt: new Date()
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
                creator: { utorid: 'cashie01' },
                promotions: [],
                createdAt: new Date()
            };

            mockPrisma.transaction.findUnique
                .mockResolvedValueOnce(mockTransaction) // First call to get transaction
                .mockResolvedValueOnce({ // Second call to get full transaction details
                    ...mockUpdatedTransaction,
                    creator: { utorid: 'cashie01' },
                    promotions: []
                });
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
    });

    describe('getUserTransactions', () => {
        test('should get user transactions with filtering', async () => {
            const mockTransactions = [
                {
                    id: 1,
                    type: 'purchase',
                    amount: 80,
                    spent: 20,
                    creator: { utorid: 'cashie01' },
                    user: { utorid: 'testus01' },
                    promotions: [],
                    createdAt: new Date()
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
    });
}); 