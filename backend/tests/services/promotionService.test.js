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

        test('should throw error for missing name', async () => {
            const promotionData = {
                description: 'A test promotion',
                type: 'automatic',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-10T17:00:00Z'
            };

            await expect(
                promotionService.createPromotion(promotionData)
            ).rejects.toThrow('Promotion name is required');
        });

        test('should throw error for invalid type', async () => {
            const promotionData = {
                name: 'Test Promotion',
                description: 'A test promotion',
                type: 'invalid',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-10T17:00:00Z'
            };

            await expect(
                promotionService.createPromotion(promotionData)
            ).rejects.toThrow('Promotion type must be either "automatic" or "one-time"');
        });

        test('should throw error when end time is before start time', async () => {
            const promotionData = {
                name: 'Test Promotion',
                description: 'A test promotion',
                type: 'automatic',
                startTime: '2025-05-10T17:00:00Z',
                endTime: '2025-05-10T09:00:00Z'
            };

            await expect(
                promotionService.createPromotion(promotionData)
            ).rejects.toThrow('End time must be after start time');
        });
    });

    describe('getPromotions', () => {
        test('should get promotions for manager', async () => {
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

        test('should throw error for invalid page parameter', async () => {
            await expect(
                promotionService.getPromotions({}, null, true, 0, 10)
            ).rejects.toThrow('Page must be a positive integer');
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
    });

    describe('updatePromotion', () => {
        test('should update promotion successfully', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Test Promotion',
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

        test('should throw error for non-existent promotion', async () => {
            mockPrisma.promotion.findUnique.mockResolvedValue(null);

            await expect(
                promotionService.updatePromotion(999, { name: 'Updated' })
            ).rejects.toThrow('Promotion not found');
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