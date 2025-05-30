/**
 * Core Event Flow: Event management business logic
 * Validates event creation, retrieval, update, deletion and organizer management workflows
 */

import api from '../../services/api';
import EventService from '../../services/event.service';

jest.mock('../../services/api');

describe('EventService - Event Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete event lifecycle: create → update → delete', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'Test Description',
      startTime: '2024-03-20T10:00:00Z',
      endTime: '2024-03-20T12:00:00Z',
      location: 'Test Location',
      capacity: 100
    };

    // Test successful event creation
    const mockCreateResponse = {
      data: {
        id: 1,
        ...eventData,
        published: false,
        createdBy: 'manager1'
      }
    };
    api.post.mockResolvedValue(mockCreateResponse);
    const createResult = await EventService.createEvent(eventData);
    expect(api.post).toHaveBeenCalledWith('/events', eventData);
    expect(createResult).toEqual(mockCreateResponse.data);

    // Test event creation errors
    api.post.mockRejectedValue({ response: { status: 400, data: { error: 'No event data provided' } } });
    await expect(EventService.createEvent({})).rejects.toThrow('No event data provided');

    api.post.mockRejectedValue({ response: { status: 403, data: { error: 'Permission denied' } } });
    await expect(EventService.createEvent(eventData)).rejects.toThrow('You do not have permission to create events');

    // Test successful event update
    const updateData = { title: 'Updated Title', published: true };
    const mockUpdateResponse = {
      data: {
        ...mockCreateResponse.data,
        ...updateData
      }
    };
    api.patch.mockResolvedValue(mockUpdateResponse);
    const updateResult = await EventService.updateEvent(1, updateData);
    expect(api.patch).toHaveBeenCalledWith('/events/1', updateData);
    expect(updateResult).toEqual(mockUpdateResponse.data);

    // Test successful event deletion
    const mockDeleteResponse = { data: { message: 'Event deleted successfully' } };
    api.delete.mockResolvedValue(mockDeleteResponse);
    const deleteResult = await EventService.deleteEvent(1);
    expect(api.delete).toHaveBeenCalledWith('/events/1');
    expect(deleteResult).toEqual(mockDeleteResponse.data);
  });

  test('event retrieval with filtering and error handling', async () => {
    const mockEventsResponse = {
      data: {
        count: 2,
        results: [
          { id: 1, title: 'Event 1', published: true },
          { id: 2, title: 'Event 2', published: true }
        ]
      }
    };

    // Test successful events listing
    api.get.mockResolvedValue(mockEventsResponse);
    const params = { page: 1, limit: 10, organizing: true };
    const listResult = await EventService.getEvents(params);
    expect(api.get).toHaveBeenCalledWith('/events', { params: { ...params } });
    expect(listResult).toEqual(mockEventsResponse.data);

    // Test single event retrieval
    const mockEventResponse = {
      data: { id: 1, title: 'Event 1', published: true }
    };
    api.get.mockResolvedValue(mockEventResponse);
    const getResult = await EventService.getEvent(1);
    expect(api.get).toHaveBeenCalledWith('/events/1', {
      params: { includeAsOrganizer: true }
    });
    expect(getResult).toEqual(mockEventResponse.data);

    // Test common retrieval errors
    api.get.mockRejectedValue({ response: { status: 404, data: { error: 'Event not found' } } });
    await expect(EventService.getEvent(999)).rejects.toThrow('Event not found');

    api.get.mockRejectedValue({ response: { status: 403, data: { error: 'Event not published' } } });
    await expect(EventService.getEvent(1)).rejects.toThrow('This event is not published yet');
  });

  test('organizer management and permissions', async () => {
    // Test adding organizer
    const mockOrganizerResponse = {
      data: {
        eventId: 1,
        utorid: 'testuser',
        role: 'organizer'
      }
    };
    api.post.mockResolvedValue(mockOrganizerResponse);
    const addResult = await EventService.addOrganizer(1, 'testuser');
    expect(api.post).toHaveBeenCalledWith('/events/1/organizers', { utorid: 'testuser' });
    expect(addResult).toEqual(mockOrganizerResponse.data);

    // Test organizer addition errors
    api.post.mockRejectedValue({ response: { status: 400, data: { error: 'Invalid event ID' } } });
    await expect(EventService.addOrganizer('invalid', 'testuser')).rejects.toThrow('Invalid event ID');

    api.post.mockRejectedValue({ response: { status: 403, data: { error: 'Permission denied' } } });
    await expect(EventService.addOrganizer(1, 'testuser')).rejects.toThrow('You do not have permission');
  });

  test('handles network errors across all operations', async () => {
    const networkError = new Error('Network error');
    
    // Test network error handling for each operation
    api.post.mockRejectedValue(networkError);
    await expect(EventService.createEvent({}))
      .rejects.toThrow('Network error: Could not connect to server');

    api.get.mockRejectedValue(networkError);
    await expect(EventService.getEvents())
      .rejects.toThrow('Network error: Could not retrieve events');

    api.patch.mockRejectedValue(networkError);
    await expect(EventService.updateEvent(1, {}))
      .rejects.toThrow('Network error: Could not connect to server');

    api.delete.mockRejectedValue(networkError);
    await expect(EventService.deleteEvent(1))
      .rejects.toThrow('Network error: Could not connect to server');
  });
}); 