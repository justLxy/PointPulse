import api from './api';

const PromotionService = {
  // Create a promotion (Manager+)
  createPromotion: async (promotionData) => {
    try {
      const response = await api.post('/promotions', promotionData);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          // 检查缺少必填字段的错误
          if (data.error && data.error.includes('required')) {
            const field = data.error.split(' is required')[0];
            throw new Error(`${field} is required`);
          }
          
          // 检查特定字段的错误
          if (data.error && data.error.includes('Type must be')) {
            throw new Error('Type must be either "automatic" or "one-time"');
          }
          
          if (data.error && data.error.includes('Either rate or points must be specified')) {
            throw new Error('Either rate or points must be specified');
          }
          
          // 检查数据验证错误
          if (data.error && data.error.includes('must be')) {
            throw new Error(data.error);
          }
          
          throw new Error(data.error || 'Invalid promotion data. Please check your inputs.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to create promotions.');
        }
        
        throw new Error(data.error || 'Failed to create promotion');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Get all promotions (Regular+ - only active ones for regular users)
  getPromotions: async (params = {}) => {
    try {
      const response = await api.get('/promotions', { params });
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Page number must be')) {
            throw new Error('Invalid page number. Page number must be a positive integer.');
          }
          
          if (data.error && data.error.includes('Limit must be')) {
            throw new Error('Invalid limit. Limit must be a positive integer.');
          }
          
          if (data.error && data.error.includes('Cannot specify both')) {
            throw new Error('Cannot specify both started and ended filters.');
          }
          
          throw new Error(data.error || 'Invalid search parameters. Please check your filters.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to view promotions.');
        }
        
        throw new Error(data.error || 'Failed to fetch promotions');
      }
      
      throw new Error('Network error: Could not retrieve promotions. Please check your connection.');
    }
  },

  // Get a specific promotion (Regular+)
  getPromotion: async (promotionId) => {
    try {
      const response = await api.get(`/promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid promotion ID')) {
            throw new Error('Invalid promotion ID');
          }
          
          throw new Error(data.error || 'Invalid request');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to view this promotion.');
        }
        
        if (status === 404) {
          throw new Error('Promotion not found.');
        }
        
        throw new Error(data.error || 'Failed to fetch promotion');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Update a promotion (Manager+)
  updatePromotion: async (promotionId, promotionData) => {
    try {
      const response = await api.patch(`/promotions/${promotionId}`, promotionData);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid promotion ID')) {
            throw new Error('Invalid promotion ID');
          }
          
          if (data.error && data.error.includes('No fields provided for update')) {
            throw new Error('No fields provided for update');
          }
          
          if (data.error && data.error.includes('Cannot update a promotion that has already started')) {
            throw new Error('Cannot update a promotion that has already started');
          }
          
          // 检查数据验证错误
          if (data.error && data.error.includes('must be')) {
            throw new Error(data.error);
          }
          
          throw new Error(data.error || 'Invalid promotion data. Please check your inputs.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to update this promotion.');
        }
        
        if (status === 404) {
          throw new Error('Promotion not found.');
        }
        
        throw new Error(data.error || 'Failed to update promotion');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },

  // Delete a promotion (Manager+)
  deletePromotion: async (promotionId) => {
    try {
      const response = await api.delete(`/promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.error && data.error.includes('Invalid promotion ID')) {
            throw new Error('Invalid promotion ID');
          }
          
          throw new Error(data.error || 'Invalid request');
        }
        
        if (status === 403) {
          if (data.error && data.error.includes('Cannot delete a promotion that has already started')) {
            throw new Error('Cannot delete a promotion that has already started');
          }
          
          throw new Error('You do not have permission to delete promotions.');
        }
        
        if (status === 404) {
          throw new Error('Promotion not found.');
        }
        
        throw new Error(data.error || 'Failed to delete promotion');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },
};

export default PromotionService; 