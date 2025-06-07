import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useUsers } from '../../hooks/useUsers';
import UserService from '../../services/user.service';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('react-hot-toast');
jest.mock('../../services/user.service');
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

describe('useUsers', () => {
  const mockUsers = {
    results: [{ id: 1, name: 'Test User', role: 'participant' }],
    count: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    UserService.getUsers = jest.fn().mockResolvedValue(mockUsers);
    UserService.getUser = jest.fn().mockResolvedValue({ id: 1, name: 'Test User' });
    UserService.createUser = jest.fn().mockResolvedValue({ id: 2 });
    UserService.updateUser = jest.fn().mockResolvedValue({ id: 1 });
  });

  it('should expose basic functions for cashiers', () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    expect(result.current.getUser).toBeDefined();
    expect(result.current.createUser).toBeDefined();
    expect(result.current.users).toBeNull();
    expect(result.current.updateUser).toBeUndefined();
  });

  it('should expose all functions for managers', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.users).toEqual([{ id: 1, name: 'Test User', role: 'participant' }]);
      expect(result.current.totalCount).toBe(1);
      expect(result.current.updateUser).toBeDefined();
    });
  });

  it('should expose search functionality when forSearch is true', async () => {
    useAuth.mockReturnValue({ activeRole: 'participant' });
    const { result } = renderHook(() => useUsers({ forSearch: true }), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.users).toEqual([{ id: 1, name: 'Test User', role: 'participant' }]);
      expect(result.current.totalCount).toBe(1);
      expect(UserService.getUsers).toHaveBeenCalledWith({ forSearch: true });
    });
  });

  it('should get single user with proper role check', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    const { result: userResult } = renderHook(() => result.current.getUser(1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(UserService.getUser).toHaveBeenCalledWith(1);
    });
  });

  it('should not get user if not cashier+', () => {
    useAuth.mockReturnValue({ activeRole: 'participant' });
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    const { result: userResult } = renderHook(() => result.current.getUser(1), { wrapper: createWrapper() });

    expect(UserService.getUser).not.toHaveBeenCalled();
  });

  it('should create user successfully', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createUser({ name: 'New User', email: 'new@test.com' });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('User created successfully');
    });
  });

  it('should handle user creation error', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    UserService.createUser.mockRejectedValue(new Error('Creation failed'));
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createUser({ name: 'New User' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Creation failed');
    });
  });

  it('should update user successfully', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updateUser({ userId: 1, userData: { name: 'Updated' } });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('User updated successfully');
    });
  });

  it('should handle user update error', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    UserService.updateUser.mockRejectedValue(new Error('Update failed'));
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.updateUser({ userId: 1, userData: { name: 'Updated' } });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Update failed');
    });
  });

  it('should handle generic error messages', async () => {
    useAuth.mockReturnValue({ activeRole: 'cashier' });
    UserService.createUser.mockRejectedValue({});
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.createUser({ name: 'Test' });
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create user');
    });
  });

  it('should work for superuser role', async () => {
    useAuth.mockReturnValue({ activeRole: 'superuser' });
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.users).toBeDefined();
      expect(result.current.updateUser).toBeDefined();
    });
  });

  it('should handle empty user data', async () => {
    useAuth.mockReturnValue({ activeRole: 'manager' });
    UserService.getUsers.mockResolvedValue({});
    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.users).toEqual([]);
      expect(result.current.totalCount).toBe(0);
    });
  });
}); 