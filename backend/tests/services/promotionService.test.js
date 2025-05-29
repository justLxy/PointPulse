// Mock external dependencies
jest.mock('@prisma/client');

const mockPrisma = {
    promotion: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    promotionUsage: {
        findMany: jest.fn(),
    },
};

// Mock PrismaClient
const { PrismaClient } = require('@prisma/client');
PrismaClient.mockImplementation(() => mockPrisma);

// Import after mocking
const promotionService = require('../../services/promotionService');

describe('PromotionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe('createPromotion', () => {
        test('should create a new promotion successfully', async () => {
            const promotionData = {
                name: 'Test Promotion',
                description: 'A test promotion',
                type: 'automatic',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-10T17:00:00Z',
                minSpending: 50,
                rate: 0.02,
                points: null
            };

            const mockCreatedPromotion = {
                id: 1,
                name: 'Test Promotion',
                description: 'A test promotion',
                type: 'automatic',
                startTime: new Date('2025-05-10T09:00:00Z'),
                endTime: new Date('2025-05-10T17:00:00Z'),
                minSpending: 50,
                rate: 0.02,
                points: null
            };

            mockPrisma.promotion.create.mockResolvedValue(mockCreatedPromotion);

            const result = await promotionService.createPromotion(promotionData);

            expect(mockPrisma.promotion.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Test Promotion',
                    description: 'A test promotion',
                    type: 'automatic',
                    startTime: new Date('2025-05-10T09:00:00Z'),
                    endTime: new Date('2025-05-10T17:00:00Z'),
                    minSpending: 50,
                    rate: 0.02,
                    points: null
                })
            });

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Promotion',
                description: 'A test promotion',
                type: 'automatic',
                startTime: '2025-05-10T09:00:00.000Z',
                endTime: '2025-05-10T17:00:00.000Z'
            }));
        });

        test('should create promotion with points instead of rate', async () => {
            const promotionData = {
                name: 'Points Promotion',
                description: 'A points-based promotion',
                type: 'one-time',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-10T17:00:00Z',
                points: 100
            };

            const mockCreatedPromotion = {
                id: 1,
                ...promotionData,
                startTime: new Date(promotionData.startTime),
                endTime: new Date(promotionData.endTime),
                minSpending: null,
                rate: null
            };

            mockPrisma.promotion.create.mockResolvedValue(mockCreatedPromotion);

            const result = await promotionService.createPromotion(promotionData);

            expect(result.points).toBe(100);
            expect(result.rate).toBeNull();
        });

        test('should handle validation errors', async () => {
            const invalidPromotionData = {
                name: 'Test Promotion',
                // description: missing description
                type: 'automatic',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-09T17:00:00Z', // End before start
                minSpending: 50,
                rate: 0.02
            };

            await expect(
                promotionService.createPromotion(invalidPromotionData)
            ).rejects.toThrow('Promotion description is required');
        });

        test('should handle database errors', async () => {
            const promotionData = {
                name: 'Test Promotion',
                description: 'A test promotion',
                type: 'automatic',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-10T17:00:00Z',
                minSpending: 50,
                rate: 0.02
            };

            mockPrisma.promotion.create.mockRejectedValue(new Error('Database error'));

            await expect(
                promotionService.createPromotion(promotionData)
            ).rejects.toThrow('Database error');
        });
    });

    describe('getPromotions', () => {
        test('should get paginated list of promotions for manager', async () => {
            const mockPromotions = [
                {
                    id: 1,
                    name: 'Test Promotion',
                    type: 'automatic',
                    startTime: new Date('2025-05-10T09:00:00Z'),
                    endTime: new Date('2025-05-10T17:00:00Z'),
                    minSpending: 50,
                    rate: 0.02,
                    points: null
                }
            ];

            mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions);
            mockPrisma.promotion.count.mockResolvedValue(1);

            const result = await promotionService.getPromotions({}, null, true, 1, 10);

            expect(result).toEqual({
                count: 1,
                results: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        name: 'Test Promotion',
                        type: 'automatic'
                    })
                ])
            });
        });

        test('should get promotions for regular user', async () => {
            const mockUser = {
                id: 1,
                role: 'regular'
            };

            const mockPromotions = [
                {
                    id: 1,
                    name: 'Test Promotion',
                    type: 'automatic',
                    startTime: new Date('2024-05-10T09:00:00Z'),
                    endTime: new Date('2026-05-10T17:00:00Z'),
                    minSpending: 50,
                    rate: 0.02,
                    points: null
                }
            ];

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.promotion.findMany
                .mockResolvedValueOnce(mockPromotions) // For debugging check
                .mockResolvedValueOnce(mockPromotions); // For actual query
            mockPrisma.promotion.count.mockResolvedValue(1);
            mockPrisma.promotionUsage.findMany.mockResolvedValue([]);

            const result = await promotionService.getPromotions({}, 1, false, 1, 10);

            expect(result).toEqual({
                count: 1,
                results: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        name: 'Test Promotion',
                        type: 'automatic'
                    })
                ])
            });
        });

        test('should filter out used one-time promotions for regular user', async () => {
            const mockUser = {
                id: 1,
                role: 'regular'
            };

            const mockPromotions = [
                {
                    id: 1,
                    name: 'Test Promotion',
                    type: 'one-time',
                    startTime: new Date('2024-05-10T09:00:00Z'),
                    endTime: new Date('2026-05-10T17:00:00Z')
                }
            ];

            const mockUsedPromotions = [
                { promotionId: 1 }
            ];

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.promotion.findMany
                .mockResolvedValueOnce(mockPromotions)
                .mockResolvedValueOnce([]); // Filtered result should be empty
            mockPrisma.promotionUsage.findMany.mockResolvedValue(mockUsedPromotions);
            mockPrisma.promotion.count.mockResolvedValue(0); // Filtered out

            const result = await promotionService.getPromotions({}, 1, false, 1, 10);

            expect(result.count).toBe(0);
            expect(result.results).toHaveLength(0);
        });

        test('should handle filters correctly', async () => {
            const filters = {
                name: 'Test',
                type: 'automatic',
                started: 'true',
                ended: 'false'
            };

            mockPrisma.promotion.findMany.mockResolvedValue([]);
            mockPrisma.promotion.count.mockResolvedValue(0);

            await promotionService.getPromotions(filters, null, true, 1, 10);

            expect(mockPrisma.promotion.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        name: expect.objectContaining({
                            contains: 'Test'
                        }),
                        type: 'automatic',
                        startTime: expect.objectContaining({
                            lte: expect.any(Date)
                        }),
                        endTime: expect.objectContaining({
                            gt: expect.any(Date)
                        })
                    })
                })
            );
        });

        test('should throw error for both started and ended filters', async () => {
            const filters = {
                started: 'true',
                ended: 'true'
            };

            await expect(
                promotionService.getPromotions(filters, null, true, 1, 10)
            ).rejects.toThrow('Cannot specify both started and ended');
        });

        test('should throw error for invalid page parameter', async () => {
            await expect(
                promotionService.getPromotions({}, null, true, 0, 10)
            ).rejects.toThrow('Page must be a positive integer');
        });

        test('should throw error for invalid limit parameter', async () => {
            await expect(
                promotionService.getPromotions({}, null, true, 1, 0)
            ).rejects.toThrow('Limit must be a positive integer');
        });

        test('should handle non-existent user for regular user request', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await promotionService.getPromotions({}, 999, false, 1, 10);
            
            expect(result).toEqual({
                count: 0,
                results: []
            });
        });
    });

    describe('getPromotion', () => {
        test('should get specific promotion for manager', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                description: 'A test promotion',
                type: 'automatic',
                startTime: new Date('2025-05-10T09:00:00Z'),
                endTime: new Date('2025-05-10T17:00:00Z'),
                minSpending: 50,
                rate: 0.02,
                points: null
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);

            const result = await promotionService.getPromotion(1, null, true);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Promotion',
                description: 'A test promotion',
                type: 'automatic'
            }));
        });

        test('should get active promotion for regular user', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                description: 'A test promotion',
                type: 'automatic',
                startTime: new Date('2024-05-10T09:00:00Z'),
                endTime: new Date('2026-05-10T17:00:00Z'),
                minSpending: 50,
                rate: 0.02,
                points: null
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);

            const result = await promotionService.getPromotion(1, 1, false);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Promotion'
            }));
        });

        test('should throw error for non-existent promotion', async () => {
            mockPrisma.promotion.findUnique.mockResolvedValue(null);

            await expect(
                promotionService.getPromotion(999, null, true)
            ).rejects.toThrow('Promotion not found');
        });

        test('should throw error for inactive promotion accessed by regular user', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                startTime: new Date('2026-05-10T09:00:00Z'),
                endTime: new Date('2026-05-10T17:00:00Z')
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);

            await expect(
                promotionService.getPromotion(1, 1, false)
            ).rejects.toThrow('Promotion not active');
        });

        test('should throw error for expired promotion accessed by regular user', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                startTime: new Date('2023-05-10T09:00:00Z'),
                endTime: new Date('2023-05-10T17:00:00Z') // Past date
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);

            await expect(
                promotionService.getPromotion(1, 1, false)
            ).rejects.toThrow('Promotion not active');
        });
    });

    describe('updatePromotion', () => {
        test('should update promotion successfully', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                type: 'automatic',
                startTime: new Date('2026-05-10T09:00:00Z'),
                endTime: new Date('2026-05-10T17:00:00Z')
            };

            const mockUpdatedPromotion = {
                ...mockPromotion,
                name: 'Updated Promotion',
                description: 'Updated description'
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);
            mockPrisma.promotion.update.mockResolvedValue(mockUpdatedPromotion);

            const result = await promotionService.updatePromotion(1, {
                name: 'Updated Promotion',
                description: 'Updated description'
            });

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Updated Promotion',
                type: mockPromotion.type
            }));
        });

        test('should throw error for updating started promotion details', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                type: 'automatic',
                startTime: new Date('2024-05-10T09:00:00Z'), // Past date
                endTime: new Date('2026-05-10T17:00:00Z')
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);

            await expect(
                promotionService.updatePromotion(1, {
                    name: 'Updated Promotion',
                    type: 'one-time',
                    minSpending: 100
                })
            ).rejects.toThrow('Cannot update a promotion that has already started');
        });

        test('should allow updating end time for started promotion', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                type: 'automatic',
                startTime: new Date('2024-05-10T09:00:00Z'), // Past date
                endTime: new Date('2026-05-10T17:00:00Z')
            };

            const mockUpdatedPromotion = {
                ...mockPromotion,
                endTime: new Date('2027-05-10T17:00:00Z')
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);
            mockPrisma.promotion.update.mockResolvedValue(mockUpdatedPromotion);

            const result = await promotionService.updatePromotion(1, {
                endTime: '2027-05-10T17:00:00Z'
            });

            expect(result).toBeDefined();
        });

        test('should throw error for updating ended promotion', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                startTime: new Date('2023-05-10T09:00:00Z'),
                endTime: new Date('2023-05-10T17:00:00Z') // Past date
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);

            await expect(
                promotionService.updatePromotion(1, {
                    endTime: '2024-05-10T17:00:00Z'
                })
            ).rejects.toThrow('Cannot update a promotion that has already ended');
        });

        test('should throw error for non-existent promotion', async () => {
            mockPrisma.promotion.findUnique.mockResolvedValue(null);

            await expect(
                promotionService.updatePromotion(999, { name: 'Updated' })
            ).rejects.toThrow('Promotion not found');
        });

        test('should handle time validation errors', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                startTime: new Date('2026-05-10T09:00:00Z'),
                endTime: new Date('2026-05-10T17:00:00Z')
            };

            const mockUpdatedPromotion = {
                ...mockPromotion,
                startTime: new Date('2027-05-10T09:00:00Z'),
                endTime: new Date('2027-05-10T17:00:00Z')
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);
            mockPrisma.promotion.update.mockResolvedValue(mockUpdatedPromotion);

            const result = await promotionService.updatePromotion(1, {
                startTime: '2027-05-10T09:00:00Z', // Future date
                endTime: '2027-05-10T17:00:00Z'
            });

            expect(result).toBeDefined();
        });

        test('should handle invalid time range', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                startTime: new Date('2026-05-10T09:00:00Z'),
                endTime: new Date('2026-05-10T17:00:00Z')
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);

            await expect(
                promotionService.updatePromotion(1, {
                    startTime: '2026-05-12T09:00:00Z',
                    endTime: '2026-05-11T17:00:00Z' // End before start
                })
            ).rejects.toThrow('End time must be after start time');
        });
    });

    describe('deletePromotion', () => {
        test('should delete promotion successfully', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                startTime: new Date('2026-05-10T09:00:00Z'),
                endTime: new Date('2026-05-10T17:00:00Z')
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);
            mockPrisma.promotion.delete.mockResolvedValue(mockPromotion);

            const result = await promotionService.deletePromotion(1);

            expect(mockPrisma.promotion.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });

            expect(result).toEqual({ success: true });
        });

        test('should throw error for non-existent promotion', async () => {
            mockPrisma.promotion.findUnique.mockResolvedValue(null);

            await expect(
                promotionService.deletePromotion(999)
            ).rejects.toThrow('Promotion not found');
        });

        test('should throw error for promotion that has already started', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
                startTime: new Date('2024-05-10T09:00:00Z'), // Past date
                endTime: new Date('2026-05-10T17:00:00Z')
            };

            mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);

            await expect(
                promotionService.deletePromotion(1)
            ).rejects.toThrow('Cannot delete a promotion that has already started');
        });
    });
}); 