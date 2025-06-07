// Mock external dependencies
jest.mock('../../services/eventService');
jest.mock('../../middlewares/authMiddleware');

// Mock Prisma client before requiring the controller
const mockPrismaEvent = {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
};

jest.doMock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        event: mockPrismaEvent,
        user: { findUnique: jest.fn() },
        transaction: { findUnique: jest.fn() }
    }))
}));

const eventController = require('../../controllers/eventController');
const eventService = require('../../services/eventService');
const { checkRole } = require('../../middlewares/authMiddleware');

describe('EventController', () => {
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
            json: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('createEvent', () => {
        beforeEach(() => {
            req.body = {
                name: 'Test Event',
                description: 'A test event',
                location: 'BA 2250',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-10T17:00:00Z',
                capacity: 100,
                points: 500
            };
        });

        /**
         * 场景：管理员创建完整的活动信息
         * 预期：1) 调用服务层创建活动；2) 返回201状态码和活动信息
         */
        test('should create event successfully with all required fields', async () => {
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                description: 'A test event',
                location: 'BA 2250',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-10T17:00:00Z',
                capacity: 100,
                pointsRemain: 500,
                pointsAwarded: 0,
                published: false,
                organizers: [],
                guests: []
            };

            eventService.createEvent.mockResolvedValue(mockEvent);

            await eventController.createEvent(req, res);

            expect(eventService.createEvent).toHaveBeenCalledWith({
                name: 'Test Event',
                description: 'A test event',
                location: 'BA 2250',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-10T17:00:00Z',
                capacity: 100,
                points: 500,
                creatorId: 1
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockEvent);
        });

        test('should return 400 when no event data provided', async () => {
            req.body = {};

            await eventController.createEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No event data provided'
            });
            expect(eventService.createEvent).not.toHaveBeenCalled();
        });

        test('should return 400 when required field is missing', async () => {
            delete req.body.name;

            await eventController.createEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'name is required'
            });
            expect(eventService.createEvent).not.toHaveBeenCalled();
        });

        test('should handle service validation errors', async () => {
            eventService.createEvent.mockRejectedValue(new Error('Start time must be in the future'));

            await eventController.createEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Start time must be in the future'
            });
        });

        test('should handle server errors', async () => {
            eventService.createEvent.mockRejectedValue(new Error('Database connection failed'));

            await eventController.createEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Database connection failed'
            });
        });
    });

    describe('getEvents', () => {
        beforeEach(() => {
            req.query = {
                name: 'test',
                location: 'BA',
                started: 'false',
                page: '1',
                limit: '10'
            };
        });

        /**
         * 场景：管理员获取活动列表
         * 预期：1) 检查管理员权限；2) 调用服务层获取活动；3) 返回活动列表
         */
        test('should get events successfully for manager', async () => {
            checkRole.mockReturnValue(true);
            const mockResult = {
                count: 2,
                results: [
                    { id: 1, name: 'Event 1', location: 'BA 2250' },
                    { id: 2, name: 'Event 2', location: 'BA 3200' }
                ]
            };

            eventService.getEvents.mockResolvedValue(mockResult);

            await eventController.getEvents(req, res);

            expect(checkRole).toHaveBeenCalledWith(req.auth, 'manager');
            expect(eventService.getEvents).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should return 400 when both started and ended are specified', async () => {
            req.query = { started: 'true', ended: 'true' };

            await eventController.getEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Cannot specify both started and ended'
            });
            expect(eventService.getEvents).not.toHaveBeenCalled();
        });

        test('should return 400 for invalid pagination parameters', async () => {
            req.query = { limit: 'invalid' };

            await eventController.getEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Limit must be a positive integer'
            });
        });

        test('should handle server errors', async () => {
            checkRole.mockReturnValue(true);
            eventService.getEvents.mockRejectedValue(new Error('Database error'));

            await eventController.getEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to retrieve events'
            });
        });
    });

    describe('getEvent', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
            req.query = {};
        });

        /**
         * 场景：获取单个活动详情
         * 预期：1) 验证活动ID；2) 调用服务层获取活动；3) 返回活动详情
         */
        test('should get event successfully', async () => {
            checkRole.mockReturnValue(true);
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                description: 'A test event',
                location: 'BA 2250',
                organizers: [],
                guests: []
            };

            // Mock Prisma to return published event
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                published: true,
                organizers: [],
                endTime: new Date('2025-12-31')
            });

            eventService.getEvent.mockResolvedValue(mockEvent);

            await eventController.getEvent(req, res);

            expect(eventService.getEvent).toHaveBeenCalledWith(1, 1, true, false, false);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockEvent);
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.getEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
            expect(eventService.getEvent).not.toHaveBeenCalled();
        });

        test('should return 404 when event not found', async () => {
            mockPrismaEvent.findUnique.mockResolvedValue(null);

            await eventController.getEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Event not found'
            });
        });
    });

    describe('createEventTransaction', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
            req.body = {
                type: 'event',
                utorid: 'guest1',
                amount: 100
            };
            checkRole.mockReturnValue(true);
            
            // Mock Prisma event findUnique to return a valid event with sufficient points
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                pointsRemain: 500,
                organizers: [{ id: 1 }], // User is an organizer
                endTime: new Date('2025-12-31')
            });
        });

        /**
         * 场景：组织者为活动参与者发放积分
         * 预期：1) 验证权限和数据；2) 调用服务层创建交易；3) 返回积分发放记录
         */
        test('should create event transaction successfully', async () => {
            const mockResult = {
                id: 123,
                recipient: 'guest1',
                awarded: 100,
                type: 'event',
                relatedId: 1,
                remark: '',
                createdBy: 'manager1'
            };

            eventService.createEventTransaction.mockResolvedValue(mockResult);

            await eventController.createEventTransaction(req, res);

            expect(eventService.createEventTransaction).toHaveBeenCalledWith(
                1,
                { type: 'event', utorid: 'guest1', amount: 100, remark: undefined },
                1
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should return 400 when type is not event', async () => {
            req.body.type = 'purchase';

            await eventController.createEventTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Transaction type must be "event"'
            });
        });

        test('should return 400 when amount is invalid', async () => {
            req.body.amount = -50;

            await eventController.createEventTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Amount must be a positive number'
            });
        });

        test('should return 404 when event not found', async () => {
            mockPrismaEvent.findUnique.mockResolvedValue(null);

            await eventController.createEventTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Event not found'
            });
        });

        test('should return 403 when user is not authorized', async () => {
            checkRole.mockReturnValue(false);
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                organizers: [], // User is not an organizer
                pointsRemain: 500
            });

            await eventController.createEventTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to create event transactions'
            });
        });
    });
}); 