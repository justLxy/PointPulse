/**
 * Core User Flow: Token validation and storage lifecycle
 * Validates token management during login, session persistence, and logout
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

describe('TokenUtils - Authentication Lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('complete token lifecycle: set → validate → clear', () => {
    const token = 'mock.jwt.token';
    const futureExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour future
    const user = { id: 1, utorid: 'testuser', role: 'regular' };

    // Initial state - no tokens
    expect(isTokenValid()).toBe(false);
    expect(getToken()).toBeNull();

    // Set authentication data
    setAuthData(token, futureExpiry, user);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', token);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('tokenExpiry', futureExpiry);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));

    // Mock localStorage to return the stored values
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return token;
      if (key === 'tokenExpiry') return futureExpiry;
      if (key === 'user') return JSON.stringify(user);
      return null;
    });

    // Validate stored tokens
    expect(getToken()).toBe(token);
    expect(getTokenExpiry()).toBe(futureExpiry);
    expect(isTokenValid()).toBe(true);

    // Clear authentication data
    clearAuthData();
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('tokenExpiry');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeRole');
  });

  test('handles expired tokens and invalid data gracefully', () => {
    const expiredDate = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
    
    // Test with expired token
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'expired.token';
      if (key === 'tokenExpiry') return expiredDate;
      return null;
    });

    expect(isTokenValid()).toBe(false);

    // Test with missing token but valid expiry
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return null;
      if (key === 'tokenExpiry') return new Date(Date.now() + 3600000).toISOString();
      return null;
    });

    expect(isTokenValid()).toBe(false);

    // Test with invalid expiry date
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'token') return 'valid.token';
      if (key === 'tokenExpiry') return 'invalid-date-format';
      return null;
    });

    expect(isTokenValid()).toBe(false);
  });

  test('handles partial authentication data correctly', () => {
    const token = 'partial.token';
    const expiry = new Date(Date.now() + 3600000).toISOString();

    // Set data without user (login without user fetch)
    setAuthData(token, expiry, null);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', token);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('tokenExpiry', expiry);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2); // Should not set user

    // Set data with all parameters
    const user = { id: 1, utorid: 'testuser' };
    localStorageMock.setItem.mockClear();
    
    setAuthData(token, expiry, user);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(3); // token, expiry, user
  });
}); 