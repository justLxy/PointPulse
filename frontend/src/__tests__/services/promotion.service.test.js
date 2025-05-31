/**
 * Core Promotion Flow: Promotion management business logic
 * Validates promotion creation, retrieval, update, and deletion workflows
 */

import api from '../../services/api';
import PromotionService from '../../services/promotion.service';

jest.mock('../../services/api');

describe('PromotionService - Promotion Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('promotion lifecycle: create → get → update → delete', async () => {
    // Test promotion creation
    const promotionData = {
      type: 'automatic',
      name: 'Test Promotion',
      description: 'Test Description',
      startTime: '2024-03-20T10:00:00Z',
      endTime: '2024-03-20T12:00:00Z',
      rate: 2.0
    };

    const mockCreateResponse = {
      data: {
        id: 1,
        ...promotionData,
        createdBy: 'manager1'
      }
    };

    api.post.mockResolvedValue(mockCreateResponse);
    const createResult = await PromotionService.createPromotion(promotionData);
    expect(api.post).toHaveBeenCalledWith('/promotions', promotionData);
    expect(createResult).toEqual(mockCreateResponse.data);

    // Test get single promotion
    api.get.mockResolvedValue(mockCreateResponse);
    const getResult = await PromotionService.getPromotion(1);
    expect(api.get).toHaveBeenCalledWith('/promotions/1');
    expect(getResult).toEqual(mockCreateResponse.data);

    // Test promotion update
    const updateData = {
      name: 'Updated Promotion',
      rate: 2.5
    };
    const mockUpdateResponse = {
      data: {
        ...mockCreateResponse.data,
        ...updateData
      }
    };
    api.patch.mockResolvedValue(mockUpdateResponse);
    const updateResult = await PromotionService.updatePromotion(1, updateData);
    expect(api.patch).toHaveBeenCalledWith('/promotions/1', updateData);
    expect(updateResult).toEqual(mockUpdateResponse.data);

    // Test promotion deletion
    const mockDeleteResponse = {
      data: { message: 'Promotion deleted successfully' }
    };
    api.delete.mockResolvedValue(mockDeleteResponse);
    const deleteResult = await PromotionService.deletePromotion(1);
    expect(api.delete).toHaveBeenCalledWith('/promotions/1');
    expect(deleteResult).toEqual(mockDeleteResponse.data);
  });

  test('promotion listing with filters', async () => {
    const mockPromotionsResponse = {
      data: {
        count: 2,
        results: [
          { id: 1, type: 'automatic', name: 'Promo 1', rate: 2.0 },
          { id: 2, type: 'one-time', name: 'Promo 2', points: 100 }
        ]
      }
    };

    api.get.mockResolvedValue(mockPromotionsResponse);
    const params = { page: 1, limit: 10, type: 'automatic' };
    const listResult = await PromotionService.getPromotions(params);
    expect(api.get).toHaveBeenCalledWith('/promotions', { params });
    expect(listResult).toEqual(mockPromotionsResponse.data);
  });

  test('validation and error handling', async () => {
    // Test missing required field
    api.post.mockRejectedValue({
      response: {
        status: 400,
        data: { error: 'name is required' }
      }
    });
    await expect(PromotionService.createPromotion({}))
      .rejects.toThrow('name is required');

    // Test invalid promotion type
    api.post.mockRejectedValue({
      response: {
        status: 400,
        data: { error: 'Type must be either "automatic" or "one-time"' }
      }
    });
    await expect(PromotionService.createPromotion({ type: 'invalid' }))
      .rejects.toThrow('Type must be either "automatic" or "one-time"');

    // Test permission error
    api.post.mockRejectedValue({
      response: {
        status: 403,
        data: { error: 'Permission denied' }
      }
    });
    await expect(PromotionService.createPromotion({}))
      .rejects.toThrow('You do not have permission to create promotions');

    // Test promotion not found
    api.get.mockRejectedValue({
      response: {
        status: 404,
        data: { error: 'Promotion not found' }
      }
    });
    await expect(PromotionService.getPromotion(999))
      .rejects.toThrow('Promotion not found');

    // Test update started promotion
    api.patch.mockRejectedValue({
      response: {
        status: 400,
        data: { error: 'Cannot update a promotion that has already started' }
      }
    });
    await expect(PromotionService.updatePromotion(1, {}))
      .rejects.toThrow('Cannot update a promotion that has already started');

    // Test delete started promotion
    api.delete.mockRejectedValue({
      response: {
        status: 403,
        data: { error: 'Cannot delete a promotion that has already started' }
      }
    });
    await expect(PromotionService.deletePromotion(1))
      .rejects.toThrow('Cannot delete a promotion that has already started');
  });
}); 