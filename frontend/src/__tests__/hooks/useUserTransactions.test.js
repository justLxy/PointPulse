import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useUserTransactions } from '../../hooks/useUserTransactions';
import UserService from '../../services/user.service';

jest.mock('react-hot-toast');
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

describe('useUserTransactions', () => {
  const mockTransactions = {
    results: [{ id: 1, type: 'purchase', amount: 100 }],
    count: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    UserService.getTransactions = jest.fn().mockResolvedValue(mockTransactions);
    UserService.createRedemption = jest.fn().mockResolvedValue({ id: 2 });
    UserService.transferPoints = jest.fn().mockResolvedValue({ id: 3 });
  });

  it('should fetch transactions successfully', async () => {
    const { result } = renderHook(() => useUserTransactions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.transactions).toEqual([{ id: 1, type: 'purchase', amount: 100 }]);
      expect(result.current.totalCount).toBe(1);
    });
  });

  it('should pass params to getTransactions', async () => {
    const params = { page: 1, type: 'purchase' };
    renderHook(() => useUserTransactions(params), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(UserService.getTransactions).toHaveBeenCalledWith(params);
    });
  });

  it('should create redemption successfully', async () => {
    const { result } = renderHook(() => useUserTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createRedemption({ amount: 50, remark: 'Test redemption' });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Redemption request created successfully');
      expect(UserService.createRedemption).toHaveBeenCalledWith(50, 'Test redemption');
    });
  });

  it('should handle redemption creation error', async () => {
    UserService.createRedemption.mockRejectedValue(new Error('Insufficient balance'));
    const { result } = renderHook(() => useUserTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createRedemption({ amount: 100, remark: 'Test' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Insufficient balance');
    });
  });

  it('should transfer points successfully', async () => {
    const { result } = renderHook(() => useUserTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.transferPoints({ userId: 2, amount: 25, remark: 'Gift points' });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Points transferred successfully');
      expect(UserService.transferPoints).toHaveBeenCalledWith(2, 25, 'Gift points');
    });
  });

  it('should handle points transfer error', async () => {
    UserService.transferPoints.mockRejectedValue(new Error('Transfer failed'));
    const { result } = renderHook(() => useUserTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.transferPoints({ userId: 2, amount: 25, remark: 'Test' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Transfer failed');
    });
  });

  it('should handle generic error messages', async () => {
    UserService.createRedemption.mockRejectedValue({});
    const { result } = renderHook(() => useUserTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createRedemption({ amount: 50, remark: 'Test' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create redemption request');
    });
  });

  it('should show loading states correctly', () => {
    const { result } = renderHook(() => useUserTransactions(), { wrapper: createWrapper() });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isCreatingRedemption).toBe(false);
    expect(result.current.isTransferringPoints).toBe(false);
  });

  it('should refetch transactions', async () => {
    const { result } = renderHook(() => useUserTransactions(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.transactions).toEqual([{ id: 1, type: 'purchase', amount: 100 }]));

    await act(async () => {
      await result.current.refetch();
    });

    expect(UserService.getTransactions).toHaveBeenCalledTimes(2);
  });

  it('should handle empty data responses', async () => {
    UserService.getTransactions.mockResolvedValue({});
    const { result } = renderHook(() => useUserTransactions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.transactions).toEqual([]);
      expect(result.current.totalCount).toBe(0);
    });
  });
}); 