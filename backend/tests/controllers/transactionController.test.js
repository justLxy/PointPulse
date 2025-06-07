// Mock external dependencies
jest.mock('../../services/transactionService');
jest.mock('../../services/userService');
jest.mock('../../middlewares/authMiddleware');

// Mock Prisma client before requiring the controller
const mockPrismaTransaction = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
};

const mockPrismaUser = {
    findUnique: jest.fn(),
    update: jest.fn()
};

jest.doMock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        transaction: mockPrismaTransaction,
        user: mockPrismaUser
    }))
}));

const transactionController = require('../../controllers/transactionController');
const transactionService = require('../../services/transactionService');
const userService = require('../../services/userService');
const { checkRole } = require('../../middlewares/authMiddleware');

describe('TransactionController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        req = {
            body: {},
            params: {},
            query: {},
            auth: { id: 1, role: 'cashier' },
            originalUrl: '/test',
            method: 'POST'
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

    describe('createTransaction - Purchase', () => {
        beforeEach(() => {
            req.body = {
                type: 'purchase',
                utorid: 'testuser1',
                spent: 25.50,
                promotionIds: [],
                remark: 'Coffee purchase'
            };
            checkRole.mockReturnValue(true);
        });

        /**
         * 场景：收银员为用户创建购买交易
         * 预期：1) 验证收银员权限；2) 调用服务层创建交易；3) 返回201状态码和交易信息
         */
        test('should create purchase transaction successfully', async () => {
            const mockTransaction = {
                id: 123,
                utorid: 'testuser1',
                type: 'purchase',
                spent: 25.50,
                earned: 102,
                remark: 'Coffee purchase',
                promotionIds: [],
                createdBy: 'cashier1'
            };

            transactionService.createPurchase.mockResolvedValue(mockTransaction);

            await transactionController.createTransaction(req, res);

            expect(checkRole).toHaveBeenCalledWith(req.auth, 'cashier');
            expect(transactionService.createPurchase).toHaveBeenCalledWith(req.body, 1, []);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockTransaction);
        });

        test('should return 400 when no transaction data provided', async () => {
            req.body = {};

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No transaction data provided'
            });
        });

        test('should return 400 when transaction type is missing', async () => {
            delete req.body.type;

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Transaction type is required'
            });
        });

        test('should return 403 when user lacks cashier role', async () => {
            checkRole.mockReturnValue(false);

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to create purchase transactions'
            });
        });

        test('should return 400 when utorid is missing', async () => {
            delete req.body.utorid;

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'UTORid is required'
            });
        });

        test('should return 400 when spent amount is invalid', async () => {
            req.body.spent = -10;

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Spent amount must be a positive number'
            });
        });

        test('should handle promotion errors', async () => {
            transactionService.createPurchase.mockRejectedValue(new Error('Promotion not found'));

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'One or more promotions not found'
            });
        });
    });

    describe('createTransaction - Adjustment', () => {
        beforeEach(() => {
            req.body = {
                type: 'adjustment',
                utorid: 'testuser1',
                amount: -50,
                relatedId: 123,
                remark: 'Point correction'
            };
            req.auth.role = 'manager';
            checkRole.mockReturnValue(true);
            mockPrismaTransaction.findUnique.mockResolvedValue({ id: 123 });
        });

        /**
         * 场景：管理员创建调整交易
         * 预期：1) 验证管理员权限；2) 验证相关交易存在；3) 调用服务层创建；4) 返回交易信息
         */
        test('should create adjustment transaction successfully', async () => {
            const mockTransaction = {
                id: 124,
                utorid: 'testuser1',
                amount: -50,
                type: 'adjustment',
                relatedId: 123,
                remark: 'Point correction',
                promotionIds: [],
                createdBy: 'manager1'
            };

            transactionService.createAdjustment.mockResolvedValue(mockTransaction);

            await transactionController.createTransaction(req, res);

            expect(checkRole).toHaveBeenCalledWith(req.auth, 'manager');
            expect(mockPrismaTransaction.findUnique).toHaveBeenCalledWith({
                where: { id: 123 }
            });
            expect(transactionService.createAdjustment).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'adjustment',
                    utorid: 'testuser1',
                    amount: -50,
                    relatedId: 123,
                    promotionIds: []
                }),
                1
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockTransaction);
        });

        test('should return 403 when user lacks manager role', async () => {
            checkRole.mockReturnValue(false);

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to create adjustment transactions'
            });
        });

        test('should return 400 when amount is missing', async () => {
            delete req.body.amount;

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Amount is required'
            });
        });

        test('should return 400 when related transaction ID is invalid', async () => {
            req.body.relatedId = 'invalid';

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid related transaction ID'
            });
        });

        test('should return 404 when related transaction not found', async () => {
            mockPrismaTransaction.findUnique.mockResolvedValue(null);

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Related transaction not found'
            });
        });
    });

    describe('createTransaction - Transfer', () => {
        beforeEach(() => {
            req.body = {
                type: 'transfer',
                utorid: 'recipient1',
                amount: 100,
                remark: 'Friend transfer'
            };
        });

        /**
         * 场景：用户创建转账交易
         * 预期：1) 验证字段完整性；2) 调用服务层创建；3) 返回转账结果
         */
        test('should create transfer transaction successfully', async () => {
            const mockResult = {
                id: 127,
                sender: 'user1',
                recipient: 'recipient1',
                type: 'transfer',
                sent: 100,
                remark: 'Friend transfer',
                createdBy: 'user1'
            };

            // Mock userService to return recipient ID
            userService.getUserIdByUtorid.mockResolvedValue(2);
            transactionService.createTransfer.mockResolvedValue(mockResult);

            await transactionController.createTransaction(req, res);

            expect(userService.getUserIdByUtorid).toHaveBeenCalledWith('recipient1');
            expect(transactionService.createTransfer).toHaveBeenCalledWith(
                { type: 'transfer', amount: 100, remark: 'Friend transfer' },
                1,
                2
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should return 400 when recipient utorid is missing', async () => {
            delete req.body.utorid;

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Recipient UTORid is required'
            });
        });

        test('should handle insufficient balance error', async () => {
            transactionService.createTransfer.mockRejectedValue(new Error('Insufficient balance'));

            await transactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Insufficient balance'
            });
        });
    });

    describe('getTransactions', () => {
        beforeEach(() => {
            req.query = {
                name: 'testuser',
                type: 'purchase',
                page: '1',
                limit: '10'
            };
            req.auth.role = 'manager';
            checkRole.mockReturnValue(true);
        });

        /**
         * 场景：管理员查看所有交易记录
         * 预期：1) 验证管理员权限；2) 调用服务层获取；3) 返回交易列表
         */
        test('should get transactions successfully for manager', async () => {
            const mockResult = {
                count: 5,
                results: [
                    {
                        id: 123,
                        utorid: 'testuser1',
                        amount: 80,
                        type: 'purchase',
                        spent: 19.99,
                        suspicious: false,
                        createdBy: 'cashier1'
                    }
                ]
            };

            transactionService.getTransactions.mockResolvedValue(mockResult);

            await transactionController.getTransactions(req, res);

            expect(checkRole).toHaveBeenCalledWith(req.auth, 'manager');
            expect(transactionService.getTransactions).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'testuser',
                    type: 'purchase'
                }),
                '1',
                '10'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should return 403 when user lacks manager role', async () => {
            checkRole.mockReturnValue(false);

            await transactionController.getTransactions(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to view all transactions'
            });
        });

        test('should return 400 for invalid pagination', async () => {
            req.query.page = 'invalid';

            await transactionController.getTransactions(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Page must be a positive integer'
            });
        });

        test('should use default pagination values', async () => {
            req.query = {};
            transactionService.getTransactions.mockResolvedValue({ results: [], count: 0 });

            await transactionController.getTransactions(req, res);

            expect(transactionService.getTransactions).toHaveBeenCalledWith({}, 1, 10);
        });
    });

    describe('getTransaction', () => {
        beforeEach(() => {
            req.params = { transactionId: '123' };
            checkRole.mockReturnValue(true);
            
            // Mock transaction exists and belongs to user
            mockPrismaTransaction.findUnique.mockResolvedValue({
                id: 123,
                userId: 1
            });
        });

        /**
         * 场景：管理员查看单个交易详情
         * 预期：1) 验证权限和交易ID；2) 调用服务层获取；3) 返回交易详情
         */
        test('should get transaction successfully', async () => {
            const mockTransaction = {
                id: 123,
                utorid: 'testuser1',
                type: 'purchase',
                spent: 19.99,
                amount: 80,
                suspicious: false,
                createdBy: 'cashier1'
            };

            transactionService.getTransaction.mockResolvedValue(mockTransaction);

            await transactionController.getTransaction(req, res);

            expect(transactionService.getTransaction).toHaveBeenCalledWith(123);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockTransaction);
        });

        test('should return 400 for invalid transaction ID', async () => {
            req.params.transactionId = 'invalid';

            await transactionController.getTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid transaction ID'
            });
        });

        test('should return 403 when user lacks manager role', async () => {
            checkRole.mockReturnValue(false);
            // Mock transaction belongs to different user
            mockPrismaTransaction.findUnique.mockResolvedValue({
                id: 123,
                userId: 2 // Different user
            });

            await transactionController.getTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to view transaction details'
            });
        });

        test('should handle transaction not found error', async () => {
            mockPrismaTransaction.findUnique.mockResolvedValue(null);

            await transactionController.getTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Transaction not found'
            });
        });
    });

    describe('updateTransactionSuspicious', () => {
        beforeEach(() => {
            req.params = { transactionId: '123' };
            req.body = { suspicious: true };
            checkRole.mockReturnValue(true);
            
            // Mock transaction exists
            mockPrismaTransaction.findUnique.mockResolvedValue({
                id: 123,
                type: 'purchase'
            });
        });

        /**
         * 场景：管理员标记交易为可疑
         * 预期：1) 验证权限；2) 调用服务层更新；3) 返回更新后的交易
         */
        test('should update transaction suspicious status successfully', async () => {
            const mockUpdatedTransaction = {
                id: 123,
                utorid: 'testuser1',
                type: 'purchase',
                spent: 19.99,
                amount: 80,
                suspicious: true,
                createdBy: 'cashier1'
            };

            transactionService.updateTransactionSuspicious.mockResolvedValue(mockUpdatedTransaction);

            await transactionController.updateTransactionSuspicious(req, res);

            expect(transactionService.updateTransactionSuspicious).toHaveBeenCalledWith(123, true);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdatedTransaction);
        });

        test('should return 400 for invalid transaction ID', async () => {
            req.params.transactionId = 'invalid';

            await transactionController.updateTransactionSuspicious(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid transaction ID'
            });
        });

        test('should return 400 when no data provided', async () => {
            req.body = {};

            await transactionController.updateTransactionSuspicious(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No data provided'
            });
        });

        test('should return 400 when suspicious field is missing', async () => {
            req.body = { other: 'field' };

            await transactionController.updateTransactionSuspicious(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Suspicious status is required'
            });
        });

        test('should return 403 when user lacks manager role', async () => {
            checkRole.mockReturnValue(false);

            await transactionController.updateTransactionSuspicious(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to update transaction status'
            });
        });
    });

    describe('processRedemption', () => {
        beforeEach(() => {
            req.params = { transactionId: '124' };
            req.body = { processed: true };
            checkRole.mockReturnValue(true);
            
            // Mock a redemption transaction that hasn't been processed yet
            mockPrismaTransaction.findUnique.mockResolvedValue({
                id: 124,
                type: 'redemption',
                processedBy: null
            });
        });

        /**
         * 场景：收银员处理兑换请求
         * 预期：1) 验证权限；2) 调用服务层处理；3) 返回处理结果
         */
        test('should process redemption successfully', async () => {
            const mockProcessedRedemption = {
                id: 124,
                utorid: 'testuser1',
                type: 'redemption',
                processedBy: 'cashier1',
                redeemed: 1000,
                createdBy: 'testuser1'
            };

            transactionService.processRedemption.mockResolvedValue(mockProcessedRedemption);

            await transactionController.processRedemption(req, res);

            expect(transactionService.processRedemption).toHaveBeenCalledWith(124, 1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockProcessedRedemption);
        });

        test('should return 400 for invalid transaction ID', async () => {
            req.params.transactionId = 'invalid';

            await transactionController.processRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid transaction ID'
            });
        });

        test('should return 400 when no data provided', async () => {
            req.body = {};

            await transactionController.processRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No data provided'
            });
        });

        test('should return 400 when processed field is not true', async () => {
            req.body.processed = false;

            await transactionController.processRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Processed status must be true'
            });
        });

        test('should return 403 when user lacks cashier role', async () => {
            checkRole.mockReturnValue(false);

            await transactionController.processRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to process redemptions'
            });
        });

        test('should handle already processed error', async () => {
            transactionService.processRedemption.mockRejectedValue(new Error('Transaction has already been processed'));

            await transactionController.processRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Transaction has already been processed'
            });
        });
    });

    describe('createUserRedemption', () => {
        beforeEach(() => {
            req.body = {
                type: 'redemption',
                amount: 500,
                remark: 'Gift card redemption'
            };
            
            // Mock user with sufficient points and verified status
            mockPrismaUser.findUnique.mockResolvedValue({
                id: 1,
                verified: true,
                points: 1000
            });
        });

        /**
         * 场景：用户创建兑换请求
         * 预期：1) 验证字段；2) 调用服务层创建；3) 返回兑换请求
         */
        test('should create user redemption successfully', async () => {
            const mockRedemption = {
                id: 124,
                utorid: 'testuser1',
                type: 'redemption',
                processedBy: null,
                amount: 500,
                remark: 'Gift card redemption',
                createdBy: 'testuser1'
            };

            transactionService.createRedemption.mockResolvedValue(mockRedemption);

            await transactionController.createUserRedemption(req, res);

            expect(transactionService.createRedemption).toHaveBeenCalledWith(req.body, 1);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockRedemption);
        });

        test('should return 400 when no transaction data provided', async () => {
            req.body = {};

            await transactionController.createUserRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No transaction data provided'
            });
        });

        test('should return 400 when type is not redemption', async () => {
            req.body.type = 'purchase';

            await transactionController.createUserRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Transaction type must be "redemption"'
            });
        });

        test('should return 400 when amount is invalid', async () => {
            req.body.amount = -500;

            await transactionController.createUserRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Amount must be a positive number'
            });
        });

        test('should return 404 when user not found', async () => {
            mockPrismaUser.findUnique.mockResolvedValue(null);

            await transactionController.createUserRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User not found'
            });
        });

        test('should return 403 when user not verified', async () => {
            mockPrismaUser.findUnique.mockResolvedValue({
                id: 1,
                verified: false,
                points: 1000
            });

            await transactionController.createUserRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User is not verified'
            });
        });

        test('should return 400 when insufficient points', async () => {
            mockPrismaUser.findUnique.mockResolvedValue({
                id: 1,
                verified: true,
                points: 100 // Less than requested amount
            });

            await transactionController.createUserRedemption(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Insufficient points'
            });
        });
    });

    describe('getUserTransactions', () => {
        beforeEach(() => {
            req.query = {
                type: 'purchase',
                page: '1',
                limit: '10'
            };
        });

        /**
         * 场景：用户查看自己的交易记录
         * 预期：1) 调用服务层获取用户交易；2) 返回用户交易列表
         */
        test('should get user transactions successfully', async () => {
            const mockResult = {
                count: 3,
                results: [
                    {
                        id: 123,
                        type: 'purchase',
                        spent: 19.99,
                        amount: 80,
                        remark: '',
                        createdBy: 'cashier1'
                    }
                ]
            };

            transactionService.getUserTransactions.mockResolvedValue(mockResult);

            await transactionController.getUserTransactions(req, res);

            expect(transactionService.getUserTransactions).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    type: 'purchase'
                }),
                '1',
                '10'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should return 400 for invalid pagination', async () => {
            req.query.limit = 'invalid';

            await transactionController.getUserTransactions(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Limit must be a positive integer'
            });
        });

        test('should use default pagination values', async () => {
            req.query = {};
            transactionService.getUserTransactions.mockResolvedValue({ results: [], count: 0 });

            await transactionController.getUserTransactions(req, res);

            expect(transactionService.getUserTransactions).toHaveBeenCalledWith(1, {}, 1, 10);
        });
    });
}); 