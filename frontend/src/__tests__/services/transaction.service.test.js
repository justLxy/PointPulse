/**
 * TransactionService Tests
 * Purpose: Test critical transaction business logic including purchase creation,
 * redemption processing, transaction adjustments, and error handling
 */

import api from '../../services/api';
import TransactionService from '../../services/transaction.service';

// Mock the api module
jest.mock('../../services/api');

describe('TransactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPurchase', () => {
    test('should successfully create a purchase transaction', async () => {
      const purchaseData = {
        utorid: 'testuser',
        spent: 25.99,
        promotionIds: [1, 2],
        remark: 'Test purchase'
      };

      const mockResponse = {
        data: {
          id: 123,
          utorid: 'testuser',
          type: 'purchase',
          spent: 25.99,
          earned: 104,
          promotionIds: [1, 2],
          remark: 'Test purchase',
          createdBy: 'cashier01'
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await TransactionService.createPurchase(purchaseData);

      expect(api.post).toHaveBeenCalledWith('/transactions', {
        ...purchaseData,
        type: 'purchase'
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle promotion already used error', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Promotion already used by this customer' }
        }
      };
      api.post.mockRejectedValue(error);

      await expect(TransactionService.createPurchase({ utorid: 'user', spent: 10 }))
        .rejects.toThrow('One or more selected promotions have already been used by this customer.');
    });

    test('should handle minimum spending not met error', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Minimum spending not met for promotion' }
        }
      };
      api.post.mockRejectedValue(error);

      await expect(TransactionService.createPurchase({ utorid: 'user', spent: 5 }))
        .rejects.toThrow('Minimum spending requirement not met for one or more selected promotions.');
    });

    test('should handle user not found error', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'User not found' }
        }
      };
      api.post.mockRejectedValue(error);

      await expect(TransactionService.createPurchase({ utorid: 'invalid', spent: 10 }))
        .rejects.toThrow('User not found. Please verify the user information.');
    });

    test('should handle insufficient permissions', async () => {
      const error = {
        response: {
          status: 403,
          data: { error: 'Forbidden' }
        }
      };
      api.post.mockRejectedValue(error);

      await expect(TransactionService.createPurchase({ utorid: 'user', spent: 10 }))
        .rejects.toThrow('You do not have permission to create purchase transactions.');
    });
  });

  describe('createAdjustment', () => {
    test('should successfully create an adjustment transaction', async () => {
      const adjustmentData = {
        utorid: 'testuser',
        amount: -50,
        relatedId: 123,
        remark: 'Adjustment for error'
      };

      const mockResponse = {
        data: {
          id: 124,
          utorid: 'testuser',
          type: 'adjustment',
          amount: -50,
          relatedId: 123,
          remark: 'Adjustment for error',
          createdBy: 'manager01'
        }
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await TransactionService.createAdjustment(adjustmentData);

      expect(api.post).toHaveBeenCalledWith('/transactions', {
        ...adjustmentData,
        type: 'adjustment'
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle insufficient manager permissions', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Manager role required' }
        }
      };
      api.post.mockRejectedValue(error);

      await expect(TransactionService.createAdjustment({ utorid: 'user', amount: -10 }))
        .rejects.toThrow('You do not have permission to create adjustment transactions.');
    });
  });

  describe('processRedemption', () => {
    test('should successfully process a redemption', async () => {
      const mockResponse = {
        data: {
          id: 125,
          utorid: 'testuser',
          type: 'redemption',
          processedBy: 'cashier01',
          redeemed: 1000,
          remark: '',
          createdBy: 'testuser'
        }
      };

      api.patch.mockResolvedValue(mockResponse);

      const result = await TransactionService.processRedemption(125);

      expect(api.patch).toHaveBeenCalledWith('/transactions/125/processed', {
        processed: true
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle already processed redemption', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Transaction has already been processed' }
        }
      };
      api.patch.mockRejectedValue(error);

      await expect(TransactionService.processRedemption(125))
        .rejects.toThrow('This redemption has already been processed.');
    });

    test('should handle non-redemption transaction', async () => {
      const error = {
        response: {
          status: 400,
          data: { error: 'Transaction is not a redemption' }
        }
      };
      api.patch.mockRejectedValue(error);

      await expect(TransactionService.processRedemption(123))
        .rejects.toThrow('Transaction is not a redemption');
    });

    test('should handle transaction not found', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'Transaction not found' }
        }
      };
      api.patch.mockRejectedValue(error);

      await expect(TransactionService.processRedemption(999))
        .rejects.toThrow('Redemption transaction not found.');
    });
  });

  describe('markAsSuspicious', () => {
    test('should successfully mark transaction as suspicious', async () => {
      const mockResponse = {
        data: {
          id: 123,
          utorid: 'testuser',
          type: 'purchase',
          suspicious: true,
          spent: 19.99,
          amount: 80
        }
      };

      api.patch.mockResolvedValue(mockResponse);

      const result = await TransactionService.markAsSuspicious(123, true);

      expect(api.patch).toHaveBeenCalledWith('/transactions/123/suspicious', {
        suspicious: true
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should successfully clear suspicious flag', async () => {
      const mockResponse = {
        data: {
          id: 123,
          utorid: 'testuser',
          suspicious: false
        }
      };

      api.patch.mockResolvedValue(mockResponse);

      const result = await TransactionService.markAsSuspicious(123, false);

      expect(api.patch).toHaveBeenCalledWith('/transactions/123/suspicious', {
        suspicious: false
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle insufficient permissions for suspicious marking', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Manager role required' }
        }
      };
      api.patch.mockRejectedValue(error);

      await expect(TransactionService.markAsSuspicious(123, true))
        .rejects.toThrow('You do not have permission to mark transactions as suspicious.');
    });
  });

  describe('getAllTransactions', () => {
    test('should fetch transactions with clean parameters', async () => {
      const mockResponse = {
        data: {
          count: 25,
          results: [
            { id: 123, type: 'purchase', utorid: 'user1' },
            { id: 124, type: 'redemption', utorid: 'user2' }
          ]
        }
      };

      api.get.mockResolvedValue(mockResponse);

      const params = {
        page: 1,
        limit: 10,
        type: 'purchase',
        name: 'test',
        emptyField: '',
        nullField: null
      };

      const result = await TransactionService.getAllTransactions(params);

      // Should call API with only non-empty parameters
      expect(api.get).toHaveBeenCalledWith('/transactions', {
        params: {
          page: 1,
          limit: 10,
          type: 'purchase',
          name: 'test'
          // emptyField and nullField should be filtered out
        },
        paramsSerializer: expect.any(Function)
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle special relatedId null parameter', async () => {
      const mockResponse = { data: { count: 0, results: [] } };
      api.get.mockResolvedValue(mockResponse);

      const params = {
        type: 'transfer',
        relatedId: null // Special case that should be preserved
      };

      await TransactionService.getAllTransactions(params);

      expect(api.get).toHaveBeenCalledWith('/transactions', {
        params: {
          type: 'transfer',
          relatedId: null
        },
        paramsSerializer: expect.any(Function)
      });
    });

    test('should handle API errors gracefully', async () => {
      const error = {
        response: {
          status: 403,
          data: { error: 'Insufficient permissions' }
        }
      };
      api.get.mockRejectedValue(error);

      await expect(TransactionService.getAllTransactions())
        .rejects.toThrow('You do not have permission to view all transactions.');
    });
  });

  describe('Network Error Handling', () => {
    test('should handle network errors across all methods', async () => {
      const networkError = { request: {} };
      
      api.post.mockRejectedValue(networkError);
      api.patch.mockRejectedValue(networkError);
      api.get.mockRejectedValue(networkError);

      await expect(TransactionService.createPurchase({ utorid: 'user', spent: 10 }))
        .rejects.toThrow('Network error: Could not connect to server');

      await expect(TransactionService.processRedemption(123))
        .rejects.toThrow('Network error: Could not connect to server');

      await expect(TransactionService.markAsSuspicious(123, true))
        .rejects.toThrow('Network error: Could not connect to server');
    });
  });
}); 