import api from './api';

const UserService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        
        throw new Error(data.message || 'Failed to fetch profile');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Update current user profile
  updateProfile: async (userData) => {
    try {
      const formData = new FormData();
      
      // Add fields to formData
      if (userData.name) formData.append('name', userData.name);
      if (userData.email) formData.append('email', userData.email);
      if (userData.birthday) formData.append('birthday', userData.birthday);
      
      // Handle avatar file specifically
      if (userData.avatar && userData.avatar instanceof File) {
        formData.append('avatar', userData.avatar);
      }
      
      const response = await api.patch('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('email')) {
            throw new Error('Invalid email format. Please check your email address.');
          }
          if (data.message && data.message.includes('name')) {
            throw new Error('Name is required.');
          }
          if (data.message && data.message.includes('birthday')) {
            throw new Error('Invalid date format for birthday.');
          }
          if (data.message && data.message.includes('avatar')) {
            throw new Error('Invalid avatar file. Please upload a valid image file (JPG, PNG, or GIF).');
          }
          throw new Error(data.message || 'Invalid profile data. Please check your inputs.');
        }
        
        if (status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        
        if (status === 413) {
          throw new Error('Avatar file is too large. Please upload a smaller image (max 50MB).');
        }
        
        throw new Error(data.message || 'Failed to update profile');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Update user avatar only
  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await api.patch('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data.message || 'Invalid avatar file format. Please upload a valid image file.');
        }
        
        if (status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        
        if (status === 413) {
          throw new Error('Avatar file is too large. Please upload a smaller image (max 50MB).');
        }
        
        throw new Error(data.message || 'Failed to update avatar');
      }
      
      throw new Error('Network error: Could not upload avatar. Please check your connection.');
    }
  },

  // Get a user by ID (Cashier+)
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 403) {
          throw new Error('You do not have permission to view this user\'s details.');
        }
        
        if (status === 404) {
          throw new Error('User not found. The user may have been deleted or deactivated.');
        }
        
        throw new Error(data.message || 'Failed to fetch user');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Get all users (Manager+)
  getUsers: async (params = {}) => {
    try {
      // Ensure boolean values in params are correctly passed
      const response = await api.get('/users', { 
        params,
        paramsSerializer: {
          serialize: (params) => {
            // Manually serialize parameters
            const result = new URLSearchParams();
            
            Object.entries(params).forEach(([key, value]) => {
              // Ensure boolean values are correctly converted to strings
              if (value === true) {
                result.append(key, 'true');
              } else if (value === false) {
                result.append(key, 'false');
              } else if (value !== undefined && value !== null) {
                result.append(key, value);
              }
            });
            
            return result.toString();
          }
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data.message || 'Invalid search parameters. Please check your filters.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to view the user list.');
        }
        
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      throw new Error('Network error: Could not retrieve users. Please check your connection.');
    }
  },

  // Create a new user (Cashier+)
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('utorid')) {
            throw new Error('Invalid or duplicate UTORid. Each user must have a unique UTORid.');
          }
          if (data.message && data.message.includes('email')) {
            throw new Error('Invalid email format. Please enter a valid email address.');
          }
          if (data.message && data.message.includes('name')) {
            throw new Error('Name is required.');
          }
          throw new Error(data.message || 'Invalid user data. Please check all required fields.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to create new users.');
        }
        
        if (status === 409) {
          throw new Error('A user with this UTORid already exists.');
        }
        
        throw new Error(data.message || 'Failed to create user');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Update a user (Manager+)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('role')) {
            throw new Error('Invalid role. Please select a valid role for the user.');
          }
          throw new Error(data.message || 'Invalid user data. Please check your inputs.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to update this user.');
        }
        
        if (status === 404) {
          throw new Error('User not found. The user may have been deleted.');
        }
        
        throw new Error(data.message || 'Failed to update user');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Transfer points to another user
  transferPoints: async (userId, amount, remark = '') => {
    try {
      const response = await api.post(`/users/${userId}/transactions`, {
        type: 'transfer',
        amount,
        remark,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message && data.message.includes('amount')) {
            throw new Error('Invalid amount. Please enter a positive number within your available balance.');
          }
          if (data.message && data.message.includes('balance')) {
            throw new Error('Insufficient points. You do not have enough points to complete this transfer.');
          }
          throw new Error(data.message || 'Invalid transfer request. Please check your inputs.');
        }
        
        if (status === 403) {
          throw new Error('You are not authorized to transfer points.');
        }
        
        if (status === 404) {
          throw new Error('Recipient not found. Please verify the user information.');
        }
        
        if (status === 409) {
          throw new Error('You cannot transfer points to yourself.');
        }
        
        throw new Error(data.message || 'Failed to transfer points');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Create a redemption request
  createRedemption: async (amount, remark = '') => {
    try {
      const response = await api.post('/users/me/transactions', {
        type: 'redemption',
        amount,
        remark,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error === 'No transaction data provided') {
            throw new Error('No transaction data provided');
          }
          
          if (data.error === 'Transaction type must be "redemption"') {
            throw new Error('Transaction type must be "redemption"');
          }
          
          if (data.error === 'Amount must be a positive number') {
            throw new Error('Amount must be a positive number');
          }
          
          if (data.error === 'Insufficient points') {
            throw new Error('Insufficient points. You do not have enough points for this redemption.');
          }
          
          throw new Error(data.error || 'Invalid redemption request. Please check your inputs.');
        }
        
        if (status === 403) {
          if (data.error === 'User is not verified') {
            throw new Error('You must be verified to create redemption requests.');
          }
          
          throw new Error(data.error || 'You are not authorized to create redemption requests.');
        }
        
        if (status === 404) {
          if (data.error === 'User not found') {
            throw new Error('User account not found or has been deactivated.');
          }
          
          throw new Error(data.error || 'Failed to create redemption');
        }
        
        throw new Error(data.error || 'Failed to create redemption');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Get user's transactions
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/users/me/transactions', { params });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data.message || 'Invalid search parameters. Please check your filters.');
        }
        
        if (status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        
        throw new Error(data.message || 'Failed to fetch transactions');
      }
      
      throw new Error('Network error: Could not retrieve transactions. Please check your connection.');
    }
  },

  // Search for a user by UTORid
  searchUserByUTORid: async (utorid) => {
    try {
      const response = await api.get('/users', { 
        params: { name: utorid },
        paramsSerializer: {
          serialize: (params) => {
            const result = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                result.append(key, value);
              }
            });
            return result.toString();
          }
        }
      });
      
      // Find the user that exactly matches the UTORid from the returned results
      const exactMatch = response.data.results.find(
        user => user.utorid.toLowerCase() === utorid.toLowerCase()
      );
      
      return exactMatch || null;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error(data.message || 'Invalid search parameters.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to search for users.');
        }
        
        throw new Error(data.message || 'Failed to search user');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Lookup a user by UTORid (for cashiers)
  lookupUserByUTORid: async (utorid) => {
    try {
      const response = await api.get(`/users/lookup/${utorid}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          throw new Error('User not found. Please check the UTORid and try again.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to lookup users.');
        }
        
        throw new Error(data.error || 'Failed to lookup user');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Get user's pending redemptions total
  getPendingRedemptionsTotal: async () => {
    try {
      const response = await api.get('/users/me/pending-redemptions');
      return response.data.pendingTotal;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        throw new Error(data.error || 'Failed to get pending redemptions total');
      }
      throw error;
    }
  },
};

export default UserService; 