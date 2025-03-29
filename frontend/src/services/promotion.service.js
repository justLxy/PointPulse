import api from './api';

const PromotionService = {
  // Create a promotion (Manager+)
  createPromotion: async (promotionData) => {
    try {
      const response = await api.post('/promotions', promotionData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create promotion');
    }
  },

  // Get all promotions (Regular+ - only active ones for regular users)
  getPromotions: async (params = {}) => {
    try {
      const response = await api.get('/promotions', { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch promotions');
    }
  },

  // Get a specific promotion (Regular+)
  getPromotion: async (promotionId) => {
    try {
      const response = await api.get(`/promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch promotion');
    }
  },

  // Update a promotion (Manager+)
  updatePromotion: async (promotionId, promotionData) => {
    try {
      const response = await api.patch(`/promotions/${promotionId}`, promotionData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update promotion');
    }
  },

  // Delete a promotion (Manager+)
  deletePromotion: async (promotionId) => {
    try {
      const response = await api.delete(`/promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to delete promotion');
    }
  },
};

export default PromotionService; 