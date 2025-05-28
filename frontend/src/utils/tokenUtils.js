/**
 * Token Utilities
 * Helper functions for JWT token management and validation
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get the token expiry time from localStorage
 * @returns {string|null} The token expiry time or null if not found
 */
export const getTokenExpiry = () => {
  return localStorage.getItem('tokenExpiry');
};

/**
 * Check if the current token is valid (exists and not expired)
 * @returns {boolean} True if token is valid, false otherwise
 */
export const isTokenValid = () => {
  const token = getToken();
  const expiry = getTokenExpiry();
  
  if (!token || !expiry) {
    return false;
  }
  
  const expiryDate = new Date(expiry);
  const now = new Date();
  
  return expiryDate > now;
};

/**
 * Clear all authentication-related data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('user');
  localStorage.removeItem('activeRole');
};

/**
 * Store authentication data in localStorage
 * @param {string} token - The JWT token
 * @param {string} expiry - The token expiry time
 * @param {object} user - The user data (optional)
 */
export const setAuthData = (token, expiry, user = null) => {
  localStorage.setItem('token', token);
  localStorage.setItem('tokenExpiry', expiry);
  
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}; 