import { useQuery } from '@tanstack/react-query';
import UserService from '../services/user.service';
import { getToken } from '../utils/tokenUtils';

export const useCurrentUser = () => {
  const { data: userProfile, isLoading, error, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: UserService.getProfile,
    enabled: !!getToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for pending redemptions total
  const { data: pendingRedemptionsTotal = 0 } = useQuery({
    queryKey: ['pendingRedemptionsTotal'],
    queryFn: UserService.getPendingRedemptionsTotal,
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