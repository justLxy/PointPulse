import UserService from './user.service';
import {
  getCurrentCycleYear,
  getCycleStartDate,
  getCycleEndDate,
  isInCycleYear,
  calculateTierFromPoints,
  getCurrentEffectiveDate,
  DEFAULT_CYCLE_START
} from '../utils/tierUtils';

class TierService {
  // Calculate earned points in a specific cycle year (excluding transfer receipts)
  async calculateCycleEarnedPoints(userId, cycleYear) {
    const cycleStart = getCycleStartDate(cycleYear, DEFAULT_CYCLE_START);
    const cycleEnd = getCycleEndDate(cycleYear, DEFAULT_CYCLE_START);
    const currentDate = getCurrentEffectiveDate(); // 使用当前有效日期（可能是模拟的）

    try {
      // Fetch all transactions for the user
      let allTransactions = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await UserService.getTransactions({ 
          page, 
          limit: 100
        });
        
        allTransactions = [...allTransactions, ...response.results];
        hasMore = response.count > page * 100;
        page++;
      }

      // Filter transactions within the cycle year and only count earned points
      // Exclude transfer receipts (positive transfer amounts) to avoid double counting
      // IMPORTANT: Only include transactions that have already occurred (not future transactions)
      const earnedPoints = allTransactions
        .filter(transaction => {
          const transactionDate = new Date(transaction.createdAt);
          return isInCycleYear(transactionDate, cycleYear, DEFAULT_CYCLE_START) && 
                 transactionDate <= currentDate && // 只包含已经发生的交易
                 this.isEarnedTransaction(transaction);
        })
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return earnedPoints;
    } catch (error) {
      console.error('Error calculating cycle earned points:', error);
      return 0;
    }
  }

  // Check if a transaction represents earned points (not transfer receipts or transfers)
  isEarnedTransaction(transaction) {
    switch (transaction.type) {
      case 'purchase':
      case 'event':
        return transaction.amount > 0;
      case 'adjustment':
        return transaction.amount > 0;
      case 'transfer':
        // Transfers are point redistributions, not earned points
        // Neither sending nor receiving transfers count as "earned"
        return false;
      default:
        return false;
    }
  }

  // Get total earned points for current cycle
  async getCurrentCycleEarnedPoints(userId) {
    const currentYear = getCurrentCycleYear(getCurrentEffectiveDate(), DEFAULT_CYCLE_START);
    return await this.calculateCycleEarnedPoints(userId, currentYear);
  }

  // Get active tier status with proper tier continuation logic
  async getActiveTierStatus(userId) {
    const currentDate = getCurrentEffectiveDate();
    const currentCycleYear = getCurrentCycleYear(currentDate, DEFAULT_CYCLE_START);
    
    // Get points earned in current cycle
    const currentCycleEarnedPoints = await this.calculateCycleEarnedPoints(userId, currentCycleYear);
    const currentCycleTier = calculateTierFromPoints(currentCycleEarnedPoints);

    // Get points earned in previous cycle
    const previousCycleYear = currentCycleYear - 1;
    const previousCycleEarnedPoints = await this.calculateCycleEarnedPoints(userId, previousCycleYear);
    const previousCycleTier = calculateTierFromPoints(previousCycleEarnedPoints);
    
    // Determine active tier and expiry date based on tier continuation rules
    let activeTier, tierSource, expiryDate;
    
    // Tier continuation rules:
    // 1. Tier earned in cycle X is valid through the end of cycle X+1
    // 2. Always use the higher tier between previous and current cycle
    // 3. If current cycle tier is higher, it becomes active immediately and extends to cycle+1
    
    const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    const previousTierIndex = tierOrder.indexOf(previousCycleTier);
    const currentTierIndex = tierOrder.indexOf(currentCycleTier);
    
    // Previous cycle tier expiry date (valid until end of current cycle)
    const previousCycleTierExpiryDate = getCycleEndDate(currentCycleYear, DEFAULT_CYCLE_START);

    // Check if we should use previous cycle tier (if it's still valid and not Bronze)
    if (currentDate <= previousCycleTierExpiryDate && 
        previousCycleTier !== 'BRONZE' && 
        previousTierIndex >= currentTierIndex) {
      // Use previous cycle tier (it's higher or equal and still valid)
      activeTier = previousCycleTier;
      tierSource = 'previous';
      expiryDate = previousCycleTierExpiryDate;
    } else {
      // Use current cycle tier (either previous expired, or current is higher, or previous was Bronze)
      activeTier = currentCycleTier;
      tierSource = 'current';
      // Current cycle tier extends to end of next cycle
      expiryDate = getCycleEndDate(currentCycleYear + 1, DEFAULT_CYCLE_START);
    }

    return {
      activeTier,
      tierSource,
      expiryDate,
      currentCycleYear,
      currentCycleEarnedPoints,
      previousCycleYear,
      previousCycleEarnedPoints
    };
  }
}

export default new TierService(); 