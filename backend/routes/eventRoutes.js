'use strict';

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireRole } = require('../middlewares/authMiddleware');
const { eventBackgroundUpload } = require('../utils/uploadConfig');

// Create a new event (manager or higher)
router.post('/', requireRole('manager'), eventBackgroundUpload.single('background'), eventController.createEvent);

// Get events with filtering
router.get('/', requireRole('regular'), eventController.getEvents);

// Get a specific event
router.get('/:eventId', requireRole('regular'), eventController.getEvent);

// Update an event (manager or organizer)
router.patch('/:eventId', requireRole('regular'), eventBackgroundUpload.single('background'), eventController.updateEvent);

// Delete an event (manager or higher)
router.delete('/:eventId', requireRole('manager'), eventController.deleteEvent);

// Add an organizer to an event (manager or higher)
router.post('/:eventId/organizers', requireRole('manager'), eventController.addOrganizer);

// Remove an organizer from an event (manager or higher)
router.delete('/:eventId/organizers/:userId', requireRole('manager'), eventController.removeOrganizer);

// Add current user as a guest
router.post('/:eventId/guests/me', requireRole('regular'), eventController.addCurrentUserAsGuest);

// Add a guest to an event (manager or organizer)
router.post('/:eventId/guests', requireRole('regular'), eventController.addGuest);

// Remove current user as a guest
router.delete('/:eventId/guests/me', requireRole('regular'), eventController.removeCurrentUserAsGuest);

// Remove a guest from an event (manager or higher)
router.delete('/:eventId/guests/:userId', requireRole('manager'), eventController.removeGuest);

// Remove all guests from an event (manager or higher)
router.delete('/:eventId/guests', requireRole('manager'), eventController.removeAllGuests);

// Create an event transaction (award points)
router.post('/:eventId/transactions', requireRole('regular'), eventController.createEventTransaction);

// Generate a dynamic check-in token (manager or organizer)
router.get('/:eventId/checkin-token', requireRole('regular'), eventController.getCheckinToken);

// For attendees to check in using a token
router.post('/:eventId/checkin', requireRole('regular'), eventController.checkInWithToken);

// Add manual QR scan check-in route – managers or organizers can record attendance by scanning a guest QR code
router.post('/:eventId/checkin/scan', requireRole('regular'), eventController.checkInByScan);

module.exports = router;