import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePendingRedemptions } from '../../hooks/usePendingRedemptions';
import UserService from '../../services/user.service';

// Mock UserService
jest.mock('../../services/user.service');

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

describe('usePendingRedemptions', () => {
  let mockUserService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService = {
      getPendingRedemptionsTotal: jest.fn(),
    };
    Object.assign(UserService, mockUserService);
  });

  it('should fetch pending redemptions total successfully', async () => {
    const mockTotal = 150;
    mockUserService.getPendingRedemptionsTotal.mockResolvedValue(mockTotal);

    const { result } = renderHook(() => usePendingRedemptions(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.pendingTotal).toBe(0); // Default value

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockUserService.getPendingRedemptionsTotal).toHaveBeenCalledTimes(1);
    expect(result.current.pendingTotal).toBe(mockTotal);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching pending redemptions total fails', async () => {
    const error = new Error('Failed to fetch pending redemptions total');
    mockUserService.getPendingRedemptionsTotal.mockRejectedValue(error);

    const { result } = renderHook(() => usePendingRedemptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.pendingTotal).toBe(0); // Should remain default value on error
  });

  it('should return default value of 0 when data is undefined', async () => {
    mockUserService.getPendingRedemptionsTotal.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePendingRedemptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pendingTotal).toBe(0);
  });

  it('should provide refetch functionality', async () => {
    const mockTotal = 75;
    mockUserService.getPendingRedemptionsTotal.mockResolvedValue(mockTotal);

    const { result } = renderHook(() => usePendingRedemptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
    
    // Test refetch
    const newMockTotal = 200;
    mockUserService.getPendingRedemptionsTotal.mockResolvedValue(newMockTotal);
    
    await result.current.refetch();

    expect(mockUserService.getPendingRedemptionsTotal).toHaveBeenCalledTimes(2);
  });

  it('should handle null response from service', async () => {
    mockUserService.getPendingRedemptionsTotal.mockResolvedValue(null);

    const { result } = renderHook(() => usePendingRedemptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // When service explicitly returns null, pendingTotal will be null
    // The default value (= 0) only applies when data is undefined
    expect(result.current.pendingTotal).toBe(null);
  });

  it('should handle zero value correctly', async () => {
    mockUserService.getPendingRedemptionsTotal.mockResolvedValue(0);

    const { result } = renderHook(() => usePendingRedemptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pendingTotal).toBe(0);
  });

  it('should cache query with correct staleTime', async () => {
    const mockTotal = 100;
    mockUserService.getPendingRedemptionsTotal.mockResolvedValue(mockTotal);

    const { result } = renderHook(() => usePendingRedemptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only be called once due to caching
    expect(mockUserService.getPendingRedemptionsTotal).toHaveBeenCalledTimes(1);
  });

  it('should handle loading state correctly during async operation', async () => {
    // Create a promise that we can control when it resolves
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockUserService.getPendingRedemptionsTotal.mockReturnValue(promise);

    const { result } = renderHook(() => usePendingRedemptions(), {
      wrapper: createWrapper(),
    });

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);
    expect(result.current.pendingTotal).toBe(0);
    expect(result.current.error).toBeNull();

    // Resolve the promise with a value
    resolvePromise(42);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pendingTotal).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it('should call service function correctly', async () => {
    mockUserService.getPendingRedemptionsTotal.mockResolvedValue(123);

    const { result } = renderHook(() => usePendingRedemptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the service was called correctly - React Query passes query context as first argument
    expect(mockUserService.getPendingRedemptionsTotal).toHaveBeenCalledTimes(1);
    // Check that it was called with React Query context object
    expect(mockUserService.getPendingRedemptionsTotal).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['pendingRedemptionsTotal']
      })
    );
  });
}); 