import {
  TIER_CONFIG,
  TIER_ORDER,
  calculateTierFromPoints,
  getNextTierInfo,
  getPointsToNextTier,
  getTierBenefits
} from '../../utils/tierUtils';

describe('Tier Configuration', () => {
  test('TIER_CONFIG contains all required tiers with correct properties', () => {
    const requiredTiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    const requiredProperties = ['name', 'threshold', 'color', 'gradient'];

    requiredTiers.forEach(tier => {
      expect(TIER_CONFIG).toHaveProperty(tier);
      requiredProperties.forEach(prop => {
        expect(TIER_CONFIG[tier]).toHaveProperty(prop);
      });
    });
  });

  test('TIER_ORDER is correctly ordered', () => {
    expect(TIER_ORDER).toEqual(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']);
    expect(TIER_ORDER.length).toBe(Object.keys(TIER_CONFIG).length);
  });

  test('tier thresholds are in ascending order', () => {
    let lastThreshold = -1;
    TIER_ORDER.forEach(tier => {
      expect(TIER_CONFIG[tier].threshold).toBeGreaterThan(lastThreshold);
      lastThreshold = TIER_CONFIG[tier].threshold;
    });
  });
});

describe('Tier Calculation', () => {
  test('calculateTierFromPoints returns correct tier', () => {
    const testCases = [
      { points: 0, expectedTier: 'BRONZE' },
      { points: 500, expectedTier: 'BRONZE' },
      { points: 1000, expectedTier: 'SILVER' },
      { points: 3000, expectedTier: 'SILVER' },
      { points: 5000, expectedTier: 'GOLD' },
      { points: 8000, expectedTier: 'GOLD' },
      { points: 10000, expectedTier: 'PLATINUM' },
      { points: 15000, expectedTier: 'PLATINUM' },
      { points: 20000, expectedTier: 'DIAMOND' },
      { points: 25000, expectedTier: 'DIAMOND' },
      { points: -100, expectedTier: 'BRONZE' } // Edge case: negative points
    ];

    testCases.forEach(({ points, expectedTier }) => {
      expect(calculateTierFromPoints(points)).toBe(expectedTier);
    });
  });

  test('getNextTierInfo returns correct next tier information', () => {
    // Test progression through tiers
    expect(getNextTierInfo('BRONZE')).toEqual({
      key: 'SILVER',
      ...TIER_CONFIG.SILVER
    });

    expect(getNextTierInfo('SILVER')).toEqual({
      key: 'GOLD',
      ...TIER_CONFIG.GOLD
    });

    expect(getNextTierInfo('GOLD')).toEqual({
      key: 'PLATINUM',
      ...TIER_CONFIG.PLATINUM
    });

    expect(getNextTierInfo('PLATINUM')).toEqual({
      key: 'DIAMOND',
      ...TIER_CONFIG.DIAMOND
    });

    // Test highest tier
    expect(getNextTierInfo('DIAMOND')).toBeNull();
  });

  test('getPointsToNextTier calculates correct points needed', () => {
    const testCases = [
      { points: 0, tier: 'BRONZE', expected: 1000 },
      { points: 500, tier: 'BRONZE', expected: 500 },
      { points: 1000, tier: 'SILVER', expected: 4000 },
      { points: 3000, tier: 'SILVER', expected: 2000 },
      { points: 5000, tier: 'GOLD', expected: 5000 },
      { points: 8000, tier: 'GOLD', expected: 2000 },
      { points: 10000, tier: 'PLATINUM', expected: 10000 },
      { points: 15000, tier: 'PLATINUM', expected: 5000 },
      { points: 20000, tier: 'DIAMOND', expected: 0 },
      { points: 25000, tier: 'DIAMOND', expected: 0 }
    ];

    testCases.forEach(({ points, tier, expected }) => {
      expect(getPointsToNextTier(points, tier)).toBe(expected);
    });
  });
});

describe('Tier Benefits', () => {
  test('getTierBenefits returns correct benefits for each tier', () => {
    // Test all tiers
    TIER_ORDER.forEach(tier => {
      const benefits = getTierBenefits(tier);
      expect(benefits).toBeInstanceOf(Array);
      expect(benefits.length).toBeGreaterThan(0);
    });

    // Test specific tier benefits
    const bronzeBenefits = getTierBenefits('BRONZE');
    expect(bronzeBenefits).toContain('Welcome to PointPulse rewards');
    expect(bronzeBenefits).toContain('Earn 1 point per $0.25 spent');

    const diamondBenefits = getTierBenefits('DIAMOND');
    expect(diamondBenefits).toContain('All Platinum benefits');
    expect(diamondBenefits).toContain('Dedicated account manager');

    // Test invalid tier
    expect(getTierBenefits('INVALID_TIER')).toEqual(getTierBenefits('BRONZE'));
  });
}); 