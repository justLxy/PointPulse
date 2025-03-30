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
          if (data.message && data.message.includes('name')) {
            throw new Error('Invalid promotion name. Please provide a valid name.');
          }
          if (data.message && data.message.includes('rate')) {
            throw new Error('Invalid rate. Rate must be a positive number.');
          }
          if (data.message && data.message.includes('points')) {
            throw new Error('Invalid points. Points must be a positive number.');
          }
          if (data.message && data.message.includes('minSpending')) {
            throw new Error('Invalid minimum spending. It must be a positive number.');
          }
          if (data.message && data.message.includes('date')) {
            throw new Error('Invalid date. Please check the start and end dates.');
          }
          throw new Error(data.message || 'Invalid promotion data. Please check your inputs.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to create promotions.');
        }
        
        throw new Error(data.message || 'Failed to create promotion');
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
          throw new Error(data.message || 'Invalid search parameters. Please check your filters.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to view promotions.');
        }
        
        throw new Error(data.message || 'Failed to fetch promotions');
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
        
        if (status === 403) {
          throw new Error('You do not have permission to view this promotion.');
        }
        
        if (status === 404) {
          throw new Error('Promotion not found. It may have been deleted or expired.');
        }
        
        throw new Error(data.message || 'Failed to fetch promotion');
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
          if (data.message && data.message.includes('name')) {
            throw new Error('Invalid promotion name. Please provide a valid name.');
          }
          if (data.message && data.message.includes('rate')) {
            throw new Error('Invalid rate. Rate must be a positive number.');
          }
          if (data.message && data.message.includes('points')) {
            throw new Error('Invalid points. Points must be a positive number.');
          }
          if (data.message && data.message.includes('minSpending')) {
            throw new Error('Invalid minimum spending. It must be a positive number.');
          }
          if (data.message && data.message.includes('date')) {
            throw new Error('Invalid date. Please check the start and end dates.');
          }
          throw new Error(data.message || 'Invalid promotion data. Please check your inputs.');
        }
        
        if (status === 403) {
          throw new Error('You do not have permission to update this promotion.');
        }
        
        if (status === 404) {
          throw new Error('Promotion not found. It may have been deleted.');
        }
        
        if (status === 409) {
          throw new Error('Cannot update an active promotion that users have already used.');
        }
        
        throw new Error(data.message || 'Failed to update promotion');
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
        
        if (status === 403) {
          throw new Error('You do not have permission to delete promotions.');
        }
        
        if (status === 404) {
          throw new Error('Promotion not found. It may have already been deleted.');
        }
        
        if (status === 409) {
          throw new Error('Cannot delete an active promotion that users have already used.');
        }
        
        throw new Error(data.message || 'Failed to delete promotion');
      }
      
      throw new Error('Network error: Could not connect to server');
    }
  },
};

export default PromotionService; 