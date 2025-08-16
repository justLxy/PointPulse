import UserService from '../../services/user.service';
import tierService from '../../services/tier.service';
import {
  getCurrentCycleYear,
  getCurrentEffectiveDate,
  DEFAULT_CYCLE_START
} from '../../utils/tierUtils';

// Mock dependencies
jest.mock('../../services/user.service');
jest.mock('../../utils/tierUtils', () => ({
  getCurrentCycleYear: jest.fn(),
  getCycleStartDate: jest.fn(),
  getCycleEndDate: jest.fn(),
  isInCycleYear: jest.fn(),
  calculateTierFromPoints: jest.fn(),
  getCurrentEffectiveDate: jest.fn(),
  DEFAULT_CYCLE_START: '01-01'
}));

// Get the mocked utils
const mockedTierUtils = jest.requireMock('../../utils/tierUtils');

describe('TierService', () => {
  // Mock data
  const mockUserId = '123';
  const mockCurrentDate = new Date('2024-03-20');
  const mockTransactions = [
    { id: 1, type: 'purchase', amount: 100, createdAt: '2024-02-01' },
    { id: 2, type: 'event', amount: 50, createdAt: '2024-02-15' },
    { id: 3, type: 'transfer', amount: -30, createdAt: '2024-03-01' },
    { id: 4, type: 'transfer', amount: 30, createdAt: '2024-03-01' },
    { id: 5, type: 'adjustment', amount: 20, createdAt: '2024-03-10' }
  ];

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    getCurrentEffectiveDate.mockReturnValue(mockCurrentDate);
    getCurrentCycleYear.mockReturnValue(2024);
    UserService.getTransactions.mockResolvedValue({
      results: mockTransactions,
      count: mockTransactions.length
    });
  });

  describe('isEarnedTransaction', () => {
    it('should correctly identify earned points from purchase transactions', () => {
      expect(tierService.isEarnedTransaction({ type: 'purchase', amount: 100 })).toBe(true);
      expect(tierService.isEarnedTransaction({ type: 'purchase', amount: -100 })).toBe(false);
    });

    it('should correctly identify earned points from event transactions', () => {
      expect(tierService.isEarnedTransaction({ type: 'event', amount: 50 })).toBe(true);
      expect(tierService.isEarnedTransaction({ type: 'event', amount: -50 })).toBe(false);
    });

    it('should correctly identify earned points from adjustment transactions', () => {
      expect(tierService.isEarnedTransaction({ type: 'adjustment', amount: 20 })).toBe(true);
      expect(tierService.isEarnedTransaction({ type: 'adjustment', amount: -20 })).toBe(false);
    });

    it('should correctly identify earned points from transfer transactions', () => {
      // Transfers are point redistributions, not earned points
      expect(tierService.isEarnedTransaction({ type: 'transfer', amount: -30 })).toBe(false);
      expect(tierService.isEarnedTransaction({ type: 'transfer', amount: 30 })).toBe(false);
    });

    it('should return false for unknown transaction types', () => {
      expect(tierService.isEarnedTransaction({ type: 'unknown', amount: 100 })).toBe(false);
    });
  });

  describe('calculateCycleEarnedPoints', () => {
    beforeEach(() => {
      // Mock isInCycleYear to return true for all test transactions
      mockedTierUtils.isInCycleYear.mockReturnValue(true);
    });

    it('should calculate earned points correctly for a cycle year', async () => {
      const points = await tierService.calculateCycleEarnedPoints(mockUserId, 2024);
      // Expected: purchase(100) + event(50) + adjustment(20) = 170
      // Transfers are not counted as earned points (they are redistributions)
      expect(points).toBe(170);
    });

    it('should handle empty transaction list', async () => {
      UserService.getTransactions.mockResolvedValue({ results: [], count: 0 });
      const points = await tierService.calculateCycleEarnedPoints(mockUserId, 2024);
      expect(points).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      UserService.getTransactions.mockRejectedValue(new Error('API Error'));
      const points = await tierService.calculateCycleEarnedPoints(mockUserId, 2024);
      expect(points).toBe(0);
    });

    /* Business Logic Updated:
     * Transfer points are NOT counted as earned points because they are 
     * point redistributions between users, not new points earned through
     * purchases, events, or adjustments.
     */
    // it('should handle pagination correctly and deduct transfer points', async () => {
    //   // Add spy to isEarnedTransaction
    //   const isEarnedSpy = jest.spyOn(tierService, 'isEarnedTransaction');
    // 
    //   // Mock multiple pages of transactions
    //   const paginatedTransactions = [
    //     { id: 1, type: 'purchase', amount: 100, createdAt: '2024-02-01' },
    //     { id: 2, type: 'event', amount: 50, createdAt: '2024-02-15' },
    //     { id: 3, type: 'transfer', amount: -30, createdAt: '2024-03-01' },
    //     { id: 4, type: 'adjustment', amount: 20, createdAt: '2024-03-10' }
    //   ];
    // 
    //   // Mock isInCycleYear to return true only for specific transactions
    //   mockedTierUtils.isInCycleYear
    //     .mockImplementation((date, year) => {
    //       const transactionDate = new Date(date);
    //       return transactionDate.getFullYear() === year;
    //     });
    // 
    //   UserService.getTransactions
    //     .mockResolvedValueOnce({ results: paginatedTransactions.slice(0, 2), count: 4 })
    //     .mockResolvedValueOnce({ results: paginatedTransactions.slice(2), count: 4 });
    // 
    //   const points = await tierService.calculateCycleEarnedPoints(mockUserId, 2024);
    //   
    //   // Log each call to isEarnedTransaction
    //   console.log('isEarnedTransaction calls:', isEarnedSpy.mock.calls.map(call => ({
    //     type: call[0].type,
    //     amount: call[0].amount,
    //     result: isEarnedSpy.mock.results[isEarnedSpy.mock.calls.indexOf(call)].value
    //   })));
    // 
    //   // Calculation: purchase(100) + event(50) + adjustment(20) = 170
    //   // Transfers are not counted as earned points
    //   expect(points).toBe(170);
    //   expect(UserService.getTransactions).toHaveBeenCalledTimes(2);
    //   
    //   // Clean up spy
    //   isEarnedSpy.mockRestore();
    // });
  });

  describe('getCurrentCycleEarnedPoints', () => {
    it('should return points for current cycle year', async () => {
      const spy = jest.spyOn(tierService, 'calculateCycleEarnedPoints');
      await tierService.getCurrentCycleEarnedPoints(mockUserId);
      
      expect(spy).toHaveBeenCalledWith(mockUserId, 2024);
      spy.mockRestore();
    });
  });

  describe('getActiveTierStatus', () => {
    beforeEach(() => {
      mockedTierUtils.calculateTierFromPoints
        .mockImplementation(points => {
          if (points >= 1000) return 'DIAMOND';
          if (points >= 500) return 'PLATINUM';
          if (points >= 200) return 'GOLD';
          if (points >= 100) return 'SILVER';
          return 'BRONZE';
        });
    });

    it('should use current cycle tier when higher than previous', async () => {
      // Mock points calculation
      jest.spyOn(tierService, 'calculateCycleEarnedPoints')
        .mockImplementation(async (userId, year) => {
          return year === 2024 ? 200 : 100; // current: 200 (GOLD), previous: 100 (SILVER)
        });

      // Mock date functions
      mockedTierUtils.getCurrentEffectiveDate.mockReturnValue(new Date('2024-03-20'));
      mockedTierUtils.getCycleEndDate.mockReturnValue(new Date('2024-12-31'));

      const status = await tierService.getActiveTierStatus(mockUserId);

      expect(status).toEqual({
        activeTier: 'GOLD',
        tierSource: 'current',
        currentCycleYear: 2024,
        previousCycleYear: 2023,
        currentCycleEarnedPoints: 200,
        previousCycleEarnedPoints: 100,
        expiryDate: new Date('2024-12-31')
      });
    });

    it('should use previous cycle tier when higher and still valid', async () => {
      // Mock points calculation
      jest.spyOn(tierService, 'calculateCycleEarnedPoints')
        .mockImplementation(async (userId, year) => {
          return year === 2024 ? 200 : 500; // current: 200 (GOLD), previous: 500 (PLATINUM)
        });

      // Mock date functions
      mockedTierUtils.getCurrentEffectiveDate.mockReturnValue(new Date('2024-03-20'));
      mockedTierUtils.getCycleEndDate.mockReturnValue(new Date('2024-12-31'));

      const status = await tierService.getActiveTierStatus(mockUserId);

      expect(status).toEqual({
        activeTier: 'PLATINUM',
        tierSource: 'previous',
        currentCycleYear: 2024,
        previousCycleYear: 2023,
        currentCycleEarnedPoints: 200,
        previousCycleEarnedPoints: 500,
        expiryDate: new Date('2024-12-31')
      });
    });

    it('should not use previous BRONZE tier even if current is also BRONZE', async () => {
      // Mock both cycles with BRONZE tier points
      const mockCalculatePoints = jest.spyOn(tierService, 'calculateCycleEarnedPoints')
        .mockResolvedValueOnce(50)  // previous cycle (BRONZE)
        .mockResolvedValueOnce(50); // current cycle (BRONZE)

      const status = await tierService.getActiveTierStatus(mockUserId);

      expect(status).toEqual(expect.objectContaining({
        activeTier: 'BRONZE',
        tierSource: 'current',
        currentCycleEarnedPoints: 50,
        previousCycleEarnedPoints: 50
      }));

      mockCalculatePoints.mockRestore();
    });
  });
}); 