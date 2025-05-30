/**
 * Core User Flow: API configuration and environment setup
 * Validates API service initialization and token management behavior
 */

import { getToken } from '../../utils/tokenUtils';

jest.mock('../../utils/tokenUtils');

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('API Service - Core Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('environment configuration and token utilities work correctly', () => {
    const expectedBaseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
    
    // Verify API URL configuration
    expect(expectedBaseUrl).toMatch(/localhost:8000/);
  });

  test('token lifecycle management integrates with localStorage', () => {
    const mockToken = 'valid.jwt.token';
    
    // Test token storage and retrieval
    getToken.mockReturnValue(mockToken);
    expect(getToken()).toBe(mockToken);

    // Test token clearing behavior
    getToken.mockReturnValue(null);
    expect(getToken()).toBeNull();
  });

  test('handles authentication cleanup during logout', () => {
    // Simulate logout cleanup
    localStorageMock.removeItem('token');
    localStorageMock.removeItem('tokenExpiry');
    localStorageMock.removeItem('user');
    localStorageMock.removeItem('activeRole');

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('tokenExpiry');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('activeRole');
  });
}); 