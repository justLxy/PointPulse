// Tier configuration
export const TIER_CONFIG = {
  BRONZE: { name: 'Bronze', threshold: 0, color: '#CD7F32', gradient: 'linear-gradient(135deg, #CD7F32, #B8860B)' },
  SILVER: { name: 'Silver', threshold: 1000, color: '#C0C0C0', gradient: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' },
  GOLD: { name: 'Gold', threshold: 5000, color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)' },
  PLATINUM: { name: 'Platinum', threshold: 10000, color: '#E5E4E2', gradient: 'linear-gradient(135deg, #E5E4E2, #BCC6CC)' },
  DIAMOND: { name: 'Diamond', threshold: 20000, color: '#B9F2FF', gradient: 'linear-gradient(135deg, #B9F2FF, #87CEEB)' }
};

// Get all tiers in order
export const TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

// Default cycle start date (September 1, 2024)
export const DEFAULT_CYCLE_START = { month: 9, day: 1, year: 2024 };

// Get current effective date (simulated or real)
export const getCurrentEffectiveDate = () => {
  const simulated = localStorage.getItem('simulatedDate');
  return simulated ? new Date(simulated) : new Date();
};

// Get cycle start date for a given year
export const getCycleStartDate = (year, cycleConfig = DEFAULT_CYCLE_START) => {
  return new Date(year, cycleConfig.month - 1, cycleConfig.day);
};

// Get cycle end date for a given year
export const getCycleEndDate = (year, cycleConfig = DEFAULT_CYCLE_START) => {
  const nextYearStart = getCycleStartDate(year + 1, cycleConfig);
  return new Date(nextYearStart.getTime() - 1); // Last millisecond of the previous day
};

// Get current cycle year based on date and configuration
export const getCurrentCycleYear = (date = getCurrentEffectiveDate(), cycleConfig = DEFAULT_CYCLE_START) => {
  const year = date.getFullYear();
  const cycleStart = getCycleStartDate(year, cycleConfig);
  
  // If we're before the cycle start date, we're still in the previous cycle
  if (date < cycleStart) {
    return year - 1;
  }
  return year;
};

// Check if a date is within a specific cycle year
export const isInCycleYear = (date, cycleYear, cycleConfig = DEFAULT_CYCLE_START) => {
  const cycleStart = getCycleStartDate(cycleYear, cycleConfig);
  const cycleEnd = getCycleEndDate(cycleYear, cycleConfig);
  return date >= cycleStart && date <= cycleEnd;
};

// Get tier validity period - tier earned in one year is valid until end of next year
export const getTierValidityPeriod = (achievementYear, cycleConfig = DEFAULT_CYCLE_START) => {
  const validUntil = getCycleEndDate(achievementYear + 1, cycleConfig);
  return {
    achievedInYear: achievementYear,
    validUntil,
    validForCycles: [achievementYear, achievementYear + 1]
  };
};

// Check if a tier achieved in a specific year is still valid at a given date
export const isTierStillValid = (achievementYear, checkDate = getCurrentEffectiveDate(), cycleConfig = DEFAULT_CYCLE_START) => {
  const validity = getTierValidityPeriod(achievementYear, cycleConfig);
  return checkDate <= validity.validUntil;
};

// Calculate tier based on points
export const calculateTierFromPoints = (points) => {
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    const tierKey = TIER_ORDER[i];
    if (points >= TIER_CONFIG[tierKey].threshold) {
      return tierKey;
    }
  }
  return 'BRONZE';
};

// Get next tier information
export const getNextTierInfo = (currentTier) => {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  if (currentIndex < TIER_ORDER.length - 1) {
    const nextTierKey = TIER_ORDER[currentIndex + 1];
    return {
      key: nextTierKey,
      ...TIER_CONFIG[nextTierKey]
    };
  }
  return null;
};

// Format tier expiry date
export const formatTierExpiryDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Calculate points needed for next tier
export const getPointsToNextTier = (currentPoints, currentTier) => {
  const nextTier = getNextTierInfo(currentTier);
  if (!nextTier) return 0;
  return Math.max(0, nextTier.threshold - currentPoints);
};

// Get formatted cycle period string
export const formatCyclePeriod = (cycleYear, cycleConfig = DEFAULT_CYCLE_START) => {
  const startDate = getCycleStartDate(cycleYear, cycleConfig);
  const endDate = getCycleEndDate(cycleYear, cycleConfig);
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
};

// Get tier benefits (reflecting implemented features)
export const getTierBenefits = (tier) => {
  const benefits = {
    BRONZE: [
      'Welcome to PointPulse Rewards!',
      'Earn points on every purchase.',
      'Access to standard promotions and events.'
    ],
    SILVER: [
      'All Bronze benefits.',
      'Access to exclusive Silver-tier promotions.',
      'Early sign-up for select events.'
    ],
    GOLD: [
      'All Silver benefits.',
      'Access to exclusive Gold-tier promotions and offers.',
      'Priority access and RSVP for popular events.'
    ],
    PLATINUM: [
      'All Gold benefits.',
      'Access to premium Platinum-only promotions.',
      'VIP access and guaranteed spots at all events.'
    ],
    DIAMOND: [
      'All Platinum benefits.',
      'The most exclusive promotions and special offers.',
      'Early access and reserved seating at all major events.'
    ]
  };
  
  return benefits[tier] || benefits.BRONZE;
}; 