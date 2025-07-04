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
    requestOTP: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            expiresAt: '2025-03-10T01:41:47.000Z'
        });
    }),
    verifyOTP: jest.fn((req, res) => {
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
    });

    describe('POST /auth/otp/request', () => {
        test('should request OTP and return success', async () => {
            await request(app)
                .post('/auth/otp/request')
                .send({
                    email: 'test@mail.utoronto.ca'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('success');
                    expect(response.body).toHaveProperty('expiresAt');
                    expect(response.body.success).toBe(true);
                });
        });

        test('should handle OTP request without error', async () => {
            await request(app)
                .post('/auth/otp/request')
                .send({
                    email: 'test@mail.utoronto.ca'
                })
                .expect(200);
        });
    });

    describe('POST /auth/otp/verify', () => {
        test('should verify OTP and return JWT token', async () => {
            await request(app)
                .post('/auth/otp/verify')
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

        test('should handle OTP verification without error', async () => {
            await request(app)
                .post('/auth/otp/verify')
                .send({
                    email: 'test@mail.utoronto.ca',
                    otp: '123456'
                })
                .expect(200);
        });
    });
}); 