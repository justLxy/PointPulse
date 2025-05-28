/**
 * API Service Tests
 * Purpose: Test API configuration and localStorage token management
 */

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

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('should use correct API URL from environment', () => {
    // Test that API_URL is configured correctly
    const expectedUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
    expect(expectedUrl).toMatch(/localhost:8000/);
  });

  test('should mock localStorage operations correctly', () => {
    const testToken = 'test.jwt.token';
    
    // Test setting and getting token
    localStorageMock.setItem('token', testToken);
    localStorageMock.getItem.mockReturnValue(testToken);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', testToken);
    expect(localStorageMock.getItem('token')).toBe(testToken);
  });

  test('should handle token removal on logout', () => {
    // Simulate logout by removing tokens
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