// Mock Prisma
jest.mock('@prisma/client');

const mockPrisma = {
    event: {
        findFirst: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
};

const { PrismaClient } = require('@prisma/client');
PrismaClient.mockImplementation(() => mockPrisma);

const {
    checkRole,
    requireRole,
    requireVerified,
    isEventOrganizer
} = require('../../middlewares/authMiddleware');

describe('Auth Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('checkRole', () => {
        test('should return true for valid role hierarchy', () => {
            expect(checkRole({ role: 'manager' }, 'cashier')).toBe(true);
            expect(checkRole({ role: 'superuser' }, 'manager')).toBe(true);
            expect(checkRole({ role: 'cashier' }, 'regular')).toBe(true);
            expect(checkRole({ role: 'regular' }, 'regular')).toBe(true);
        });

        test('should return false for insufficient permissions', () => {
            expect(checkRole({ role: 'regular' }, 'cashier')).toBe(false);
            expect(checkRole({ role: 'cashier' }, 'manager')).toBe(false);
            expect(checkRole({ role: 'manager' }, 'superuser')).toBe(false);
        });

        test('should handle case insensitive roles', () => {
            expect(checkRole({ role: 'MANAGER' }, 'cashier')).toBe(true);
            expect(checkRole({ role: 'manager' }, 'CASHIER')).toBe(true);
        });

        test('should return false for invalid input', () => {
            expect(checkRole(null, 'regular')).toBe(false);
            expect(checkRole(undefined, 'regular')).toBe(false);
            expect(checkRole({ role: null }, 'regular')).toBe(false);
            expect(checkRole({ role: 'invalid' }, 'regular')).toBe(false);
        });
    });

    describe('requireRole middleware', () => {
        test('should call next() for sufficient permissions', () => {
            const req = { auth: { role: 'manager' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            const middleware = requireRole('cashier');
            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 401 for missing auth', () => {
            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            const middleware = requireRole('regular');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 403 for insufficient permissions', () => {
            const req = { auth: { role: 'regular' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            const middleware = requireRole('manager');
            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('requireVerified middleware', () => {
        test('should call next() for verified user', async () => {
            const req = { auth: { id: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            mockPrisma.user.findUnique.mockResolvedValue({ verified: true });

            await requireVerified(req, res, next);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                select: { verified: true }
            });
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 401 for missing auth', () => {
            const req = {};
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            requireVerified(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 403 for unverified user', async () => {
            const req = { auth: { id: 1 } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            mockPrisma.user.findUnique.mockResolvedValue({ verified: false });

            await new Promise(resolve => {
                requireVerified(req, res, next);
                setTimeout(resolve, 10);
            });

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Account not verified' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('isEventOrganizer middleware', () => {
        test('should call next() for event organizer', async () => {
            const req = { 
                auth: { id: 1, role: 'regular' }, 
                params: { eventId: '123' },
                prisma: mockPrisma
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            mockPrisma.event.findFirst.mockResolvedValue({ id: 123 });

            await isEventOrganizer(req, res, next);

            expect(req.isOrganizer).toBe(true);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should call next() for manager even if not organizer', async () => {
            const req = { 
                auth: { id: 1, role: 'manager' }, 
                params: { eventId: '123' },
                prisma: mockPrisma
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            mockPrisma.event.findFirst.mockResolvedValue(null);

            await isEventOrganizer(req, res, next);

            expect(req.isOrganizer).toBe(false);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 401 for missing auth', async () => {
            const req = { params: { eventId: '123' } };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            await isEventOrganizer(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 400 for invalid event ID', async () => {
            const req = { 
                auth: { id: 1, role: 'regular' }, 
                params: { eventId: 'invalid' }
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            await isEventOrganizer(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid event ID' });
            expect(next).not.toHaveBeenCalled();
        });

        test('should return 403 for non-organizer regular user', async () => {
            const req = { 
                auth: { id: 1, role: 'regular' }, 
                params: { eventId: '123' },
                prisma: mockPrisma
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            mockPrisma.event.findFirst.mockResolvedValue(null);

            await isEventOrganizer(req, res, next);

            expect(req.isOrganizer).toBe(false);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ 
                error: 'Unauthorized - you must be an organizer or manager for this event' 
            });
            expect(next).not.toHaveBeenCalled();
        });
    });
}); 