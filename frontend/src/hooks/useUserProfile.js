import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import UserService from '../services/user.service';
import AuthService from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

export const useUserProfile = () => {
  const { updateCurrentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: UserService.getProfile,
    onSuccess: (data) => {
      // Update auth context with the latest user data
      updateCurrentUser(data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: UserService.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      // Update auth context with the latest user data
      updateCurrentUser(data);
      // Invalidate user profile cache
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
  
  const updateAvatarMutation = useMutation({
    mutationFn: UserService.updateAvatar,
    onSuccess: (data) => {
      toast.success('Avatar updated successfully');
      // Update auth context with the latest user data
      updateCurrentUser(data);
      // Invalidate user profile cache
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update avatar');
    },
  });
  
  const updatePasswordMutation = useMutation({
    mutationFn: ({ oldPassword, newPassword }) => {
      return AuthService.updatePassword(oldPassword, newPassword);
    },
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update password');
    },
  });
  
  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    updateAvatar: updateAvatarMutation.mutate,
    isUpdatingAvatar: updateAvatarMutation.isPending,
    updatePassword: updatePasswordMutation.mutate,
    isUpdatingPassword: updatePasswordMutation.isPending,
  };
};

export default useUserProfile; 