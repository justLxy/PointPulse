/**
 * AuthService Tests
 * Purpose: Test critical authentication logic including login flow, token management,
 * password reset functionality, and authentication state validation
 */

import AuthService from '../../services/auth.service';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Override global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('AuthService - Authentication Lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('complete authentication flow: login → fetch user → validate session → logout', async () => {
    const mockLoginResponse = {
      data: { token: 'mock.jwt.token', expiresAt: '2024-12-31T23:59:59Z' }
    };
    const mockUser = { id: 1, utorid: 'testuser', role: 'regular', verified: true };

    // Login success
    api.post.mockResolvedValue(mockLoginResponse);
    const loginResult = await AuthService.login('testuser', 'password123');
    
    expect(api.post).toHaveBeenCalledWith('/auth/tokens', {
      utorid: 'testuser', password: 'password123'
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock.jwt.token');
    expect(loginResult).toEqual(mockLoginResponse.data);

    // Fetch user data
    api.get.mockResolvedValue({ data: mockUser });
    const userResult = await AuthService.getCurrentUser(true);
    
    expect(api.get).toHaveBeenCalledWith('/users/me');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    expect(userResult).toEqual(mockUser);

    // Logout
    AuthService.logout();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  test('handles authentication errors and edge cases', async () => {
    // Invalid credentials
    const authError = { response: { status: 401, data: { message: 'Invalid credentials' } } };
    api.post.mockRejectedValue(authError);
    
    await expect(AuthService.login('wrong', 'credentials'))
      .rejects.toThrow('Invalid username or password. Please try again.');

    // User data fetch failure
    const userError = { response: { data: { error: 'Unauthorized' } } };
    api.get.mockRejectedValue(userError);
    
    await expect(AuthService.getCurrentUser(true)).rejects.toEqual({ error: 'Unauthorized' });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });

  test('password management workflow', async () => {
    // Password update success
    const updateResponse = { data: { message: 'Password updated' } };
    api.patch.mockResolvedValue(updateResponse);
    
    const result = await AuthService.updatePassword('oldpass', 'newpass123');
    expect(api.patch).toHaveBeenCalledWith('/users/me/password', {
      old: 'oldpass', new: 'newpass123'
    });
    expect(result).toEqual(updateResponse.data);

    // Password reset request
    const resetResponse = { data: { message: 'Reset email sent' } };
    api.post.mockResolvedValue(resetResponse);
    
    const resetResult = await AuthService.requestPasswordReset('testuser');
    expect(api.post).toHaveBeenCalledWith('/auth/resets', { utorid: 'testuser' });
    expect(resetResult).toEqual(resetResponse.data);

    // Handle incorrect current password
    const wrongPasswordError = { response: { status: 401, data: { message: 'Invalid password' } } };
    api.patch.mockRejectedValue(wrongPasswordError);
    
    await expect(AuthService.updatePassword('wrong', 'new123'))
      .rejects.toThrow('Your current password is incorrect. Please enter the correct password.');
  });

  test('cached user data and session persistence', async () => {
    const cachedUser = { id: 1, utorid: 'testuser', role: 'regular' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedUser));

    // Should return cached data without API call
    const result = await AuthService.getCurrentUser(false);
    expect(result).toEqual(cachedUser);
    expect(api.get).not.toHaveBeenCalled();

    // Should make API call when forcing refresh
    const freshUser = { ...cachedUser, verified: true };
    api.get.mockResolvedValue({ data: freshUser });
    
    const refreshResult = await AuthService.getCurrentUser(true);
    expect(api.get).toHaveBeenCalledWith('/users/me');
    expect(refreshResult).toEqual(freshUser);
  });
}); 