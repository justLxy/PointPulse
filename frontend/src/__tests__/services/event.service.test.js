/**
 * Core Event Flow: Event management business logic
 * Validates event creation, retrieval, update, deletion and organizer management workflows
 */

import api from '../../services/api';
import EventService from '../../services/event.service';

jest.mock('../../services/api');

describe('EventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    const validEventData = {
      title: 'Test Event',
      description: 'Test Description',
      startTime: '2024-03-20T10:00:00Z',
      endTime: '2024-03-20T12:00:00Z',
      location: 'Test Location',
      capacity: 100
    };

    test('successfully creates an event', async () => {
      const mockResponse = {
        data: {
          id: 1,
          ...validEventData,
          published: false,
          createdBy: 'manager1'
        }
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await EventService.createEvent(validEventData);
      expect(api.post).toHaveBeenCalledWith('/events', validEventData);
      expect(result).toEqual(mockResponse.data);
    });

    test('handles missing event data error', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'No event data provided' }
        }
      });

      await expect(EventService.createEvent({}))
        .rejects.toThrow('No event data provided');
    });

    test('handles required field errors', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Title field is required' }
        }
      });

      await expect(EventService.createEvent({ description: 'Test' }))
        .rejects.toThrow('Title field is required');
    });

    test('handles permission error', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Permission denied' }
        }
      });

      await expect(EventService.createEvent(validEventData))
        .rejects.toThrow('You do not have permission to create events');
    });

    test('handles network error', async () => {
      api.post.mockRejectedValue(new Error('Network error'));

      await expect(EventService.createEvent(validEventData))
        .rejects.toThrow('Network error: Could not connect to server');
    });
  });

  describe('getEvents', () => {
    test('successfully retrieves events with default params', async () => {
      const mockResponse = {
        data: {
          count: 2,
          results: [
            { id: 1, title: 'Event 1', published: true },
            { id: 2, title: 'Event 2', published: true }
          ]
        }
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await EventService.getEvents();
      expect(api.get).toHaveBeenCalledWith('/events', {
        params: { includeMyOrganizedEvents: true }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('successfully retrieves organized events', async () => {
      const mockResponse = {
        data: {
          count: 1,
          results: [{ id: 1, title: 'My Event', published: false }]
        }
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await EventService.getEvents({ organizing: true });
      expect(api.get).toHaveBeenCalledWith('/events', {
        params: { organizing: true }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles invalid limit parameter', async () => {
      api.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Limit must be a positive integer' }
        }
      });

      await expect(EventService.getEvents({ limit: -1 }))
        .rejects.toThrow('Invalid limit parameter. Limit must be a positive integer.');
    });

    test('handles invalid page parameter', async () => {
      api.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Page must be a positive integer' }
        }
      });

      await expect(EventService.getEvents({ page: 0 }))
        .rejects.toThrow('Invalid page parameter. Page must be a positive integer.');
    });

    test('handles conflicting filters error', async () => {
      api.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Cannot specify both started and ended filters' }
        }
      });

      await expect(EventService.getEvents({ started: true, ended: true }))
        .rejects.toThrow('Cannot specify both started and ended filters.');
    });

    test('handles network error', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      await expect(EventService.getEvents())
        .rejects.toThrow('Network error: Could not retrieve events. Please check your connection.');
    });
  });

  describe('getEvent', () => {
    test('successfully retrieves a single event', async () => {
      const mockResponse = {
        data: {
          id: 1,
          title: 'Test Event',
          published: true
        }
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await EventService.getEvent(1);
      expect(api.get).toHaveBeenCalledWith('/events/1', {
        params: { includeAsOrganizer: true }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles invalid event ID error', async () => {
      api.get.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid event ID' }
        }
      });

      await expect(EventService.getEvent('invalid'))
        .rejects.toThrow('Invalid event ID');
    });

    test('handles unpublished event error', async () => {
      api.get.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Event not published' }
        }
      });

      await expect(EventService.getEvent(1))
        .rejects.toThrow('This event is not published yet. Only managers and organizers can view unpublished events.');
    });

    test('handles event not found error', async () => {
      api.get.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Event not found' }
        }
      });

      await expect(EventService.getEvent(999))
        .rejects.toThrow('Event not found');
    });

    test('handles network error', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      await expect(EventService.getEvent(1))
        .rejects.toThrow('Network error: Could not connect to server');
    });
  });

  describe('updateEvent', () => {
    test('successfully updates an event', async () => {
      const updateData = { title: 'Updated Title', published: true };
      const mockResponse = {
        data: {
          id: 1,
          ...updateData
        }
      };
      api.patch.mockResolvedValue(mockResponse);

      const result = await EventService.updateEvent(1, updateData);
      expect(api.patch).toHaveBeenCalledWith('/events/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });

    test('handles invalid event ID error', async () => {
      api.patch.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid event ID' }
        }
      });

      await expect(EventService.updateEvent('invalid', {}))
        .rejects.toThrow('Invalid event ID');
    });

    test('handles no fields provided error', async () => {
      api.patch.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'No fields provided' }
        }
      });

      await expect(EventService.updateEvent(1, {}))
        .rejects.toThrow('No fields provided for update');
    });

    test('handles permission error', async () => {
      api.patch.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Permission denied' }
        }
      });

      await expect(EventService.updateEvent(1, { title: 'New Title' }))
        .rejects.toThrow('You do not have permission to update this event');
    });

    test('handles event not found error', async () => {
      api.patch.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Event not found' }
        }
      });

      await expect(EventService.updateEvent(999, { title: 'New Title' }))
        .rejects.toThrow('Event not found');
    });

    test('handles network error', async () => {
      api.patch.mockRejectedValue(new Error('Network error'));

      await expect(EventService.updateEvent(1, { title: 'New Title' }))
        .rejects.toThrow('Network error: Could not connect to server');
    });
  });

  describe('deleteEvent', () => {
    test('successfully deletes an event', async () => {
      const mockResponse = {
        data: { message: 'Event deleted successfully' }
      };
      api.delete.mockResolvedValue(mockResponse);

      const result = await EventService.deleteEvent(1);
      expect(api.delete).toHaveBeenCalledWith('/events/1');
      expect(result).toEqual(mockResponse.data);
    });

    test('handles invalid event ID error', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid event ID' }
        }
      });

      await expect(EventService.deleteEvent('invalid'))
        .rejects.toThrow('Invalid event ID');
    });

    test('handles permission error', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Permission denied' }
        }
      });

      await expect(EventService.deleteEvent(1))
        .rejects.toThrow('You do not have permission to delete events');
    });

    test('handles event not found error', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Event not found' }
        }
      });

      await expect(EventService.deleteEvent(999))
        .rejects.toThrow('Event not found');
    });

    test('handles network error', async () => {
      api.delete.mockRejectedValue(new Error('Network error'));

      await expect(EventService.deleteEvent(1))
        .rejects.toThrow('Network error: Could not connect to server');
    });
  });

  describe('addOrganizer', () => {
    test('successfully adds an organizer', async () => {
      const mockResponse = {
        data: {
          eventId: 1,
          utorid: 'testuser',
          role: 'organizer'
        }
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await EventService.addOrganizer(1, 'testuser');
      expect(api.post).toHaveBeenCalledWith('/events/1/organizers', { utorid: 'testuser' });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles invalid event ID error', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid event ID' }
        }
      });

      await expect(EventService.addOrganizer('invalid', 'testuser'))
        .rejects.toThrow('Invalid event ID');
    });

    test('handles missing UTORid error', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'UTORid is required' }
        }
      });

      await expect(EventService.addOrganizer(1, ''))
        .rejects.toThrow('UTORid is required');
    });

    test('handles duplicate organizer error', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'User is already an organizer' }
        }
      });

      await expect(EventService.addOrganizer(1, 'testuser'))
        .rejects.toThrow('User is already an organizer for this event');
    });

    test('handles permission error', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Permission denied' }
        }
      });

      await expect(EventService.addOrganizer(1, 'testuser'))
        .rejects.toThrow('You do not have permission to add organizers to this event');
    });

    test('handles user not found error', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'User not found' }
        }
      });

      await expect(EventService.addOrganizer(1, 'nonexistent'))
        .rejects.toThrow('User not found');
    });

    test('handles guest conflict error', async () => {
      api.post.mockRejectedValue({
        response: {
          status: 409,
          data: { error: 'User is already a guest' }
        }
      });

      await expect(EventService.addOrganizer(1, 'testuser'))
        .rejects.toThrow('User is already a guest of this event and cannot be added as an organizer');
    });

    test('handles network error', async () => {
      api.post.mockRejectedValue(new Error('Network error'));

      await expect(EventService.addOrganizer(1, 'testuser'))
        .rejects.toThrow('Network error: Could not connect to server');
    });
  });

  describe('removeOrganizer', () => {
    test('successfully removes an organizer', async () => {
      const mockResponse = {
        data: { message: 'Organizer removed successfully' }
      };
      api.delete.mockResolvedValue(mockResponse);

      const result = await EventService.removeOrganizer(1, 2);
      expect(api.delete).toHaveBeenCalledWith('/events/1/organizers/2');
      expect(result).toEqual(mockResponse.data);
    });

    test('handles invalid event ID error', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Invalid event ID' }
        }
      });

      await expect(EventService.removeOrganizer('invalid', 2))
        .rejects.toThrow('Invalid event ID');
    });

    test('handles creator removal error', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Event creator cannot be removed' }
        }
      });

      await expect(EventService.removeOrganizer(1, 1))
        .rejects.toThrow('The event creator cannot be removed as an organizer');
    });

    test('handles permission error', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Permission denied' }
        }
      });

      await expect(EventService.removeOrganizer(1, 2))
        .rejects.toThrow('You do not have permission to remove organizers from this event');
    });

    test('handles event not found error', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Event not found' }
        }
      });

      await expect(EventService.removeOrganizer(999, 2))
        .rejects.toThrow('Event not found');
    });

    test('handles organizer not found error', async () => {
      api.delete.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Event not found' }
        }
      });

      await expect(EventService.removeOrganizer(1, 999))
        .rejects.toThrow('Event not found');
    });

    test('handles network error', async () => {
      api.delete.mockRejectedValue(new Error('Network error'));

      await expect(EventService.removeOrganizer(1, 2))
        .rejects.toThrow('Network error: Could not connect to server');
    });
  });
}); 