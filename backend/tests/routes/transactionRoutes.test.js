const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock the transaction controller - must be before importing app
jest.mock('../../controllers/transactionController', () => ({
    createTransaction: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            utorid: 'testus01',
            type: 'purchase',
            spent: 19.99,
            earned: 80,
            remark: '',
            promotionIds: [],
            createdBy: 'cashie01'
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
    createTransfer: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            sender: 'testus01',
            recipient: 'testusero002',
            type: 'transfer',
            sent: 500
        });
    }),
    getCurrentUserPendingRedemptionsTotal: jest.fn((req, res) => {
        res.status(200).json({
            totalPendingRedemptions: 500
        });
    }),
    getTransactions: jest.fn((req, res) => {
        res.status(200).json({
            count: 1,
            results: [
                {
                    id: 1,
                    utorid: 'testus01',
                    amount: 80,
                    type: 'purchase',
                    spent: 19.99,
                    promotionIds: [],
                    suspicious: false,
                    remark: '',
                    createdBy: 'cashie01'
                }
            ]
        });
    }),
    getPendingRedemptions: jest.fn((req, res) => {
        res.status(200).json({
            count: 1,
            results: [
                {
                    id: 2,
                    utorid: 'testus01',
                    type: 'redemption',
                    amount: -1000,
                    redeemed: 1000,
                    processedBy: null,
                    createdBy: 'testus01'
                }
            ]
        });
    }),
    lookupRedemptionTransaction: jest.fn((req, res) => {
        res.status(200).json({
            id: 2,
            utorid: 'testus01',
            type: 'redemption',
            amount: -1000,
            redeemed: 1000,
            processedBy: null,
            remark: 'Test redemption'
        });
    }),
    getTransaction: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            utorid: 'testus01',
            type: 'purchase',
            spent: 19.99,
            amount: 80,
            promotionIds: [],
            suspicious: false,
            remark: '',
            createdBy: 'cashie01'
        });
    }),
    updateTransactionSuspicious: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            utorid: 'testus01',
            type: 'purchase',
            spent: 19.99,
            amount: 80,
            promotionIds: [],
            suspicious: true,
            remark: '',
            createdBy: 'cashie01'
        });
    }),
    processRedemption: jest.fn((req, res) => {
        res.status(200).json({
            id: 2,
            utorid: 'testus01',
            type: 'redemption',
            processedBy: 'cashie01',
            redeemed: 1000,
            remark: '',
            createdBy: 'testus01'
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

describe('Transaction Routes', () => {
    describe('POST /transactions', () => {
        test('should create a new purchase transaction with cashier role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'cashie01', role: 'cashier' });

            await request(app)
                .post('/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    utorid: 'testus01',
                    type: 'purchase',
                    spent: 19.99,
                    promotionIds: [],
                    remark: 'Test purchase'
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('id');
                    expect(response.body).toHaveProperty('utorid', 'testus01');
                    expect(response.body).toHaveProperty('type', 'purchase');
                    expect(response.body).toHaveProperty('spent', 19.99);
                    expect(response.body).toHaveProperty('earned', 80);
                });
        });

        test('should create a new adjustment transaction with manager role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .post('/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    utorid: 'testus01',
                    type: 'adjustment',
                    amount: -50,
                    relatedId: 123,
                    remark: 'Adjustment for incorrect purchase'
                })
                .expect(201);
        });
    });

    describe('GET /transactions', () => {
        test('should get paginated list of transactions for manager', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .get('/transactions')
                .set('Authorization', `Bearer ${token}`)
                .query({ page: 1, limit: 10 })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('count');
                    expect(response.body).toHaveProperty('results');
                    expect(Array.isArray(response.body.results)).toBe(true);
                });
        });

        test('should get transactions with filters', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .get('/transactions')
                .set('Authorization', `Bearer ${token}`)
                .query({ 
                    type: 'purchase',
                    suspicious: false,
                    page: 1
                })
                .expect(200);
        });
    });

    describe('GET /transactions/pending-redemptions', () => {
        test('should get pending redemption transactions for cashier', async () => {
            const token = generateTestToken({ id: 1, utorid: 'cashie01', role: 'cashier' });

            await request(app)
                .get('/transactions/pending-redemptions')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('count');
                    expect(response.body).toHaveProperty('results');
                    expect(Array.isArray(response.body.results)).toBe(true);
                });
        });
    });

    describe('GET /transactions/lookup-redemption/:transactionId', () => {
        test('should lookup redemption transaction for processing', async () => {
            const token = generateTestToken({ id: 1, utorid: 'cashie01', role: 'cashier' });

            await request(app)
                .get('/transactions/lookup-redemption/2')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id', 2);
                    expect(response.body).toHaveProperty('type', 'redemption');
                    expect(response.body).toHaveProperty('redeemed', 1000);
                    expect(response.body).toHaveProperty('processedBy', null);
                });
        });
    });

    describe('GET /transactions/:transactionId', () => {
        test('should get specific transaction for manager', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .get('/transactions/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id', 1);
                    expect(response.body).toHaveProperty('type', 'purchase');
                    expect(response.body).toHaveProperty('utorid', 'testus01');
                    expect(response.body).toHaveProperty('amount', 80);
                });
        });
    });

    describe('PATCH /transactions/:transactionId/suspicious', () => {
        test('should update transaction suspicious status for manager', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .patch('/transactions/1/suspicious')
                .set('Authorization', `Bearer ${token}`)
                .send({ suspicious: true })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id', 1);
                    expect(response.body).toHaveProperty('suspicious', true);
                    expect(response.body).toHaveProperty('type', 'purchase');
                });
        });

        test('should clear suspicious status', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .patch('/transactions/1/suspicious')
                .set('Authorization', `Bearer ${token}`)
                .send({ suspicious: false })
                .expect(200);
        });
    });

    describe('PATCH /transactions/:transactionId/processed', () => {
        test('should process redemption transaction for cashier', async () => {
            const token = generateTestToken({ id: 1, utorid: 'cashie01', role: 'cashier' });

            await request(app)
                .patch('/transactions/2/processed')
                .set('Authorization', `Bearer ${token}`)
                .send({ processed: true })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id', 2);
                    expect(response.body).toHaveProperty('type', 'redemption');
                    expect(response.body).toHaveProperty('processedBy', 'cashie01');
                    expect(response.body).toHaveProperty('redeemed', 1000);
                });
        });
    });
}); 