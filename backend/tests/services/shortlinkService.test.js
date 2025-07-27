// Mock external dependencies
jest.mock('@prisma/client');

const mockPrisma = {
    shortlink: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    event: {
        findUnique: jest.fn(),
    },
};

// Mock PrismaClient
const { PrismaClient } = require('@prisma/client');
PrismaClient.mockImplementation(() => mockPrisma);

// Import after mocking
const shortlinkService = require('../../services/shortlinkService');

describe('ShortlinkService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe('createShortlink', () => {
        test('should create shortlink successfully with valid data', async () => {
            const shortlinkData = {
                slug: 'test-slug',
                targetUrl: 'https://example.com'
            };
            const createdById = 1;
            const isManager = false;

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdById: 1,
                createdBy: {
                    id: 1,
                    utorid: 'testuser',
                    name: 'Test User'
                },
                event: null
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);
            mockPrisma.shortlink.create.mockResolvedValue(mockShortlink);

            const result = await shortlinkService.createShortlink(shortlinkData, createdById, isManager);

            expect(mockPrisma.shortlink.findUnique).toHaveBeenCalledWith({
                where: { slug: 'test-slug' },
                include: {
                    event: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
            expect(mockPrisma.shortlink.create).toHaveBeenCalledWith({
                data: {
                    slug: 'test-slug',
                    targetUrl: 'https://example.com',
                    createdById: 1,
                    eventId: null,
                },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            utorid: true,
                            name: true,
                        }
                    },
                    event: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
            expect(result).toEqual(mockShortlink);
        });

        test('should create shortlink with event successfully', async () => {
            const shortlinkData = {
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                eventId: '1'
            };
            const createdById = 1;
            const isManager = false;

            const mockEvent = {
                id: 1,
                name: 'Test Event',
                organizers: [{ id: 1 }]
            };

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdById: 1,
                eventId: 1,
                createdBy: {
                    id: 1,
                    utorid: 'testuser',
                    name: 'Test User'
                },
                event: {
                    id: 1,
                    name: 'Test Event'
                }
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.shortlink.create.mockResolvedValue(mockShortlink);

            const result = await shortlinkService.createShortlink(shortlinkData, createdById, isManager);

            expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    organizers: true
                }
            });
            expect(result).toEqual(mockShortlink);
        });

        test('should throw error for invalid slug format', async () => {
            const shortlinkData = {
                slug: 'invalid slug!',
                targetUrl: 'https://example.com'
            };

            await expect(
                shortlinkService.createShortlink(shortlinkData, 1, false)
            ).rejects.toThrow('Slug must contain only letters, numbers, hyphens, and underscores');
        });

        test('should throw error for missing slug', async () => {
            const shortlinkData = {
                targetUrl: 'https://example.com'
            };

            await expect(
                shortlinkService.createShortlink(shortlinkData, 1, false)
            ).rejects.toThrow('Slug must contain only letters, numbers, hyphens, and underscores');
        });

        test('should throw error for missing target URL', async () => {
            const shortlinkData = {
                slug: 'test-slug'
            };

            await expect(
                shortlinkService.createShortlink(shortlinkData, 1, false)
            ).rejects.toThrow('Target URL is required');
        });

        test('should throw error for invalid target URL format', async () => {
            const shortlinkData = {
                slug: 'test-slug',
                targetUrl: 'invalid-url'
            };

            await expect(
                shortlinkService.createShortlink(shortlinkData, 1, false)
            ).rejects.toThrow('Invalid target URL format');
        });

        test('should throw error when slug already exists', async () => {
            const shortlinkData = {
                slug: 'existing-slug',
                targetUrl: 'https://example.com'
            };

            const existingShortlink = {
                id: 1,
                slug: 'existing-slug',
                event: { id: 1, name: 'Test Event' }
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(existingShortlink);

            await expect(
                shortlinkService.createShortlink(shortlinkData, 1, false)
            ).rejects.toThrow('Shortlink with this slug already exists (used by event: Test Event)');
        });

        test('should throw error for invalid event ID', async () => {
            const shortlinkData = {
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                eventId: 'invalid'
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);

            await expect(
                shortlinkService.createShortlink(shortlinkData, 1, false)
            ).rejects.toThrow('Invalid event ID');
        });

        test('should throw error when event not found', async () => {
            const shortlinkData = {
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                eventId: '999'
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);
            mockPrisma.event.findUnique.mockResolvedValue(null);

            await expect(
                shortlinkService.createShortlink(shortlinkData, 1, false)
            ).rejects.toThrow('Event not found');
        });

        test('should throw error for insufficient permissions when not manager', async () => {
            const shortlinkData = {
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                eventId: '1'
            };

            const mockEvent = {
                id: 1,
                name: 'Test Event',
                organizers: [{ id: 2 }] // Different user ID
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                shortlinkService.createShortlink(shortlinkData, 1, false)
            ).rejects.toThrow('Insufficient permissions to create shortlinks for this event');
        });

        test('should allow manager to create shortlink for any event', async () => {
            const shortlinkData = {
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                eventId: '1'
            };

            const mockEvent = {
                id: 1,
                name: 'Test Event',
                organizers: [{ id: 2 }] // Different user ID
            };

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdById: 1,
                eventId: 1
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.shortlink.create.mockResolvedValue(mockShortlink);

            const result = await shortlinkService.createShortlink(shortlinkData, 1, true);

            expect(result).toEqual(mockShortlink);
        });
    });

    describe('updateShortlink', () => {
        test('should update shortlink successfully with valid data', async () => {
            const id = 1;
            const shortlinkData = {
                targetUrl: 'https://updated.com'
            };
            const userId = 1;

            const existingShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdBy: { id: 1 },
                event: null
            };

            const updatedShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://updated.com',
                createdBy: { id: 1, utorid: 'testuser', name: 'Test User' },
                event: null
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(existingShortlink);
            mockPrisma.shortlink.update.mockResolvedValue(updatedShortlink);

            const result = await shortlinkService.updateShortlink(id, shortlinkData, userId);

            expect(mockPrisma.shortlink.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { targetUrl: 'https://updated.com' },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            utorid: true,
                            name: true,
                        }
                    },
                    event: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
            expect(result).toEqual(updatedShortlink);
        });

        test('should throw error when shortlink not found', async () => {
            const id = 999;
            const shortlinkData = { targetUrl: 'https://updated.com' };
            const userId = 1;

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);

            await expect(
                shortlinkService.updateShortlink(id, shortlinkData, userId)
            ).rejects.toThrow('Shortlink not found');
        });

        test('should throw error for invalid slug format', async () => {
            const id = 1;
            const shortlinkData = { slug: 'invalid slug!' };
            const userId = 1;

            const existingShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdBy: { id: 1 },
                event: null
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(existingShortlink);

            await expect(
                shortlinkService.updateShortlink(id, shortlinkData, userId)
            ).rejects.toThrow('Slug must contain only letters, numbers, hyphens, and underscores');
        });

        test('should throw error for invalid target URL format', async () => {
            const id = 1;
            const shortlinkData = { targetUrl: 'invalid-url' };
            const userId = 1;

            const existingShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdBy: { id: 1 },
                event: null
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(existingShortlink);

            await expect(
                shortlinkService.updateShortlink(id, shortlinkData, userId)
            ).rejects.toThrow('Invalid target URL format');
        });

        test('should throw error when new slug conflicts with existing shortlink', async () => {
            const id = 1;
            const shortlinkData = { slug: 'conflicting-slug' };
            const userId = 1;

            const existingShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdBy: { id: 1 },
                event: null
            };

            const conflictingShortlink = {
                id: 2,
                slug: 'conflicting-slug',
                event: { id: 1, name: 'Test Event' }
            };

            mockPrisma.shortlink.findUnique
                .mockResolvedValueOnce(existingShortlink)
                .mockResolvedValueOnce(conflictingShortlink);

            await expect(
                shortlinkService.updateShortlink(id, shortlinkData, userId)
            ).rejects.toThrow('Shortlink with this slug already exists (used by event: Test Event)');
        });

        test('should throw error for invalid event ID', async () => {
            const id = 1;
            const shortlinkData = { eventId: 'invalid' };
            const userId = 1;

            const existingShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdBy: { id: 1 },
                event: null
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(existingShortlink);

            await expect(
                shortlinkService.updateShortlink(id, shortlinkData, userId)
            ).rejects.toThrow('Invalid event ID');
        });

        test('should throw error when event not found', async () => {
            const id = 1;
            const shortlinkData = { eventId: '999' };
            const userId = 1;

            const existingShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdBy: { id: 1 },
                event: null
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(existingShortlink);
            mockPrisma.event.findUnique.mockResolvedValue(null);

            await expect(
                shortlinkService.updateShortlink(id, shortlinkData, userId)
            ).rejects.toThrow('Event not found');
        });
    });

    describe('getShortlinks', () => {
        test('should get shortlinks with default filters', async () => {
            const filters = {};
            const isManager = false;
            const userId = 1;

            const mockShortlinks = [
                { id: 1, slug: 'test1', targetUrl: 'https://example1.com' },
                { id: 2, slug: 'test2', targetUrl: 'https://example2.com' }
            ];

            mockPrisma.shortlink.findMany.mockResolvedValue(mockShortlinks);
            mockPrisma.shortlink.count.mockResolvedValue(2);

            const result = await shortlinkService.getShortlinks(filters, isManager, userId);

            expect(mockPrisma.shortlink.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { createdById: 1 },
                        {
                            event: {
                                organizers: {
                                    some: { id: 1 }
                                }
                            }
                        }
                    ]
                },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            utorid: true,
                            name: true,
                        }
                    },
                    event: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
            expect(result).toEqual({
                shortlinks: mockShortlinks,
                total: 2,
                page: 1,
                limit: 10,
                totalPages: 1
            });
        });

        test('should get shortlinks with custom filters for manager', async () => {
            const filters = {
                slug: 'test',
                eventId: 1,
                createdBy: 'user1',
                page: 2,
                limit: 5
            };
            const isManager = true;
            const userId = 1;

            const mockShortlinks = [
                { id: 1, slug: 'test1', targetUrl: 'https://example1.com' }
            ];

            mockPrisma.shortlink.findMany.mockResolvedValue(mockShortlinks);
            mockPrisma.shortlink.count.mockResolvedValue(1);

            const result = await shortlinkService.getShortlinks(filters, isManager, userId);

            expect(mockPrisma.shortlink.findMany).toHaveBeenCalledWith({
                where: {
                    slug: {
                        contains: 'test',
                        mode: 'insensitive'
                    },
                    eventId: 1,
                    createdBy: {
                        OR: [
                            { utorid: { contains: 'user1', mode: 'insensitive' } },
                            { name: { contains: 'user1', mode: 'insensitive' } }
                        ]
                    }
                },
                skip: 5,
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            utorid: true,
                            name: true,
                        }
                    },
                    event: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
            expect(result).toEqual({
                shortlinks: mockShortlinks,
                total: 1,
                page: 2,
                limit: 5,
                totalPages: 1
            });
        });
    });

    describe('getShortlink', () => {
        test('should get shortlink successfully by ID', async () => {
            const id = 1;

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                createdBy: {
                    id: 1,
                    utorid: 'testuser',
                    name: 'Test User'
                },
                event: null
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(mockShortlink);

            const result = await shortlinkService.getShortlink(id);

            expect(mockPrisma.shortlink.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            utorid: true,
                            name: true,
                        }
                    },
                    event: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
            expect(result).toEqual(mockShortlink);
        });

        test('should throw error when shortlink not found', async () => {
            const id = 999;

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);

            await expect(
                shortlinkService.getShortlink(id)
            ).rejects.toThrow('Shortlink not found');
        });
    });

    describe('getShortlinkBySlug', () => {
        test('should get shortlink successfully by slug', async () => {
            const slug = 'test-slug';

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com'
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(mockShortlink);

            const result = await shortlinkService.getShortlinkBySlug(slug);

            expect(mockPrisma.shortlink.findUnique).toHaveBeenCalledWith({
                where: { slug: 'test-slug' },
                select: {
                    id: true,
                    slug: true,
                    targetUrl: true,
                }
            });
            expect(result).toEqual(mockShortlink);
        });

        test('should throw error when shortlink not found', async () => {
            const slug = 'non-existent';

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);

            await expect(
                shortlinkService.getShortlinkBySlug(slug)
            ).rejects.toThrow('Shortlink not found');
        });
    });

    describe('getShortlinkBySlugSafe', () => {
        test('should get shortlink by slug with custom options', async () => {
            const slug = 'test-slug';
            const options = {
                include: {
                    event: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, utorid: true, name: true } },
                }
            };

            const mockShortlink = {
                id: 1,
                slug: 'test-slug',
                targetUrl: 'https://example.com',
                event: { id: 1, name: 'Test Event' },
                createdBy: { id: 1, utorid: 'testuser', name: 'Test User' }
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(mockShortlink);

            const result = await shortlinkService.getShortlinkBySlugSafe(slug, options);

            expect(mockPrisma.shortlink.findUnique).toHaveBeenCalledWith({
                where: { slug: 'test-slug' },
                ...options
            });
            expect(result).toEqual(mockShortlink);
        });

        test('should return null when shortlink not found', async () => {
            const slug = 'non-existent';

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);

            const result = await shortlinkService.getShortlinkBySlugSafe(slug);

            expect(result).toBeNull();
        });
    });

    describe('deleteShortlink', () => {
        test('should delete shortlink successfully for creator', async () => {
            const id = 1;
            const userId = 1;
            const isManager = false;

            const mockShortlink = {
                id: 1,
                createdById: 1,
                event: null
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(mockShortlink);
            mockPrisma.shortlink.delete.mockResolvedValue({});

            const result = await shortlinkService.deleteShortlink(id, userId, isManager);

            expect(mockPrisma.shortlink.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toEqual({ message: 'Shortlink deleted successfully' });
        });

        test('should delete shortlink successfully for manager', async () => {
            const id = 1;
            const userId = 1;
            const isManager = true;

            const mockShortlink = {
                id: 1,
                createdById: 2, // Different user
                event: null
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(mockShortlink);
            mockPrisma.shortlink.delete.mockResolvedValue({});

            const result = await shortlinkService.deleteShortlink(id, userId, isManager);

            expect(mockPrisma.shortlink.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toEqual({ message: 'Shortlink deleted successfully' });
        });

        test('should delete shortlink successfully for event organizer', async () => {
            const id = 1;
            const userId = 1;
            const isManager = false;

            const mockShortlink = {
                id: 1,
                createdById: 2, // Different user
                event: {
                    organizers: [{ id: 1 }] // User is organizer
                }
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(mockShortlink);
            mockPrisma.shortlink.delete.mockResolvedValue({});

            const result = await shortlinkService.deleteShortlink(id, userId, isManager);

            expect(mockPrisma.shortlink.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toEqual({ message: 'Shortlink deleted successfully' });
        });

        test('should throw error when shortlink not found', async () => {
            const id = 999;
            const userId = 1;
            const isManager = false;

            mockPrisma.shortlink.findUnique.mockResolvedValue(null);

            await expect(
                shortlinkService.deleteShortlink(id, userId, isManager)
            ).rejects.toThrow('Shortlink not found');
        });

        test('should throw error for insufficient permissions', async () => {
            const id = 1;
            const userId = 1;
            const isManager = false;

            const mockShortlink = {
                id: 1,
                createdById: 2, // Different user
                event: {
                    organizers: [{ id: 3 }] // Different organizer
                }
            };

            mockPrisma.shortlink.findUnique.mockResolvedValue(mockShortlink);

            await expect(
                shortlinkService.deleteShortlink(id, userId, isManager)
            ).rejects.toThrow('Insufficient permissions to delete this shortlink');
        });
    });

    describe('getEventShortlinks', () => {
        test('should get event shortlinks successfully for manager', async () => {
            const eventId = 1;
            const userId = 1;
            const isManager = true;

            const mockShortlinks = [
                { id: 1, slug: 'test1', targetUrl: 'https://example1.com' },
                { id: 2, slug: 'test2', targetUrl: 'https://example2.com' }
            ];

            mockPrisma.shortlink.findMany.mockResolvedValue(mockShortlinks);

            const result = await shortlinkService.getEventShortlinks(eventId, userId, isManager);

            expect(mockPrisma.shortlink.findMany).toHaveBeenCalledWith({
                where: { eventId: 1 },
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            utorid: true,
                            name: true,
                        }
                    },
                    event: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            });
            expect(result).toEqual(mockShortlinks);
        });

        test('should get event shortlinks successfully for organizer', async () => {
            const eventId = 1;
            const userId = 1;
            const isManager = false;

            const mockEvent = {
                id: 1,
                name: 'Test Event',
                organizers: [{ id: 1 }]
            };

            const mockShortlinks = [
                { id: 1, slug: 'test1', targetUrl: 'https://example1.com' }
            ];

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.shortlink.findMany.mockResolvedValue(mockShortlinks);

            const result = await shortlinkService.getEventShortlinks(eventId, userId, isManager);

            expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    organizers: true
                }
            });
            expect(result).toEqual(mockShortlinks);
        });

        test('should throw error for invalid event ID', async () => {
            const eventId = 'invalid';
            const userId = 1;
            const isManager = false;

            await expect(
                shortlinkService.getEventShortlinks(eventId, userId, isManager)
            ).rejects.toThrow('Invalid event ID');
        });

        test('should throw error when event not found', async () => {
            const eventId = 999;
            const userId = 1;
            const isManager = false;

            mockPrisma.event.findUnique.mockResolvedValue(null);

            await expect(
                shortlinkService.getEventShortlinks(eventId, userId, isManager)
            ).rejects.toThrow('Event not found');
        });

        test('should throw error for insufficient permissions', async () => {
            const eventId = 1;
            const userId = 1;
            const isManager = false;

            const mockEvent = {
                id: 1,
                name: 'Test Event',
                organizers: [{ id: 2 }] // Different user
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                shortlinkService.getEventShortlinks(eventId, userId, isManager)
            ).rejects.toThrow('Insufficient permissions to view event shortlinks');
        });
    });
}); 