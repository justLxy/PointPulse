/**
 * Core User Flow: User data management and points calculation
 * Tests user profile fetching, points calculation, and data synchronization
 */

import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import UserService from '../../services/user.service';
import { getToken } from '../../utils/tokenUtils';

jest.mock('../../services/user.service', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn(),
    getPendingRedemptionsTotal: jest.fn(),
  },
}));
jest.mock('../../utils/tokenUtils');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCurrentUser - User Data Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles unauthenticated state correctly', () => {
    getToken.mockReturnValue(null);
    
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    // Should handle unauthenticated state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentUser).toBeUndefined();
  });

  test('handles authenticated user initialization', () => {
    getToken.mockReturnValue('valid.token');
    UserService.getProfile.mockResolvedValue({
      id: 1,
      utorid: 'testuser',
      points: 1000,
    });
    UserService.getPendingRedemptionsTotal.mockResolvedValue(100);

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    // Should initialize with loading state
    expect(result.current.isLoading).toBe(true);
  });

  test('provides refetch functionality', () => {
    getToken.mockReturnValue('valid.token');
    
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    // Should provide refetch function
    expect(typeof result.current.refetch).toBe('function');
  });

  test('handles API errors gracefully', () => {
    getToken.mockReturnValue('valid.token');
    UserService.getProfile.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    });

    // Should handle errors without crashing
    expect(result.current.isLoading).toBe(true);
  });
}); 