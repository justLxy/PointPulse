import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTierStatus } from '../../hooks/useTierStatus';
import TierService from '../../services/tier.service';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../services/tier.service');
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

describe('useTierStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    TierService.getActiveTierStatus.mockResolvedValue({ tier: 'Gold', points: 1000 });
    TierService.getCurrentCycleEarnedPoints.mockResolvedValue(500);
    useAuth.mockReturnValue({ currentUser: { id: 1 } });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should fetch tier status successfully', async () => {
    const { result } = renderHook(() => useTierStatus(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.tierStatus).toEqual({ tier: 'Gold', points: 1000 });
      expect(result.current.currentCycleEarnedPoints).toBe(500);
    });
  });

  it('should handle user without ID', async () => {
    useAuth.mockReturnValue({ currentUser: null });
    const { result } = renderHook(() => useTierStatus(), { wrapper: createWrapper() });

    expect(TierService.getActiveTierStatus).not.toHaveBeenCalled();
    expect(TierService.getCurrentCycleEarnedPoints).not.toHaveBeenCalled();
  });

  it('should refresh tier status', async () => {
    const { result } = renderHook(() => useTierStatus(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.tierStatus).toBeDefined());

    const initialCalls = TierService.getActiveTierStatus.mock.calls.length;

    await act(async () => {
      await result.current.refreshTierStatus();
    });

    expect(TierService.getActiveTierStatus.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it('should handle localStorage simulated date changes', async () => {
    jest.useFakeTimers();
    localStorage.setItem('simulatedDate', '2023-01-01');
    
    const { result } = renderHook(() => useTierStatus(), { wrapper: createWrapper() });

    act(() => {
      localStorage.setItem('simulatedDate', '2023-01-02');
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(TierService.getActiveTierStatus).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('should use real date when no simulated date', async () => {
    const { result } = renderHook(() => useTierStatus(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.tierStatus).toBeDefined();
    });
  });

  it('should show loading state', () => {
    const { result } = renderHook(() => useTierStatus(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', async () => {
    TierService.getActiveTierStatus.mockRejectedValue(new Error('Service error'));
    const { result } = renderHook(() => useTierStatus(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
}); 