import { useQuery } from 'react-query';
import { userService } from '../services/userService';
import { getToken } from '../utils/tokenUtils';

export const useCurrentUser = () => {
  const { data: userProfile, isLoading, error, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: userService.getProfile,
    enabled: !!getToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for pending redemptions total
  const { data: pendingRedemptionsTotal = 0 } = useQuery({
    queryKey: ['pendingRedemptionsTotal'],
    queryFn: userService.getPendingRedemptionsTotal,
    enabled: !!getToken(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  // Calculate available points (total points minus pending redemptions)
  const availablePoints = userProfile ? userProfile.points - pendingRedemptionsTotal : 0;

  return {
    currentUser: userProfile,
    isLoading,
    error,
    refetch,
    pendingRedemptionsTotal,
    availablePoints
  };
}; 