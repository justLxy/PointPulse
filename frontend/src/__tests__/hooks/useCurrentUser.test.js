/**
 * useCurrentUser Hook Tests
 * Purpose: Test user data fetching, caching behavior, points calculation,
 * and pending redemptions tracking functionality
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import UserService from '../../services/user.service';

// Mock dependencies
jest.mock('../../services/user.service');
jest.mock('../../utils/tokenUtils');

// Mock getToken utility
import { getToken } from '../../utils/tokenUtils';

describe('useCurrentUser Hook', () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Create wrapper with QueryClient
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  test('should fetch user profile when token exists', async () => {
    const mockUser = {
      id: 1,
      utorid: 'testuser',
      name: 'Test User',
      points: 1500,
      verified: true
    };

    getToken.mockReturnValue('valid.token');
    UserService.getProfile.mockResolvedValue(mockUser);
    UserService.getPendingRedemptionsTotal.mockResolvedValue(200);

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(UserService.getProfile).toHaveBeenCalled();
    expect(UserService.getPendingRedemptionsTotal).toHaveBeenCalled();
    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.pendingRedemptionsTotal).toBe(200);
    expect(result.current.availablePoints).toBe(1300); // 1500 - 200
  });

  test('should not fetch data when no token exists', async () => {
    getToken.mockReturnValue(null);

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(UserService.getProfile).not.toHaveBeenCalled();
    expect(UserService.getPendingRedemptionsTotal).not.toHaveBeenCalled();
    expect(result.current.currentUser).toBeUndefined();
    expect(result.current.availablePoints).toBe(0);
  });

  test('should calculate available points correctly', async () => {
    const mockUser = { id: 1, utorid: 'testuser', points: 1000 };

    getToken.mockReturnValue('valid.token');
    UserService.getProfile.mockResolvedValue(mockUser);
    UserService.getPendingRedemptionsTotal.mockResolvedValue(250);

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentUser).toEqual(mockUser);
    });

    expect(result.current.availablePoints).toBe(750); // 1000 - 250
  });

  test('should handle zero pending redemptions', async () => {
    const mockUser = { id: 1, utorid: 'testuser', points: 500 };

    getToken.mockReturnValue('valid.token');
    UserService.getProfile.mockResolvedValue(mockUser);
    UserService.getPendingRedemptionsTotal.mockResolvedValue(0);

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentUser).toEqual(mockUser);
    });

    expect(result.current.availablePoints).toBe(500); // 500 - 0
    expect(result.current.pendingRedemptionsTotal).toBe(0);
  });

  test('should handle API errors gracefully', async () => {
    getToken.mockReturnValue('valid.token');
    UserService.getProfile.mockRejectedValue(new Error('API Error'));
    UserService.getPendingRedemptionsTotal.mockResolvedValue(0);

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.currentUser).toBeUndefined();
    expect(result.current.availablePoints).toBe(0);
  });

  test('should default pending redemptions to 0 on API error', async () => {
    const mockUser = { id: 1, utorid: 'testuser', points: 800 };

    getToken.mockReturnValue('valid.token');
    UserService.getProfile.mockResolvedValue(mockUser);
    UserService.getPendingRedemptionsTotal.mockRejectedValue(new Error('Redemptions API Error'));

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentUser).toEqual(mockUser);
    });

    expect(result.current.pendingRedemptionsTotal).toBe(0); // Default value
    expect(result.current.availablePoints).toBe(800); // 800 - 0
  });

  test('should provide refetch functionality', async () => {
    const mockUser = { id: 1, utorid: 'testuser', points: 600 };

    getToken.mockReturnValue('valid.token');
    UserService.getProfile.mockResolvedValue(mockUser);
    UserService.getPendingRedemptionsTotal.mockResolvedValue(100);

    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentUser).toEqual(mockUser);
    });

    expect(typeof result.current.refetch).toBe('function');
    
    // Test refetch functionality
    const updatedUser = { ...mockUser, points: 700 };
    UserService.getProfile.mockResolvedValue(updatedUser);

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.currentUser.points).toBe(700);
    });

    expect(result.current.availablePoints).toBe(600); // 700 - 100
  });

  test('should use appropriate stale times for caching', () => {
    getToken.mockReturnValue('valid.token');

    renderHook(() => useCurrentUser(), { wrapper });

    // Check that queries are configured with proper stale times
    const queries = queryClient.getQueryCache().getAll();
    
    const userProfileQuery = queries.find(q => q.queryKey[0] === 'userProfile');
    const redemptionsQuery = queries.find(q => q.queryKey[0] === 'pendingRedemptionsTotal');

    expect(userProfileQuery?.options.staleTime).toBe(5 * 60 * 1000); // 5 minutes
    expect(redemptionsQuery?.options.staleTime).toBe(3 * 60 * 1000); // 3 minutes
  });
}); 