import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import TransactionService from '../services/transaction.service';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../services/user.service';

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
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['tierStatus'] });
      queryClient.invalidateQueries({ queryKey: ['currentCycleEarnedPoints'] });
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
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['tierStatus'] });
      queryClient.invalidateQueries({ queryKey: ['currentCycleEarnedPoints'] });
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
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['tierStatus'] });
      queryClient.invalidateQueries({ queryKey: ['currentCycleEarnedPoints'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update transaction status');
    },
  });
  
  // Process redemption transaction (cashier+)
  const processRedemptionMutation = useMutation({
    mutationFn: (transactionId) => TransactionService.processRedemption(transactionId),
    onSuccess: (data) => {
      console.log('Redemption processed successfully, API returned:', data);
      toast.success('Redemption processed successfully');
      
      // Invalidate queries related to transactions and user profile
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] }); // For managers
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] }); // For user's own view
      queryClient.invalidateQueries({ queryKey: ['userProfile'] }); // To update points balance
      queryClient.invalidateQueries({ queryKey: ['tierStatus'] }); // To update tier status
      queryClient.invalidateQueries({ queryKey: ['currentCycleEarnedPoints'] }); // To update earned points
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // To update dashboard stats
      
      // Invalidate the pending redemptions query to refresh the list
      // This targets the query key used in ProcessRedemption.js
      queryClient.invalidateQueries({ queryKey: ['pendingRedemptions'] }); 
    },
    onError: (error) => {
      console.error('Error processing redemption:', error);
      toast.error(error.message || 'Failed to process redemption');
    },
  });
  
  // Get transaction by ID without using useQuery
  const getTransaction = async (transactionId) => {
    try {
      // Try the cashier-specific endpoint first, if that fails, try the manager endpoint
      try {
        const data = await TransactionService.lookupRedemption(transactionId);
        return data;
      } catch (error) {
        // If error is not permission-related, try the regular getTransaction
        if (!error.message.includes('permission')) {
          throw error;
        }
        const data = await TransactionService.getTransaction(transactionId);
        return data;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch transaction');
      throw error;
    }
  };
  
  // Fetch transaction details including related user information
  const fetchTransactionDetails = async (transactionId) => {
    try {
      const transaction = await TransactionService.getTransactionById(transactionId);
      
      // Enhance transaction with related user info
      if (transaction.relatedId) {
        try {
          const relatedUser = await UserService.getUserById(transaction.relatedId);
          return {
            ...transaction,
            relatedUser: {
              utorid: relatedUser.utorid,
              name: relatedUser.name,
              role: relatedUser.role
            }
          };
        } catch (error) {
          console.warn(`Could not fetch related user for transaction ${transactionId}:`, error);
          return transaction;
        }
      }
      
      return transaction;
    } catch (error) {
      console.error(`Error fetching transaction ${transactionId}:`, error);
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
    
    // New functions
    fetchTransactionDetails,
  };
};

export default useTransactions; 