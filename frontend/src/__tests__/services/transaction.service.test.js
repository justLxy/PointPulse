/**
 * Transaction Service Tests
 * Tests the core business logic for transaction management including:
 * - Purchase transactions
 * - Adjustments
 * - Redemptions
 * - Transaction marking
 * - Transaction retrieval
 */

import api from '../../services/api';
import TransactionService from '../../services/transaction.service';

jest.mock('../../services/api');

describe('TransactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to prevent logging during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console mocks
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('Purchase Transactions', () => {
    const purchaseData = {
      utorid: 'testuser',
      spent: 25.99,
      promotionIds: [1, 2],
      remark: 'Test purchase'
    };

    test('successfully creates a purchase transaction', async () => {
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

    test('handles validation errors for purchases', async () => {
      const testCases = [
        {
          error: { response: { status: 400, data: { error: 'Cashier not found' } } },
          expectedMessage: 'Cashier account not found. Please ensure your user profile is set up correctly to process transactions.'
        },
        {
          error: { response: { status: 400, data: { message: 'Invalid amount' } } },
          expectedMessage: 'Invalid amount. Amount must be positive.'
        },
        {
          error: { response: { status: 400, data: { error: 'Promotion already used' } } },
          expectedMessage: 'One or more selected promotions have already been used by this customer.'
        },
        {
          error: { response: { status: 400, data: { error: 'Minimum spending not met' } } },
          expectedMessage: 'Minimum spending requirement not met for one or more selected promotions.'
        },
        {
          error: { response: { status: 400, data: { error: 'Generic error' } } },
          expectedMessage: 'Generic error'
        }
      ];

      for (const testCase of testCases) {
        api.post.mockRejectedValueOnce(testCase.error);
        await expect(TransactionService.createPurchase(purchaseData))
          .rejects.toThrow(testCase.expectedMessage);
      }
    });

    test('handles permission and not found errors for purchases', async () => {
      // Test permission error
      api.post.mockRejectedValueOnce({
        response: { status: 403, data: { message: 'Permission denied' } }
      });
      await expect(TransactionService.createPurchase(purchaseData))
        .rejects.toThrow('You do not have permission to create purchase transactions.');

      // Test not found error
      api.post.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'User not found' } }
      });
      await expect(TransactionService.createPurchase(purchaseData))
        .rejects.toThrow('User not found. Please verify the user information.');
    });
  });

  describe('Adjustment Transactions', () => {
    const adjustmentData = {
      utorid: 'testuser',
      amount: -50,
      relatedId: 123,
      remark: 'Adjustment for error'
    };

    test('successfully creates an adjustment transaction', async () => {
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

    test('handles validation errors for adjustments', async () => {
      api.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: 'Invalid adjustment data' }
        }
      });
      await expect(TransactionService.createAdjustment(adjustmentData))
        .rejects.toThrow('Invalid adjustment data');
    });

    test('handles permission and not found errors for adjustments', async () => {
      // Test permission error
      api.post.mockRejectedValueOnce({
        response: { status: 403, data: { message: 'Permission denied' } }
      });
      await expect(TransactionService.createAdjustment(adjustmentData))
        .rejects.toThrow('You do not have permission to create adjustment transactions.');

      // Test not found error
      api.post.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'User not found' } }
      });
      await expect(TransactionService.createAdjustment(adjustmentData))
        .rejects.toThrow('User not found. Please verify the user information.');
    });
  });

  describe('Redemption Processing', () => {
    test('successfully processes a redemption', async () => {
      const mockResponse = {
        data: {
          id: 125,
          utorid: 'testuser',
          type: 'redemption',
          processedBy: 'cashier01',
          redeemed: 1000,
          processed: true
        }
      };

      api.patch.mockResolvedValue(mockResponse);
      const result = await TransactionService.processRedemption(125);

      expect(api.patch).toHaveBeenCalledWith('/transactions/125/processed', {
        processed: true
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles validation errors for redemption processing', async () => {
      const testCases = [
        {
          error: { response: { status: 400, data: { error: 'Invalid transaction ID' } } },
          expectedMessage: 'Invalid transaction ID'
        },
        {
          error: { response: { status: 400, data: { error: 'No data provided' } } },
          expectedMessage: 'No data provided'
        },
        {
          error: { response: { status: 400, data: { error: 'Processed status must be true' } } },
          expectedMessage: 'Processed status must be true'
        },
        {
          error: { response: { status: 400, data: { error: 'Transaction is not a redemption' } } },
          expectedMessage: 'Transaction is not a redemption'
        },
        {
          error: { response: { status: 400, data: { error: 'Transaction has already been processed' } } },
          expectedMessage: 'This redemption has already been processed.'
        }
      ];

      for (const testCase of testCases) {
        api.patch.mockRejectedValueOnce(testCase.error);
        await expect(TransactionService.processRedemption(125))
          .rejects.toThrow(testCase.expectedMessage);
      }
    });

    test('handles permission and not found errors for redemption processing', async () => {
      // Test unauthorized error
      api.patch.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { error: 'Unauthorized to process redemptions' }
        }
      });
      await expect(TransactionService.processRedemption(125))
        .rejects.toThrow('You do not have permission to process redemptions.');

      // Test not found error
      api.patch.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { error: 'Transaction not found' }
        }
      });
      await expect(TransactionService.processRedemption(125))
        .rejects.toThrow('Redemption transaction not found.');
    });
  });

  describe('Suspicious Transaction Marking', () => {
    test('successfully marks a transaction as suspicious', async () => {
      const mockResponse = {
        data: {
          id: 123,
          suspicious: true,
          type: 'purchase',
          spent: 19.99
        }
      };

      api.patch.mockResolvedValue(mockResponse);
      const result = await TransactionService.markAsSuspicious(123, true);

      expect(api.patch).toHaveBeenCalledWith('/transactions/123/suspicious', {
        suspicious: true
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles validation errors for suspicious marking', async () => {
      api.patch.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: 'Invalid request' }
        }
      });
      await expect(TransactionService.markAsSuspicious(123, true))
        .rejects.toThrow('Invalid request');
    });

    test('handles permission and not found errors for suspicious marking', async () => {
      // Test permission error
      api.patch.mockRejectedValueOnce({
        response: { status: 403, data: { message: 'Permission denied' } }
      });
      await expect(TransactionService.markAsSuspicious(123, true))
        .rejects.toThrow('You do not have permission to mark transactions as suspicious.');

      // Test not found error
      api.patch.mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Not found' } }
      });
      await expect(TransactionService.markAsSuspicious(123, true))
        .rejects.toThrow('Transaction not found.');
    });
  });

  describe('Transaction Retrieval', () => {
    describe('getAllTransactions', () => {
      const mockResponse = {
        data: {
          count: 25,
          results: [
            { id: 123, type: 'purchase', utorid: 'user1' },
            { id: 124, type: 'redemption', utorid: 'user2' }
          ]
        }
      };

      test('successfully retrieves transactions with various params', async () => {
        api.get.mockResolvedValue(mockResponse);

        // Test with all types of parameters
        const params = {
          page: 1,
          limit: 10,
          type: 'purchase',
          suspicious: true,
          processed: false,
          search: 'test',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          relatedId: null,
          emptyField: '',
          undefinedField: undefined
        };

        const result = await TransactionService.getAllTransactions(params);

        expect(api.get).toHaveBeenCalledWith('/transactions', {
          params: expect.objectContaining({
            page: 1,
            limit: 10,
            type: 'purchase',
            suspicious: 'true',
            processed: 'false',
            search: 'test',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            relatedId: null
          }),
          paramsSerializer: expect.any(Function)
        });
        expect(result).toEqual(mockResponse.data);

        // Verify parameter serialization
        const serializer = api.get.mock.calls[0][1].paramsSerializer;
        const serializedParams = serializer({
          type: 'purchase',
          suspicious: true,
          relatedId: null
        });
        expect(serializedParams).toContain('type=purchase');
        expect(serializedParams).toContain('suspicious=true');
        expect(serializedParams).toContain('relatedId=null');
      });

      test('handles empty params', async () => {
        api.get.mockResolvedValue(mockResponse);
        await TransactionService.getAllTransactions();
        expect(api.get).toHaveBeenCalledWith('/transactions', {
          params: {},
          paramsSerializer: expect.any(Function)
        });
      });

      test('handles error responses', async () => {
        // Test permission error
        api.get.mockRejectedValueOnce({
          response: { status: 403, data: { message: 'Permission denied' } }
        });
        await expect(TransactionService.getAllTransactions())
          .rejects.toThrow('You do not have permission to view all transactions.');

        // Test invalid params error
        api.get.mockRejectedValueOnce({
          response: { status: 400, data: { message: 'Invalid parameters' } }
        });
        await expect(TransactionService.getAllTransactions({ invalid: true }))
          .rejects.toThrow('Invalid parameters');

        // Test network error
        api.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(TransactionService.getAllTransactions())
          .rejects.toThrow('Network error: Could not retrieve transactions. Please check your connection.');
      });

      test('logs debug information', async () => {
        api.get.mockResolvedValue(mockResponse);
        const params = { type: 'purchase', suspicious: true };
        
        await TransactionService.getAllTransactions(params);
        
        expect(console.log).toHaveBeenCalledWith('Fetching transactions with params:', params);
        expect(console.log).toHaveBeenCalledWith('Clean params for API:', expect.any(Object));
        expect(console.log).toHaveBeenCalledWith('Transaction response:', mockResponse.data);
      });

      test('logs errors', async () => {
        const error = new Error('Test error');
        api.get.mockRejectedValueOnce(error);
        
        await expect(TransactionService.getAllTransactions())
          .rejects.toThrow();
        
        expect(console.error).toHaveBeenCalledWith('Error fetching transactions:', error);
      });
    });

    describe('getTransaction', () => {
      test('successfully retrieves a single transaction', async () => {
        const mockResponse = {
          data: {
            id: 123,
            type: 'purchase',
            utorid: 'user1',
            spent: 19.99
          }
        };

        api.get.mockResolvedValue(mockResponse);
        const result = await TransactionService.getTransaction(123);

        expect(api.get).toHaveBeenCalledWith('/transactions/123');
        expect(result).toEqual(mockResponse.data);
      });

      test('handles error responses', async () => {
        // Test permission error
        api.get.mockRejectedValueOnce({
          response: { status: 403, data: { message: 'Permission denied' } }
        });
        await expect(TransactionService.getTransaction(123))
          .rejects.toThrow('You do not have permission to view this transaction.');

        // Test not found error
        api.get.mockRejectedValueOnce({
          response: { status: 404, data: { message: 'Not found' } }
        });
        await expect(TransactionService.getTransaction(123))
          .rejects.toThrow('Transaction not found.');

        // Test network error
        api.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(TransactionService.getTransaction(123))
          .rejects.toThrow('Network error: Could not connect to server');
      });
    });
  });

  describe('Network Error Handling', () => {
    test('handles network errors across all operations', async () => {
      const networkError = new Error('Network error');

      // Test purchase creation
      api.post.mockRejectedValueOnce(networkError);
      await expect(TransactionService.createPurchase({}))
        .rejects.toThrow('Network error: Could not connect to server');

      // Test adjustment creation
      api.post.mockRejectedValueOnce(networkError);
      await expect(TransactionService.createAdjustment({}))
        .rejects.toThrow('Network error: Could not connect to server');

      // Test redemption processing
      api.patch.mockRejectedValueOnce(networkError);
      await expect(TransactionService.processRedemption(123))
        .rejects.toThrow('Network error: Could not connect to server');

      // Test suspicious marking
      api.patch.mockRejectedValueOnce(networkError);
      await expect(TransactionService.markAsSuspicious(123, true))
        .rejects.toThrow('Network error: Could not connect to server');

      // Test transaction retrieval
      api.get.mockRejectedValueOnce(networkError);
      await expect(TransactionService.getTransaction(123))
        .rejects.toThrow('Network error: Could not connect to server');
    });
  });
}); 