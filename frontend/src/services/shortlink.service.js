import api from './api';

/**
 * Shortlink Service
 * Handles all shortlink-related API calls
 */
class ShortlinkService {
  /**
   * Create a new shortlink
   * @param {Object} shortlinkData - The shortlink data
   * @param {string} shortlinkData.slug - The shortlink slug
   * @param {string} shortlinkData.targetUrl - The target URL
   * @param {number} [shortlinkData.eventId] - Optional event ID
   * @returns {Promise<Object>} The created shortlink
   */
  async createShortlink(shortlinkData) {
    try {
      const response = await api.post('/shortlinks', shortlinkData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create shortlink';
      throw new Error(message);
    }
  }

  /**
   * Get all shortlinks with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {string} [params.slug] - Filter by slug
   * @param {number} [params.eventId] - Filter by event ID
   * @param {string} [params.createdBy] - Filter by creator
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @returns {Promise<Object>} Paginated shortlinks result
   */
  async getShortlinks(params = {}) {
    try {
      const response = await api.get('/shortlinks', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch shortlinks';
      throw new Error(message);
    }
  }

  /**
   * Get a single shortlink by ID
   * @param {number} id - The shortlink ID
   * @returns {Promise<Object>} The shortlink
   */
  async getShortlink(id) {
    try {
      const response = await api.get(`/shortlinks/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch shortlink';
      throw new Error(message);
    }
  }

  /**
   * Update a shortlink
   * @param {number} id - The shortlink ID
   * @param {Object} updateData - The update data
   * @param {string} [updateData.slug] - The shortlink slug
   * @param {string} [updateData.targetUrl] - The target URL
   * @param {number} [updateData.eventId] - Optional event ID
   * @returns {Promise<Object>} The updated shortlink
   */
  async updateShortlink(id, updateData) {
    try {
      const response = await api.patch(`/shortlinks/${id}`, updateData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update shortlink';
      throw new Error(message);
    }
  }

  /**
   * Delete a shortlink
   * @param {number} id - The shortlink ID
   * @returns {Promise<void>}
   */
  async deleteShortlink(id) {
    try {
      await api.delete(`/shortlinks/${id}`);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete shortlink';
      throw new Error(message);
    }
  }

  /**
   * Get shortlinks for a specific event
   * @param {number} eventId - The event ID
   * @returns {Promise<Array>} Array of shortlinks for the event
   */
  async getEventShortlinks(eventId) {
    try {
      const response = await api.get(`/shortlinks/events/${eventId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch event shortlinks';
      throw new Error(message);
    }
  }

  /**
   * Check if a slug is already taken
   * Performs a filtered query with limit=1 for efficiency.
   * This helper is useful for client-side validation before attempting to create a shortlink.
   * @param {string} slug - The slug to check
   * @returns {Promise<boolean>} True if the slug already exists
   */
  async checkSlugExists(slug) {
    if (!slug) return false;
    try {
      const response = await api.get(`/shortlinks/exists/${slug}`);
      return response.data;
    } catch (error) {
      // If the request fails we assume the slug is not taken to avoid blocking the user.
      // The server will still enforce uniqueness on create.
      console.error('Failed to check slug availability:', error);
      return false;
    }
  }

  /**
   * Get the full shortlink URL
   * @param {string} slug - The shortlink slug
   * @returns {string} The full shortlink URL
   */
  getShortlinkUrl(slug) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/${slug}`;
  }

  /**
   * Validate slug format
   * @param {string} slug - The slug to validate
   * @returns {boolean} Whether the slug is valid
   */
  isValidSlug(slug) {
    return /^[a-zA-Z0-9-_]+$/.test(slug);
  }

  /**
   * Validate URL format
   * @param {string} url - The URL to validate
   * @returns {boolean} Whether the URL is valid
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a suggested slug from a string
   * @param {string} text - The text to generate slug from
   * @returns {string} The generated slug
   */
  generateSlug(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-_\s]/g, '') // Remove special characters except hyphens, underscores, and spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
}

export default new ShortlinkService(); 