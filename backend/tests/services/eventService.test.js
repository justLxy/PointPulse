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
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
    },
    transaction: {
        create: jest.fn(),
        updateMany: jest.fn()
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
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('createEvent', () => {
        test('should create event successfully', async () => {
            const eventData = {
                name: 'Test Event',
                description: 'A test event',
                location: 'Test Location',
                startTime: new Date(Date.now() + 86400000), // 1 day from now
                endTime: new Date(Date.now() + 2 * 86400000), // 2 days from now
                capacity: 100,
                points: 500,
                creatorId: 1
            };

            const mockCreator = {
                id: 1,
                name: 'Creator'
            };

            const mockCreatedEvent = {
                id: 1,
                name: 'Test Event',
                description: 'A test event',
                location: 'Test Location',
                startTime: new Date(Date.now() + 86400000),
                endTime: new Date(Date.now() + 2 * 86400000),
                capacity: 100,
                pointsRemain: 500,
                pointsAwarded: 0,
                published: false,
                organizers: [{ id: 1 }],
                guests: []
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockCreator);
            mockPrisma.event.create.mockResolvedValue(mockCreatedEvent);
            mockPrisma.event.findUnique.mockResolvedValue(mockCreatedEvent);

            const result = await eventService.createEvent(eventData);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Event',
                pointsRemain: 500
            }));
        });

        test('should handle null capacity', async () => {
            const eventData = {
                name: 'Test Event',
                description: 'A test event',
                location: 'Test Location',
                startTime: new Date(Date.now() + 86400000),
                endTime: new Date(Date.now() + 2 * 86400000),
                capacity: null,
                points: 500,
                creatorId: 1
            };

            const mockCreator = {
                id: 1,
                name: 'Creator'
            };

            const mockCreatedEvent = {
                id: 1,
                name: 'Test Event',
                description: 'A test event',
                location: 'Test Location',
                startTime: new Date(Date.now() + 86400000),
                endTime: new Date(Date.now() + 2 * 86400000),
                capacity: null,
                pointsRemain: 500,
                pointsAwarded: 0,
                published: false,
                organizers: [{ id: 1 }],
                guests: []
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockCreator);
            mockPrisma.event.create.mockResolvedValue(mockCreatedEvent);
            mockPrisma.event.findUnique.mockResolvedValue(mockCreatedEvent);

            const result = await eventService.createEvent(eventData);

            expect(result.capacity).toBeNull();
        });
    });

    describe('getEvents', () => {
        test('should return paginated events for regular users', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'Test Event',
                    location: 'Test Location',
                    startTime: new Date(),
                    endTime: new Date(),
                    capacity: 100,
                    guests: [{ id: 1 }]
                }
            ];

            mockPrisma.event.findMany.mockResolvedValue(mockEvents);
            mockPrisma.event.count.mockResolvedValue(1);

            const result = await eventService.getEvents({}, false, 1, 10);

            expect(result).toEqual({
                count: 1,
                results: expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        name: 'Test Event',
                        numGuests: 1
                    })
                ])
            });
        });

        test('should handle showFull filter', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'Full Event',
                    location: 'Test Location',
                    startTime: new Date(),
                    endTime: new Date(),
                    capacity: 2,
                    guests: [{ id: 1 }, { id: 2 }]
                }
            ];

            mockPrisma.event.findMany.mockResolvedValue(mockEvents);
            mockPrisma.event.count.mockResolvedValue(1);

            const result = await eventService.getEvents({ showFull: 'true' }, false, 1, 10);

            expect(result.results).toHaveLength(1);
        });

        test('should filter out full events when showFull is false', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'Full Event',
                    capacity: 1,
                    guests: [{ id: 1 }]
                }
            ];

            mockPrisma.event.findMany.mockResolvedValue(mockEvents);
            mockPrisma.event.count.mockResolvedValue(0);

            const result = await eventService.getEvents({ showFull: false }, false, 1, 10);

            expect(result.results).toHaveLength(0);
        });
    });

    describe('getEvent', () => {
        test('should return event details for regular user', async () => {
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                description: 'A test event',
                location: 'Test Location',
                startTime: new Date(),
                endTime: new Date(),
                capacity: 100,
                published: true,
                organizers: [{ id: 1, utorid: 'org1', name: 'Organizer' }],
                guests: [{ id: 2 }]
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            const result = await eventService.getEvent(1);

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

        test('should throw error for unpublished event when not manager/organizer', async () => {
            const mockEvent = {
                id: 1,
                name: 'Test Event',
                published: false,
                organizers: [{ id: 2 }] // Different user
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.getEvent(1, 1, false, false)
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

        test('should throw error for updating event in the past', async () => {
            const mockEvent = {
                id: 1,
                startTime: new Date(Date.now() - 86400000), // 1 day ago
                endTime: new Date(Date.now() + 86400000),
                guests: [] // Add guests array
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.updateEvent(1, { name: 'Updated' }, true)
            ).rejects.toThrow('Cannot update name, description, location, startTime, or capacity after event has started');
        });

        test('should throw error for reducing capacity below current guests', async () => {
            const mockEvent = {
                id: 1,
                capacity: 100,
                startTime: new Date(Date.now() + 86400000),
                endTime: new Date(Date.now() + 2 * 86400000),
                guests: new Array(50).fill({ id: 1 }) // 50 guests
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.updateEvent(1, { capacity: 10 }, true)
            ).rejects.toThrow('New capacity cannot be less than the current number of guests');
        });
    });

    describe('deleteEvent', () => {
        test('should delete unpublished event', async () => {
            const mockEvent = {
                id: 1,
                published: false
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.event.delete.mockResolvedValue({});

            await eventService.deleteEvent(1);

            expect(mockPrisma.event.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        test('should throw error for deleting published event', async () => {
            const mockEvent = {
                id: 1,
                published: true
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.deleteEvent(1)
            ).rejects.toThrow('Cannot delete a published event');
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

        test('should throw error for ended event', async () => {
            const mockUser = {
                id: 2,
                utorid: 'organizer1'
            };

            const mockEvent = {
                id: 1,
                endTime: new Date(Date.now() - 86400000), // 1 day ago
                organizers: [],
                guests: []
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.addOrganizer(1, 'organizer1')
            ).rejects.toThrow('Event has ended');
        });

        test('should throw error if user is already an organizer', async () => {
            const mockUser = {
                id: 2,
                utorid: 'organizer1'
            };

            const mockEvent = {
                id: 1,
                endTime: new Date(Date.now() + 86400000),
                organizers: [mockUser], // User already organizer
                guests: []
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.addOrganizer(1, 'organizer1')
            ).rejects.toThrow('User is already an organizer');
        });

        test('should throw error if user is already a guest', async () => {
            const mockUser = {
                id: 2,
                utorid: 'guest1'
            };

            const mockEvent = {
                id: 1,
                endTime: new Date(Date.now() + 86400000),
                organizers: [],
                guests: [mockUser] // User already guest
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.addOrganizer(1, 'guest1')
            ).rejects.toThrow('User is already a guest');
        });
    });

    describe('removeOrganizer', () => {
        test('should remove organizer successfully', async () => {
            const mockEvent = {
                id: 1,
                organizers: [{ id: 2 }]
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.event.update.mockResolvedValue({});

            const result = await eventService.removeOrganizer(1, 2);

            expect(result).toEqual({ success: true });
        });

        test('should throw error if user is not an organizer', async () => {
            const mockEvent = {
                id: 1,
                organizers: [] // User not in organizers
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.removeOrganizer(1, 2)
            ).rejects.toThrow('User is not an organizer for this event');
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
                location: 'Test Location',
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

        test('should throw error for unpublished event when not manager/organizer', async () => {
            const mockUser = {
                id: 3,
                utorid: 'guest1'
            };

            const mockEvent = {
                id: 1,
                published: false,
                organizers: [],
                guests: [],
                endTime: new Date(Date.now() + 86400000)
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.addGuest(1, 'guest1', false, false)
            ).rejects.toThrow('Event not found');
        });

        test('should throw error for full event', async () => {
            const mockUser = {
                id: 3,
                utorid: 'guest1'
            };

            const mockEvent = {
                id: 1,
                capacity: 1,
                endTime: new Date(Date.now() + 86400000),
                published: true,
                organizers: [],
                guests: [{ id: 2 }] // Already at capacity
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.addGuest(1, 'guest1', false, false)
            ).rejects.toThrow('Event is full');
        });

        test('should throw error if user is already an organizer', async () => {
            const mockUser = {
                id: 3,
                utorid: 'organizer1'
            };

            const mockEvent = {
                id: 1,
                capacity: 100,
                endTime: new Date(Date.now() + 86400000),
                published: true,
                organizers: [mockUser], // User is organizer
                guests: []
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.addGuest(1, 'organizer1', false, false)
            ).rejects.toThrow('User is already an organizer');
        });

        test('should handle errors properly', async () => {
            const mockUser = {
                id: 3,
                utorid: 'guest1'
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockRejectedValue(new Error('Database error'));

            await expect(
                eventService.addGuest(1, 'guest1', false, false)
            ).rejects.toThrow('Database error');
        });
    });

    describe('addCurrentUserAsGuest', () => {
        test('should add current user as guest', async () => {
            const mockUser = {
                id: 1,
                utorid: 'user1',
                name: 'User One'
            };

            const mockEvent = {
                id: 1,
                name: 'Test Event',
                location: 'Test Location',
                capacity: 100,
                endTime: new Date(Date.now() + 86400000),
                published: true,
                organizers: [],
                guests: []
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.event.update.mockResolvedValue({});

            const result = await eventService.addCurrentUserAsGuest(1, 1);

            expect(result).toEqual(expect.objectContaining({
                id: 1,
                name: 'Test Event',
                guestAdded: expect.objectContaining({
                    utorid: 'user1'
                }),
                numGuests: 1
            }));
        });

        test('should throw error if user already a guest', async () => {
            const mockUser = {
                id: 1,
                utorid: 'user1'
            };

            const mockEvent = {
                id: 1,
                capacity: 100,
                endTime: new Date(Date.now() + 86400000),
                published: true,
                organizers: [],
                guests: [mockUser] // User already guest
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.addCurrentUserAsGuest(1, 1)
            ).rejects.toThrow('User is already a guest');
        });
    });

    describe('removeGuest', () => {
        test('should remove guest successfully', async () => {
            const mockEvent = {
                id: 1,
                guests: [{ id: 2 }]
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.event.update.mockResolvedValue({});

            const result = await eventService.removeGuest(1, 2);

            expect(result).toEqual({ success: true });
        });

        test('should throw error if user is not a guest', async () => {
            const mockEvent = {
                id: 1,
                guests: [] // User not in guests
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.removeGuest(1, 2)
            ).rejects.toThrow('User is not a guest for this event');
        });
    });

    describe('removeCurrentUserAsGuest', () => {
        test('should remove current user as guest', async () => {
            const mockEvent = {
                id: 1,
                endTime: new Date(Date.now() + 86400000),
                guests: [{ id: 1 }]
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.event.update.mockResolvedValue({});

            const result = await eventService.removeCurrentUserAsGuest(1, 1);

            expect(result).toEqual({ success: true });
        });

        test('should throw error for ended event', async () => {
            const mockEvent = {
                id: 1,
                endTime: new Date(Date.now() - 86400000), // Past event
                guests: [{ id: 1 }]
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.removeCurrentUserAsGuest(1, 1)
            ).rejects.toThrow('Event has already ended');
        });

        test('should throw error if user not RSVP\'d', async () => {
            const mockEvent = {
                id: 1,
                guests: [] // User not in guest list
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            await expect(
                eventService.removeCurrentUserAsGuest(1, 1)
            ).rejects.toThrow('User is not a guest for this event');
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

        test('should create transactions for all guests when no utorid specified', async () => {
            const mockCreator = {
                id: 1,
                utorid: 'manager1',
                role: 'manager'
            };

            const mockEvent = {
                id: 1,
                pointsRemain: 500,
                organizers: [],
                guests: [
                    { id: 2, utorid: 'guest1' },
                    { id: 3, utorid: 'guest2' }
                ]
            };

            const mockTransactions = [
                {
                    id: 1,
                    type: 'event',
                    amount: 100,
                    userId: 2,
                    createdBy: 1,
                    eventId: 1,
                    relatedId: 1
                },
                {
                    id: 2,
                    type: 'event',
                    amount: 100,
                    userId: 3,
                    createdBy: 1,
                    eventId: 1,
                    relatedId: 1
                }
            ];

            mockPrisma.user.findUnique.mockResolvedValue(mockCreator);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.transaction.create
                .mockResolvedValueOnce(mockTransactions[0])
                .mockResolvedValueOnce(mockTransactions[1]);

            const data = {
                type: 'event',
                amount: 100,
                remark: 'Event participation'
            };

            const result = await eventService.createEventTransaction(1, data, 1);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });

        test('should throw error if user not on guest list', async () => {
            const mockCreator = {
                id: 1,
                utorid: 'manager1',
                role: 'manager'
            };

            const mockEvent = {
                id: 1,
                pointsRemain: 500,
                organizers: [{ id: 1 }],
                guests: [] // Empty guest list
            };

            const mockUser = {
                id: 2,
                utorid: 'notguest1'
            };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockCreator)
                .mockResolvedValueOnce(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            const data = {
                type: 'event',
                utorid: 'notguest1',
                amount: 100
            };

            await expect(
                eventService.createEventTransaction(1, data, 1)
            ).rejects.toThrow('User is not a guest for this event');
        });

        test('should throw error if insufficient points remain', async () => {
            const mockCreator = {
                id: 1,
                utorid: 'manager1',
                role: 'manager'
            };

            const mockEvent = {
                id: 1,
                pointsRemain: 50, // Less than requested
                organizers: [{ id: 1 }],
                guests: [{ id: 2, utorid: 'guest1' }]
            };

            const mockUser = {
                id: 2,
                utorid: 'guest1'
            };

            mockPrisma.user.findUnique
                .mockResolvedValueOnce(mockCreator)
                .mockResolvedValueOnce(mockUser);
            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

            const data = {
                type: 'event',
                utorid: 'guest1',
                amount: 100
            };

            await expect(
                eventService.createEventTransaction(1, data, 1)
            ).rejects.toThrow('Not enough points remaining for this event');
        });
    });

    describe('removeAllGuests', () => {
        test('should remove all guests successfully', async () => {
            const mockEvent = {
                id: 1,
                guests: [{ id: 1 }, { id: 2 }]
            };

            mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
            mockPrisma.event.update.mockResolvedValue({});

            const result = await eventService.removeAllGuests(1);

            expect(mockPrisma.event.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    guests: {
                        set: []
                    }
                }
            });

            expect(result).toEqual({ success: true });
        });

        test('should throw error for non-existent event', async () => {
            mockPrisma.event.findUnique.mockResolvedValue(null);

            await expect(
                eventService.removeAllGuests(1)
            ).rejects.toThrow('Event not found');
        });
    });
}); 