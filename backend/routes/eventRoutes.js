'use strict';

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireRole } = require('../middlewares/authMiddleware');

// Create a new event (manager or higher)
router.post('/', requireRole('manager'), eventController.createEvent);

// Get events with filtering
router.get('/', requireRole('regular'), eventController.getEvents);

// Get a specific event
router.get('/:eventId', requireRole('regular'), eventController.getEvent);

// Update an event (manager or organizer)
router.patch('/:eventId', requireRole('regular'), eventController.updateEvent);

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

module.exports = router;