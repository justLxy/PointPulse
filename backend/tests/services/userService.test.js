// Mock external dependencies first
jest.mock('@prisma/client');
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));
jest.mock('../../services/emailService');
jest.mock('fs', () => ({
    readdirSync: jest.fn(() => []),
    unlinkSync: jest.fn(),
    existsSync: jest.fn(() => false)
}));
jest.mock('path', () => ({
    join: jest.fn(() => '/mock/path'),
    basename: jest.fn((p) => p),
    resolve: jest.fn((p) => p)
}));

const bcrypt = require('bcrypt');

const mockPrisma = {
    user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    promotion: {
        findMany: jest.fn(),
    },
    promotionUsage: {
        findMany: jest.fn(),
    },
};

// Mock PrismaClient
const { PrismaClient } = require('@prisma/client');
PrismaClient.mockImplementation(() => mockPrisma);

// Import after mocking
const userService = require('../../services/userService');

// FS and path mocks moved to top

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        test('should create a new user successfully', async () => {
            const userData = {
                utorid: 'testus01', // Valid 8-character UTORid
                name: 'Test User',
                email: 'test@mail.utoronto.ca'
            };

            const mockCreatedUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                email: 'test@mail.utoronto.ca',
                verified: false,
                expiresAt: new Date(),
                resetToken: 'mock-token'
            };

            mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

            const result = await userService.createUser(userData, 1);

            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    utorid: 'testus01',
                    name: 'Test User',
                    email: 'test@mail.utoronto.ca',
                    role: 'regular',
                    points: 0,
                    verified: false,
                    resetToken: expect.any(String),
                    expiresAt: expect.any(Date)
                })
            });

            expect(result).toEqual(mockCreatedUser);
        });
    });

    describe('getUsers', () => {
        test('should get paginated list of users', async () => {
            const mockUsers = [
                {
                    id: 1,
                    utorid: 'usero001',
                    name: 'User One',
                    email: 'user1@mail.utoronto.ca',
                    role: 'regular',
                    points: 100,
                    verified: true
                },
                {
                    id: 2,
                    utorid: 'janedo01',
                    name: 'User Two',
                    email: 'user2@mail.utoronto.ca',
                    role: 'cashier',
                    points: 50,
                    verified: false
                }
            ];

            mockPrisma.user.findMany.mockResolvedValue(mockUsers);
            mockPrisma.user.count.mockResolvedValue(2);

            const result = await userService.getUsers({}, 1, 10);

            expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
                where: {},
                select: expect.any(Object),
                skip: 0,
                take: 10,
                orderBy: { id: 'asc' }
            });

            expect(result).toEqual({
                results: mockUsers,
                count: 2
            });
        });

        test('should filter users by name', async () => {
            const mockUsers = [{
                id: 1,
                utorid: 'johndo01',
                name: 'John Doe',
                email: 'john@mail.utoronto.ca'
            }];

            mockPrisma.user.findMany.mockResolvedValue(mockUsers);
            mockPrisma.user.count.mockResolvedValue(1);

            const result = await userService.getUsers({ name: 'John' }, 1, 10);

            expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { utorid: { contains: 'John' } },
                        { name: { contains: 'John' } }
                    ]
                },
                select: expect.any(Object),
                skip: 0,
                take: 10,
                orderBy: { id: 'asc' }
            });

            expect(result.results).toEqual(mockUsers);
        });
    });

    describe('getUserByCashier', () => {
        test('should get user with limited info for cashier', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                points: 100,
                verified: true
            };

            const mockPromotions = [
                {
                    id: 1,
                    name: 'Test Promotion',
                    minSpending: 10,
                    rate: null,
                    points: 20
                }
            ];

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions);
            mockPrisma.promotionUsage.findMany.mockResolvedValue([]);

            const result = await userService.getUserByCashier(1);

            expect(result).toEqual({
                ...mockUser,
                promotions: mockPromotions
            });
        });
    });

    describe('getCurrentUser', () => {
        test('should get current user with promotions', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                email: 'test@mail.utoronto.ca',
                points: 100,
                verified: true,
                role: 'regular'
            };

            const mockPromotions = [];

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions);
            mockPrisma.promotionUsage.findMany.mockResolvedValue([]);

            const result = await userService.getCurrentUser(1);

            expect(result).toEqual({
                ...mockUser,
                promotions: mockPromotions
            });
        });
    });

    describe('updateUserByManager', () => {
        test('should update user verification status', async () => {
            const mockUpdatedUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                verified: true
            };

            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateUserByManager(1, { verified: true });

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { verified: true }
            });

            expect(result).toEqual(mockUpdatedUser);
        });

        test('should update user suspicious status', async () => {
            const mockUpdatedUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                suspicious: false
            };

            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateUserByManager(1, { suspicious: false });

            expect(result).toEqual(mockUpdatedUser);
        });
    });

    describe('updateCurrentUser', () => {
        test('should update current user profile', async () => {
            const updateData = {
                name: 'Updated Name',
                email: 'updated@mail.utoronto.ca',
                birthday: '1990-01-01'
            };

            const mockUpdatedUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Updated Name',
                email: 'updated@mail.utoronto.ca',
                birthday: '1990-01-01',
                verified: true
            };

            mockPrisma.user.findUnique.mockResolvedValue({ utorid: 'testus01' });
            mockPrisma.user.findFirst.mockResolvedValue(null); // No existing user with that email
            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateCurrentUser(1, updateData);

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: expect.objectContaining({
                    name: 'Updated Name',
                    email: 'updated@mail.utoronto.ca',
                    birthday: expect.any(String) // Birthday gets transformed by timezone
                }),
                select: expect.any(Object)
            });

            expect(result).toEqual(mockUpdatedUser);
        });
    });

    describe('updatePassword', () => {
        test('should update user password successfully', async () => {
            const mockUser = {
                id: 1,
                password: 'hashedOldPassword'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('hashedNewPassword');
            mockPrisma.user.update.mockResolvedValue({});

            const result = await userService.updatePassword(1, 'oldPassword', 'NewPassword123!');

            expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', 'hashedOldPassword');
            expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 10);
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { password: 'hashedNewPassword' }
            });

            expect(result).toEqual({ success: true });
        });

        test('should throw error for incorrect old password', async () => {
            const mockUser = {
                id: 1,
                password: 'hashedOldPassword'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(
                userService.updatePassword(1, 'wrongPassword', 'NewPassword123!')
            ).rejects.toThrow('Current password is incorrect');
        });
    });

    describe('getUserIdByUtorid', () => {
        test('should get user ID by utorid', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

            const result = await userService.getUserIdByUtorid('testus01');

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { utorid: 'testus01' },
                select: { id: true }
            });

            expect(result).toBe(1);
        });

        test('should throw error for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                userService.getUserIdByUtorid('nonexistent')
            ).rejects.toThrow('User not found');
        });
    });

    describe('getUserRole', () => {
        test('should get user role by ID', async () => {
            const mockUser = {
                id: 1,
                role: 'manager'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await userService.getUserRole(1);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: {
                    id: true,
                    role: true
                }
            });

            expect(result).toEqual(mockUser);
        });
    });
}); 