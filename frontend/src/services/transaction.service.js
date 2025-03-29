import api from './api';

const TransactionService = {
  // Create a purchase transaction (Cashier+)
  createPurchase: async (purchaseData) => {
    try {
      const response = await api.post('/transactions', {
        ...purchaseData,
        type: 'purchase',
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create purchase');
    }
  },

  // Create an adjustment transaction (Manager+)
  createAdjustment: async (adjustmentData) => {
    try {
      const response = await api.post('/transactions', {
        ...adjustmentData,
        type: 'adjustment',
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to create adjustment');
    }
  },

  // Process a redemption (Cashier+)
  processRedemption: async (transactionId) => {
    try {
      const response = await api.patch(`/transactions/${transactionId}/processed`, {
        processed: true,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to process redemption');
    }
  },

  // Mark a transaction as suspicious or not (Manager+)
  markAsSuspicious: async (transactionId, suspicious) => {
    try {
      const response = await api.patch(`/transactions/${transactionId}/suspicious`, {
        suspicious,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to update suspicious status');
    }
  },

  // Get all transactions (Manager+)
  getAllTransactions: async (params = {}) => {
    try {
      console.log('Fetching transactions with params:', params);
      
      const cleanParams = {};
      for (const [key, value] of Object.entries(params)) {
        // Allow relatedId=null to pass through
        if (key === 'relatedId' && value === null) {
           cleanParams[key] = null; // Keep null for serializer
        } else if (value === '' || value === null || value === undefined) {
          continue; // Skip other null/undefined/empty values
        } else if (typeof value === 'boolean') {
          cleanParams[key] = value.toString(); // Keep boolean conversion
        } else {
          cleanParams[key] = value; // Keep other values
        }
      }
      
      console.log('Clean params for API:', cleanParams);
      
      const response = await api.get('/transactions', { 
        params: cleanParams,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => {
              // Explicitly handle null for relatedId by sending key=null
              if (key === 'relatedId' && value === null) {
                return `${encodeURIComponent(key)}=null`; 
              }
              // Handle boolean serialization
              if (typeof value === 'boolean') {
                return `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`;
              }
              // Standard serialization for other types (excluding nulls not handled above)
              if (value !== null && value !== undefined) {
                 return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
              }
              return ''; // Skip other null/undefined values if they somehow got here
            })
            .filter(p => p !== '') // Remove empty parameters
            .join('&');
        }
      });
      
      console.log('Transaction response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error.response ? error.response.data : new Error('Failed to fetch transactions');
    }
  },

  // Get a specific transaction (Manager+)
  getTransaction: async (transactionId) => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch transaction');
    }
  },
};

export default TransactionService; 