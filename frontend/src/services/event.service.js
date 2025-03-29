import api from './api';

const EventService = {
  // Create an event (Manager+)
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create event');
    }
  },

  // Get all events (Regular+)
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch events');
    }
  },

  // Get a specific event (Regular+)
  getEvent: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch event');
    }
  },

  // Update an event (Manager+ or Organizer)
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.patch(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update event');
    }
  },

  // Delete an event (Manager+)
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete event');
    }
  },

  // Add an organizer to an event (Manager+)
  addOrganizer: async (eventId, userId) => {
    try {
      const response = await api.post(`/events/${eventId}/organizers`, { userId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to add organizer');
    }
  },

  // Remove an organizer from an event (Manager+)
  removeOrganizer: async (eventId, userId) => {
    try {
      const response = await api.delete(`/events/${eventId}/organizers/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to remove organizer');
    }
  },

  // Add a guest to an event (Manager+ or Organizer)
  addGuest: async (eventId, userId) => {
    try {
      const response = await api.post(`/events/${eventId}/guests`, { userId });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to add guest');
    }
  },

  // Remove a guest from an event (Manager+ or Organizer)
  removeGuest: async (eventId, userId) => {
    try {
      const response = await api.delete(`/events/${eventId}/guests/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to remove guest');
    }
  },

  // RSVP to an event (Regular+)
  rsvpToEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/guests/me`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to RSVP to event');
    }
  },

  // Cancel RSVP to an event (Regular+)
  cancelRsvp: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}/guests/me`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to cancel RSVP');
    }
  },

  // Award points to attendees (Manager+ or Organizer)
  awardPoints: async (eventId, userId = null, points) => {
    try {
      const data = userId ? { userId, points } : { points };
      const response = await api.post(`/events/${eventId}/transactions`, data);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to award points');
    }
  },
};

export default EventService; 