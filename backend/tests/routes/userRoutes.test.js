const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock all the controllers since we're testing routes - must be before importing app
jest.mock('../../controllers/userController', () => ({
    createUser: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            utorid: 'testus01',
            name: 'Test User',
            email: 'test@mail.utoronto.ca',
            verified: false,
            expiresAt: '2025-03-10T01:41:47.000Z',
            resetToken: 'mock-reset-token'
        });
    }),
    getUsers: jest.fn((req, res) => {
        res.status(200).json({
            count: 2,
            results: [
                {
                    id: 1,
                    utorid: 'usero001',
                    name: 'User One',
                    role: 'regular',
                    points: 100
                },
                {
                    id: 2,
                    utorid: 'usero002',
                    name: 'User Two',
                    role: 'cashier',
                    points: 50
                }
            ]
        });
    }),
    getCurrentUser: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            utorid: 'testus01',
            name: 'Test User',
            email: 'test@mail.utoronto.ca',
            points: 100,
            verified: true,
            role: 'regular'
        });
    }),
    updateCurrentUser: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            utorid: 'testus01',
            name: 'Updated Name',
            email: 'updated@mail.utoronto.ca',
            verified: true
        });
    }),
    updatePassword: jest.fn((req, res) => {
        res.status(200).json({ success: true });
    }),
    getUser: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            utorid: 'testus01',
            name: 'Test User',
            points: 100,
            verified: true
        });
    }),
    updateUser: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            utorid: 'testus01',
            name: 'Test User',
            verified: true
        });
    }),
    lookupUserByUtorid: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            utorid: 'testus01',
            name: 'Test User',
            points: 100
        });
    })
}));

jest.mock('../../controllers/transactionController', () => ({
    createTransaction: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            utorid: 'testus01',
            type: 'purchase',
            spent: 19.99,
            earned: 80
        });
    }),
    getTransactions: jest.fn((req, res) => {
        res.status(200).json({
            count: 1,
            results: []
        });
    }),
    getTransaction: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            type: 'purchase'
        });
    }),
    updateTransactionSuspicious: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            suspicious: true
        });
    }),
    processRedemption: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            processedBy: 'cashie01'
        });
    }),
    lookupRedemptionTransaction: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            type: 'redemption'
        });
    }),
    getPendingRedemptions: jest.fn((req, res) => {
        res.status(200).json({
            count: 0,
            results: []
        });
    }),
    createUserRedemption: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            utorid: 'testus01',
            type: 'redemption',
            amount: 1000,
            processedBy: null
        });
    }),
    getUserTransactions: jest.fn((req, res) => {
        res.status(200).json({
            count: 1,
            results: [
                {
                    id: 1,
                    type: 'purchase',
                    amount: 80,
                    spent: 19.99
                }
            ]
        });
    }),
    getCurrentUserPendingRedemptionsTotal: jest.fn((req, res) => {
        res.status(200).json({
            totalPendingRedemptions: 500
        });
    }),
    createTransfer: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            sender: 'testus01',
            recipient: 'testusero002',
            type: 'transfer',
            sent: 500
        });
    })
}));

// Import after mocking
const app = require('../../index');
const { JWT_SECRET } = require('../../utils/jwtConfig');

// Helper function to generate JWT tokens for testing
const generateTestToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

describe('User Routes', () => {
    describe('POST /users', () => {
        test('should create a new user with cashier role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'cashie01', role: 'cashier' });

            await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    utorid: 'testus01',
                    name: 'Test User',
                    email: 'test@mail.utoronto.ca'
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('id');
                    expect(response.body).toHaveProperty('utorid', 'testus01');
                    expect(response.body).toHaveProperty('name', 'Test User');
                    expect(response.body).toHaveProperty('resetToken');
                });
        });
    });

    describe('GET /users', () => {
        test('should get paginated list of users for manager', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${token}`)
                .query({ page: 1, limit: 10 })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('count');
                    expect(response.body).toHaveProperty('results');
                    expect(Array.isArray(response.body.results)).toBe(true);
                });
        });

        test('should get users with name filter', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${token}`)
                .query({ name: 'John' })
                .expect(200);
        });
    });

    describe('GET /users/me', () => {
        test('should get current user profile', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id');
                    expect(response.body).toHaveProperty('utorid');
                    expect(response.body).toHaveProperty('name');
                    expect(response.body).toHaveProperty('email');
                    expect(response.body).toHaveProperty('points');
                });
        });
    });

    describe('PATCH /users/me', () => {
        test('should update current user profile', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .patch('/users/me')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Name',
                    email: 'updated@mail.utoronto.ca'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('name', 'Updated Name');
                    expect(response.body).toHaveProperty('email', 'updated@mail.utoronto.ca');
                });
        });
    });

    describe('PATCH /users/me/password', () => {
        test('should update current user password', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .patch('/users/me/password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    old: 'oldPassword',
                    new: 'NewPassword123!'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('success', true);
                });
        });
    });

    describe('POST /users/me/transactions', () => {
        test('should create redemption transaction for current user', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .post('/users/me/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type: 'redemption',
                    amount: 1000,
                    remark: 'Test redemption'
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('type', 'redemption');
                    expect(response.body).toHaveProperty('amount', 1000);
                    expect(response.body).toHaveProperty('processedBy', null);
                });
        });
    });

    describe('GET /users/me/transactions', () => {
        test('should get current user transactions', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .get('/users/me/transactions')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('count');
                    expect(response.body).toHaveProperty('results');
                    expect(Array.isArray(response.body.results)).toBe(true);
                });
        });
    });

    describe('GET /users/me/pending-redemptions', () => {
        test('should get current user pending redemptions total', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .get('/users/me/pending-redemptions')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('totalPendingRedemptions');
                });
        });
    });

    describe('GET /users/:userId', () => {
        test('should get specific user with cashier role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'cashie01', role: 'cashier' });

            await request(app)
                .get('/users/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id');
                    expect(response.body).toHaveProperty('utorid');
                    expect(response.body).toHaveProperty('name');
                    expect(response.body).toHaveProperty('points');
                });
        });
    });

    describe('PATCH /users/:userId', () => {
        test('should update user status with manager role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .patch('/users/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    verified: true,
                    suspicious: false
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('verified', true);
                });
        });
    });

    describe('POST /users/:userId/transactions', () => {
        test('should create transfer transaction between users', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .post('/users/2/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type: 'transfer',
                    amount: 500,
                    remark: 'Test transfer'
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('type', 'transfer');
                    expect(response.body).toHaveProperty('sent', 500);
                    expect(response.body).toHaveProperty('sender');
                    expect(response.body).toHaveProperty('recipient');
                });
        });
    });

    describe('GET /users/lookup/:utorid', () => {
        test('should lookup user by utorid with cashier role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'cashie01', role: 'cashier' });

            await request(app)
                .get('/users/lookup/testus01')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('utorid', 'testus01');
                    expect(response.body).toHaveProperty('name');
                    expect(response.body).toHaveProperty('points');
                });
        });
    });
}); 