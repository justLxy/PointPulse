import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import UserService from '../services/user.service';
import { useAuth } from '../contexts/AuthContext';

export const useUsers = (params = {}) => {
  const queryClient = useQueryClient();
  const { activeRole } = useAuth();
  
  const isCashier = ['cashier', 'manager', 'superuser'].includes(activeRole);
  const isManager = ['manager', 'superuser'].includes(activeRole);
  
  // Get all users (manager only)
  const getAllUsersQuery = useQuery({
    queryKey: ['allUsers', params],
    queryFn: () => UserService.getUsers(params),
    enabled: isManager || params.forSearch === true, // Also enable for organizers when specifically searching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get a user (cashier+)
  const useGetUser = (userId) => {
    return useQuery({
      queryKey: ['user', userId],
      queryFn: () => UserService.getUser(userId),
      enabled: !!userId && isCashier,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
  
  // Create a user (cashier+)
  const createUserMutation = useMutation({
    mutationFn: UserService.createUser,
    onSuccess: () => {
      toast.success('User created successfully');
      if (isManager) {
        queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
  
  // Update a user (manager+)
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }) => UserService.updateUser(userId, userData),
    onSuccess: (_, variables) => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
  
  return {
    // Available to both cashiers and managers
    getUser: useGetUser,
    createUser: createUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    
    // Available to everyone when searching users for events
    users: params.forSearch ? getAllUsersQuery.data?.results || [] : null,
    
    // Available to managers only
    ...(isManager ? {
      users: getAllUsersQuery.data?.results || [],
      totalCount: getAllUsersQuery.data?.count || 0,
      isLoading: getAllUsersQuery.isLoading,
      error: getAllUsersQuery.error,
      refetch: getAllUsersQuery.refetch,
      updateUser: updateUserMutation.mutate,
      isUpdatingUser: updateUserMutation.isPending,
    } : {
      // Still provide these for event organizers when searching
      ...(params.forSearch ? {
        totalCount: getAllUsersQuery.data?.count || 0,
        isLoading: getAllUsersQuery.isLoading,
        error: getAllUsersQuery.error,
      } : {})
    }),
  };
};

export default useUsers; 