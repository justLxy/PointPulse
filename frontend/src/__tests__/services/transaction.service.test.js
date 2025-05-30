/**
 * Core User Flow: Transaction business logic
 * Validates purchase creation, redemption processing, and transaction management workflows
 */

import api from '../../services/api';
import TransactionService from '../../services/transaction.service';

jest.mock('../../services/api');

describe('TransactionService - Transaction Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete purchase workflow: create → verify → handle errors', async () => {
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

    // Successful purchase creation
    api.post.mockResolvedValue(mockResponse);
    const result = await TransactionService.createPurchase(purchaseData);

    expect(api.post).toHaveBeenCalledWith('/transactions', {
      ...purchaseData,
      type: 'purchase'
    });
    expect(result).toEqual(mockResponse.data);

    // Handle common business errors
    const promotionError = { response: { status: 400, data: { error: 'Promotion already used by this customer' } } };
    api.post.mockRejectedValue(promotionError);
    
    await expect(TransactionService.createPurchase(purchaseData))
      .rejects.toThrow('One or more selected promotions have already been used by this customer.');

    // User validation error
    const userError = { response: { status: 404, data: { error: 'User not found' } } };
    api.post.mockRejectedValue(userError);
    
    await expect(TransactionService.createPurchase(purchaseData))
      .rejects.toThrow('User not found. Please verify the user information.');
  });

  test('redemption processing and validation flow', async () => {
    const mockRedemptionResponse = {
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

    // Successful redemption processing
    api.patch.mockResolvedValue(mockRedemptionResponse);
    const result = await TransactionService.processRedemption(125);

    expect(api.patch).toHaveBeenCalledWith('/transactions/125/processed', {
      processed: true
    });
    expect(result).toEqual(mockRedemptionResponse.data);

    // Handle already processed redemption
    const processedError = { response: { status: 400, data: { error: 'Transaction has already been processed' } } };
    api.patch.mockRejectedValue(processedError);
    
    await expect(TransactionService.processRedemption(125))
      .rejects.toThrow('This redemption has already been processed.');

    // Handle non-redemption transaction
    const typeError = { response: { status: 400, data: { error: 'Transaction is not a redemption' } } };
    api.patch.mockRejectedValue(typeError);
    
    await expect(TransactionService.processRedemption(123))
      .rejects.toThrow('Transaction is not a redemption');
  });

  test('transaction management and adjustment workflows', async () => {
    // Create adjustment transaction
    const adjustmentData = {
      utorid: 'testuser',
      amount: -50,
      relatedId: 123,
      remark: 'Adjustment for error'
    };

    const adjustmentResponse = {
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

    api.post.mockResolvedValue(adjustmentResponse);
    const adjustResult = await TransactionService.createAdjustment(adjustmentData);

    expect(api.post).toHaveBeenCalledWith('/transactions', {
      ...adjustmentData,
      type: 'adjustment'
    });
    expect(adjustResult).toEqual(adjustmentResponse.data);

    // Mark transaction as suspicious
    const suspiciousResponse = {
      data: { id: 123, utorid: 'testuser', type: 'purchase', suspicious: true, spent: 19.99, amount: 80 }
    };

    api.patch.mockResolvedValue(suspiciousResponse);
    const suspiciousResult = await TransactionService.markAsSuspicious(123, true);

    expect(api.patch).toHaveBeenCalledWith('/transactions/123/suspicious', {
      suspicious: true
    });
    expect(suspiciousResult).toEqual(suspiciousResponse.data);
  });

  test('transaction listing with filtering and parameter management', async () => {
    const mockTransactionsResponse = {
      data: {
        count: 25,
        results: [
          { id: 123, type: 'purchase', utorid: 'user1' },
          { id: 124, type: 'redemption', utorid: 'user2' }
        ]
      }
    };

    api.get.mockResolvedValue(mockTransactionsResponse);

    // Test parameter filtering - should remove empty values
    const params = {
      page: 1,
      limit: 10,
      type: 'purchase',
      name: 'test',
      emptyField: '',
      nullField: null
    };

    const result = await TransactionService.getAllTransactions(params);

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
    expect(result).toEqual(mockTransactionsResponse.data);

    // Test special case where relatedId null should be preserved
    const specialParams = { type: 'transfer', relatedId: null };
    await TransactionService.getAllTransactions(specialParams);

    expect(api.get).toHaveBeenCalledWith('/transactions', {
      params: { type: 'transfer', relatedId: null },
      paramsSerializer: expect.any(Function)
    });
  });

  test('handles system errors and permissions across operations', async () => {
    // Permission errors
    const permissionError = { response: { status: 403, data: { message: 'Manager role required' } } };
    
    api.post.mockRejectedValue(permissionError);
    await expect(TransactionService.createAdjustment({ utorid: 'user', amount: -10 }))
      .rejects.toThrow('You do not have permission to create adjustment transactions.');

    api.patch.mockRejectedValue(permissionError);
    await expect(TransactionService.markAsSuspicious(123, true))
      .rejects.toThrow('You do not have permission to mark transactions as suspicious.');

    // Network errors
    const networkError = { request: {} };
    api.post.mockRejectedValue(networkError);
    
    await expect(TransactionService.createPurchase({ utorid: 'user', spent: 10 }))
      .rejects.toThrow('Network error: Could not connect to server');
  });
}); 