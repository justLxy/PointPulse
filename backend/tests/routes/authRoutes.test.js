const request = require('supertest');
const app = require('../../index');

// Mock the entire authController since we're testing routes, not business logic
jest.mock('../../controllers/authController', () => ({
    login: jest.fn((req, res) => {
        res.status(200).json({
            token: 'mock-jwt-token',
            expiresAt: '2025-03-10T01:41:47.000Z'
        });
    }),
    requestReset: jest.fn((req, res) => {
        res.status(202).json({
            expiresAt: '2025-03-01T01:41:47.000Z',
            resetToken: 'ad71d4e1-8614-46aa-b96f-cb894e346506'
        });
    }),
    resetPassword: jest.fn((req, res) => {
        res.status(200).json({ success: true });
    }),
    requestEmailLogin: jest.fn((req, res) => {
        res.status(200).json({
            message: 'Login verification email sent',
            expiresAt: '2025-03-10T01:56:47.000Z'
        });
    }),
    verifyEmailLogin: jest.fn((req, res) => {
        res.status(200).json({
            token: 'mock-jwt-token',
            expiresAt: '2025-03-10T01:41:47.000Z'
        });
    })
}));

describe('Auth Routes', () => {
    describe('POST /auth/tokens', () => {
        test('should authenticate user and return JWT token', async () => {
            await request(app)
                .post('/auth/tokens')
                .send({
                    utorid: 'testus01',
                    password: 'TestPassword123!'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('token');
                    expect(response.body).toHaveProperty('expiresAt');
                    expect(response.body.token).toBe('mock-jwt-token');
                });
        });

        test('should handle authentication request without error', async () => {
            await request(app)
                .post('/auth/tokens')
                .send({
                    utorid: 'testus01',
                    password: 'TestPassword123!'
                })
                .expect(200);
        });
    });

    describe('POST /auth/resets', () => {
        test('should request password reset and return reset token', async () => {
            await request(app)
                .post('/auth/resets')
                .send({
                    utorid: 'testus01'
                })
                .expect(202)
                .then((response) => {
                    expect(response.body).toHaveProperty('expiresAt');
                    expect(response.body).toHaveProperty('resetToken');
                    expect(response.body.resetToken).toBe('ad71d4e1-8614-46aa-b96f-cb894e346506');
                });
        });

        test('should handle password reset request', async () => {
            await request(app)
                .post('/auth/resets')
                .send({
                    utorid: 'existinguser'
                })
                .expect(202);
        });
    });

    describe('POST /auth/resets/:resetToken', () => {
        test('should reset password with valid token', async () => {
            const resetToken = 'ad71d4e1-8614-46aa-b96f-cb894e346506';

            await request(app)
                .post(`/auth/resets/${resetToken}`)
                .send({
                    utorid: 'testus01',
                    password: 'NewPassword123!'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('success');
                    expect(response.body.success).toBe(true);
                });
        });

        test('should handle password reset with token', async () => {
            const resetToken = 'valid-reset-token';

            await request(app)
                .post(`/auth/resets/${resetToken}`)
                .send({
                    utorid: 'testus01',
                    password: 'NewPassword123!'
                })
                .expect(200);
        });
    });

    describe('POST /auth/email-login', () => {
        test('should request email login and return success message', async () => {
            await request(app)
                .post('/auth/email-login')
                .send({
                    email: 'test@mail.utoronto.ca'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('message');
                    expect(response.body).toHaveProperty('expiresAt');
                    expect(response.body.message).toBe('Login verification email sent');
                });
        });

        test('should handle email login request without error', async () => {
            await request(app)
                .post('/auth/email-login')
                .send({
                    email: 'user@mail.utoronto.ca'
                })
                .expect(200);
        });
    });

    describe('POST /auth/verify-email', () => {
        test('should verify email login and return JWT token', async () => {
            await request(app)
                .post('/auth/verify-email')
                .send({
                    email: 'test@mail.utoronto.ca',
                    otp: '123456'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('token');
                    expect(response.body).toHaveProperty('expiresAt');
                    expect(response.body.token).toBe('mock-jwt-token');
                });
        });

        test('should handle email verification without error', async () => {
            await request(app)
                .post('/auth/verify-email')
                .send({
                    email: 'user@mail.utoronto.ca',
                    otp: '654321'
                })
                .expect(200);
        });
    });
}); 