// Mock external dependencies
jest.mock('../../services/shortlinkService');
jest.mock('../../middlewares/authMiddleware');

const shortlinkController = require('../../controllers/shortlinkController');
const shortlinkService = require('../../services/shortlinkService');
const { checkRole } = require('../../middlewares/authMiddleware');

describe('ShortlinkController', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        req = {
            body: {},
            params: {},
            query: {},
            originalUrl: '/test',
            method: 'POST',
            auth: {
                id: 1,
                utorid: 'testuser',
                role: 'user'
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            redirect: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('createShortlink', () => {
        test('should create shortlink successfully with valid data', async () => {
            req.body = {
                slug: 'test-slug',
                targetUrl: 'https://example.com'
            };

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdById: 1
            };

            shortlinkService.createShortlink.mockResolvedValue(mockShortlink);
            checkRole.mockReturnValue(false);

            await shortlinkController.createShortlink(req, res);

            expect(shortlinkService.createShortlink).toHaveBeenCalledWith(
                req.body, 1, false
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockShortlink);
        });

        test('should create shortlink successfully for manager', async () => {
            req.body = {
                slug: 'test-slug',
                targetUrl: 'https://example.com'
            };
            req.auth.role = 'manager';

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdById: 1
            };

            shortlinkService.createShortlink.mockResolvedValue(mockShortlink);
            checkRole.mockReturnValue(true);

            await shortlinkController.createShortlink(req, res);

            expect(shortlinkService.createShortlink).toHaveBeenCalledWith(
                req.body, 1, true
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockShortlink);
        });

        test('should return 400 when no body is provided', async () => {
            req.body = {};

            await shortlinkController.createShortlink(req, res);

            expect(shortlinkService.createShortlink).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No shortlink data provided'
            });
        });

        test('should return 400 when slug is missing', async () => {
            req.body = {
                targetUrl: 'https://example.com'
            };

            await shortlinkController.createShortlink(req, res);

            expect(shortlinkService.createShortlink).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Slug and target URL are required'
            });
        });

        test('should return 400 when targetUrl is missing', async () => {
            req.body = {
                slug: 'test-slug'
            };

            await shortlinkController.createShortlink(req, res);

            expect(shortlinkService.createShortlink).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Slug and target URL are required'
            });
        });

        test('should return 400 when service throws validation error', async () => {
            req.body = {
                slug: 'test-slug',
                targetUrl: 'https://example.com'
            };

            shortlinkService.createShortlink.mockRejectedValue(
                new Error('Slug must contain only letters, numbers, hyphens, and underscores')
            );

            await shortlinkController.createShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Slug must contain only letters, numbers, hyphens, and underscores'
            });
        });

        test('should return 500 when service throws unexpected error', async () => {
            req.body = {
                slug: 'test-slug',
                targetUrl: 'https://example.com'
            };

            shortlinkService.createShortlink.mockRejectedValue(
                new Error('Database connection failed')
            );

            await shortlinkController.createShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to create shortlink'
            });
        });
    });

    describe('getShortlinks', () => {
        test('should get shortlinks successfully with default filters', async () => {
            const mockResult = {
                shortlinks: [],
                total: 0,
                page: 1,
                limit: 10
            };

            shortlinkService.getShortlinks.mockResolvedValue(mockResult);
            checkRole.mockReturnValue(false);

            await shortlinkController.getShortlinks(req, res);

            expect(shortlinkService.getShortlinks).toHaveBeenCalledWith(
                {
                    slug: undefined,
                    eventId: undefined,
                    createdBy: undefined,
                    page: 1,
                    limit: 10
                },
                false,
                1
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should get shortlinks successfully with custom filters', async () => {
            req.query = {
                slug: 'test',
                eventId: '1',
                createdBy: 'user1',
                page: '2',
                limit: '20'
            };

            const mockResult = {
                shortlinks: [],
                total: 0,
                page: 2,
                limit: 20
            };

            shortlinkService.getShortlinks.mockResolvedValue(mockResult);
            checkRole.mockReturnValue(true);

            await shortlinkController.getShortlinks(req, res);

            expect(shortlinkService.getShortlinks).toHaveBeenCalledWith(
                {
                    slug: 'test',
                    eventId: 1,
                    createdBy: 'user1',
                    page: 2,
                    limit: 20
                },
                true,
                1
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should return 400 when page is invalid', async () => {
            req.query = {
                page: 'invalid'
            };

            await shortlinkController.getShortlinks(req, res);

            expect(shortlinkService.getShortlinks).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Page number must be a positive integer'
            });
        });

        test('should return 400 when limit is invalid', async () => {
            req.query = {
                limit: 'invalid'
            };

            await shortlinkController.getShortlinks(req, res);

            expect(shortlinkService.getShortlinks).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Limit must be a positive integer'
            });
        });

        test('should return 500 when service throws error', async () => {
            shortlinkService.getShortlinks.mockRejectedValue(
                new Error('Database error')
            );

            await shortlinkController.getShortlinks(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to retrieve shortlinks'
            });
        });
    });

    describe('getShortlink', () => {
        test('should get shortlink successfully with valid ID', async () => {
            req.params = { id: '1' };

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com'
            };

            shortlinkService.getShortlink.mockResolvedValue(mockShortlink);

            await shortlinkController.getShortlink(req, res);

            expect(shortlinkService.getShortlink).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockShortlink);
        });

        test('should return 400 when ID is invalid', async () => {
            req.params = { id: 'invalid' };

            await shortlinkController.getShortlink(req, res);

            expect(shortlinkService.getShortlink).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid shortlink ID'
            });
        });

        test('should return 404 when shortlink not found', async () => {
            req.params = { id: '999' };

            shortlinkService.getShortlink.mockRejectedValue(
                new Error('Shortlink not found')
            );

            await shortlinkController.getShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Shortlink not found'
            });
        });

        test('should return 500 when service throws unexpected error', async () => {
            req.params = { id: '1' };

            shortlinkService.getShortlink.mockRejectedValue(
                new Error('Database error')
            );

            await shortlinkController.getShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to retrieve shortlink'
            });
        });
    });

    describe('updateShortlink', () => {
        test('should update shortlink successfully with valid data', async () => {
            req.params = { id: '1' };
            req.body = {
                targetUrl: 'https://updated.com'
            };

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://updated.com'
            };

            shortlinkService.updateShortlink.mockResolvedValue(mockShortlink);

            await shortlinkController.updateShortlink(req, res);

            expect(shortlinkService.updateShortlink).toHaveBeenCalledWith(
                1, req.body, 1
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockShortlink);
        });

        test('should return 400 when ID is invalid', async () => {
            req.params = { id: 'invalid' };
            req.body = { targetUrl: 'https://updated.com' };

            await shortlinkController.updateShortlink(req, res);

            expect(shortlinkService.updateShortlink).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid shortlink ID'
            });
        });

        test('should return 400 when no update data provided', async () => {
            req.params = { id: '1' };
            req.body = {};

            await shortlinkController.updateShortlink(req, res);

            expect(shortlinkService.updateShortlink).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'No update data provided'
            });
        });

        test('should return 404 when shortlink not found', async () => {
            req.params = { id: '999' };
            req.body = { targetUrl: 'https://updated.com' };

            shortlinkService.updateShortlink.mockRejectedValue(
                new Error('Shortlink not found')
            );

            await shortlinkController.updateShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Shortlink not found'
            });
        });

        test('should return 400 when service throws validation error', async () => {
            req.params = { id: '1' };
            req.body = { targetUrl: 'invalid-url' };

            shortlinkService.updateShortlink.mockRejectedValue(
                new Error('Invalid target URL format')
            );

            await shortlinkController.updateShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid target URL format'
            });
        });

        test('should return 500 when service throws unexpected error', async () => {
            req.params = { id: '1' };
            req.body = { targetUrl: 'https://updated.com' };

            shortlinkService.updateShortlink.mockRejectedValue(
                new Error('Database error')
            );

            await shortlinkController.updateShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to update shortlink'
            });
        });
    });

    describe('deleteShortlink', () => {
        test('should delete shortlink successfully', async () => {
            req.params = { id: '1' };

            shortlinkService.deleteShortlink.mockResolvedValue(true);
            checkRole.mockReturnValue(false);

            await shortlinkController.deleteShortlink(req, res);

            expect(shortlinkService.deleteShortlink).toHaveBeenCalledWith(1, 1, false);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('should delete shortlink successfully for manager', async () => {
            req.params = { id: '1' };
            req.auth.role = 'manager';

            shortlinkService.deleteShortlink.mockResolvedValue(true);
            checkRole.mockReturnValue(true);

            await shortlinkController.deleteShortlink(req, res);

            expect(shortlinkService.deleteShortlink).toHaveBeenCalledWith(1, 1, true);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        test('should return 400 when ID is invalid', async () => {
            req.params = { id: 'invalid' };

            await shortlinkController.deleteShortlink(req, res);

            expect(shortlinkService.deleteShortlink).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid shortlink ID'
            });
        });

        test('should return 404 when shortlink not found', async () => {
            req.params = { id: '999' };

            shortlinkService.deleteShortlink.mockRejectedValue(
                new Error('Shortlink not found')
            );

            await shortlinkController.deleteShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Shortlink not found'
            });
        });

        test('should return 403 when insufficient permissions', async () => {
            req.params = { id: '1' };

            shortlinkService.deleteShortlink.mockRejectedValue(
                new Error('Insufficient permissions to delete this shortlink')
            );

            await shortlinkController.deleteShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Insufficient permissions to delete this shortlink'
            });
        });

        test('should return 500 when service throws unexpected error', async () => {
            req.params = { id: '1' };

            shortlinkService.deleteShortlink.mockRejectedValue(
                new Error('Database error')
            );

            await shortlinkController.deleteShortlink(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to delete shortlink'
            });
        });
    });

    describe('getEventShortlinks', () => {
        test('should get event shortlinks successfully', async () => {
            req.params = { eventId: '1' };

            const mockShortlinks = [
                { id: 1, slug: 'test1', targetUrl: 'https://example1.com' },
                { id: 2, slug: 'test2', targetUrl: 'https://example2.com' }
            ];

            shortlinkService.getEventShortlinks.mockResolvedValue(mockShortlinks);
            checkRole.mockReturnValue(false);

            await shortlinkController.getEventShortlinks(req, res);

            expect(shortlinkService.getEventShortlinks).toHaveBeenCalledWith(1, 1, false);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockShortlinks);
        });

        test('should get event shortlinks successfully for manager', async () => {
            req.params = { eventId: '1' };
            req.auth.role = 'manager';

            const mockShortlinks = [
                { id: 1, slug: 'test1', targetUrl: 'https://example1.com' }
            ];

            shortlinkService.getEventShortlinks.mockResolvedValue(mockShortlinks);
            checkRole.mockReturnValue(true);

            await shortlinkController.getEventShortlinks(req, res);

            expect(shortlinkService.getEventShortlinks).toHaveBeenCalledWith(1, 1, true);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockShortlinks);
        });

        test('should return 400 when event ID is invalid', async () => {
            req.params = { eventId: 'invalid' };

            await shortlinkController.getEventShortlinks(req, res);

            expect(shortlinkService.getEventShortlinks).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid event ID'
            });
        });

        test('should return 404 when event not found', async () => {
            req.params = { eventId: '999' };

            shortlinkService.getEventShortlinks.mockRejectedValue(
                new Error('Event not found')
            );

            await shortlinkController.getEventShortlinks(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Event not found'
            });
        });

        test('should return 403 when insufficient permissions', async () => {
            req.params = { eventId: '1' };

            shortlinkService.getEventShortlinks.mockRejectedValue(
                new Error('Insufficient permissions to access this event')
            );

            await shortlinkController.getEventShortlinks(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Insufficient permissions to access this event'
            });
        });

        test('should return 500 when service throws unexpected error', async () => {
            req.params = { eventId: '1' };

            shortlinkService.getEventShortlinks.mockRejectedValue(
                new Error('Database error')
            );

            await shortlinkController.getEventShortlinks(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to retrieve event shortlinks'
            });
        });
    });

    describe('redirectBySlug', () => {
        test('should redirect successfully with valid slug', async () => {
            req.params = { slug: 'test-slug' };

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com'
            };

            shortlinkService.getShortlinkBySlug.mockResolvedValue(mockShortlink);

            await shortlinkController.redirectBySlug(req, res);

            expect(shortlinkService.getShortlinkBySlug).toHaveBeenCalledWith('test-slug');
            expect(res.redirect).toHaveBeenCalledWith(302, 'https://example.com');
        });

        test('should return 400 when slug is missing', async () => {
            req.params = {};

            await shortlinkController.redirectBySlug(req, res);

            expect(shortlinkService.getShortlinkBySlug).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Slug is required'
            });
        });

        test('should return 404 when shortlink not found', async () => {
            req.params = { slug: 'non-existent' };

            shortlinkService.getShortlinkBySlug.mockRejectedValue(
                new Error('Shortlink not found')
            );

            await shortlinkController.redirectBySlug(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Shortlink not found'
            });
        });

        test('should return 500 when service throws unexpected error', async () => {
            req.params = { slug: 'test-slug' };

            shortlinkService.getShortlinkBySlug.mockRejectedValue(
                new Error('Database error')
            );

            await shortlinkController.redirectBySlug(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to redirect'
            });
        });
    });

    describe('checkSlugExists', () => {
        test('should return exists true when slug exists', async () => {
            req.params = { slug: 'existing-slug' };

            const mockShortlink = {
                id: 1,
                slug: 'existing-slug',
                targetUrl: 'https://example.com',
                event: { id: 1, name: 'Test Event' },
                createdBy: { id: 1, utorid: 'testuser', name: 'Test User' }
            };

            shortlinkService.getShortlinkBySlugSafe.mockResolvedValue(mockShortlink);

            await shortlinkController.checkSlugExists(req, res);

            expect(shortlinkService.getShortlinkBySlugSafe).toHaveBeenCalledWith('existing-slug', {
                include: {
                    event: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, utorid: true, name: true } },
                },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                exists: true,
                shortlink: mockShortlink
            });
        });

        test('should return exists false when slug does not exist', async () => {
            req.params = { slug: 'non-existing-slug' };

            shortlinkService.getShortlinkBySlugSafe.mockResolvedValue(null);

            await shortlinkController.checkSlugExists(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                exists: false
            });
        });

        test('should return 400 when slug format is invalid', async () => {
            req.params = { slug: 'invalid slug!' };

            await shortlinkController.checkSlugExists(req, res);

            expect(shortlinkService.getShortlinkBySlugSafe).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid slug format'
            });
        });

        test('should return 400 when slug is missing', async () => {
            req.params = {};

            await shortlinkController.checkSlugExists(req, res);

            expect(shortlinkService.getShortlinkBySlugSafe).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Invalid slug format'
            });
        });

        test('should return 500 when service throws error', async () => {
            req.params = { slug: 'test-slug' };

            shortlinkService.getShortlinkBySlugSafe.mockRejectedValue(
                new Error('Database error')
            );

            await shortlinkController.checkSlugExists(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to check slug'
            });
        });
    });
}); 