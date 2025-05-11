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
          
          // Check for missing required field errors
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
      // Create new params object, by default include events the user is organizing
      const apiParams = { ...params };
      
      // If organizing parameter is true, explicitly request to only return events the user is organizing
      if (apiParams.organizing) {
        apiParams.organizing = true;
      } else {
        // If not specifically filtering for organized events, but still want to include organized events in the results
        apiParams.includeMyOrganizedEvents = true;
      }
      
      const response = await api.get('/events', { params: apiParams });
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
      // By default tell the backend we want to see our organized events, even if unpublished
      const response = await api.get(`/events/${eventId}`, {
        params: { includeAsOrganizer: true }
      });
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
          if (data.error && data.error.includes('not published')) {
            throw new Error('This event is not published yet. Only managers and organizers can view unpublished events.');
          }
          throw new Error('You do not have permission to view this event.');
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
  addOrganizer: async (eventId, utorid) => {
    try {
      // Backend expects to receive utorid string
      const response = await api.post(`/events/${eventId}/organizers`, { utorid });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          if (data.error && data.error.includes('UTORid is required')) {
            throw new Error('UTORid is required');
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
  addGuest: async (eventId, utorid) => {
    try {
      // Backend expects to receive utorid string
      const response = await api.post(`/events/${eventId}/guests`, { utorid });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          if (data.error && data.error.includes('UTORid is required')) {
            throw new Error('UTORid is required');
          }
          
          if (data.error && data.error.includes('already a guest')) {
            throw new Error('User is already a guest for this event');
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
          throw new Error('User is already an organizer of this event and cannot be added as a guest');
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

  // Remove all guests from an event (Manager+)
  removeAllGuests: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}/guests`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid event ID')) {
            throw new Error('Invalid event ID');
          }
          
          throw new Error(data.error || 'Invalid request to remove all guests');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to remove all guests from this event');
        }
        
        if (status === 404) {
          throw new Error('Event not found');
        }
        
        throw new Error(data.error || 'Failed to remove all guests');
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
        
        if (status === 403) {
          throw new Error(data.error || 'You do not have permission to cancel this RSVP');
        }
        
        if (status === 404) {
          if (data.error && data.error.includes('not a guest')) {
            throw new Error('You are not RSVP\'d to this event');
          }
          
          throw new Error('Event not found');
        }
        
        if (status === 410) {
          throw new Error('Cannot cancel RSVP: Event has already ended');
        }
        
        throw new Error(data.error || 'Failed to cancel RSVP');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Award points to attendees (Manager+ or Organizer)
  awardPoints: async (eventId, userId = null, points) => {
    try {
      // Ensure points is an integer
      const pointsValue = Math.floor(Number(points));
      
      // Validate points value
      if (isNaN(pointsValue) || pointsValue <= 0) {
        throw new Error('Points amount must be a positive number');
      }
      
      // Explicitly use integer type
      const data = userId ? 
        { type: 'event', userId, amount: pointsValue } : 
        { type: 'event', amount: pointsValue };
      
      console.log('Sending award points request:', data);
      
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

  // Generate a dynamic check-in token (Manager or Organizer)
  getCheckinToken: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/checkin-token`);
      return response.data; // { eventId, timestamp, signature, token }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 403) throw new Error('You are not authorized to generate check-in tokens.');
        if (status === 404) throw new Error('Event not found');
        if (status === 410) throw new Error('Event has already ended');
        throw new Error(data.error || 'Failed to generate check-in token');
      }
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Submit an attendee check-in using a token
  submitCheckin: async (eventId, { timestamp, signature }) => {
    try {
      const response = await api.post(`/events/${eventId}/checkin`, { timestamp, signature });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          // Not authenticated
          throw new Error('Please log in to check in.');
        }
        if (status === 403 && data.needsRsvp) {
          // Pass through the needsRsvp flag from the backend
          error.response.data.needsRsvp = true;
          throw error;
        }
        if (status === 400) throw new Error(data.error || 'Invalid check-in token.');
        if (status === 410) throw new Error(data.error || 'Check-in token expired.');
        if (status === 404) throw new Error('Event not found');
        throw new Error(data.error || 'Failed to check in');
      }
      throw new Error('Network error: Could not connect to server');
    }
  },

  // organizer check in a guest by utorid
  checkinUserByUtorid: async (eventId, utorid) => {
    try {
      const response = await api.post(`/events/${eventId}/checkin-user`, { utorid });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) throw new Error(data.error || 'Invalid check-in request');
        if (status === 403) throw new Error(data.error || 'You do not have permission to check in users for this event');
        if (status === 404) throw new Error('Event or user not found');
        throw new Error(data.error || 'Failed to check in user');
      }
      throw new Error('Network error: Could not connect to server');
    }
  },
};

export default EventService; 