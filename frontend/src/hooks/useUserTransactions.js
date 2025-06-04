import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import UserService from '../services/user.service';

export const useUserTransactions = (params = {}) => {
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userTransactions', params],
    queryFn: () => UserService.getTransactions(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  const createRedemptionMutation = useMutation({
    mutationFn: ({ amount, remark }) => UserService.createRedemption(amount, remark),
    onSuccess: (data) => {
      toast.success('Redemption request created successfully');
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['tierStatus'] });
      queryClient.invalidateQueries({ queryKey: ['currentCycleEarnedPoints'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRedemptions'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRedemptionsTotal'] });
      queryClient.refetchQueries({ queryKey: ['pendingRedemptionsTotal'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create redemption request');
    },
  });
  
  const transferPointsMutation = useMutation({
    mutationFn: ({ userId, amount, remark }) => UserService.transferPoints(userId, amount, remark),
    onSuccess: () => {
      toast.success('Points transferred successfully');
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['tierStatus'] });
      queryClient.invalidateQueries({ queryKey: ['currentCycleEarnedPoints'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to transfer points');
    },
  });
  
  return {
    transactions: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    createRedemption: createRedemptionMutation.mutate,
    isCreatingRedemption: createRedemptionMutation.isPending,
    transferPoints: transferPointsMutation.mutate,
    isTransferringPoints: transferPointsMutation.isPending,
  };
};

export default useUserTransactions; 