import api from './api';

const UserService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch profile');
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
        console.log('Appending avatar file:', userData.avatar.name, userData.avatar.type);
      }
      
      // Log the FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
      
      const response = await api.patch('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error.response ? error.response.data : new Error('Failed to update profile');
    }
  },

  // Update user avatar only
  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      console.log('Updating avatar with file:', avatarFile.name, avatarFile.type, avatarFile.size);
      
      const response = await api.patch('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Avatar update error:', error);
      throw error.response ? error.response.data : new Error('Failed to update avatar');
    }
  },

  // Get a user by ID (Cashier+)
  getUser: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch user');
    }
  },

  // Get all users (Manager+)
  getUsers: async (params = {}) => {
    try {
      console.log('Fetching users with params:', params);
      
      // 确保params中的布尔值被正确传递
      const response = await api.get('/users', { 
        params,
        paramsSerializer: {
          serialize: (params) => {
            // 手动序列化参数
            const result = new URLSearchParams();
            
            Object.entries(params).forEach(([key, value]) => {
              // 确保布尔值正确转换为字符串
              if (value === true) {
                result.append(key, 'true');
              } else if (value === false) {
                result.append(key, 'false');
              } else if (value !== undefined && value !== null) {
                result.append(key, value);
              }
            });
            
            console.log('Serialized params:', result.toString());
            return result.toString();
          }
        }
      });
      
      console.log('Users API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response ? error.response.data : new Error('Failed to fetch users');
    }
  },

  // Create a new user (Cashier+)
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create user');
    }
  },

  // Update a user (Manager+)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update user');
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
      throw error.response ? error.response.data : new Error('Failed to transfer points');
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
      throw error.response ? error.response.data : new Error('Failed to create redemption');
    }
  },

  // Get user's transactions
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/users/me/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch transactions');
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
      
      // 从返回的结果中找到完全匹配 UTORid 的用户
      const exactMatch = response.data.results.find(
        user => user.utorid.toLowerCase() === utorid.toLowerCase()
      );
      
      return exactMatch || null;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to search user');
    }
  },
};

export default UserService; 