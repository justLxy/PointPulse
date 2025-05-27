const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../index');
const { JWT_SECRET } = require('../../utils/jwtConfig');

// Mock the event controller
jest.mock('../../controllers/eventController', () => ({
    createEvent: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            name: 'Test Event',
            description: 'A test event',
            location: 'Test Location',
            startTime: '2025-05-10T09:00:00Z',
            endTime: '2025-05-10T17:00:00Z',
            capacity: 100,
            pointsRemain: 500,
            pointsAwarded: 0,
            published: false,
            organizers: [],
            guests: []
        });
    }),
    getEvents: jest.fn((req, res) => {
        res.status(200).json({
            count: 1,
            results: [
                {
                    id: 1,
                    name: 'Test Event',
                    location: 'Test Location',
                    startTime: '2025-05-10T09:00:00Z',
                    endTime: '2025-05-10T17:00:00Z',
                    capacity: 100,
                    numGuests: 0
                }
            ]
        });
    }),
    getEvent: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            name: 'Test Event',
            description: 'A test event',
            location: 'Test Location',
            startTime: '2025-05-10T09:00:00Z',
            endTime: '2025-05-10T17:00:00Z',
            capacity: 100,
            organizers: [],
            guests: []
        });
    }),
    updateEvent: jest.fn((req, res) => {
        res.status(200).json({
            id: 1,
            name: 'Updated Event',
            location: 'Test Location',
            published: true
        });
    }),
    deleteEvent: jest.fn((req, res) => {
        res.status(204).send();
    }),
    addOrganizer: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            name: 'Test Event',
            location: 'Test Location',
            organizers: [
                {
                    id: 2,
                    utorid: 'organi01',
                    name: 'Organizer One'
                }
            ]
        });
    }),
    removeOrganizer: jest.fn((req, res) => {
        res.status(204).send();
    }),
    addCurrentUserAsGuest: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            name: 'Test Event',
            location: 'Test Location',
            guestAdded: {
                id: 3,
                utorid: 'testus01',
                name: 'Test User'
            },
            numGuests: 1
        });
    }),
    addGuest: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            name: 'Test Event',
            location: 'Test Location',
            guestAdded: {
                id: 4,
                utorid: 'guestus01',
                name: 'Guest One'
            },
            numGuests: 1
        });
    }),
    removeCurrentUserAsGuest: jest.fn((req, res) => {
        res.status(204).send();
    }),
    removeGuest: jest.fn((req, res) => {
        res.status(204).send();
    }),
    removeAllGuests: jest.fn((req, res) => {
        res.status(204).send();
    }),
    createEventTransaction: jest.fn((req, res) => {
        res.status(201).json({
            id: 1,
            recipient: 'guestus01',
            awarded: 100,
            type: 'event',
            relatedId: 1,
            remark: 'Event participation',
            createdBy: 'manage01'
        });
    }),
    getCheckinToken: jest.fn((req, res) => {
        res.status(200).json({
            token: 'checkin-token-123',
            expiresAt: '2025-05-10T18:00:00Z'
        });
    }),
    checkInWithToken: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            message: 'Successfully checked in'
        });
    }),
    checkInByScan: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            message: 'User checked in successfully'
        });
    })
}));

// Helper function to generate JWT tokens for testing
const generateTestToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

describe('Event Routes', () => {
    describe('POST /events', () => {
        test('should create a new event with manager role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .post('/events')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Test Event',
                    description: 'A test event',
                    location: 'Test Location',
                    startTime: '2025-05-10T09:00:00Z',
                    endTime: '2025-05-10T17:00:00Z',
                    capacity: 100,
                    points: 500
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('id');
                    expect(response.body).toHaveProperty('name', 'Test Event');
                    expect(response.body).toHaveProperty('location', 'Test Location');
                    expect(response.body).toHaveProperty('pointsRemain', 500);
                });
        });
    });

    describe('GET /events', () => {
        test('should get paginated list of events', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .get('/events')
                .set('Authorization', `Bearer ${token}`)
                .query({ page: 1, limit: 10 })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('count');
                    expect(response.body).toHaveProperty('results');
                    expect(Array.isArray(response.body.results)).toBe(true);
                });
        });

        test('should get events with filters', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .get('/events')
                .set('Authorization', `Bearer ${token}`)
                .query({ 
                    name: 'Test',
                    location: 'Location'
                })
                .expect(200);
        });
    });

    describe('GET /events/:eventId', () => {
        test('should get specific event', async () => {
            const token = generateTestToken({ id: 1, utorid: 'testus01', role: 'regular' });

            await request(app)
                .get('/events/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id', 1);
                    expect(response.body).toHaveProperty('name', 'Test Event');
                    expect(response.body).toHaveProperty('description');
                    expect(response.body).toHaveProperty('location');
                });
        });
    });

    describe('PATCH /events/:eventId', () => {
        test('should update event', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .patch('/events/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Event',
                    published: true
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('id', 1);
                    expect(response.body).toHaveProperty('name', 'Updated Event');
                    expect(response.body).toHaveProperty('published', true);
                });
        });
    });

    describe('DELETE /events/:eventId', () => {
        test('should delete event with manager role', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .delete('/events/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(204);
        });
    });

    describe('POST /events/:eventId/organizers', () => {
        test('should add organizer to event', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .post('/events/1/organizers')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    utorid: 'organi01'
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('organizers');
                    expect(response.body.organizers).toHaveLength(1);
                    expect(response.body.organizers[0]).toHaveProperty('utorid', 'organi01');
                });
        });
    });

    describe('DELETE /events/:eventId/organizers/:userId', () => {
        test('should remove organizer from event', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .delete('/events/1/organizers/2')
                .set('Authorization', `Bearer ${token}`)
                .expect(204);
        });
    });

    describe('POST /events/:eventId/guests/me', () => {
        test('should add current user as guest', async () => {
            const token = generateTestToken({ id: 3, utorid: 'testus01', role: 'regular' });

            await request(app)
                .post('/events/1/guests/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('guestAdded');
                    expect(response.body.guestAdded).toHaveProperty('utorid', 'testus01');
                    expect(response.body).toHaveProperty('numGuests', 1);
                });
        });
    });

    describe('POST /events/:eventId/guests', () => {
        test('should add guest to event', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .post('/events/1/guests')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    utorid: 'guestus01'
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('guestAdded');
                    expect(response.body.guestAdded).toHaveProperty('utorid', 'guestus01');
                });
        });
    });

    describe('DELETE /events/:eventId/guests/me', () => {
        test('should remove current user as guest', async () => {
            const token = generateTestToken({ id: 3, utorid: 'testus01', role: 'regular' });

            await request(app)
                .delete('/events/1/guests/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(204);
        });
    });

    describe('DELETE /events/:eventId/guests/:userId', () => {
        test('should remove guest from event', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .delete('/events/1/guests/3')
                .set('Authorization', `Bearer ${token}`)
                .expect(204);
        });
    });

    describe('POST /events/:eventId/transactions', () => {
        test('should create event transaction (award points)', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .post('/events/1/transactions')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type: 'event',
                    utorid: 'guestus01',
                    amount: 100,
                    remark: 'Event participation'
                })
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('recipient', 'guestus01');
                    expect(response.body).toHaveProperty('awarded', 100);
                    expect(response.body).toHaveProperty('type', 'event');
                });
        });
    });

    describe('GET /events/:eventId/checkin-token', () => {
        test('should generate check-in token', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .get('/events/1/checkin-token')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('token');
                    expect(response.body).toHaveProperty('expiresAt');
                });
        });
    });

    describe('POST /events/:eventId/checkin', () => {
        test('should check in with token', async () => {
            const token = generateTestToken({ id: 3, utorid: 'testus01', role: 'regular' });

            await request(app)
                .post('/events/1/checkin')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    token: 'checkin-token-123'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('success', true);
                    expect(response.body).toHaveProperty('message');
                });
        });
    });

    describe('POST /events/:eventId/checkin/scan', () => {
        test('should check in by QR scan', async () => {
            const token = generateTestToken({ id: 1, utorid: 'manage01', role: 'manager' });

            await request(app)
                .post('/events/1/checkin/scan')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    utorid: 'guestus01'
                })
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('success', true);
                    expect(response.body).toHaveProperty('message');
                });
        });
    });
}); 