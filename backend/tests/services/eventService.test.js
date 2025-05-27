// Mock external dependencies
jest.mock('@prisma/client');

const mockPrisma = {
    $transaction: jest.fn(),
    event: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    transaction: {
        create: jest.fn(),
    },
};

// Mock PrismaClient
const { PrismaClient } = require('@prisma/client');
PrismaClient.mockImplementation(() => mockPrisma);

// Import after mocking
const eventService = require('../../services/eventService');

describe('EventService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createEvent', () => {
        test('should create a new event successfully', async () => {
            const eventData = {
                name: 'Test Event',
                description: 'A test event',
                location: 'Test Location',
                startTime: '2025-05-10T09:00:00Z',
                endTime: '2025-05-10T17:00:00Z',
                capacity: 100,
                points: 500
            };

            const mockCreatedEvent = {
                id: 1,
                name: 'Test Event',
                description: 'A test event',
                location: 'Test Location',
                startTime: new Date('2025-05-10T09:00:00Z'),
                endTime: new Date('2025-05-10T17:00:00Z'),
                capacity: 100,
                pointsRemain: 500,
                pointsAwarded: 0,
                published: false,
                organizers: [],
                guests: []
            };

            const mockCreator = {
                id: 1,
                name: 'Test Creator'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockCreator);
            mockPrisma.event.create.mockResolvedValue(mockCreatedEvent);
            mockPrisma.event.findUnique.mockResolvedValue(mockCreatedEvent);

            const eventDataWithCreator = { ...eventData, creatorId: 1 };
            const result = await eventService.createEvent(eventDataWithCreator);

            expect(mockPrisma.event.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Test Event',
                    description: 'A test event',
                    location: 'Test Location',
                    capacity: 100,
                    pointsRemain: 500,
                    pointsAwarded: 0,
                    published: false
                }),
                include: expect.any(Object)
            });

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Event',
                location: 'Test Location'
            }));
        });
    });

    describe('getEvents', () => {
        test('should get paginated list of events', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'Event 1',
                    location: 'Location 1',
                    startTime: new Date('2025-05-10T09:00:00Z'),
                    endTime: new Date('2025-05-10T17:00:00Z'),
                    capacity: 100,
                    guests: []
                }
            ];

            mockPrisma.event.findMany.mockResolvedValue(mockEvents);
            mockPrisma.event.count.mockResolvedValue(1);

            const result = await eventService.getEvents({}, false, 1, 10);

            expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    published: true
                }),
                include: expect.any(Object),
                orderBy: { startTime: 'asc' }
            });

            expect(result).toEqual({
                count: 1,
                results: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        name: 'Event 1',
                        location: 'Location 1'
                    })
                ])
            });
        });
    });

    describe('getEvent', () => {
        test('should get a specific event', async () => {
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                description: 'A test event',
                location: 'Test Location',
                startTime: new Date('2025-05-10T09:00:00Z'),
                endTime: new Date('2025-05-10T17:00:00Z'),
                capacity: 100,
                published: true,
                organizers: [],
                guests: []
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            const result = await eventService.getEvent(1);

            expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expect.any(Object)
            });

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Event',
                description: 'A test event'
            }));
        });

        test('should throw error for non-existent event', async () => {
            mockPrisma.event.findUnique.mockResolvedValue(null);

            await expect(
                eventService.getEvent(999)
            ).rejects.toThrow('Event not found');
        });
    });

    describe('updateEvent', () => {
        test('should update event successfully', async () => {
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                startTime: new Date(Date.now() + 86400000), // 1 day from now
                endTime: new Date(Date.now() + 2 * 86400000), // 2 days from now
                published: false,
                guests: []
            };

            const updateData = {
                name: 'Updated Event',
                description: 'Updated description'
            };

            const mockUpdatedEvent = {
                ...mockEvent,
                name: 'Updated Event',
                description: 'Updated description'
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.event.update.mockResolvedValue(mockUpdatedEvent);

            const result = await eventService.updateEvent(1, updateData, true);

            expect(mockPrisma.event.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: expect.objectContaining({
                    name: 'Updated Event',
                    description: 'Updated description'
                })
            });

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Updated Event',
                description: 'Updated description'
            }));
        });
    });

    describe('addOrganizer', () => {
        test('should add organizer to event successfully', async () => {
            const mockUser = {
                id: 2,
                utorid: 'organizer1',
                name: 'Organizer One'
            };

            const mockEvent = {
                id: 1,
                name: 'Test Event',
                endTime: new Date(Date.now() + 86400000), // 1 day from now
                organizers: [],
                guests: []
            };

            const mockUpdatedEvent = {
                ...mockEvent,
                organizers: [mockUser],
                location: 'Test Location'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique
                .mockResolvedValueOnce(mockEvent) // First call to check event
                .mockResolvedValueOnce(mockUpdatedEvent); // Second call to get updated event
            mockPrisma.event.update.mockResolvedValue({});

            const result = await eventService.addOrganizer(1, 'organizer1');

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Event',
                organizers: expect.arrayContaining([
                    expect.objectContaining({
                        utorid: 'organizer1'
                    })
                ])
            }));
        });
    });

    describe('addGuest', () => {
        test('should add guest to event successfully', async () => {
            const mockUser = {
                id: 3,
                utorid: 'guest1',
                name: 'Guest One'
            };

            const mockEvent = {
                id: 1,
                name: 'Test Event',
                capacity: 100,
                endTime: new Date(Date.now() + 86400000), // 1 day from now
                published: true,
                organizers: [],
                guests: []
            };

            const mockUpdatedEvent = {
                ...mockEvent,
                guests: [mockUser]
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.event.update.mockResolvedValue(mockUpdatedEvent);

            const result = await eventService.addGuest(1, 'guest1', true, false);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Event',
                guestAdded: expect.objectContaining({
                    utorid: 'guest1'
                }),
                numGuests: 1
            }));
        });
    });

    describe('createEventTransaction', () => {
        test('should create event transaction for specific user', async () => {
            const mockCreator = {
                id: 1,
                utorid: 'manager1',
                role: 'manager'
            };

            const mockEvent = {
                id: 1,
                pointsRemain: 500,
                organizers: [],
                guests: [{ id: 2, utorid: 'guest1' }]
            };

            const mockUser = {
                id: 2,
                utorid: 'guest1'
            };

            const mockTransaction = {
                id: 1,
                type: 'event',
                amount: 100,
                remark: 'Event participation',
                userId: 2,
                createdBy: 1,
                eventId: 1,
                relatedId: 1
            };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockCreator) // creator lookup
                .mockResolvedValueOnce(mockUser); // user lookup
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.create.mockResolvedValue(mockTransaction);

            const data = {
                type: 'event',
                utorid: 'guest1',
                amount: 100,
                remark: 'Event participation'
            };

            const result = await eventService.createEventTransaction(1, data, 1);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                recipient: 'guest1',
                awarded: 100,
                type: 'event',
                relatedId: 1
            }));
        });
    });
}); 