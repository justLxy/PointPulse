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

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('login', () => {
    test('should successfully login and store token', async () => {
      const mockResponse = {
        data: {
          token: 'mock.jwt.token',
          expiresAt: '2024-12-31T23:59:59Z'
        }
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await AuthService.login('testuser', 'password123');

      expect(api.post).toHaveBeenCalledWith('/auth/tokens', {
        utorid: 'testuser',
        password: 'password123'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock.jwt.token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tokenExpiry', '2024-12-31T23:59:59Z');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle 401 unauthorized error', async () => {
      const error = {
        response: { status: 401, data: { message: 'Invalid credentials' } }
      };
      api.post.mockRejectedValue(error);

      await expect(AuthService.login('wrong', 'credentials'))
        .rejects.toThrow('Invalid username or password. Please try again.');
    });

    test('should handle network error', async () => {
      const error = { request: {} };
      api.post.mockRejectedValue(error);

      await expect(AuthService.login('user', 'pass'))
        .rejects.toThrow('Network error. Please check your internet connection.');
    });
  });

  describe('logout', () => {
    test('should clear all stored authentication data', () => {
      AuthService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tokenExpiry');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('role');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeRole');
    });
  });

  describe('getCurrentUser', () => {
    test('should return cached user when available and not forcing refresh', async () => {
      const cachedUser = { id: 1, utorid: 'testuser', role: 'regular' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedUser));

      const result = await AuthService.getCurrentUser(false);

      expect(result).toEqual(cachedUser);
      expect(api.get).not.toHaveBeenCalled();
    });

    test('should fetch from API when forcing refresh', async () => {
      const apiUser = { id: 1, utorid: 'testuser', role: 'regular', verified: true };
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ old: 'data' }));
      api.get.mockResolvedValue({ data: apiUser });

      const result = await AuthService.getCurrentUser(true);

      expect(api.get).toHaveBeenCalledWith('/users/me');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(apiUser));
      expect(result).toEqual(apiUser);
    });

    test('should handle API error and clear cached data', async () => {
      const error = { response: { data: { error: 'Unauthorized' } } };
      api.get.mockRejectedValue(error);

      await expect(AuthService.getCurrentUser(true))
        .rejects.toEqual({ error: 'Unauthorized' });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('isAuthenticated', () => {
    test('should return true for valid token within expiry', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid.jwt.token';
        if (key === 'tokenExpiry') return futureDate;
        return null;
      });

      expect(AuthService.isAuthenticated()).toBe(true);
    });

    test('should return false for expired token', () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'expired.jwt.token';
        if (key === 'tokenExpiry') return pastDate;
        return null;
      });

      expect(AuthService.isAuthenticated()).toBe(false);
    });

    test('should return false for missing token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    test('should successfully request password reset', async () => {
      const mockResponse = { data: { message: 'Reset email sent' } };
      api.post.mockResolvedValue(mockResponse);

      const result = await AuthService.requestPasswordReset('testuser');

      expect(api.post).toHaveBeenCalledWith('/auth/resets', { utorid: 'testuser' });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle user not found error', async () => {
      const error = { response: { status: 404, data: { message: 'User not found' } } };
      api.post.mockRejectedValue(error);

      await expect(AuthService.requestPasswordReset('nonexistent'))
        .rejects.toThrow('User not found. Please verify your UTORid.');
    });
  });

  describe('updatePassword', () => {
    test('should successfully update password', async () => {
      const mockResponse = { data: { message: 'Password updated' } };
      api.patch.mockResolvedValue(mockResponse);

      const result = await AuthService.updatePassword('oldpass', 'newpass123');

      expect(api.patch).toHaveBeenCalledWith('/users/me/password', {
        old: 'oldpass',
        new: 'newpass123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle incorrect current password', async () => {
      const error = { response: { status: 401, data: { message: 'Invalid password' } } };
      api.patch.mockRejectedValue(error);

      await expect(AuthService.updatePassword('wrong', 'new123'))
        .rejects.toThrow('Your current password is incorrect. Please enter the correct password.');
    });
  });
}); 