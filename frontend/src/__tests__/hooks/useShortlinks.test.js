import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useShortlinks, useShortlink, useEventShortlinks } from '../../hooks/useShortlinks';
import ShortlinkService from '../../services/shortlink.service';
import { useAuth } from '../../contexts/AuthContext';

// Mock dependencies
jest.mock('../../services/shortlink.service');
jest.mock('react-hot-toast');
jest.mock('../../contexts/AuthContext');

describe('useShortlinks', () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    jest.clearAllMocks();
  });

  describe('useShortlinks hook', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ activeRole: 'manager' });
    });

    it('should fetch shortlinks successfully', async () => {
      const mockData = {
        shortlinks: [{ id: 1, slug: 'test', targetUrl: 'https://example.com' }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      ShortlinkService.getShortlinks.mockResolvedValue(mockData);

      const { result } = renderHook(() => useShortlinks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.shortlinks).toEqual(mockData.shortlinks);
      expect(result.current.total).toBe(mockData.total);
      expect(result.current.page).toBe(mockData.page);
      expect(result.current.limit).toBe(mockData.limit);
      expect(result.current.totalPages).toBe(mockData.totalPages);
      expect(ShortlinkService.getShortlinks).toHaveBeenCalledWith({});
    });

    it('should fetch shortlinks with parameters', async () => {
      const params = { slug: 'test', page: 2 };
      const mockData = { shortlinks: [], total: 0, page: 2, limit: 10, totalPages: 0 };
      ShortlinkService.getShortlinks.mockResolvedValue(mockData);

      const { result } = renderHook(() => useShortlinks(params), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(ShortlinkService.getShortlinks).toHaveBeenCalledWith(params);
    });

    it('should handle query errors', async () => {
      const mockError = new Error('Failed to fetch');
      ShortlinkService.getShortlinks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useShortlinks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should create shortlink successfully', async () => {
      const mockShortlinkData = { slug: 'test', targetUrl: 'https://example.com' };
      const mockResponse = { id: 1, ...mockShortlinkData };
      ShortlinkService.createShortlink.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useShortlinks(), { wrapper });

      await result.current.createShortlink(mockShortlinkData);

      expect(ShortlinkService.createShortlink).toHaveBeenCalledWith(mockShortlinkData);
      expect(toast.success).toHaveBeenCalledWith('Shortlink created successfully');
    });

    it('should handle create shortlink errors', async () => {
      const mockShortlinkData = { slug: 'test', targetUrl: 'https://example.com' };
      const mockError = new Error('Slug already exists');
      ShortlinkService.createShortlink.mockRejectedValue(mockError);

      const { result } = renderHook(() => useShortlinks(), { wrapper });

      try {
        await result.current.createShortlink(mockShortlinkData);
      } catch (error) {
        // Error is expected to be thrown
      }

      expect(toast.error).toHaveBeenCalledWith('Slug already exists');
    });

    it('should update shortlink successfully', async () => {
      const mockUpdateData = { id: 1, updateData: { slug: 'new-slug' } };
      const mockResponse = { id: 1, slug: 'new-slug' };
      ShortlinkService.updateShortlink.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useShortlinks(), { wrapper });

      await result.current.updateShortlink(mockUpdateData);

      expect(ShortlinkService.updateShortlink).toHaveBeenCalledWith(mockUpdateData.id, mockUpdateData.updateData);
      expect(toast.success).toHaveBeenCalledWith('Shortlink updated successfully');
    });

    it('should handle update shortlink errors', async () => {
      const mockUpdateData = { id: 1, updateData: { slug: 'new-slug' } };
      const mockError = new Error('Slug already exists');
      ShortlinkService.updateShortlink.mockRejectedValue(mockError);

      const { result } = renderHook(() => useShortlinks(), { wrapper });

      try {
        await result.current.updateShortlink(mockUpdateData);
      } catch (error) {
        // Error is expected to be thrown
      }

      expect(toast.error).toHaveBeenCalledWith('Slug already exists');
    });

    it('should delete shortlink successfully', async () => {
      ShortlinkService.deleteShortlink.mockResolvedValue();

      const { result } = renderHook(() => useShortlinks(), { wrapper });

      await result.current.deleteShortlink(1);

      expect(ShortlinkService.deleteShortlink).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Shortlink deleted successfully');
    });

    it('should handle delete shortlink errors', async () => {
      const mockError = new Error('Shortlink not found');
      ShortlinkService.deleteShortlink.mockRejectedValue(mockError);

      const { result } = renderHook(() => useShortlinks(), { wrapper });

      try {
        await result.current.deleteShortlink(1);
      } catch (error) {
        // Error is expected to be thrown
      }

      expect(toast.error).toHaveBeenCalledWith('Shortlink not found');
    });

    it('should show loading states during mutations', async () => {
      const { result } = renderHook(() => useShortlinks(), { wrapper });

      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });

    it('should disable query for non-manager users', () => {
      useAuth.mockReturnValue({ activeRole: 'user' });

      renderHook(() => useShortlinks(), { wrapper });

      expect(ShortlinkService.getShortlinks).not.toHaveBeenCalled();
    });

    it('should enable query for regular users', async () => {
      useAuth.mockReturnValue({ activeRole: 'regular' });
      const mockData = { shortlinks: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      ShortlinkService.getShortlinks.mockResolvedValue(mockData);

      renderHook(() => useShortlinks(), { wrapper });

      await waitFor(() => {
        expect(ShortlinkService.getShortlinks).toHaveBeenCalled();
      });
    });
  });

  describe('useShortlink hook', () => {
    it('should fetch single shortlink successfully', async () => {
      const mockShortlink = { id: 1, slug: 'test', targetUrl: 'https://example.com' };
      ShortlinkService.getShortlink.mockResolvedValue(mockShortlink);

      const { result } = renderHook(() => useShortlink(1), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.shortlink).toEqual(mockShortlink);
      expect(ShortlinkService.getShortlink).toHaveBeenCalledWith(1);
    });

    it('should handle single shortlink errors', async () => {
      const mockError = new Error('Shortlink not found');
      ShortlinkService.getShortlink.mockRejectedValue(mockError);

      const { result } = renderHook(() => useShortlink(1), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should not fetch when id is not provided', () => {
      renderHook(() => useShortlink(null), { wrapper });

      expect(ShortlinkService.getShortlink).not.toHaveBeenCalled();
    });

    it('should provide refetch function', async () => {
      const mockShortlink = { id: 1, slug: 'test' };
      ShortlinkService.getShortlink.mockResolvedValue(mockShortlink);

      const { result } = renderHook(() => useShortlink(1), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('useEventShortlinks hook', () => {
    it('should fetch event shortlinks successfully', async () => {
      const mockShortlinks = [
        { id: 1, slug: 'event1', eventId: 1 },
        { id: 2, slug: 'event2', eventId: 1 }
      ];
      ShortlinkService.getEventShortlinks.mockResolvedValue(mockShortlinks);

      const { result } = renderHook(() => useEventShortlinks(1), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.shortlinks).toEqual(mockShortlinks);
      expect(ShortlinkService.getEventShortlinks).toHaveBeenCalledWith(1);
    });

    it('should handle event shortlinks errors', async () => {
      const mockError = new Error('Event not found');
      ShortlinkService.getEventShortlinks.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventShortlinks(1), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should not fetch when eventId is not provided', () => {
      renderHook(() => useEventShortlinks(null), { wrapper });

      expect(ShortlinkService.getEventShortlinks).not.toHaveBeenCalled();
    });

    it('should create event shortlink successfully', async () => {
      const mockShortlinkData = { slug: 'event-test', targetUrl: 'https://example.com' };
      const mockResponse = { id: 1, ...mockShortlinkData, eventId: 1 };
      ShortlinkService.createShortlink.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useEventShortlinks(1), { wrapper });

      await result.current.createEventShortlink(mockShortlinkData);

      expect(ShortlinkService.createShortlink).toHaveBeenCalledWith({
        ...mockShortlinkData,
        eventId: 1
      });
      expect(toast.success).toHaveBeenCalledWith('Event shortlink created successfully');
    });

    it('should handle create event shortlink errors', async () => {
      const mockShortlinkData = { slug: 'event-test', targetUrl: 'https://example.com' };
      const mockError = new Error('Slug already exists');
      ShortlinkService.createShortlink.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventShortlinks(1), { wrapper });

      try {
        await result.current.createEventShortlink(mockShortlinkData);
      } catch (error) {
        // Error is expected to be thrown
      }

      expect(toast.error).toHaveBeenCalledWith('Slug already exists');
    });

    it('should update event shortlink successfully', async () => {
      const mockUpdateData = { id: 1, updateData: { slug: 'new-event-slug' } };
      const mockResponse = { id: 1, slug: 'new-event-slug' };
      ShortlinkService.updateShortlink.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useEventShortlinks(1), { wrapper });

      await result.current.updateEventShortlink(mockUpdateData);

      expect(ShortlinkService.updateShortlink).toHaveBeenCalledWith(mockUpdateData.id, mockUpdateData.updateData);
      expect(toast.success).toHaveBeenCalledWith('Event shortlink updated successfully');
    });

    it('should delete event shortlink successfully', async () => {
      ShortlinkService.deleteShortlink.mockResolvedValue();

      const { result } = renderHook(() => useEventShortlinks(1), { wrapper });

      await result.current.deleteEventShortlink(1);

      expect(ShortlinkService.deleteShortlink).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Event shortlink deleted successfully');
    });

    it('should show loading states during event mutations', async () => {
      const { result } = renderHook(() => useEventShortlinks(1), { wrapper });

      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
    });

    it('should provide refetch function for event shortlinks', async () => {
      const mockShortlinks = [{ id: 1, slug: 'event1' }];
      ShortlinkService.getEventShortlinks.mockResolvedValue(mockShortlinks);

      const { result } = renderHook(() => useEventShortlinks(1), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
}); 