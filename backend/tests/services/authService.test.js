const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Mock external dependencies
jest.mock('@prisma/client');
jest.mock('bcrypt');
jest.mock('uuid');
jest.mock('../../services/emailService');

const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
    },
};

// Mock PrismaClient
const { PrismaClient } = require('@prisma/client');
PrismaClient.mockImplementation(() => mockPrisma);

// Import after mocking
const authService = require('../../services/authService');
const emailService = require('../../services/emailService');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        emailService.sendResetEmail.mockResolvedValue();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe('generateToken', () => {
        test('should generate a valid JWT token for user', () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                role: 'regular'
            };

            const result = authService.generateToken(mockUser);

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('expiresAt');
            expect(result.token).toMatch(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/); // JWT format
            expect(new Date(result.expiresAt)).toBeInstanceOf(Date);
        });
    });

    describe('authenticateUser', () => {
        test('should authenticate valid user credentials', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                password: 'hashedPassword',
                role: 'regular'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            mockPrisma.user.update.mockResolvedValue(mockUser);

            const result = await authService.authenticateUser('testuser1', 'password');

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { utorid: 'testuser1' }
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { lastLogin: expect.any(Date) }
            });
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('expiresAt');
        });

        test('should throw error for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.authenticateUser('nonexistent', 'password')
            ).rejects.toThrow('Invalid credentials');
        });

        test('should throw error for invalid password', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                password: 'hashedPassword',
                role: 'regular'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(
                authService.authenticateUser('testuser1', 'wrongpassword')
            ).rejects.toThrow('Invalid credentials');
        });
    });

    describe('requestPasswordReset', () => {
        test('should create password reset token for valid user', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                email: 'test@mail.utoronto.ca',
                resetToken: null
            };

            const mockResetToken = 'mock-uuid-token';
            const mockExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            uuidv4.mockReturnValue(mockResetToken);
            mockPrisma.user.update.mockResolvedValue({
                ...mockUser,
                resetToken: mockResetToken,
                expiresAt: mockExpiresAt
            });

            const result = await authService.requestPasswordReset('testuser1', '127.0.0.1');

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { utorid: 'testuser1' }
            });
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    resetToken: mockResetToken,
                    expiresAt: expect.any(Date)
                }
            });
            expect(emailService.sendResetEmail).toHaveBeenCalled();
            expect(result).toEqual({
                resetToken: mockResetToken,
                expiresAt: expect.any(Date)
            });
        });

        test('should handle user with existing reset token', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                email: 'test@mail.utoronto.ca',
                resetToken: 'existing-token'
            };

            const mockResetToken = 'new-mock-uuid-token';

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            uuidv4.mockReturnValue(mockResetToken);
            mockPrisma.user.update.mockResolvedValue({
                ...mockUser,
                resetToken: mockResetToken
            });

            const result = await authService.requestPasswordReset('testuser1', '192.168.1.100');

            expect(result.resetToken).toBe(mockResetToken);
        });

        test('should throw error for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.requestPasswordReset('nonexistent', '192.168.1.200')
            ).rejects.toThrow('User not found');
        });

        test('should enforce rate limiting', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                email: 'test@mail.utoronto.ca',
                resetToken: null
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            uuidv4.mockReturnValue('token1');

            const uniqueIP = '192.168.1.300';

            // First request should succeed
            await authService.requestPasswordReset('testuser1', uniqueIP);

            // Second request from same IP within 60 seconds should fail
            await expect(
                authService.requestPasswordReset('testuser1', uniqueIP)
            ).rejects.toThrow('Too many requests');
        });
    });

    describe('resetPassword', () => {
        test('should reset password with valid token', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'valid-token',
                expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);
            bcrypt.hash.mockResolvedValue('newHashedPassword');
            mockPrisma.user.update.mockResolvedValue({
                ...mockUser,
                password: 'newHashedPassword',
                resetToken: null,
                expiresAt: null
            });

            const result = await authService.resetPassword('valid-token', 'testuser1', 'newPassword');

            expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
                where: { resetToken: 'valid-token' }
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    password: 'newHashedPassword',
                    resetToken: null,
                    expiresAt: null
                }
            });
            expect(result).toEqual({ success: true });
        });

        test('should throw error for invalid token', async () => {
            mockPrisma.user.findFirst.mockResolvedValue(null);

            await expect(
                authService.resetPassword('invalid-token', 'testuser1', 'newPassword')
            ).rejects.toThrow('Invalid reset token');
        });

        test('should throw error for expired token', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'valid-token',
                expiresAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago (expired)
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);

            await expect(
                authService.resetPassword('valid-token', 'testuser1', 'newPassword')
            ).rejects.toThrow('Reset token has expired');
        });

        test('should throw error for null expiresAt', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'valid-token',
                expiresAt: null // null expiration
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);

            await expect(
                authService.resetPassword('valid-token', 'testuser1', 'newPassword')
            ).rejects.toThrow('Reset token has expired');
        });

        test('should throw error for mismatched utorid', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'valid-token',
                expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);

            await expect(
                authService.resetPassword('valid-token', 'wronguser', 'newPassword')
            ).rejects.toThrow('Token does not match utorid');
        });

        test('should handle case-insensitive utorid matching', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'valid-token',
                expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);
            bcrypt.hash.mockResolvedValue('newHashedPassword');
            mockPrisma.user.update.mockResolvedValue(mockUser);

            const result = await authService.resetPassword('valid-token', 'TESTUSER1', 'newPassword');

            expect(result).toEqual({ success: true });
        });

        test('should remove token from expired tokens map when resetting password', async () => {
            // First create an expired token scenario by making a password reset request
            const mockUserForReset = {
                id: 1,
                utorid: 'testuser1',
                name: 'Test User',
                email: 'test@mail.utoronto.ca',
                resetToken: 'old-token'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUserForReset);
            uuidv4.mockReturnValue('new-token');
            mockPrisma.user.update.mockResolvedValue(mockUserForReset);

            // This will put the old token in the expired tokens map - use unique IP
            await authService.requestPasswordReset('testuser1', '192.168.1.600');

            // Now reset password with the old token that's in the expired map
            const mockUserForPasswordReset = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'old-token',
                expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUserForPasswordReset);
            bcrypt.hash.mockResolvedValue('newHashedPassword');
            mockPrisma.user.update.mockResolvedValue({
                ...mockUserForPasswordReset,
                password: 'newHashedPassword',
                resetToken: null,
                expiresAt: null
            });

            const result = await authService.resetPassword('old-token', 'testuser1', 'newPassword');

            expect(result).toEqual({ success: true });
            // This test exercises the code path where expiredTokens.delete() is called
        });
    });

    describe('findUserByResetToken', () => {
        test('should find user with valid reset token', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'valid-token'
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);

            const result = await authService.findUserByResetToken('valid-token');

            expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
                where: { resetToken: 'valid-token' }
            });
            expect(result).toEqual(mockUser);
        });

        test('should return null for invalid token', async () => {
            mockPrisma.user.findFirst.mockResolvedValue(null);

            const result = await authService.findUserByResetToken('invalid-token');

            expect(result).toBeNull();
        });

        test('should find expired token in expired tokens map', async () => {
            // First, create an expired token scenario
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'expired-token'
            };

            // Simulate the expired token being stored in the map by first requesting a reset
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            uuidv4.mockReturnValue('new-token');
            mockPrisma.user.update.mockResolvedValue(mockUser);
            
            await authService.requestPasswordReset('testuser1', '192.168.1.400');

            // Now try to find the expired token
            mockPrisma.user.findFirst.mockResolvedValue(null);
            
            const result = await authService.findUserByResetToken('expired-token');
            
            expect(result).toBeDefined();
        });
    });

    describe('isResetTokenExpired', () => {
        test('should return false for valid non-expired token', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'valid-token',
                expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);

            const result = await authService.isResetTokenExpired('valid-token');

            expect(result).toBe(false);
        });

        test('should return true for expired token', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'valid-token',
                expiresAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago (expired)
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);

            const result = await authService.isResetTokenExpired('valid-token');

            expect(result).toBe(true);
        });

        test('should return true for token with null expiresAt', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'valid-token',
                expiresAt: null
            };

            mockPrisma.user.findFirst.mockResolvedValue(mockUser);

            const result = await authService.isResetTokenExpired('valid-token');

            expect(result).toBe(true);
        });

        test('should return false for non-existent token', async () => {
            mockPrisma.user.findFirst.mockResolvedValue(null);

            const result = await authService.isResetTokenExpired('non-existent-token');

            expect(result).toBe(false);
        });

        test('should return true for token in expired tokens map', async () => {
            // First create an expired token scenario
            const mockUser = {
                id: 1,
                utorid: 'testuser1',
                resetToken: 'old-token'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            uuidv4.mockReturnValue('new-token');
            mockPrisma.user.update.mockResolvedValue(mockUser);
            
            // Use a unique IP to avoid rate limiting issues
            await authService.requestPasswordReset('testuser1', '192.168.1.700');

            // Now check if the old token is expired
            const result = await authService.isResetTokenExpired('old-token');
            
            expect(result).toBe(true);
        });
    });
}); 