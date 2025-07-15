'use strict';

const express = require('express');
const router = express.Router();
const shortlinkController = require('../controllers/shortlinkController');
const { requireRole } = require('../middlewares/authMiddleware');

// Create a new shortlink (regular or higher role required, with permission check in controller)
router.post('/', requireRole('regular'), shortlinkController.createShortlink);

// Get all shortlinks with filtering and pagination (manager or higher role required)
router.get('/', requireRole('regular'), shortlinkController.getShortlinks);

// Public endpoint to check if slug exists
router.get('/exists/:slug', shortlinkController.checkSlugExists);

// Get a single shortlink by ID (manager or higher role required)
router.get('/:id', requireRole('regular'), shortlinkController.getShortlink);

// Update a shortlink (manager or higher role required)
router.patch('/:id', requireRole('manager'), shortlinkController.updateShortlink);

// Delete a shortlink (manager or higher role required)
router.delete('/:id', requireRole('manager'), shortlinkController.deleteShortlink);

// Get shortlinks for a specific event (regular or higher role required)
router.get('/events/:eventId', requireRole('regular'), shortlinkController.getEventShortlinks);

// Public redirect endpoint (no authentication required)
router.get('/redirect/:slug', shortlinkController.redirectBySlug);

module.exports = router; 