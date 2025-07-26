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

const mockPrismaUser = {
    findUnique: jest.fn()
};

const mockPrismaEventAttendance = {
    findUnique: jest.fn(),
    upsert: jest.fn()
};

jest.doMock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        event: mockPrismaEvent,
        user: mockPrismaUser,
        transaction: { findUnique: jest.fn() },
        eventAttendance: mockPrismaEventAttendance
    }))
}));

const eventController = require('../../controllers/eventController');
const eventService = require('../../services/eventService');
const { checkRole } = require('../../middlewares/authMiddleware');

describe('EventController', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        req = {
            params: { eventId: '1' },
            body: {
                name: 'Test Event',
                description: 'Test Description',
                location: 'BA 3200',
                startTime: '2025-06-10T09:00:00Z',
                endTime: '2025-06-10T17:00:00Z',
                points: 500,
                capacity: 100
            },
            auth: { id: 1, role: 'manager' },
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        next = jest.fn();
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

    describe('updateEvent', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
            req.body = {
                name: 'Updated Event',
                description: 'Updated description',
                location: 'BA 3200',
                startTime: '2025-06-10T09:00:00Z',
                endTime: '2025-06-10T17:00:00Z',
                capacity: 150,
                points: 600
            };
        });

        test('should update event successfully', async () => {
            checkRole.mockReturnValue(true);
            const mockEvent = {
                id: 1,
                name: 'Updated Event',
                description: 'Updated description',
                location: 'BA 3200',
                startTime: '2025-06-10T09:00:00Z',
                endTime: '2025-06-10T17:00:00Z',
                capacity: 150,
                points: 600
            };
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                organizers: [{ id: 1 }],
                guests: [],
                endTime: new Date('2025-12-31')
            });
            eventService.updateEvent.mockResolvedValue(mockEvent);
            await eventController.updateEvent(req, res);
            expect(eventService.updateEvent).toHaveBeenCalledWith(1, req.body, true);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockEvent);
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
        });

        test('should return 404 when event not found', async () => {
            mockPrismaEvent.findUnique.mockResolvedValue(null);

            await eventController.updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Event not found'
            });
        });

        test('should return 403 when user is not authorized', async () => {
            checkRole.mockReturnValue(false);
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                organizers: [],
                guests: [],
                endTime: new Date('2025-12-31')
            });

            await eventController.updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Unauthorized to update this event'
            });
        });
    });

    describe('deleteEvent', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
        });

        test('should delete event successfully', async () => {
            checkRole.mockReturnValue(true);
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                organizers: [{ id: 1 }]
            });
            eventService.deleteEvent.mockResolvedValue({ message: 'Event deleted successfully' });

            await eventController.deleteEvent(req, res);

            expect(eventService.deleteEvent).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.deleteEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
        });

        test('should return 404 when event not found', async () => {
            mockPrismaEvent.findUnique.mockResolvedValue(null);

            await eventController.deleteEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Event not found'
            });
        });
    });

    describe('addOrganizer', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
            req.body = { utorid: 'organizer1' };
        });

        test('should add organizer successfully', async () => {
            req.body = { utorid: 'organizer1' };
            // Mock user lookup
            mockPrismaUser.findUnique.mockResolvedValue({ id: 2, utorid: 'organizer1' });
            // Mock event lookup
            mockPrismaEvent.findUnique.mockResolvedValueOnce({ id: 1, endTime: new Date('2025-12-31') });
            eventService.addOrganizer.mockResolvedValue({ message: 'Organizer added successfully' });

            await eventController.addOrganizer(req, res);

            expect(eventService.addOrganizer).toHaveBeenCalledWith(1, 'organizer1');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Organizer added successfully' });
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.addOrganizer(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
        });

        test('should return 400 when utorid is missing', async () => {
            req.body = {};
            await eventController.addOrganizer(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'No data provided' });
        });
    });

    describe('removeOrganizer', () => {
        beforeEach(() => {
            req.params = { eventId: '1', organizerId: '2' };
        });

        test('should remove organizer successfully', async () => {
            req.params.userId = '2';
            eventService.removeOrganizer.mockResolvedValue();
            await eventController.removeOrganizer(req, res);
            expect(eventService.removeOrganizer).toHaveBeenCalledWith(1, 2);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('should return 400 for invalid organizer ID', async () => {
            req.params.userId = 'abc';
            await eventController.removeOrganizer(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
        });
    });

    describe('addGuest', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
            req.body = { utorid: 'guest1' };
        });

        test('should add guest successfully', async () => {
            req.body = { utorid: 'guest1' };
            checkRole.mockReturnValue(true); // Mock manager role
            mockPrismaUser.findUnique.mockResolvedValue({ id: 3, utorid: 'guest1' });
            mockPrismaEvent.findUnique.mockResolvedValueOnce({ 
                id: 1, 
                endTime: new Date('2025-12-31'),
                capacity: 100
            });
            mockPrismaEvent.findUnique.mockResolvedValueOnce({
                id: 1,
                _count: { guests: 50 }
            });
            eventService.addGuest.mockResolvedValue({ message: 'Guest added successfully' });
            await eventController.addGuest(req, res);
            expect(eventService.addGuest).toHaveBeenCalledWith(1, 'guest1', true, true);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Guest added successfully' });
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.addGuest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
        });

        test('should return 400 when utorid is missing', async () => {
            req.body = {};
            await eventController.addGuest(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'No data provided' });
        });
    });

    describe('removeGuest', () => {
        beforeEach(() => {
            req.params = { eventId: '1', guestId: '2' };
        });

        test('should remove guest successfully', async () => {
            req.params.userId = '3';
            checkRole.mockReturnValue(true); // Mock manager role
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                endTime: new Date('2025-12-31'),
                guests: [{ id: 3 }] // User is a guest
            });
            eventService.removeGuest.mockResolvedValue();
            await eventController.removeGuest(req, res);
            expect(eventService.removeGuest).toHaveBeenCalledWith(1, 3);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('should return 400 for invalid guest ID', async () => {
            req.params.userId = 'abc';
            await eventController.removeGuest(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
        });
    });

    describe('addCurrentUserAsGuest', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.addCurrentUserAsGuest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
        });

        test('should return 404 when event not found', async () => {
            mockPrismaEvent.findUnique.mockResolvedValue(null);

            await eventController.addCurrentUserAsGuest(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Event not found'
            });
        });
    });

    describe('removeCurrentUserAsGuest', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
        });

        test('should remove current user as guest successfully', async () => {
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                endTime: new Date('2025-12-31'),
                guests: [{ id: 1 }], // User is a guest
                organizers: [] // User is not an organizer
            });
            eventService.removeCurrentUserAsGuest.mockResolvedValue({ message: 'Successfully left event' });
            await eventController.removeCurrentUserAsGuest(req, res);
            expect(eventService.removeCurrentUserAsGuest).toHaveBeenCalledWith(1, 1);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.removeCurrentUserAsGuest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
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

    describe('removeAllGuests', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
        });

        test('should remove all guests successfully', async () => {
            checkRole.mockReturnValue(true);
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                organizers: [{ id: 1 }]
            });
            eventService.removeAllGuests.mockResolvedValue({ message: 'All guests removed successfully' });

            await eventController.removeAllGuests(req, res);

            expect(eventService.removeAllGuests).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(204);
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.removeAllGuests(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
        });

        test('should return 404 when event not found', async () => {
            mockPrismaEvent.findUnique.mockResolvedValue(null);

            await eventController.removeAllGuests(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Event not found'
            });
        });
    });

    describe('getCheckinToken', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.getCheckinToken(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
        });

        test('should return 404 when event not found', async () => {
            mockPrismaEvent.findUnique.mockResolvedValue(null);

            await eventController.getCheckinToken(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Event not found'
            });
        });

        test('should return 403 when user is not authorized', async () => {
            checkRole.mockReturnValue(false);
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                organizers: []
            });

            await eventController.getCheckinToken(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Only managers or organizers can generate check-in tokens'
            });
        });
    });

    describe('checkInWithToken', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
            req.body = {
                timestamp: Date.now(),
                signature: 'valid-signature'
            };
        });

        test('should check in with token successfully', async () => {
            const now = Date.now();
            const signature = require('crypto').createHmac('sha256', 'pointpulse_checkin_secret').update(`1:${now}`).digest('hex');
            req.body = {
                timestamp: now,
                signature: signature
            };
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                guests: [{ id: 1 }]
            });
            mockPrismaEventAttendance.findUnique.mockResolvedValue(null);
            mockPrismaEventAttendance.upsert.mockResolvedValue({
                eventId: 1,
                userId: 1,
                checkedInAt: new Date()
            });
            await eventController.checkInWithToken(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Successfully checked in',
                    checkedInAt: expect.any(String)
                })
            );
        });

        test('should return 400 when token is missing', async () => {
            req.body = { timestamp: Date.now() };
            await eventController.checkInWithToken(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing timestamp or signature' });
        });

        test('should return 400 when timestamp is missing', async () => {
            req.body = { signature: 'valid-signature' };
            await eventController.checkInWithToken(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing timestamp or signature' });
        });
    });

    describe('checkInByScan', () => {
        beforeEach(() => {
            req.params = { eventId: '1' };
        });

        test('should return 400 for invalid event ID', async () => {
            req.params.eventId = 'invalid';

            await eventController.checkInByScan(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
        });

        test('should return 400 when utorid is missing', async () => {
            req.body = {};
            await eventController.checkInByScan(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid utorid' });
        });

        test('should return 403 when user is not authorized', async () => {
            req.body = { utorid: 'testuser' };
            req.auth = { id: 2, role: 'user' };
            mockPrismaUser.findUnique.mockResolvedValue({ 
                id: 2, 
                role: 'user', 
                utorid: 'user1'
            });
            mockPrismaEvent.findUnique.mockResolvedValue({
                id: 1,
                name: 'Test Event',
                endTime: new Date('2025-12-31'),
                guests: [],
                organizers: []
            });
            await eventController.checkInByScan(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Only organizers or managers can record attendance'
            });
        });
    });
});