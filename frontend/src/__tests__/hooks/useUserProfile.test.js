import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUserProfile';
import UserService from '../../services/user.service';
import AuthService from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('react-hot-toast');
jest.mock('react-router-dom');
jest.mock('../../services/user.service');
jest.mock('../../services/auth.service');
jest.mock('../../contexts/AuthContext');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserProfile', () => {
  const mockProfile = { id: 1, name: 'Test User', email: 'test@example.com' };
  const mockUpdateCurrentUser = jest.fn();
  const mockLogout = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    
    UserService.getProfile = jest.fn().mockResolvedValue(mockProfile);
    UserService.updateProfile = jest.fn().mockResolvedValue(mockProfile);
    UserService.updateAvatar = jest.fn().mockResolvedValue(mockProfile);
    AuthService.updatePassword = jest.fn().mockResolvedValue({});
    
    useAuth.mockReturnValue({
      updateCurrentUser: mockUpdateCurrentUser,
      logout: mockLogout,
    });
    
    useNavigate.mockReturnValue(mockNavigate);
    
    localStorage.clear();
  });

  it('should fetch user profile successfully', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
    });
  });

  it('should update profile successfully', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });
    const updateData = { name: 'Updated Name' };

    await act(async () => {
      result.current.updateProfile(updateData);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
      expect(UserService.updateProfile).toHaveBeenCalledWith(updateData);
    });
  });

  it('should handle profile update error', async () => {
    UserService.updateProfile.mockRejectedValue(new Error('Update failed'));
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updateProfile({ name: 'New Name' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Update failed');
    });
  });

  it('should update avatar successfully', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });
    const avatarFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });

    await act(async () => {
      result.current.updateAvatar(avatarFile);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Avatar updated successfully');
      expect(UserService.updateAvatar).toHaveBeenCalledWith(avatarFile);
      expect(localStorage.getItem('avatarVersion')).toBeTruthy();
    });
  });

  it('should handle avatar update error', async () => {
    UserService.updateAvatar.mockRejectedValue(new Error('Avatar failed'));
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updateAvatar(new File([''], 'test.jpg'));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Avatar failed');
    });
  });

  it('should update password successfully and logout', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updatePassword({ oldPassword: 'old123', newPassword: 'new123' });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully. Please log in again with your new password.');
    });

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    
    jest.useRealTimers();
  });

  it('should handle password update error', async () => {
    AuthService.updatePassword.mockRejectedValue(new Error('Password failed'));
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updatePassword({ oldPassword: 'old', newPassword: 'new' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Password failed');
    });
  });

  it('should handle generic error messages', async () => {
    UserService.updateProfile.mockRejectedValue({});
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updateProfile({ name: 'Test' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update profile');
    });
  });

  it('should show loading states correctly', () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.isUpdatingAvatar).toBe(false);
    expect(result.current.isUpdatingPassword).toBe(false);
  });

  it('should refetch profile data', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.profile).toEqual(mockProfile));

    await act(async () => {
      await result.current.refetch();
    });

    expect(UserService.getProfile).toHaveBeenCalledTimes(2);
  });

  it('should verify service calls are made correctly', async () => {
    const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.profile).toEqual(mockProfile));

    expect(UserService.getProfile).toHaveBeenCalledTimes(1);
    
    await act(async () => {
      result.current.updateProfile({ name: 'Test' });
    });

    await waitFor(() => {
      expect(UserService.updateProfile).toHaveBeenCalledWith({ name: 'Test' });
    });

    await act(async () => {
      result.current.updatePassword({ oldPassword: 'old', newPassword: 'new' });
    });

    await waitFor(() => {
      expect(AuthService.updatePassword).toHaveBeenCalledWith('old', 'new');
    });
  });
}); 