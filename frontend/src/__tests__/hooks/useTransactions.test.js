import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTransactions } from '../../hooks/useTransactions';
import TransactionService from '../../services/transaction.service';
import UserService from '../../services/user.service';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('react-hot-toast');
jest.mock('../../services/transaction.service');
jest.mock('../../services/user.service');
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

describe('useTransactions', () => {
  const mockTransactions = {
    results: [{ id: 1, type: 'purchase', amount: 100 }],
    count: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    
    // Mock all TransactionService methods
    TransactionService.getAllTransactions = jest.fn().mockResolvedValue(mockTransactions);
    TransactionService.getTransaction = jest.fn().mockResolvedValue({ id: 1, type: 'purchase' });
    TransactionService.getTransactionById = jest.fn().mockResolvedValue({ id: 1, relatedId: 2 });
    TransactionService.createPurchase = jest.fn().mockResolvedValue({ id: 2 });
    TransactionService.createAdjustment = jest.fn().mockResolvedValue({ id: 3 });
    TransactionService.markAsSuspicious = jest.fn().mockResolvedValue({});
    TransactionService.processRedemption = jest.fn().mockResolvedValue({ id: 4 });
    TransactionService.lookupRedemption = jest.fn().mockResolvedValue({ id: 1, type: 'redemption' });
    
    // Mock UserService methods
    UserService.getUserById = jest.fn().mockResolvedValue({ utorid: 'user123', name: 'Test User', role: 'participant' });
  });

  it('should expose basic functions for all roles', async () => {
    useAuth.mockReturnValue({ activeRole: 'participant' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    expect(result.current.getTransaction).toBeDefined();
    expect(result.current.getTransactionQuery).toBeDefined();
    expect(result.current.createPurchase).toBeDefined();
    expect(result.current.processRedemption).toBeDefined();
  });

  it('should not expose manager functions for participants', () => {
    useAuth.mockReturnValue({ activeRole: 'participant' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    expect(result.current.transactions).toBeUndefined();
    expect(result.current.createAdjustment).toBeUndefined();
    expect(result.current.markAsSuspicious).toBeUndefined();
  });

  it('should expose manager functions for managers', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.transactions).toEqual([{ id: 1, type: 'purchase', amount: 100 }]);
      expect(result.current.totalCount).toBe(1);
      expect(result.current.createAdjustment).toBeDefined();
      expect(result.current.markAsSuspicious).toBeDefined();
    });
  });

  it('should expose manager functions for superusers', async () => {
    useAuth.mockReturnValue({ activeRole: 'superuser' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.transactions).toBeDefined();
      expect(result.current.createAdjustment).toBeDefined();
    });
  });

  it('should create purchase successfully', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createPurchase({ amount: 50 });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Purchase transaction created successfully');
    });
  });

  it('should handle purchase creation error', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    TransactionService.createPurchase.mockRejectedValue(new Error('Purchase failed'));
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createPurchase({ amount: 50 });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Purchase failed');
    });
  });

  it('should create adjustment successfully', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createAdjustment({ amount: -10 });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Adjustment transaction created successfully');
    });
  });

  it('should mark transaction as suspicious', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.markAsSuspicious({ transactionId: 1, suspicious: true });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Transaction status updated successfully');
    });
  });

  it('should process redemption successfully', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.processRedemption(1);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Redemption processed successfully');
      expect(console.log).toHaveBeenCalledWith('Redemption processed successfully, API returned:', { id: 4 });
    });
  });

  it('should handle redemption processing error', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    TransactionService.processRedemption.mockRejectedValue(new Error('Redemption failed'));
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.processRedemption(1);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Redemption failed');
      expect(console.error).toHaveBeenCalledWith('Error processing redemption:', expect.any(Error));
    });
  });

  it('should get transaction using lookupRedemption first', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    const transaction = await result.current.getTransaction(1);
    expect(transaction).toEqual({ id: 1, type: 'redemption' });
    expect(TransactionService.lookupRedemption).toHaveBeenCalledWith(1);
  });

  it('should fallback to getTransaction when lookupRedemption fails with permission error', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    TransactionService.lookupRedemption.mockRejectedValue(new Error('permission denied'));
    TransactionService.getTransaction.mockResolvedValue({ id: 1, type: 'purchase' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    const transaction = await result.current.getTransaction(1);
    expect(transaction).toEqual({ id: 1, type: 'purchase' });
  });

  it('should handle getTransaction error', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    TransactionService.lookupRedemption.mockRejectedValue(new Error('Service error'));
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await expect(result.current.getTransaction(1)).rejects.toThrow('Service error');
    expect(toast.error).toHaveBeenCalledWith('Service error');
  });

  it('should fetch transaction details with related user', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    const details = await result.current.fetchTransactionDetails(1);
    expect(details).toEqual({
      id: 1,
      relatedId: 2,
      relatedUser: {
        utorid: 'user123',
        name: 'Test User',
        role: 'participant'
      }
    });
  });

  it('should fetch transaction details without related user', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    TransactionService.getTransactionById.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    const details = await result.current.fetchTransactionDetails(1);
    expect(details).toEqual({ id: 1 });
  });

  it('should handle related user fetch error gracefully', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    UserService.getUserById.mockRejectedValue(new Error('User not found'));
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    const details = await result.current.fetchTransactionDetails(1);
    expect(details).toEqual({ id: 1, relatedId: 2 });
    expect(console.warn).toHaveBeenCalledWith('Could not fetch related user for transaction 1:', expect.any(Error));
  });

  it('should handle transaction details fetch error', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    TransactionService.getTransactionById.mockRejectedValue(new Error('Transaction not found'));
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await expect(result.current.fetchTransactionDetails(1)).rejects.toThrow('Transaction not found');
    expect(console.error).toHaveBeenCalledWith('Error fetching transaction 1:', expect.any(Error));
  });

  it('should handle generic error messages', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    TransactionService.createAdjustment.mockRejectedValue({});
    const { result } = renderHook(() => useTransactions(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createAdjustment({ amount: -10 });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create adjustment transaction');
    });
  });
}); 