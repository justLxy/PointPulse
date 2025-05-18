import { useQuery } from '@tanstack/react-query';
import UserService from '../services/user.service';

export const usePendingRedemptions = () => {
  const { 
    data: pendingTotal = 0, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['pendingRedemptionsTotal'],
    queryFn: UserService.getPendingRedemptionsTotal,
    staleTime: 60 * 1000, // 1 minute
  });
  
  return {
    pendingTotal,
    isLoading,
    error,
    refetch
  };
};

export default usePendingRedemptions; 