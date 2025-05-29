// Mock external dependencies
jest.mock('../../services/authService');
jest.mock('../../utils/validators');

const authController = require('../../controllers/authController');
const authService = require('../../services/authService');
const { validatePassword } = require('../../utils/validators');

describe('AuthController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        req = {
            body: {},
            params: {},
            originalUrl: '/test',
            method: 'POST',
            ip: '127.0.0.1'
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('login', () => {
        test('should login successfully with valid credentials', async () => {
            req.body = {
                utorid: 'testuser1',
                password: 'Password123!'
            };

            const mockAuthResult = {
                token: 'mock-jwt-token',
                expiresAt: '2024-12-31T23:59:59.000Z'
            };

            authService.authenticateUser.mockResolvedValue(mockAuthResult);

            await authController.login(req, res);

            expect(authService.authenticateUser).toHaveBeenCalledWith('testuser1', 'Password123!');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockAuthResult);
        });

        test('should return 400 when utorid is missing', async () => {
            req.body = {
                password: 'Password123!'
            };

            await authController.login(req, res);

            expect(authService.authenticateUser).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'UTORid and password are required'
            });
        });

        test('should return 400 when password is missing', async () => {
            req.body = {
                utorid: 'testuser1'
            };

            await authController.login(req, res);

            expect(authService.authenticateUser).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'UTORid and password are required'
            });
        });

        test('should return 400 when both utorid and password are missing', async () => {
            req.body = {};

            await authController.login(req, res);

            expect(authService.authenticateUser).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'UTORid and password are required'
            });
        });

        test('should return 401 when authentication fails', async () => {
            req.body = {
                utorid: 'testuser1',
                password: 'wrongpassword'
            };

            authService.authenticateUser.mockRejectedValue(new Error('Invalid credentials'));

            await authController.login(req, res);

            expect(authService.authenticateUser).toHaveBeenCalledWith('testuser1', 'wrongpassword');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid credentials'
            });
        });

        test('should handle any authentication service error', async () => {
            req.body = {
                utorid: 'testuser1',
                password: 'Password123!'
            };

            authService.authenticateUser.mockRejectedValue(new Error('Database connection failed'));

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid credentials'
            });
        });
    });

    describe('requestReset', () => {
        test('should request password reset successfully', async () => {
            req.body = {
                utorid: 'testuser1'
            };

            const mockResetResult = {
                resetToken: 'mock-reset-token',
                expiresAt: '2024-12-31T23:59:59.000Z'
            };

            authService.requestPasswordReset.mockResolvedValue(mockResetResult);

            await authController.requestReset(req, res);

            expect(authService.requestPasswordReset).toHaveBeenCalledWith('testuser1', '127.0.0.1');
            expect(res.status).toHaveBeenCalledWith(202);
            expect(res.json).toHaveBeenCalledWith(mockResetResult);
        });

        test('should return 400 when utorid is missing', async () => {
            req.body = {};

            await authController.requestReset(req, res);

            expect(authService.requestPasswordReset).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'UTORid is required'
            });
        });

        test('should return 429 when too many requests', async () => {
            req.body = {
                utorid: 'testuser1'
            };

            authService.requestPasswordReset.mockRejectedValue(new Error('Too many requests'));

            await authController.requestReset(req, res);

            expect(res.status).toHaveBeenCalledWith(429);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Too many requests. Please try again later.'
            });
        });

        test('should return 404 when user not found', async () => {
            req.body = {
                utorid: 'nonexistent'
            };

            authService.requestPasswordReset.mockRejectedValue(new Error('User not found'));

            await authController.requestReset(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User not found'
            });
        });

        test('should return 500 when unexpected error occurs', async () => {
            req.body = {
                utorid: 'testuser1'
            };

            authService.requestPasswordReset.mockRejectedValue(new Error('Database connection failed'));

            await authController.requestReset(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to request password reset'
            });
        });
    });

    describe('resetPassword', () => {
        beforeEach(() => {
            req.params = {
                resetToken: 'valid-reset-token'
            };
            req.body = {
                utorid: 'testuser1',
                password: 'NewPassword123!'
            };
        });

        test('should reset password successfully', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1'
            };

            validatePassword.mockReturnValue(true);
            authService.findUserByResetToken.mockResolvedValue(mockUser);
            authService.isResetTokenExpired.mockResolvedValue(false);
            authService.resetPassword.mockResolvedValue({ success: true });

            await authController.resetPassword(req, res);

            expect(validatePassword).toHaveBeenCalledWith('NewPassword123!');
            expect(authService.findUserByResetToken).toHaveBeenCalledWith('valid-reset-token');
            expect(authService.isResetTokenExpired).toHaveBeenCalledWith('valid-reset-token');
            expect(authService.resetPassword).toHaveBeenCalledWith('valid-reset-token', 'testuser1', 'NewPassword123!');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Password reset successful'
            });
        });

        test('should return 400 when utorid is missing', async () => {
            req.body = {
                password: 'NewPassword123!'
            };

            await authController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'UTORid and password are required'
            });
        });

        test('should return 400 when password is missing', async () => {
            req.body = {
                utorid: 'testuser1'
            };

            await authController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'UTORid and password are required'
            });
        });

        test('should return 400 when password validation fails', async () => {
            validatePassword.mockReturnValue(false);

            await authController.resetPassword(req, res);

            expect(validatePassword).toHaveBeenCalledWith('NewPassword123!');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Password must be 8-20 characters with at least one uppercase letter, one lowercase letter, one number, and one special character'
            });
        });

        test('should return 404 when reset token is invalid', async () => {
            validatePassword.mockReturnValue(true);
            authService.findUserByResetToken.mockResolvedValue(null);

            await authController.resetPassword(req, res);

            expect(authService.findUserByResetToken).toHaveBeenCalledWith('valid-reset-token');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid reset token'
            });
        });

        test('should return 410 when reset token is expired', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1'
            };

            validatePassword.mockReturnValue(true);
            authService.findUserByResetToken.mockResolvedValue(mockUser);
            authService.isResetTokenExpired.mockResolvedValue(true);

            await authController.resetPassword(req, res);

            expect(authService.isResetTokenExpired).toHaveBeenCalledWith('valid-reset-token');
            expect(res.status).toHaveBeenCalledWith(410);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Reset token has expired'
            });
        });

        test('should return 401 when token does not match utorid', async () => {
            const mockUser = {
                id: 1,
                utorid: 'differentuser'
            };

            validatePassword.mockReturnValue(true);
            authService.findUserByResetToken.mockResolvedValue(mockUser);
            authService.isResetTokenExpired.mockResolvedValue(false);

            await authController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Token does not match utorid'
            });
        });

        test('should handle case-insensitive utorid matching', async () => {
            const mockUser = {
                id: 1,
                utorid: 'TESTUSER1'
            };

            req.body.utorid = 'testuser1';

            validatePassword.mockReturnValue(true);
            authService.findUserByResetToken.mockResolvedValue(mockUser);
            authService.isResetTokenExpired.mockResolvedValue(false);
            authService.resetPassword.mockResolvedValue({ success: true });

            await authController.resetPassword(req, res);

            expect(authService.resetPassword).toHaveBeenCalledWith('valid-reset-token', 'testuser1', 'NewPassword123!');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Password reset successful'
            });
        });

        test('should return 500 when unexpected error occurs', async () => {
            validatePassword.mockReturnValue(true);
            authService.findUserByResetToken.mockRejectedValue(new Error('Database connection failed'));

            await authController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to reset password'
            });
        });

        test('should return 500 when resetPassword service fails', async () => {
            const mockUser = {
                id: 1,
                utorid: 'testuser1'
            };

            validatePassword.mockReturnValue(true);
            authService.findUserByResetToken.mockResolvedValue(mockUser);
            authService.isResetTokenExpired.mockResolvedValue(false);
            authService.resetPassword.mockRejectedValue(new Error('Reset operation failed'));

            await authController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to reset password'
            });
        });
    });
}); 