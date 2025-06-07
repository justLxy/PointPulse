import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useEvents } from '../../hooks/useEvents';
import EventService from '../../services/event.service';
import { useAuth } from '../../contexts/AuthContext';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('../../services/event.service');
jest.mock('../../contexts/AuthContext');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEvents', () => {
  let mockEventService;
  let mockUseAuth;
  let mockToast;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockEventService = {
      getEvents: jest.fn(),
      getEvent: jest.fn(),
      createEvent: jest.fn(),
      updateEvent: jest.fn(),
      deleteEvent: jest.fn(),
      rsvpToEvent: jest.fn(),
      cancelRsvp: jest.fn(),
      addOrganizer: jest.fn(),
      removeOrganizer: jest.fn(),
      addGuest: jest.fn(),
      removeGuest: jest.fn(),
      removeAllGuests: jest.fn(),
      awardPoints: jest.fn(),
    };
    
    Object.assign(EventService, mockEventService);
    
    mockUseAuth = {
      activeRole: 'participant',
    };
    useAuth.mockReturnValue(mockUseAuth);
    
    mockToast = {
      success: jest.fn(),
      error: jest.fn(),
    };
    Object.assign(toast, mockToast);
  });

  describe('Basic functionality', () => {
    it('should fetch events with default parameters', async () => {
      const mockEventsData = {
        results: [
          { id: 1, name: 'Event 1' },
          { id: 2, name: 'Event 2' },
        ],
        count: 2,
      };
      
      mockEventService.getEvents.mockResolvedValue(mockEventsData);

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockEventService.getEvents).toHaveBeenCalledWith({});
      expect(result.current.events).toEqual(mockEventsData.results);
      expect(result.current.totalCount).toBe(2);
    });

    it('should handle custom parameters', async () => {
      const params = { page: 2, search: 'test' };
      mockEventService.getEvents.mockResolvedValue({ results: [], count: 0 });

      renderHook(() => useEvents(params), {
        wrapper: createWrapper(),
      });

      expect(mockEventService.getEvents).toHaveBeenCalledWith(params);
    });

    it('should convert upcoming parameter to ended parameter', async () => {
      const params = { upcoming: true };
      mockEventService.getEvents.mockResolvedValue({ results: [], count: 0 });

      renderHook(() => useEvents(params), {
        wrapper: createWrapper(),
      });

      expect(mockEventService.getEvents).toHaveBeenCalledWith({ ended: false });
    });
  });

  describe('RSVP functionality', () => {
    beforeEach(() => {
      mockEventService.getEvents.mockResolvedValue({ results: [], count: 0 });
    });

    it('should handle successful RSVP', async () => {
      mockEventService.rsvpToEvent.mockResolvedValue({});

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.rsvpToEvent('1');
      });

      await waitFor(() => {
        expect(result.current.isRsvping).toBe(false);
      });

      expect(mockEventService.rsvpToEvent).toHaveBeenCalledWith('1');
      expect(mockToast.success).toHaveBeenCalledWith('Successfully RSVP\'d to event');
    });

    it('should handle RSVP error', async () => {
      const error = new Error('RSVP failed');
      mockEventService.rsvpToEvent.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.rsvpToEvent('1');
      });

      await waitFor(() => {
        expect(result.current.isRsvping).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalledWith('RSVP failed');
    });

    it('should handle successful RSVP cancellation', async () => {
      mockEventService.cancelRsvp.mockResolvedValue({});

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.cancelRsvp('1');
      });

      await waitFor(() => {
        expect(result.current.isCancellingRsvp).toBe(false);
      });

      expect(mockEventService.cancelRsvp).toHaveBeenCalledWith('1');
      expect(mockToast.success).toHaveBeenCalledWith('Successfully cancelled RSVP');
    });
  });

  describe('Role-based functionality', () => {
    beforeEach(() => {
      mockEventService.getEvents.mockResolvedValue({ results: [], count: 0 });
    });

    it('should return participant-specific functions', async () => {
      mockUseAuth.activeRole = 'participant';

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have basic functions
      expect(typeof result.current.rsvpToEvent).toBe('function');
      expect(typeof result.current.cancelRsvp).toBe('function');
      expect(typeof result.current.updateEvent).toBe('function');
      expect(typeof result.current.addGuest).toBe('function');
      expect(typeof result.current.removeGuest).toBe('function');
      expect(typeof result.current.awardPoints).toBe('function');

      // Should not have manager-only functions
      expect(result.current.createEvent).toBeUndefined();
      expect(result.current.deleteEvent).toBeUndefined();
      expect(result.current.addOrganizer).toBeUndefined();
      expect(result.current.removeOrganizer).toBeUndefined();
      expect(result.current.removeAllGuests).toBeUndefined();
    });

    it('should return manager-specific functions', async () => {
      mockUseAuth.activeRole = 'manager';

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have all functions including manager-only ones
      expect(typeof result.current.createEvent).toBe('function');
      expect(typeof result.current.deleteEvent).toBe('function');
      expect(typeof result.current.addOrganizer).toBe('function');
      expect(typeof result.current.removeOrganizer).toBe('function');
      expect(typeof result.current.removeAllGuests).toBe('function');
    });

    it('should handle event creation for managers', async () => {
      mockUseAuth.activeRole = 'manager';
      mockEventService.createEvent.mockResolvedValue({});

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const eventData = { name: 'New Event', description: 'Test event' };
      await act(async () => {
        result.current.createEvent(eventData);
      });

      expect(mockEventService.createEvent).toHaveBeenCalledWith(eventData);
      expect(mockToast.success).toHaveBeenCalledWith('Event created successfully');
    });

    it('should handle event deletion for managers', async () => {
      mockUseAuth.activeRole = 'manager';
      mockEventService.deleteEvent.mockResolvedValue({});

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.deleteEvent('1');
      });

      expect(mockEventService.deleteEvent).toHaveBeenCalledWith('1');
      expect(mockToast.success).toHaveBeenCalledWith('Event deleted successfully');
    });
  });

  describe('Update event functionality', () => {
    beforeEach(() => {
      mockEventService.getEvents.mockResolvedValue({ results: [], count: 0 });
    });

    it('should handle successful event update', async () => {
      mockEventService.updateEvent.mockResolvedValue({});

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updateData = { id: '1', data: { name: 'Updated Event' } };
      await act(async () => {
        result.current.updateEvent(updateData);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockEventService.updateEvent).toHaveBeenCalledWith('1', { name: 'Updated Event' });
      expect(mockToast.success).toHaveBeenCalledWith('Event updated successfully');
    });

    it('should handle update event error', async () => {
      const error = new Error('Update failed');
      mockEventService.updateEvent.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.updateEvent({ id: '1', data: {} });
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('Points awarding functionality', () => {
    beforeEach(() => {
      mockEventService.getEvents.mockResolvedValue({ results: [], count: 0 });
    });

    it('should handle successful points awarding', async () => {
      mockEventService.awardPoints.mockResolvedValue({});

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.awardPoints({ eventId: '1', utorid: 'user1', points: 100 });
      });

      expect(mockEventService.awardPoints).toHaveBeenCalledWith('1', 'user1', 100);
      expect(mockToast.success).toHaveBeenCalledWith('Points awarded successfully');
    });

    it('should handle points awarding error', async () => {
      const error = new Error('Points awarding failed');
      mockEventService.awardPoints.mockRejectedValue(error);

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.awardPoints({ eventId: '1', utorid: 'user1', points: 100 });
      });

      expect(mockToast.error).toHaveBeenCalledWith('Points awarding failed');
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      mockEventService.getEvents.mockResolvedValue({ results: [], count: 0 });
    });

    it('should use generic error message when error has no message', async () => {
      mockEventService.createEvent.mockRejectedValue(new Error());
      mockUseAuth.activeRole = 'manager';

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.createEvent({});
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalledWith('Failed to create event');
    });
  });
}); 