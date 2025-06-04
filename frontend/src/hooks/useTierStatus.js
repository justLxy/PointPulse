import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useCallback, useState, useEffect } from 'react';
import TierService from '../services/tier.service';

export const useTierStatus = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const userId = currentUser?.id;
  
  // Track simulated date for cache invalidation
  const [simulatedDateKey, setSimulatedDateKey] = useState(() => 
    localStorage.getItem('simulatedDate') || 'real'
  );

  // Listen for changes to simulated date
  useEffect(() => {
    const checkSimulatedDate = () => {
      const current = localStorage.getItem('simulatedDate') || 'real';
      if (current !== simulatedDateKey) {
        setSimulatedDateKey(current);
      }
    };
    
    // Check every second for changes (could be optimized with custom events)
    const interval = setInterval(checkSimulatedDate, 1000);
    return () => clearInterval(interval);
  }, [simulatedDateKey]);

  // Query for getting active tier status
  const {
    data: tierStatus,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tierStatus', userId, simulatedDateKey],
    queryFn: () => TierService.getActiveTierStatus(userId),
    enabled: !!userId,
    staleTime: 0, // Don't cache when using time simulation
    cacheTime: 1000, // Very short cache time for testing
  });

  // Query for getting current cycle earned points
  const {
    data: currentCycleEarnedPoints,
    isLoading: isLoadingEarnedPoints
  } = useQuery({
    queryKey: ['currentCycleEarnedPoints', userId, simulatedDateKey],
    queryFn: () => TierService.getCurrentCycleEarnedPoints(userId),
    enabled: !!userId,
    staleTime: 0, // Don't cache when using time simulation
    cacheTime: 1000, // Very short cache time for testing
  });

  // Force refresh tier status - memoize to prevent infinite loops
  const refreshTierStatus = useCallback(async () => {
    await refetch();
    await queryClient.invalidateQueries(['currentCycleEarnedPoints', userId]);
  }, [refetch, queryClient, userId]);

  return {
    tierStatus,
    currentCycleEarnedPoints,
    isLoading: isLoading || isLoadingEarnedPoints,
    error,
    refreshTierStatus
  };
}; 