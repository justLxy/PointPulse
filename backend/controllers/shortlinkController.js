'use strict';

const shortlinkService = require('../services/shortlinkService');
const { checkRole } = require('../middlewares/authMiddleware');

/**
 * Create a new shortlink
 */
const createShortlink = async (req, res) => {
  console.log('\n\n===== CREATE SHORTLINK REQUEST START =====');
  console.log('Time:', new Date().toISOString());
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Auth user:', JSON.stringify(req.auth, null, 2));

  try {
    // Check for empty payload
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('No shortlink data provided');
      console.log('===== CREATE SHORTLINK REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'No shortlink data provided' });
    }

    // Validate required fields
    const { slug, targetUrl } = req.body;
    if (!slug || !targetUrl) {
      console.log('Missing required fields');
      console.log('===== CREATE SHORTLINK REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'Slug and target URL are required' });
    }

    const createdById = req.auth.id;
    const isManager = checkRole(req.auth, 'manager');
    console.log('Creating shortlink for user ID:', createdById, ', isManager:', isManager);

    const shortlink = await shortlinkService.createShortlink(req.body, createdById, isManager);
    console.log('Shortlink created successfully:', JSON.stringify(shortlink, null, 2));
    console.log('===== CREATE SHORTLINK REQUEST END (201) =====\n\n');
    
    return res.status(201).json(shortlink);
  } catch (error) {
    console.log('Error creating shortlink:', error.message);
    console.log('Error stack:', error.stack);
    
    if (error.message.includes('already exists') || 
        error.message.includes('required') || 
        error.message.includes('Invalid') ||
        error.message.includes('must contain')) {
      console.log('===== CREATE SHORTLINK REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: error.message });
    }
    
    console.log('===== CREATE SHORTLINK REQUEST END (500) =====\n\n');
    return res.status(500).json({ error: 'Failed to create shortlink' });
  }
};

/**
 * Get all shortlinks with filtering and pagination
 */
const getShortlinks = async (req, res) => {
  console.log('\n\n===== GET SHORTLINKS REQUEST START =====');
  console.log('Time:', new Date().toISOString());
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Query parameters:', JSON.stringify(req.query, null, 2));
  console.log('Auth user:', JSON.stringify(req.auth, null, 2));

  try {
    const filters = {
      slug: req.query.slug,
      eventId: req.query.eventId ? parseInt(req.query.eventId) : undefined,
      createdBy: req.query.createdBy,
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 10
    };

    console.log('Filters:', JSON.stringify(filters, null, 2));

    // Validate pagination parameters
    if (isNaN(filters.page) || filters.page <= 0) {
      console.log('Invalid page parameter:', filters.page);
      console.log('===== GET SHORTLINKS REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'Page number must be a positive integer' });
    }

    if (isNaN(filters.limit) || filters.limit <= 0) {
      console.log('Invalid limit parameter:', filters.limit);
      console.log('===== GET SHORTLINKS REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'Limit must be a positive integer' });
    }

    const isManager = checkRole(req.auth, 'manager');
    const userId = req.auth.id;

    console.log('User roles - isManager:', isManager, ', userId:', userId);

    const result = await shortlinkService.getShortlinks(filters, isManager, userId);
    console.log('Shortlinks retrieved successfully, count:', result.total);
    console.log('===== GET SHORTLINKS REQUEST END (200) =====\n\n');
    
    return res.status(200).json(result);
  } catch (error) {
    console.log('Error getting shortlinks:', error.message);
    console.log('Error stack:', error.stack);
    console.log('===== GET SHORTLINKS REQUEST END (500) =====\n\n');
    return res.status(500).json({ error: 'Failed to retrieve shortlinks' });
  }
};

/**
 * Get a single shortlink by ID
 */
const getShortlink = async (req, res) => {
  console.log('\n\n===== GET SHORTLINK REQUEST START =====');
  console.log('Time:', new Date().toISOString());
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Params:', JSON.stringify(req.params, null, 2));
  console.log('Auth user:', JSON.stringify(req.auth, null, 2));

  try {
    const shortlinkId = parseInt(req.params.id);
    console.log('Parsed shortlink ID:', shortlinkId);

    if (isNaN(shortlinkId) || shortlinkId <= 0) {
      console.log('Invalid shortlink ID');
      console.log('===== GET SHORTLINK REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'Invalid shortlink ID' });
    }

    const shortlink = await shortlinkService.getShortlink(shortlinkId);
    console.log('Shortlink retrieved successfully:', JSON.stringify(shortlink, null, 2));
    console.log('===== GET SHORTLINK REQUEST END (200) =====\n\n');
    
    return res.status(200).json(shortlink);
  } catch (error) {
    console.log('Error getting shortlink:', error.message);
    
    if (error.message === 'Shortlink not found') {
      console.log('===== GET SHORTLINK REQUEST END (404) =====\n\n');
      return res.status(404).json({ error: 'Shortlink not found' });
    }
    
    console.log('Error stack:', error.stack);
    console.log('===== GET SHORTLINK REQUEST END (500) =====\n\n');
    return res.status(500).json({ error: 'Failed to retrieve shortlink' });
  }
};

/**
 * Update a shortlink
 */
const updateShortlink = async (req, res) => {
  console.log('\n\n===== UPDATE SHORTLINK REQUEST START =====');
  console.log('Time:', new Date().toISOString());
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Params:', JSON.stringify(req.params, null, 2));
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Auth user:', JSON.stringify(req.auth, null, 2));

  try {
    const shortlinkId = parseInt(req.params.id);
    console.log('Parsed shortlink ID:', shortlinkId);

    if (isNaN(shortlinkId) || shortlinkId <= 0) {
      console.log('Invalid shortlink ID');
      console.log('===== UPDATE SHORTLINK REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'Invalid shortlink ID' });
    }

    // Check for empty payload
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('No update data provided');
      console.log('===== UPDATE SHORTLINK REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'No update data provided' });
    }

    const userId = req.auth.id;
    console.log('Updating shortlink for user ID:', userId);

    const shortlink = await shortlinkService.updateShortlink(shortlinkId, req.body, userId);
    console.log('Shortlink updated successfully:', JSON.stringify(shortlink, null, 2));
    console.log('===== UPDATE SHORTLINK REQUEST END (200) =====\n\n');
    
    return res.status(200).json(shortlink);
  } catch (error) {
    console.log('Error updating shortlink:', error.message);
    
    if (error.message === 'Shortlink not found') {
      console.log('===== UPDATE SHORTLINK REQUEST END (404) =====\n\n');
      return res.status(404).json({ error: 'Shortlink not found' });
    }
    
    if (error.message.includes('already exists') || 
        error.message.includes('Invalid') ||
        error.message.includes('must contain')) {
      console.log('===== UPDATE SHORTLINK REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: error.message });
    }
    
    console.log('Error stack:', error.stack);
    console.log('===== UPDATE SHORTLINK REQUEST END (500) =====\n\n');
    return res.status(500).json({ error: 'Failed to update shortlink' });
  }
};

/**
 * Delete a shortlink
 */
const deleteShortlink = async (req, res) => {
  console.log('\n\n===== DELETE SHORTLINK REQUEST START =====');
  console.log('Time:', new Date().toISOString());
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Params:', JSON.stringify(req.params, null, 2));
  console.log('Auth user:', JSON.stringify(req.auth, null, 2));

  try {
    const shortlinkId = parseInt(req.params.id);
    console.log('Parsed shortlink ID:', shortlinkId);

    if (isNaN(shortlinkId) || shortlinkId <= 0) {
      console.log('Invalid shortlink ID');
      console.log('===== DELETE SHORTLINK REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'Invalid shortlink ID' });
    }

    const userId = req.auth.id;
    const isManager = checkRole(req.auth, 'manager');
    console.log('Deleting shortlink for user ID:', userId, ', isManager:', isManager);

    const result = await shortlinkService.deleteShortlink(shortlinkId, userId, isManager);
    console.log('Shortlink deleted successfully');
    console.log('===== DELETE SHORTLINK REQUEST END (204) =====\n\n');
    
    return res.status(204).send();
  } catch (error) {
    console.log('Error deleting shortlink:', error.message);
    
    if (error.message === 'Shortlink not found') {
      console.log('===== DELETE SHORTLINK REQUEST END (404) =====\n\n');
      return res.status(404).json({ error: 'Shortlink not found' });
    }
    
    if (error.message.includes('Insufficient permissions')) {
      console.log('===== DELETE SHORTLINK REQUEST END (403) =====\n\n');
      return res.status(403).json({ error: error.message });
    }
    
    console.log('Error stack:', error.stack);
    console.log('===== DELETE SHORTLINK REQUEST END (500) =====\n\n');
    return res.status(500).json({ error: 'Failed to delete shortlink' });
  }
};

/**
 * Get shortlinks for a specific event
 */
const getEventShortlinks = async (req, res) => {
  console.log('\n\n===== GET EVENT SHORTLINKS REQUEST START =====');
  console.log('Time:', new Date().toISOString());
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Params:', JSON.stringify(req.params, null, 2));
  console.log('Auth user:', JSON.stringify(req.auth, null, 2));

  try {
    const eventId = parseInt(req.params.eventId);
    console.log('Parsed event ID:', eventId);

    if (isNaN(eventId) || eventId <= 0) {
      console.log('Invalid event ID');
      console.log('===== GET EVENT SHORTLINKS REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const userId = req.auth.id;
    const isManager = checkRole(req.auth, 'manager');
    console.log('Getting event shortlinks for user ID:', userId, ', isManager:', isManager);

    const shortlinks = await shortlinkService.getEventShortlinks(eventId, userId, isManager);
    console.log('Event shortlinks retrieved successfully, count:', shortlinks.length);
    console.log('===== GET EVENT SHORTLINKS REQUEST END (200) =====\n\n');
    
    return res.status(200).json(shortlinks);
  } catch (error) {
    console.log('Error getting event shortlinks:', error.message);
    
    if (error.message === 'Event not found') {
      console.log('===== GET EVENT SHORTLINKS REQUEST END (404) =====\n\n');
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (error.message.includes('Insufficient permissions')) {
      console.log('===== GET EVENT SHORTLINKS REQUEST END (403) =====\n\n');
      return res.status(403).json({ error: error.message });
    }
    
    console.log('Error stack:', error.stack);
    console.log('===== GET EVENT SHORTLINKS REQUEST END (500) =====\n\n');
    return res.status(500).json({ error: 'Failed to retrieve event shortlinks' });
  }
};

/**
 * Redirect to target URL by slug (public endpoint)
 */
const redirectBySlug = async (req, res) => {
  console.log('\n\n===== REDIRECT BY SLUG REQUEST START =====');
  console.log('Time:', new Date().toISOString());
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Params:', JSON.stringify(req.params, null, 2));

  try {
    const { slug } = req.params;
    console.log('Slug:', slug);

    if (!slug) {
      console.log('No slug provided');
      console.log('===== REDIRECT BY SLUG REQUEST END (400) =====\n\n');
      return res.status(400).json({ error: 'Slug is required' });
    }

    const shortlink = await shortlinkService.getShortlinkBySlug(slug);
    console.log('Shortlink found, redirecting to:', shortlink.targetUrl);
    console.log('===== REDIRECT BY SLUG REQUEST END (302) =====\n\n');
    
    return res.redirect(302, shortlink.targetUrl);
  } catch (error) {
    console.log('Error redirecting by slug:', error.message);
    
    if (error.message === 'Shortlink not found') {
      console.log('===== REDIRECT BY SLUG REQUEST END (404) =====\n\n');
      return res.status(404).json({ error: 'Shortlink not found' });
    }
    
    console.log('Error stack:', error.stack);
    console.log('===== REDIRECT BY SLUG REQUEST END (500) =====\n\n');
    return res.status(500).json({ error: 'Failed to redirect' });
  }
};

/**
 * Check if a shortlink slug already exists (public helper)
 */
const checkSlugExists = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug || !/^[a-zA-Z0-9-_]+$/.test(slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    const existing = await shortlinkService.getShortlinkBySlugSafe(slug, {
      include: {
        event: { select: { id: true, name: true } },
        createdBy: { select: { id: true, utorid: true, name: true } },
      },
    });

    if (existing) {
      return res.status(200).json({ exists: true, shortlink: existing });
    }

    return res.status(200).json({ exists: false });
  } catch (error) {
    console.log('Error checking slug existence:', error.message);
    return res.status(500).json({ error: 'Failed to check slug' });
  }
};

module.exports = {
  createShortlink,
  getShortlinks,
  getShortlink,
  updateShortlink,
  deleteShortlink,
  getEventShortlinks,
  redirectBySlug,
  checkSlugExists,
}; 