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
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('capacity')) {
            throw new Error('Cannot add guest: Event has reached maximum capacity');
          }
          if (data.message && data.message.includes('already')) {
            throw new Error('This user is already a guest of this event');
          }
          throw new Error(data.message || 'Invalid request to add guest');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to add guests to this event');
        }
        
        if (status === 404) {
          if (data.message && data.message.includes('user')) {
            throw new Error('User not found');
          }
          throw new Error('Event not found');
        }
        
        if (status === 409) {
          throw new Error('This user is an organizer of this event and cannot be added as a guest');
        }
        
        throw new Error(data.message || 'Failed to add guest');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Remove a guest from an event (Manager+ or Organizer)
  removeGuest: async (eventId, userId) => {
    try {
      const response = await api.delete(`/events/${eventId}/guests/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 403) {
          throw new Error('You do not have permission to remove guests from this event');
        }
        
        if (status === 404) {
          if (data.message && data.message.includes('user')) {
            throw new Error('User is not a guest of this event');
          }
          throw new Error('Event not found');
        }
        
        throw new Error(data.message || 'Failed to remove guest');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // RSVP to an event (Regular+)
  rsvpToEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/guests/me`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('capacity')) {
            throw new Error('Cannot RSVP: This event has reached its maximum capacity');
          }
          if (data.message && data.message.includes('already')) {
            throw new Error('You have already RSVP\'d to this event');
          }
          throw new Error(data.message || 'Invalid RSVP request');
        }
        
        if (status === 403) {
          throw new Error('You must be verified to RSVP to events');
        }
        
        if (status === 404) {
          throw new Error('This event does not exist or has been cancelled');
        }
        
        if (status === 409) {
          throw new Error('You are an organizer of this event and cannot RSVP');
        }
        
        throw new Error(data.message || 'Failed to RSVP to event');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Cancel RSVP to an event (Regular+)
  cancelRsvp: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}/guests/me`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data.message || 'Invalid request to cancel RSVP');
        }
        
        if (status === 404) {
          throw new Error('This event does not exist or you are not RSVP\'d to it');
        }
        
        throw new Error(data.message || 'Failed to cancel RSVP');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Award points to attendees (Manager+ or Organizer)
  awardPoints: async (eventId, userId = null, points) => {
    try {
      const data = userId ? { userId, points } : { points };
      const response = await api.post(`/events/${eventId}/transactions`, data);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('points')) {
            throw new Error('Not enough points remaining for this event');
          }
          if (data.message && data.message.includes('already awarded')) {
            throw new Error('Points have already been awarded to this user');
          }
          throw new Error(data.message || 'Invalid points award request');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to award points for this event');
        }
        
        if (status === 404) {
          if (data.message && data.message.includes('user')) {
            throw new Error('User is not a guest of this event');
          }
          throw new Error('Event not found');
        }
        
        throw new Error(data.message || 'Failed to award points');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },
};

export default EventService; 