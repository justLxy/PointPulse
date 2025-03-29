import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import TransactionService from '../services/transaction.service';
import { useAuth } from '../contexts/AuthContext';

export const useTransactions = (params = {}) => {
  const queryClient = useQueryClient();
  const { activeRole } = useAuth();
  
  const isManager = ['manager', 'superuser'].includes(activeRole);
  
  // Get all transactions (manager+)
  const getAllTransactionsQuery = useQuery({
    queryKey: ['allTransactions', params],
    queryFn: () => TransactionService.getAllTransactions(params),
    enabled: isManager,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get a specific transaction
  const useGetTransaction = (transactionId) => {
    return useQuery({
      queryKey: ['transaction', transactionId],
      queryFn: () => TransactionService.getTransaction(transactionId),
      enabled: !!transactionId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
  
  // Create a purchase transaction (cashier+)
  const createPurchaseMutation = useMutation({
    mutationFn: TransactionService.createPurchase,
    onSuccess: () => {
      toast.success('Purchase transaction created successfully');
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create purchase transaction');
    },
  });
  
  // Create an adjustment transaction (manager+)
  const createAdjustmentMutation = useMutation({
    mutationFn: TransactionService.createAdjustment,
    onSuccess: () => {
      toast.success('Adjustment transaction created successfully');
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create adjustment transaction');
    },
  });
  
  // Mark transaction as suspicious (manager+)
  const markAsSuspiciousMutation = useMutation({
    mutationFn: ({ transactionId, suspicious }) => 
      TransactionService.markAsSuspicious(transactionId, suspicious),
    onSuccess: () => {
      toast.success('Transaction status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update transaction status');
    },
  });
  
  // Process redemption transaction (cashier+)
  const processRedemptionMutation = useMutation({
    mutationFn: (transactionId) => TransactionService.processRedemption(transactionId),
    onSuccess: () => {
      toast.success('Redemption processed successfully');
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process redemption');
    },
  });
  
  // Get transaction by ID without using useQuery
  const getTransaction = async (transactionId) => {
    try {
      const data = await TransactionService.getTransaction(transactionId);
      return data;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch transaction');
      throw error;
    }
  };
  
  return {
    // Available to all roles
    getTransaction,
    getTransactionQuery: useGetTransaction,
    
    // Available to cashiers and up
    createPurchase: createPurchaseMutation.mutate,
    isCreatingPurchase: createPurchaseMutation.isPending,
    processRedemption: processRedemptionMutation.mutate,
    isProcessing: processRedemptionMutation.isPending,
    
    // Available to managers only
    ...(isManager ? {
      transactions: getAllTransactionsQuery.data?.results || [],
      totalCount: getAllTransactionsQuery.data?.count || 0,
      isLoading: getAllTransactionsQuery.isLoading,
      error: getAllTransactionsQuery.error,
      refetch: getAllTransactionsQuery.refetch,
      createAdjustment: createAdjustmentMutation.mutate,
      isCreatingAdjustment: createAdjustmentMutation.isPending,
      markAsSuspicious: markAsSuspiciousMutation.mutate,
      isMarkingAsSuspicious: markAsSuspiciousMutation.isPending,
    } : {}),
  };
};

export default useTransactions; 