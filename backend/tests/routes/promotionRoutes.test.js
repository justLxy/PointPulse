const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock the promotion controller - must be before importing app
jest.mock('../../controllers/promotionController', () => ({
    createPromotion: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            name: 'Test Promotion',
            description: 'A test promotion',
            type: 'automatic',
            startTime: '2025-05-10T09:00:00.000Z',
            endTime: '2025-05-10T17:00:00.000Z',
            minSpending: 50,
            rate: 0.02,
            points: null
        });
    }),
    getPromotions: jest.fn((req, res) => {
        res.status(200).json({
            count: 1,
            results: [
                {
                    id: 1,
                    name: 'Test Promotion',
                    type: 'automatic',
                    endTime: '2025-05-10T17:00:00.000Z',
                    minSpending: 50,
                    rate: 0.02,
                    points: null
                }
            ]
        });
    }),
    getPromotion: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            name: 'Test Promotion',
            description: 'A test promotion',
            type: 'automatic',
            endTime: '2025-05-10T17:00:00.000Z',
            minSpending: 50,
            rate: 0.02,
            points: null
        });
    }),
    updatePromotion: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            name: 'Updated Promotion',
            type: 'automatic',
            description: 'Updated description'
        });
    }),
    deletePromotion: jest.fn((req, res) => {
        res.status(204).send();
    })
}));

// Import after mocking
const app = require('../../index');
const { JWT_SECRET } = require('../../utils/jwtConfig');

// Helper function to generate JWT tokens for testing
const generateTestToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

describe('Promotion Routes', () => {
    describe('POST /promotions', () => {
        test('should create a new promotion with manager role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .post('/promotions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Test Promotion',
                    description: 'A test promotion',
                    type: 'automatic',
                    startTime: '2025-05-10T09:00:00Z',
                    endTime: '2025-05-10T17:00:00Z',
                    minSpending: 50,
                    rate: 0.02,
                    points: null
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('id');
                    expect(response.body).toHaveProperty('name', 'Test Promotion');
                    expect(response.body).toHaveProperty('type', 'automatic');
                    expect(response.body).toHaveProperty('startTime');
                    expect(response.body).toHaveProperty('endTime');
                });
        });

        test('should reject promotion creation with regular role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'usero001', role: 'regular' });

            await request(app)
                .post('/promotions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Test Promotion',
                    description: 'A test promotion',
                    type: 'automatic',
                    startTime: '2025-05-10T09:00:00Z',
                    endTime: '2025-05-10T17:00:00Z'
                })
                .expect(403);
        });
    });

    describe('GET /promotions', () => {
        test('should get promotions with regular role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'usero001', role: 'regular' });

            await request(app)
                .get('/promotions')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('count');
                    expect(response.body).toHaveProperty('results');
                    expect(Array.isArray(response.body.results)).toBe(true);
                });
        });

        test('should get promotions with manager role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .get('/promotions')
                .set('Authorization', `Bearer ${token}`)
                .query({ page: 1, limit: 10 })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('count');
                    expect(response.body).toHaveProperty('results');
                });
        });

        test('should get promotions with filters', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .get('/promotions')
                .set('Authorization', `Bearer ${token}`)
                .query({
                    name: 'Test',
                    type: 'automatic',
                    started: 'true'
                })
                .expect(200);
        });
    });

    describe('GET /promotions/:promotionId', () => {
        test('should get specific promotion with regular role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'usero001', role: 'regular' });

            await request(app)
                .get('/promotions/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id', 1);
                    expect(response.body).toHaveProperty('name', 'Test Promotion');
                    expect(response.body).toHaveProperty('description', 'A test promotion');
                    expect(response.body).toHaveProperty('type', 'automatic');
                });
        });

        test('should get specific promotion with manager role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .get('/promotions/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id', 1);
                    expect(response.body).toHaveProperty('name', 'Test Promotion');
                });
        });
    });

    describe('PATCH /promotions/:promotionId', () => {
        test('should update promotion with manager role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .patch('/promotions/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Promotion',
                    description: 'Updated description'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id', 1);
                    expect(response.body).toHaveProperty('name', 'Updated Promotion');
                    expect(response.body).toHaveProperty('type', 'automatic');
                });
        });

        test('should reject promotion update with regular role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'usero001', role: 'regular' });

            await request(app)
                .patch('/promotions/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Promotion'
                })
                .expect(403);
        });

        test('should update promotion rates and points', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .patch('/promotions/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rate: 0.05,
                    points: 100,
                    minSpending: 75
                })
                .expect(200);
        });
    });

    describe('DELETE /promotions/:promotionId', () => {
        test('should delete promotion with manager role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .delete('/promotions/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(204);
        });

        test('should reject promotion deletion with regular role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'usero001', role: 'regular' });

            await request(app)
                .delete('/promotions/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });

        test('should reject promotion deletion with cashier role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'cashie01', role: 'cashier' });

            await request(app)
                .delete('/promotions/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });
    });
}); 