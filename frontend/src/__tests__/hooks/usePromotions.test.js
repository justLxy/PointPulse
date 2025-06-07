import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { usePromotions } from '../../hooks/usePromotions';
import PromotionService from '../../services/promotion.service';
import { useAuth } from '../../contexts/AuthContext';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('../../services/promotion.service');
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

describe('usePromotions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PromotionService.getPromotions.mockResolvedValue({
      results: [{ id: 1, title: 'Test Promotion' }],
      count: 1,
    });
    PromotionService.getPromotion.mockResolvedValue({ id: 1, title: 'Test Promotion' });
  });

  it('should fetch promotions successfully', async () => {
    useAuth.mockReturnValue({ activeRole: 'participant' });
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.promotions).toEqual([{ id: 1, title: 'Test Promotion' }]);
      expect(result.current.totalCount).toBe(1);
    });
  });

  it('should fetch single promotion with getPromotion', async () => {
    useAuth.mockReturnValue({ activeRole: 'participant' });
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });
    const { result: promotionResult } = renderHook(() => result.current.getPromotion(1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(PromotionService.getPromotion).toHaveBeenCalledWith(1);
    });
  });

  it('should not expose manager functions for participant role', async () => {
    useAuth.mockReturnValue({ activeRole: 'participant' });
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.createPromotion).toBeUndefined();
      expect(result.current.updatePromotion).toBeUndefined();
      expect(result.current.deletePromotion).toBeUndefined();
    });
  });

  it('should expose manager functions for manager role', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.createPromotion).toBeDefined();
      expect(result.current.updatePromotion).toBeDefined();
      expect(result.current.deletePromotion).toBeDefined();
    });
  });

  it('should expose manager functions for superuser role', async () => {
    useAuth.mockReturnValue({ activeRole: 'superuser' });
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.createPromotion).toBeDefined();
      expect(result.current.updatePromotion).toBeDefined();
      expect(result.current.deletePromotion).toBeDefined();
    });
  });

  it('should create promotion successfully', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    PromotionService.createPromotion.mockResolvedValue({ id: 2 });
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.createPromotion).toBeDefined();
    });

    await act(async () => {
      result.current.createPromotion({ title: 'New Promotion' });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Promotion created successfully');
    });
  });

  it('should handle create promotion error', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    PromotionService.createPromotion.mockRejectedValue(new Error('Create failed'));
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createPromotion({ title: 'New Promotion' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Create failed');
    });
  });

  it('should update promotion successfully', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    PromotionService.updatePromotion.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updatePromotion({ id: 1, data: { title: 'Updated' } });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Promotion updated successfully');
    });
  });

  it('should handle update promotion error', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    PromotionService.updatePromotion.mockRejectedValue(new Error('Update failed'));
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updatePromotion({ id: 1, data: { title: 'Updated' } });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Update failed');
    });
  });

  it('should delete promotion successfully', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    PromotionService.deletePromotion.mockResolvedValue({});
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.deletePromotion(1);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Promotion deleted successfully');
    });
  });

  it('should handle delete promotion error', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    PromotionService.deletePromotion.mockRejectedValue(new Error('Delete failed'));
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.deletePromotion(1);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Delete failed');
    });
  });

  it('should handle generic error messages', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    PromotionService.createPromotion.mockRejectedValue({});
    const { result } = renderHook(() => usePromotions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createPromotion({ title: 'New Promotion' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create promotion');
    });
  });

  it('should pass params to getPromotions', async () => {
    useAuth.mockReturnValue({ activeRole: 'participant' });
    const params = { page: 1, status: 'active' };
    renderHook(() => usePromotions(params), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(PromotionService.getPromotions).toHaveBeenCalledWith(params);
    });
  });
}); 