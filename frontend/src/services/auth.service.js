import api from './api';

const AuthService = {
  login: async (utorid, password) => {
    try {
      const response = await api.post('/auth/tokens', { utorid, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('tokenExpiry', response.data.expiresAt);
      }
      return response.data;
    } catch (error) {
      
      // Provide more specific error messages
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        // Provide more specific error messages based on status code
        if (status === 401) {
          throw new Error('Invalid username or password. Please try again.');
        } else if (status === 403) {
          throw new Error('Your account is not authorized to access this system.');
        } else if (status === 404) {
          throw new Error('User not found. Please check your UTORid.');
        } else if (status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else if (status >= 500) {
          throw new Error('Server error. Our team has been notified.');
        } else if (data && data.message) {
          throw new Error(data.message);
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message) {
        throw new Error(error.message);
      }
      
      // Default error message
      throw new Error('Login failed. Please try again later.');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('activeRole');
  },

  requestPasswordReset: async (utorid) => {
    try {
      const response = await api.post('/auth/resets', { utorid });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error('Invalid UTORid format. Please check your UTORid and try again.');
        }
        
        if (status === 404) {
          throw new Error('User not found. Please verify your UTORid.');
        }
        
        if (status === 429) {
          throw new Error('Too many reset requests. Please wait before trying again.');
        }
        
        throw new Error(data.message || 'Password reset request failed');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  resetPassword: async (resetToken, utorid, password) => {
    try {
      const response = await api.post(`/auth/resets/${resetToken}`, {
        utorid,
        password,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('password')) {
            throw new Error('Invalid password. Password must be at least 8 characters long and contain letters and numbers.');
          }
          throw new Error(data.message || 'Invalid reset request. Please check your information.');
        }
        
        if (status === 404) {
          throw new Error('Invalid or expired reset token. Please request a new password reset.');
        }
        
        if (status === 410) {
          throw new Error('This reset token has expired. Please request a new password reset.');
        }
        
        throw new Error(data.message || 'Password reset failed');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  getCurrentUser: async (forceRefresh = false) => {
    try {
      // First try to get user from localStorage unless we're forcing a refresh
      const cachedUser = localStorage.getItem('user');
      
      if (cachedUser && !forceRefresh) {
        const user = JSON.parse(cachedUser);
        return user;
      }
      
      // If not in localStorage or forceRefresh is true, fetch from API
      const response = await api.get('/users/me');
      
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      } else {
        throw new Error('Empty user data received');
      }
    } catch (error) {
      localStorage.removeItem('user'); // Clear cached user data if API call fails
      throw error.response ? error.response.data : new Error('Failed to get user');
    }
  },

  updatePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.patch('/users/me/password', {
        old: oldPassword,
        new: newPassword,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('password requirements')) {
            throw new Error('New password does not meet security requirements. Password must be at least 8 characters long and contain letters and numbers.');
          }
          throw new Error(data.message || 'Invalid password change request.');
        }
        
        if (status === 401) {
          throw new Error('Your current password is incorrect. Please enter the correct password.');
        }
        
        if (status === 409) {
          throw new Error('New password cannot be the same as your current password.');
        }
        
        throw new Error(data.message || 'Password update failed');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  isTokenValid: (token) => {
    // Basic format validation - tokens should be non-empty strings
    // JWT tokens typically have three parts separated by dots
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    const parts = token.split('.');
    return parts.length === 3;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');
    const user = localStorage.getItem('user');
    
    if (!token || !expiry) {
      return false;
    }
    
    // Validate token format
    if (!AuthService.isTokenValid(token)) {
      return false;
    }
    
    // Check if token is expired
    const expiryDate = new Date(expiry);
    const now = new Date();
    
    const isValid = now < expiryDate;
    
    return isValid;
  },

  getRole: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || null;
  },
};

export default AuthService; 