/**
 * TokenUtils Tests
 * Purpose: Test token management utilities including validation,
 * storage operations, and expiry checking logic
 */

import {
  getToken,
  getTokenExpiry,
  isTokenValid,
  clearAuthData,
  setAuthData
} from '../../utils/tokenUtils';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

// Override global localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('TokenUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('getToken', () => {
    test('should return token from localStorage', () => {
      const mockToken = 'mock.jwt.token';
      localStorageMock.getItem.mockReturnValue(mockToken);

      const result = getToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(result).toBe(mockToken);
    });

    test('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getToken();

      expect(result).toBeNull();
    });
  });

  describe('getTokenExpiry', () => {
    test('should return token expiry from localStorage', () => {
      const mockExpiry = '2024-12-31T23:59:59Z';
      localStorageMock.getItem.mockReturnValue(mockExpiry);

      const result = getTokenExpiry();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('tokenExpiry');
      expect(result).toBe(mockExpiry);
    });

    test('should return null when no expiry exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getTokenExpiry();

      expect(result).toBeNull();
    });
  });

  describe('isTokenValid', () => {
    test('should return true for valid token within expiry', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid.jwt.token';
        if (key === 'tokenExpiry') return futureDate;
        return null;
      });

      const result = isTokenValid();

      expect(result).toBe(true);
    });

    test('should return false for expired token', () => {
      const pastDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'expired.jwt.token';
        if (key === 'tokenExpiry') return pastDate;
        return null;
      });

      const result = isTokenValid();

      expect(result).toBe(false);
    });

    test('should return false when token is missing', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return null;
        if (key === 'tokenExpiry') return futureDate;
        return null;
      });

      const result = isTokenValid();

      expect(result).toBe(false);
    });

    test('should return false when expiry is missing', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid.jwt.token';
        if (key === 'tokenExpiry') return null;
        return null;
      });

      const result = isTokenValid();

      expect(result).toBe(false);
    });

    test('should return false for invalid expiry date', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid.jwt.token';
        if (key === 'tokenExpiry') return 'invalid-date';
        return null;
      });

      const result = isTokenValid();

      expect(result).toBe(false);
    });
  });

  describe('clearAuthData', () => {
    test('should remove all authentication data from localStorage', () => {
      clearAuthData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tokenExpiry');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeRole');
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(4);
    });
  });

  describe('setAuthData', () => {
    test('should store token and expiry in localStorage', () => {
      const token = 'new.jwt.token';
      const expiry = '2024-12-31T23:59:59Z';

      setAuthData(token, expiry);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tokenExpiry', expiry);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    });

    test('should store token, expiry, and user data when user is provided', () => {
      const token = 'new.jwt.token';
      const expiry = '2024-12-31T23:59:59Z';
      const user = { id: 1, utorid: 'testuser', role: 'regular' };

      setAuthData(token, expiry, user);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tokenExpiry', expiry);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
    });

    test('should not store user data when user is null', () => {
      const token = 'new.jwt.token';
      const expiry = '2024-12-31T23:59:59Z';

      setAuthData(token, expiry, null);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tokenExpiry', expiry);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    });
  });
}); 