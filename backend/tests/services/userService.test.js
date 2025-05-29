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
        test('should throw error for no fields provided', async () => {
            await expect(
                userService.updateCurrentUser(1, {})
            ).rejects.toThrow('No fields provided for update');
        });

        test('should throw error for all null fields', async () => {
            await expect(
                userService.updateCurrentUser(1, { name: null, email: null, birthday: null })
            ).rejects.toThrow('No fields provided for update');
        });

        test('should throw error for empty name', async () => {
            await expect(
                userService.updateCurrentUser(1, { name: '' })
            ).rejects.toThrow('Name cannot be empty');
        });

        test('should throw error for name too long', async () => {
            const longName = 'a'.repeat(51);
            await expect(
                userService.updateCurrentUser(1, { name: longName })
            ).rejects.toThrow('Name must be between 1 and 50 characters');
        });

        test('should throw error for invalid email format', async () => {
            await expect(
                userService.updateCurrentUser(1, { email: 'invalid@gmail.com' })
            ).rejects.toThrow('Invalid email format');
        });

        test('should throw error for email already in use', async () => {
            const existingUser = {
                id: 2,
                email: 'existing@mail.utoronto.ca'
            };

            mockPrisma.user.findFirst.mockResolvedValue(existingUser);

            await expect(
                userService.updateCurrentUser(1, { email: 'existing@mail.utoronto.ca' })
            ).rejects.toThrow('Email already in use');
        });

        test('should throw error for empty birthday', async () => {
            await expect(
                userService.updateCurrentUser(1, { birthday: '' })
            ).rejects.toThrow('Birthday cannot be empty');
        });

        test('should throw error for invalid birthday format', async () => {
            await expect(
                userService.updateCurrentUser(1, { birthday: '1990/01/01' })
            ).rejects.toThrow('Birthday must be in YYYY-MM-DD format');
        });

        test('should throw error for invalid date', async () => {
            await expect(
                userService.updateCurrentUser(1, { birthday: '1990-02-30' })
            ).rejects.toThrow('Invalid date');
        });

        test('should throw error for future year', async () => {
            const futureYear = new Date().getFullYear() + 1;
            await expect(
                userService.updateCurrentUser(1, { birthday: `${futureYear}-01-01` })
            ).rejects.toThrow('Year cannot be in the future');
        });

        test('should update user successfully with valid data', async () => {
            const mockUpdatedUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Updated Name',
                email: 'updated@mail.utoronto.ca',
                birthday: '1990-01-01',
                verified: true
            };

            mockPrisma.user.findFirst.mockResolvedValue(null); // No existing user with same email
            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateCurrentUser(1, {
                name: 'Updated Name',
                email: 'updated@mail.utoronto.ca',
                birthday: '1990-01-01'
            });

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    name: 'Updated Name',
                    email: 'updated@mail.utoronto.ca',
                    birthday: expect.any(String)
                },
                select: expect.objectContaining({
                    id: true,
                    utorid: true,
                    name: true,
                    email: true,
                    birthday: true,
                    role: true,
                    points: true,
                    createdAt: true,
                    lastLogin: true,
                    verified: true,
                    avatarUrl: true
                })
            });

            expect(result.verified).toBe(true); // Should be boolean
            expect(result).toEqual(mockUpdatedUser);
        });

        test('should update user with avatar URL', async () => {
            const mockUpdatedUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                avatarUrl: '/path/to/avatar.jpg',
                verified: false
            };

            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateCurrentUser(1, {}, '/path/to/avatar.jpg');

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { avatarUrl: '/path/to/avatar.jpg' },
                select: expect.any(Object)
            });

            expect(result.verified).toBe(false); // Should be boolean
            expect(result).toEqual(mockUpdatedUser);
        });

        test('should handle database errors', async () => {
            mockPrisma.user.findFirst.mockResolvedValue(null);
            mockPrisma.user.update.mockRejectedValue(new Error('Database error'));

            await expect(
                userService.updateCurrentUser(1, { name: 'Valid Name' })
            ).rejects.toThrow('Database error');
        });

        test('should handle birthday parsing correctly', async () => {
            const mockUpdatedUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                birthday: '1990-01-01',
                verified: true
            };

            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateCurrentUser(1, { birthday: '1990-01-01' });

            // The birthday should be formatted correctly
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    birthday: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
                },
                select: expect.any(Object)
            });
        });

        test('should handle email validation with existing user check', async () => {
            const sameUser = {
                id: 1,
                email: 'test@mail.utoronto.ca'
            };

            const mockUpdatedUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                email: 'test@mail.utoronto.ca',
                verified: true
            };

            // User with same ID should NOT trigger the "already in use" error
            mockPrisma.user.findFirst.mockResolvedValue(null); // Return null for same user
            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateCurrentUser(1, { email: 'test@mail.utoronto.ca' });

            expect(result).toEqual(mockUpdatedUser);
        });

        test('should throw error for empty email', async () => {
            await expect(
                userService.updateCurrentUser(1, { email: '' })
            ).rejects.toThrow('Email cannot be empty');
        });

        test('should handle avatar cleanup with existing files', async () => {
            const fs = require('fs');
            const path = require('path');
            
            // Mock existing user
            const mockUser = {
                id: 1,
                utorid: 'testus01'
            };

            // Mock file system operations
            fs.readdirSync.mockReturnValue(['testus01-old.jpg', 'testus01-new.jpg', 'other-file.jpg']);
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementation(() => {}); // Mock successful deletion
            path.join.mockReturnValue('/mock/path');

            const mockUpdatedUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                avatarUrl: '/path/to/testus01-new.jpg',
                verified: true
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateCurrentUser(1, {}, '/path/to/testus01-new.jpg');

            expect(fs.unlinkSync).toHaveBeenCalled(); // Should delete old avatar
            expect(result).toEqual(mockUpdatedUser);
        });

        test('should handle avatar cleanup errors gracefully', async () => {
            const fs = require('fs');
            const path = require('path');
            
            // Mock existing user
            const mockUser = {
                id: 1,
                utorid: 'testus01'
            };

            // Mock file system operations with errors
            fs.readdirSync.mockReturnValue(['testus01-old.jpg']);
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementation(() => {
                throw new Error('File deletion failed');
            });
            path.join.mockReturnValue('/mock/path');

            const mockUpdatedUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                avatarUrl: '/path/to/testus01-new.jpg',
                verified: true
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            // Should not throw error even if file deletion fails
            const result = await userService.updateCurrentUser(1, {}, '/path/to/testus01-new.jpg');

            expect(result).toEqual(mockUpdatedUser);
        });

        test('should handle avatar cleanup directory read errors', async () => {
            const fs = require('fs');
            
            // Mock existing user
            const mockUser = {
                id: 1,
                utorid: 'testus01'
            };

            // Mock file system operations with directory read error
            fs.readdirSync.mockImplementation(() => {
                throw new Error('Directory read failed');
            });
            fs.existsSync.mockReturnValue(true);

            const mockUpdatedUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                avatarUrl: '/path/to/testus01-new.jpg',
                verified: true
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            // Should not throw error even if directory read fails
            const result = await userService.updateCurrentUser(1, {}, '/path/to/testus01-new.jpg');

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

        test('should throw error for user without password', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                password: null // No password set
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(
                userService.updatePassword(1, 'oldPassword', 'NewPassword123!')
            ).rejects.toThrow('Current password is incorrect');
        });

        test('should throw error for invalid new password format', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                password: 'hashedOldPassword'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true); // Old password is correct

            await expect(
                userService.updatePassword(1, 'oldPassword', 'weak') // Invalid new password
            ).rejects.toThrow('New password must be 8-20 characters with at least one uppercase letter, one lowercase letter, one number, and one special character');
        });
    });

    describe('updatePassword - additional coverage', () => {
        test('should throw error for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                userService.updatePassword(999, 'oldPassword', 'NewPassword123!')
            ).rejects.toThrow('User not found');
        });

        test('should throw error for user without password', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                password: null // No password set
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            await expect(
                userService.updatePassword(1, 'oldPassword', 'NewPassword123!')
            ).rejects.toThrow('Current password is incorrect');
        });

        test('should throw error for invalid new password format', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                password: 'hashedOldPassword'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true); // Old password is correct

            await expect(
                userService.updatePassword(1, 'oldPassword', 'weak') // Invalid new password
            ).rejects.toThrow('New password must be 8-20 characters with at least one uppercase letter, one lowercase letter, one number, and one special character');
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

    describe('getUserByManager', () => {
        test('should get user by manager with full details', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testus01',
                name: 'Test User',
                email: 'test@mail.utoronto.ca',
                birthday: '1990-01-01',
                role: 'regular',
                points: 100,
                verified: true,
                suspicious: false,
                avatarUrl: null
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

            const result = await userService.getUserByManager(1);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: expect.objectContaining({
                    id: true,
                    utorid: true,
                    name: true,
                    email: true,
                    birthday: true,
                    role: true,
                    points: true,
                    createdAt: true,
                    lastLogin: true,
                    verified: true,
                    suspicious: true,
                    avatarUrl: true
                })
            });

            expect(result).toEqual({
                ...mockUser,
                promotions: mockPromotions
            });
        });

        test('should throw error for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                userService.getUserByManager(999)
            ).rejects.toThrow('User not found');
        });
    });

    describe('updateUserRoleBySuperuser', () => {
        test('should update user role to manager', async () => {
            const mockUpdatedUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                role: 'manager'
            };

            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateUserRoleBySuperuser(1, 'manager');

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { role: 'manager' },
                select: {
                    id: true,
                    utorid: true,
                    name: true,
                    role: true
                }
            });

            expect(result).toEqual(mockUpdatedUser);
        });

        test('should update user role to superuser', async () => {
            const mockUpdatedUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                role: 'superuser'
            };

            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateUserRoleBySuperuser(1, 'SUPERUSER');

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { role: 'superuser' },
                select: {
                    id: true,
                    utorid: true,
                    name: true,
                    role: true
                }
            });

            expect(result).toEqual(mockUpdatedUser);
        });

        test('should throw error for invalid role', async () => {
            await expect(
                userService.updateUserRoleBySuperuser(1, 'invalid')
            ).rejects.toThrow('Invalid role');
        });

        test('should handle database errors', async () => {
            mockPrisma.user.update.mockRejectedValue(new Error('Database error'));

            await expect(
                userService.updateUserRoleBySuperuser(1, 'manager')
            ).rejects.toThrow('Database error');
        });
    });

    describe('createUser - validation and error handling', () => {
        test('should throw error for invalid UTORid', async () => {
            const userData = {
                utorid: 'invalid', // Less than 8 characters
                name: 'Test User',
                email: 'test@mail.utoronto.ca'
            };

            await expect(
                userService.createUser(userData, 1)
            ).rejects.toThrow('UTORid must be 8 alphanumeric characters');
        });

        test('should throw error for invalid name', async () => {
            const userData = {
                utorid: 'testus01',
                name: '', // Empty name
                email: 'test@mail.utoronto.ca'
            };

            await expect(
                userService.createUser(userData, 1)
            ).rejects.toThrow('Name must be between 1 and 50 characters');
        });

        test('should throw error for invalid email', async () => {
            const userData = {
                utorid: 'testus01',
                name: 'Test User',
                email: 'invalid@gmail.com' // Not UofT email
            };

            await expect(
                userService.createUser(userData, 1)
            ).rejects.toThrow('Email must be a valid University of Toronto email');
        });

        test('should throw error for existing user', async () => {
            const userData = {
                utorid: 'testus01',
                name: 'Test User',
                email: 'test@mail.utoronto.ca'
            };

            const existingUser = {
                id: 1,
                utorid: 'testus01',
                email: 'test@mail.utoronto.ca'
            };

            mockPrisma.user.findFirst.mockResolvedValue(existingUser);

            await expect(
                userService.createUser(userData, 1)
            ).rejects.toThrow('A user with this UTORid or email already exists');
        });
    });

    describe('getUsers - advanced filtering and validation', () => {
        test('should filter by role', async () => {
            const mockUsers = [
                {
                    id: 1,
                    utorid: 'cash001',
                    name: 'Cashier One',
                    role: 'cashier'
                }
            ];

            mockPrisma.user.findMany.mockResolvedValue(mockUsers);
            mockPrisma.user.count.mockResolvedValue(1);

            const result = await userService.getUsers({ role: 'cashier' }, 1, 10);

            expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
                where: { role: 'cashier' },
                select: expect.any(Object),
                skip: 0,
                take: 10,
                orderBy: { id: 'asc' }
            });

            expect(result.results).toEqual(mockUsers);
        });

        test('should filter by verified status', async () => {
            mockPrisma.user.findMany.mockResolvedValue([]);
            mockPrisma.user.count.mockResolvedValue(0);

            await userService.getUsers({ verified: 'true' }, 1, 10);

            expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
                where: { verified: true },
                select: expect.any(Object),
                skip: 0,
                take: 10,
                orderBy: { id: 'asc' }
            });
        });

        test('should filter by activated status', async () => {
            mockPrisma.user.findMany.mockResolvedValue([]);
            mockPrisma.user.count.mockResolvedValue(0);

            await userService.getUsers({ activated: 'true' }, 1, 10);

            expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
                where: { lastLogin: { not: null } },
                select: expect.any(Object),
                skip: 0,
                take: 10,
                orderBy: { id: 'asc' }
            });
        });

        test('should filter by not activated status', async () => {
            mockPrisma.user.findMany.mockResolvedValue([]);
            mockPrisma.user.count.mockResolvedValue(0);

            await userService.getUsers({ activated: 'false' }, 1, 10);

            expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
                where: { lastLogin: null },
                select: expect.any(Object),
                skip: 0,
                take: 10,
                orderBy: { id: 'asc' }
            });
        });

        test('should throw error for invalid page', async () => {
            await expect(
                userService.getUsers({}, 0, 10)
            ).rejects.toThrow('Invalid page number');
        });

        test('should throw error for invalid limit', async () => {
            await expect(
                userService.getUsers({}, 1, 0)
            ).rejects.toThrow('Invalid limit number');
        });

        test('should handle complex filtering', async () => {
            mockPrisma.user.findMany.mockResolvedValue([]);
            mockPrisma.user.count.mockResolvedValue(0);

            await userService.getUsers({
                name: 'John',
                role: 'manager',
                verified: 'false',
                activated: 'true'
            }, 2, 5);

            expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { utorid: { contains: 'John' } },
                        { name: { contains: 'John' } }
                    ],
                    role: 'manager',
                    verified: false,
                    lastLogin: { not: null }
                },
                select: expect.any(Object),
                skip: 5,
                take: 5,
                orderBy: { id: 'asc' }
            });
        });
    });

    describe('getUserByCashier - error handling', () => {
        test('should throw error for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                userService.getUserByCashier(999)
            ).rejects.toThrow('User not found');
        });
    });

    describe('getCurrentUser - error handling', () => {
        test('should throw error for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                userService.getCurrentUser(999)
            ).rejects.toThrow('User not found');
        });
    });

    describe('updateUserByManager - advanced scenarios', () => {
        test('should throw error for no fields provided', async () => {
            await expect(
                userService.updateUserByManager(1, {})
            ).rejects.toThrow('No fields provided for update');
        });

        test('should update user email', async () => {
            const mockUpdatedUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                email: 'newemail@mail.utoronto.ca'
            };

            mockPrisma.user.findFirst.mockResolvedValue(null); // No existing user with this email
            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateUserByManager(1, { email: 'newemail@mail.utoronto.ca' });

            expect(result).toEqual(mockUpdatedUser);
        });

        test('should throw error for invalid email', async () => {
            await expect(
                userService.updateUserByManager(1, { email: 'invalid@gmail.com' })
            ).rejects.toThrow('Email must be a valid University of Toronto email');
        });

        test('should throw error for email already in use', async () => {
            const existingUser = {
                id: 2,
                email: 'existing@mail.utoronto.ca'
            };

            mockPrisma.user.findFirst.mockResolvedValue(existingUser);

            await expect(
                userService.updateUserByManager(1, { email: 'existing@mail.utoronto.ca' })
            ).rejects.toThrow('Email already in use by another user');
        });

        test('should update user role', async () => {
            const mockUpdatedUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                role: 'cashier'
            };

            mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

            const result = await userService.updateUserByManager(1, { role: 'CASHIER' });

            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { role: 'cashier' }
            });

            expect(result).toEqual(mockUpdatedUser);
        });

        test('should throw error for invalid role', async () => {
            await expect(
                userService.updateUserByManager(1, { role: 'invalid' })
            ).rejects.toThrow('Role must be either "cashier" or "regular"');
        });

        test('should throw error for invalid verified value', async () => {
            await expect(
                userService.updateUserByManager(1, { verified: false })
            ).rejects.toThrow('Verified must be true');
        });

        test('should throw error for invalid suspicious value', async () => {
            await expect(
                userService.updateUserByManager(1, { suspicious: 'invalid' })
            ).rejects.toThrow('Suspicious must be a boolean or string "true"/"false"');
        });

        test('should handle database errors', async () => {
            mockPrisma.user.update.mockRejectedValue(new Error('Database error'));

            await expect(
                userService.updateUserByManager(1, { verified: true })
            ).rejects.toThrow('Database error');
        });
    });
}); 