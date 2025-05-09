import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import UserService from '../services/user.service';
import AuthService from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useUserProfile = () => {
  const { updateCurrentUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
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
      // Store cache-busting version so images refresh after upload
      localStorage.setItem('avatarVersion', Date.now().toString());
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
      toast.success('Password updated successfully. Please log in again with your new password.');
      
      // Clear all queries from the cache
      queryClient.clear();
      
      // Small delay before logout to allow toast to be seen
      setTimeout(() => {
        // Log out the user
        logout();
        
        // Redirect to login page
        navigate('/login');
      }, 1500);
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