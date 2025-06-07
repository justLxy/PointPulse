// Mock external dependencies
jest.mock('../../services/promotionService');
jest.mock('../../middlewares/authMiddleware');

// Mock Prisma client before requiring the controller
const mockPrismaPromotion = {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
};

jest.doMock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        promotion: mockPrismaPromotion
    }))
}));

const promotionController = require('../../controllers/promotionController');
const promotionService = require('../../services/promotionService');
const { checkRole } = require('../../middlewares/authMiddleware');

describe('PromotionController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        req = {
            body: {},
            params: {},
            query: {},
            auth: { id: 1, role: 'manager' },
            originalUrl: '/test',
            method: 'POST'
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('createPromotion', () => {
        beforeEach(() => {
            req.body = {
                name: 'Summer Sale',
                description: 'Get extra points this summer',
                type: 'automatic',
                startTime: '2025-06-01T00:00:00Z',
                endTime: '2025-08-31T23:59:59Z',
                minSpending: 50,
                rate: 0.02,
                points: null
            };
        });

        /**
         * 场景：管理员创建自动促销活动
         * 预期：1) 验证必填字段；2) 调用服务层创建；3) 返回201状态码和促销信息
         */
        test('should create automatic promotion successfully', async () => {
            const mockPromotion = {
                id: 1,
                name: 'Summer Sale',
                description: 'Get extra points this summer',
                type: 'automatic',
                startTime: '2025-06-01T00:00:00Z',
                endTime: '2025-08-31T23:59:59Z',
                minSpending: 50,
                rate: 0.02,
                points: 0
            };

            promotionService.createPromotion.mockResolvedValue(mockPromotion);

            await promotionController.createPromotion(req, res);

            expect(promotionService.createPromotion).toHaveBeenCalledWith({
                name: 'Summer Sale',
                description: 'Get extra points this summer',
                type: 'automatic',
                startTime: '2025-06-01T00:00:00Z',
                endTime: '2025-08-31T23:59:59Z',
                minSpending: 50,
                rate: 0.02,
                points: null
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockPromotion);
        });

        test('should create one-time promotion with points', async () => {
            req.body = {
                name: 'Welcome Bonus',
                description: 'First purchase bonus',
                type: 'one-time',
                startTime: '2025-01-01T00:00:00Z',
                endTime: '2025-12-31T23:59:59Z',
                minSpending: null,
                rate: null,
                points: 100
            };

            const mockPromotion = {
                id: 2,
                name: 'Welcome Bonus',
                description: 'First purchase bonus',
                type: 'one-time',
                startTime: '2025-01-01T00:00:00Z',
                endTime: '2025-12-31T23:59:59Z',
                minSpending: null,
                rate: null,
                points: 100
            };

            promotionService.createPromotion.mockResolvedValue(mockPromotion);

            await promotionController.createPromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockPromotion);
        });

        test('should return 400 when no promotion data provided', async () => {
            req.body = {};

            await promotionController.createPromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No promotion data provided'
            });
            expect(promotionService.createPromotion).not.toHaveBeenCalled();
        });

        test('should return 400 when required field is missing', async () => {
            delete req.body.name;

            await promotionController.createPromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'name is required'
            });
        });

        test('should return 400 for invalid promotion type', async () => {
            req.body.type = 'invalid-type';

            await promotionController.createPromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Type must be either "automatic" or "one-time"'
            });
        });

        test('should return 400 when neither rate nor points is provided', async () => {
            req.body.rate = null;
            req.body.points = null;

            await promotionController.createPromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Either rate or points must be specified'
            });
        });

        test('should handle service validation errors', async () => {
            promotionService.createPromotion.mockRejectedValue(new Error('Start time must be in the future'));

            await promotionController.createPromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Start time must be in the future'
            });
        });
    });

    describe('getPromotions', () => {
        beforeEach(() => {
            req.query = {
                name: 'summer',
                type: 'automatic',
                page: '1',
                limit: '10'
            };
        });

        /**
         * 场景：管理员查看所有促销活动
         * 预期：1) 检查管理员权限；2) 调用服务层获取促销；3) 返回促销列表
         */
        test('should get promotions successfully for manager', async () => {
            checkRole.mockImplementation((auth, role) => {
                if (role === 'manager') return true;
                if (role === 'cashier') return true;
                if (role === 'regular') return true;
                return false;
            });

            const mockResult = {
                count: 2,
                results: [
                    {
                        id: 1,
                        name: 'Summer Sale',
                        type: 'automatic',
                        startTime: '2025-06-01T00:00:00Z',
                        endTime: '2025-08-31T23:59:59Z'
                    },
                    {
                        id: 2,
                        name: 'Summer Special',
                        type: 'one-time',
                        startTime: '2025-06-15T00:00:00Z',
                        endTime: '2025-07-15T23:59:59Z'
                    }
                ]
            };

            promotionService.getPromotions.mockResolvedValue(mockResult);

            await promotionController.getPromotions(req, res);

            expect(promotionService.getPromotions).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'summer',
                    type: 'automatic'
                }),
                1,
                true,
                1,
                10
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should get promotions for regular user with limited filters', async () => {
            req.auth.role = 'regular';
            checkRole.mockImplementation((auth, role) => {
                if (role === 'manager') return false;
                if (role === 'cashier') return false;
                if (role === 'regular') return true;
                return false;
            });

            const mockResult = {
                count: 1,
                results: [
                    {
                        id: 1,
                        name: 'Summer Sale',
                        type: 'automatic',
                        endTime: '2025-08-31T23:59:59Z'
                    }
                ]
            };

            promotionService.getPromotions.mockResolvedValue(mockResult);

            await promotionController.getPromotions(req, res);

            expect(promotionService.getPromotions).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'summer',
                    type: 'automatic'
                }),
                1,
                false,
                1,
                10
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should return 400 for invalid pagination parameters', async () => {
            req.query.page = 'invalid';

            await promotionController.getPromotions(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Page number must be a positive integer'
            });
        });

        test('should return 400 when both started and ended are specified for manager', async () => {
            checkRole.mockReturnValue(true);
            req.query = { started: 'true', ended: 'true' };

            await promotionController.getPromotions(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cannot specify both started and ended'
            });
        });

        test('should use default pagination values', async () => {
            req.query = {};
            checkRole.mockReturnValue(true);
            promotionService.getPromotions.mockResolvedValue({ results: [], count: 0 });

            await promotionController.getPromotions(req, res);

            expect(promotionService.getPromotions).toHaveBeenCalledWith(
                expect.any(Object),
                1,
                true,
                1,
                10
            );
        });
    });

    describe('getPromotion', () => {
        beforeEach(() => {
            req.params = { promotionId: '1' };
        });

        /**
         * 场景：查看单个促销活动详情
         * 预期：1) 验证促销ID；2) 调用服务层获取；3) 返回促销详情
         */
        test('should get promotion successfully for manager', async () => {
            checkRole.mockReturnValue(true);
            const mockPromotion = {
                id: 1,
                name: 'Summer Sale',
                description: 'Get extra points this summer',
                type: 'automatic',
                startTime: '2025-06-01T00:00:00Z',
                endTime: '2025-08-31T23:59:59Z',
                minSpending: 50,
                rate: 0.02,
                points: 0
            };

            promotionService.getPromotion.mockResolvedValue(mockPromotion);

            await promotionController.getPromotion(req, res);

            expect(promotionService.getPromotion).toHaveBeenCalledWith(1, 1, true);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPromotion);
        });

        test('should get promotion successfully for regular user', async () => {
            req.auth.role = 'regular';
            checkRole.mockReturnValue(false);
            const mockPromotion = {
                id: 1,
                name: 'Summer Sale',
                description: 'Get extra points this summer',
                type: 'automatic',
                endTime: '2025-08-31T23:59:59Z',
                minSpending: 50,
                rate: 0.02,
                points: 0
            };

            promotionService.getPromotion.mockResolvedValue(mockPromotion);

            await promotionController.getPromotion(req, res);

            expect(promotionService.getPromotion).toHaveBeenCalledWith(1, 1, false);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPromotion);
        });

        test('should return 400 for invalid promotion ID', async () => {
            req.params.promotionId = 'invalid';

            await promotionController.getPromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid promotion ID'
            });
            expect(promotionService.getPromotion).not.toHaveBeenCalled();
        });

        test('should handle service errors', async () => {
            checkRole.mockReturnValue(false);
            promotionService.getPromotion.mockRejectedValue(new Error('Promotion not found or inactive'));

            await promotionController.getPromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to retrieve promotion'
            });
        });
    });

    describe('updatePromotion', () => {
        beforeEach(() => {
            req.params = { promotionId: '1' };
            req.body = {
                name: 'Updated Summer Sale',
                description: 'Updated description'
            };
            checkRole.mockReturnValue(true);
            
            // Mock Prisma to return a promotion that hasn't started yet
            mockPrismaPromotion.findUnique.mockResolvedValue({
                id: 1,
                name: 'Summer Sale',
                type: 'automatic',
                startTime: new Date('2025-12-01'), // Future date
                endTime: new Date('2025-12-31')
            });
        });

        /**
         * 场景：管理员更新促销活动信息
         * 预期：1) 验证权限；2) 调用服务层更新；3) 返回更新后的促销信息
         */
        test('should update promotion successfully', async () => {
            const mockUpdatedPromotion = {
                id: 1,
                name: 'Updated Summer Sale',
                type: 'automatic',
                description: 'Updated description'
            };

            promotionService.updatePromotion.mockResolvedValue(mockUpdatedPromotion);

            await promotionController.updatePromotion(req, res);

            expect(promotionService.updatePromotion).toHaveBeenCalledWith(1, {
                name: 'Updated Summer Sale',
                description: 'Updated description'
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdatedPromotion);
        });

        test('should return 400 for invalid promotion ID', async () => {
            req.params.promotionId = 'invalid';

            await promotionController.updatePromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid promotion ID'
            });
        });

        test('should return 404 when promotion not found', async () => {
            mockPrismaPromotion.findUnique.mockResolvedValue(null);

            await promotionController.updatePromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Promotion not found'
            });
        });

        test('should return 400 when promotion has already started', async () => {
            mockPrismaPromotion.findUnique.mockResolvedValue({
                id: 1,
                startTime: new Date('2020-01-01'), // Past date
                endTime: new Date('2025-12-31')
            });

            await promotionController.updatePromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cannot update a promotion that has already started'
            });
        });

        test('should return 400 when no update data provided', async () => {
            req.body = {};

            await promotionController.updatePromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No fields provided for update'
            });
        });
    });

    describe('deletePromotion', () => {
        beforeEach(() => {
            req.params = { promotionId: '1' };
            checkRole.mockReturnValue(true);
            
            // Mock Prisma to return a promotion that hasn't started yet
            mockPrismaPromotion.findUnique.mockResolvedValue({
                id: 1,
                name: 'Summer Sale',
                type: 'automatic',
                startTime: new Date('2025-12-01'), // Future date
                endTime: new Date('2025-12-31')
            });
        });

        /**
         * 场景：管理员删除促销活动
         * 预期：1) 验证权限；2) 调用服务层删除；3) 返回204状态码
         */
        test('should delete promotion successfully', async () => {
            promotionService.deletePromotion.mockResolvedValue();

            await promotionController.deletePromotion(req, res);

            expect(promotionService.deletePromotion).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('should return 400 for invalid promotion ID', async () => {
            req.params.promotionId = 'invalid';

            await promotionController.deletePromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid promotion ID'
            });
        });

        test('should return 404 when promotion not found', async () => {
            mockPrismaPromotion.findUnique.mockResolvedValue(null);

            await promotionController.deletePromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Promotion not found'
            });
        });

        test('should return 403 when deleting started promotion', async () => {
            mockPrismaPromotion.findUnique.mockResolvedValue({
                id: 1,
                startTime: new Date('2020-01-01'), // Past date
                endTime: new Date('2025-12-31')
            });

            await promotionController.deletePromotion(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cannot delete a promotion that has already started'
            });
        });
    });
}); 