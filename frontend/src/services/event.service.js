import api from './api';

const EventService = {
  // Create an event (Manager+)
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error === 'No event data provided') {
            throw new Error('No event data provided');
          }
          
          // 检查缺少必填字段的错误
          if (data.error && data.error.includes('required')) {
            throw new Error(data.error);
          }
          
          throw new Error(data.error || 'Invalid event data. Please check your inputs.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to create events');
        }
        
        throw new Error(data.error || 'Failed to create event');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Get all events (Regular+)
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Limit must be')) {
            throw new Error('Invalid limit parameter. Limit must be a positive integer.');
          }
          
          if (data.error && data.error.includes('Page must be')) {
            throw new Error('Invalid page parameter. Page must be a positive integer.');
          }
          
          if (data.error && data.error.includes('Cannot specify both')) {
            throw new Error('Cannot specify both started and ended filters.');
          }
          
          throw new Error(data.error || 'Invalid search parameters. Please check your filters.');
        }
        
        throw new Error(data.error || 'Failed to fetch events');
      }
      
      throw new Error('Network error: Could not retrieve events. Please check your connection.');
    }
  },

  // Get a specific event (Regular+)
  getEvent: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          throw new Error(data.error || 'Invalid request');
        }
        
        if (status === 403) {
          throw new Error('Event is not published. You do not have permission to view this event.');
        }
        
        if (status === 404) {
          throw new Error('Event not found');
        }
        
        throw new Error(data.error || 'Failed to fetch event');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Update an event (Manager+ or Organizer)
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.patch(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          if (data.error && data.error.includes('No fields provided')) {
            throw new Error('No fields provided for update');
          }
          
          throw new Error(data.error || 'Invalid event data. Please check your inputs.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to update this event');
        }
        
        if (status === 404) {
          throw new Error('Event not found');
        }
        
        throw new Error(data.error || 'Failed to update event');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Delete an event (Manager+)
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          throw new Error(data.error || 'Invalid request');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to delete events');
        }
        
        if (status === 404) {
          throw new Error('Event not found');
        }
        
        throw new Error(data.error || 'Failed to delete event');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Add an organizer to an event (Manager+)
  addOrganizer: async (eventId, userId) => {
    try {
      const response = await api.post(`/events/${eventId}/organizers`, { userId });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          if (data.error && data.error.includes('userId is required')) {
            throw new Error('User ID is required');
          }
          
          if (data.error && data.error.includes('already an organizer')) {
            throw new Error('User is already an organizer for this event');
          }
          
          throw new Error(data.error || 'Invalid request to add organizer');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to add organizers to this event');
        }
        
        if (status === 404) {
          if (data.error && data.error.includes('User not found')) {
            throw new Error('User not found');
          }
          
          throw new Error('Event not found');
        }
        
        if (status === 409) {
          throw new Error('User is already a guest of this event and cannot be added as an organizer');
        }
        
        throw new Error(data.error || 'Failed to add organizer');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Remove an organizer from an event (Manager+)
  removeOrganizer: async (eventId, userId) => {
    try {
      const response = await api.delete(`/events/${eventId}/organizers/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          if (data.error && data.error.includes('creator cannot be removed')) {
            throw new Error('The event creator cannot be removed as an organizer');
          }
          
          throw new Error(data.error || 'Invalid request to remove organizer');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to remove organizers from this event');
        }
        
        if (status === 404) {
          if (data.error && data.error.includes('not an organizer')) {
            throw new Error('This user is not an organizer of this event');
          }
          
          throw new Error('Event not found');
        }
        
        throw new Error(data.error || 'Failed to remove organizer');
      }
      
      throw new Error('Network error: Could not connect to server');
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
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          if (data.error && data.error.includes('userId is required')) {
            throw new Error('User ID is required');
          }
          
          if (data.error && data.error.includes('capacity')) {
            throw new Error('Cannot add guest: Event has reached maximum capacity');
          }
          
          if (data.error && data.error.includes('already a guest')) {
            throw new Error('This user is already a guest of this event');
          }
          
          throw new Error(data.error || 'Invalid request to add guest');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to add guests to this event');
        }
        
        if (status === 404) {
          if (data.error && data.error.includes('User not found')) {
            throw new Error('User not found');
          }
          
          throw new Error('Event not found');
        }
        
        if (status === 409) {
          throw new Error('This user is an organizer of this event and cannot be added as a guest');
        }
        
        throw new Error(data.error || 'Failed to add guest');
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
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          throw new Error(data.error || 'Invalid request to remove guest');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to remove guests from this event');
        }
        
        if (status === 404) {
          if (data.error && data.error.includes('not a guest')) {
            throw new Error('User is not a guest of this event');
          }
          
          throw new Error('Event not found');
        }
        
        throw new Error(data.error || 'Failed to remove guest');
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
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          if (data.error && data.error.includes('capacity')) {
            throw new Error('Cannot RSVP: This event has reached its maximum capacity');
          }
          
          if (data.error && data.error.includes('already a guest')) {
            throw new Error('You have already RSVP\'d to this event');
          }
          
          throw new Error(data.error || 'Invalid RSVP request');
        }
        
        if (status === 403) {
          if (data.error && data.error.includes('not verified')) {
            throw new Error('You must be verified to RSVP to events');
          }
          
          if (data.error && data.error.includes('not published')) {
            throw new Error('This event is not published yet');
          }
          
          throw new Error(data.error || 'You do not have permission to RSVP to this event');
        }
        
        if (status === 404) {
          throw new Error('Event not found');
        }
        
        if (status === 409) {
          throw new Error('You are an organizer of this event and cannot RSVP');
        }
        
        throw new Error(data.error || 'Failed to RSVP to event');
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
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          throw new Error(data.error || 'Invalid request to cancel RSVP');
        }
        
        if (status === 404) {
          if (data.error && data.error.includes('not a guest')) {
            throw new Error('You are not RSVP\'d to this event');
          }
          
          throw new Error('Event not found');
        }
        
        throw new Error(data.error || 'Failed to cancel RSVP');
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
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          if (data.error && data.error.includes('points remaining')) {
            throw new Error('Not enough points remaining for this event');
          }
          
          if (data.error && data.error.includes('already awarded')) {
            throw new Error('Points have already been awarded to this user');
          }
          
          if (data.error && data.error.includes('points must be')) {
            throw new Error('Points amount must be a positive number');
          }
          
          if (data.error && data.error.includes('points is required')) {
            throw new Error('Points amount is required');
          }
          
          throw new Error(data.error || 'Invalid points award request');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to award points for this event');
        }
        
        if (status === 404) {
          if (data.error && data.error.includes('Event not found')) {
            throw new Error('Event not found');
          }
          
          if (data.error && data.error.includes('not a guest')) {
            throw new Error('User is not a guest of this event');
          }
          
          throw new Error(data.error || 'Not found');
        }
        
        throw new Error(data.error || 'Failed to award points');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },
};

export default EventService; 