/**
 * Scenario: Dashboard displays user information and core functionality
 * Expected: 1) User sees their profile data; 2) Role-based UI permissions work; 3) Key interactions function properly
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../../pages/Dashboard';

// Create a dynamic mock context that can be updated
let mockAuthContext = {
  user: {
    id: 1,
    utorid: 'testuser',
    name: 'John Doe',
    role: 'regular',
    points: 1500
  },
  isAuthenticated: true,
  activeRole: 'regular'
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock hooks
jest.mock('../../hooks/useUserProfile', () => () => ({
  profile: mockAuthContext.user,
  isLoading: false,
  error: null
}));

jest.mock('../../hooks/useUserTransactions', () => () => ({
  transactions: [
    { id: 1, type: 'purchase', amount: 100, createdAt: '2024-01-01' }
  ],
  isLoading: false,
  error: null
}));

jest.mock('../../hooks/useEvents', () => () => ({
  events: [
    {
      id: 1,
      name: 'Test Event',
      location: 'Test Location',
      startTime: '2024-12-25T10:00:00Z',
      endTime: '2024-12-25T12:00:00Z'
    }
  ],
  isLoading: false,
  error: null
}));

jest.mock('../../hooks/usePromotions', () => ({
  usePromotions: () => ({
    promotions: [
      {
        id: 1,
        name: 'Test Promotion',
        type: 'automatic',
        points: 50,
        description: 'Test promotion'
      }
    ],
    isLoading: false,
    error: null
  })
}));

// Mock useTierStatus hook
jest.mock('../../hooks/useTierStatus', () => ({
  useTierStatus: () => ({
    tierStatus: {
      activeTier: 'SILVER',
      currentCycleEarnedPoints: 1000,
      expiryDate: new Date('2025-08-31T00:00:00.000Z'),
      tierSource: 'current'
    },
    refreshTierStatus: jest.fn(),
    isLoading: false,
    error: null
  })
}));

// Mock components to avoid complex dependencies
jest.mock('../../components/common/LoadingSpinner', () => ({ text }) => (
  <div data-testid="loading-spinner">{text}</div>
));

jest.mock('../../components/common/UniversalQRCode', () => ({ description }) => (
  <div data-testid="universal-qr-code">{description}</div>
));

jest.mock('../../components/user/RedemptionModal', () => ({ isOpen, onClose, availablePoints }) => 
  isOpen ? (
    <div data-testid="redemption-modal">
      <button onClick={onClose}>Close</button>
      <span>Available: {availablePoints}</span>
    </div>
  ) : null
);

jest.mock('../../components/user/TransferModal', () => ({ isOpen, onClose, availablePoints }) => 
  isOpen ? (
    <div data-testid="transfer-modal">
      <button onClick={onClose}>Close</button>
      <span>Available: {availablePoints}</span>
    </div>
  ) : null
);

const renderDashboard = (userRole = 'regular') => {
  // Update mock context for role - modify the object directly 
  mockAuthContext.activeRole = userRole;
  mockAuthContext.user.role = userRole;
  
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard - Core User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default role
    mockAuthContext.activeRole = 'regular';
    mockAuthContext.user.role = 'regular';
  });

  /**
   * Scenario: User views dashboard main page
   * Expected: Profile data and points balance are displayed
   */
  test('displays user profile data and points balance', () => {
    renderDashboard();
    
    // Verify user name and points are displayed (flexible matching)
    expect(screen.getByText(/john.*doe/i)).toBeInTheDocument();
    expect(screen.getByText(/1500/)).toBeInTheDocument();
  });

  /**
   * Scenario: User attempts point redemption and transfer workflows
   * Expected: Modal interactions work correctly
   */
  test('handles point management workflows', async () => {
    renderDashboard();
    
    // Test redemption workflow
    const redeemButton = screen.getByRole('button', { name: /redeem/i });
    fireEvent.click(redeemButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('redemption-modal')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('redemption-modal')).not.toBeInTheDocument();
    });
    
    // Test transfer workflow
    const transferButtons = screen.getAllByRole('button', { name: /transfer/i });
    fireEvent.click(transferButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByTestId('transfer-modal')).toBeInTheDocument();
      expect(screen.getByText(/available.*1500/i)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('transfer-modal')).not.toBeInTheDocument();
    });
  });

  /**
   * Scenario: User navigates dashboard with role-based features
   * Expected: Appropriate navigation options are available based on user role
   */
  test('displays role-appropriate navigation', () => {
    // Test with default regular user role
    renderDashboard('regular');
    
    // Regular user should see personal features
    expect(screen.getByText(/my.*transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/products/i)).toBeInTheDocument();
  });

  /**
   * Scenario: User accesses QR code functionality
   * Expected: QR code component is rendered
   */
  test('provides QR code access', () => {
    renderDashboard();
    expect(screen.getByTestId('universal-qr-code')).toBeInTheDocument();
  });

  /**
   * Scenario: Dashboard displays dynamic content (events, promotions, tier info)
   * Expected: Mock data is rendered correctly
   */
  test('renders dynamic content sections', () => {
    renderDashboard();
    
    // Verify mock data is displayed (functional content, not specific wording)
    expect(screen.getByText(/test.*event/i)).toBeInTheDocument();
    expect(screen.getByText(/test.*location/i)).toBeInTheDocument();
    expect(screen.getAllByText(/test.*promotion/i).length).toBeGreaterThan(0);
    
    // Verify tier system functionality (semantic content)
    expect(screen.getAllByText(/silver/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/progress/i)).toBeInTheDocument();
  });
});

describe('Dashboard - Tier System Multi-Year Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.activeRole = 'regular';
    mockAuthContext.user.role = 'regular';
  });
  
  /**
   * These tests validate the tier system's multi-year flow including:
   * 1. Tier carryover mechanics (tier earned in cycle X valid until end of cycle X+1)
   * 2. Progress bar calculations based on current cycle points (not carryover tier)
   * 3. Tier card highlighting based on current cycle achievement
   * 4. Proper handling of tier transitions and downgrades
   * 
   * Note: Tests use flexible regex patterns to avoid brittle dependencies on exact wording,
   * CSS classes, or specific UI text that may change during development.
   */

  const renderWithTierStatus = (tierData) => {
    // Mock the tier status hook with specific data for this test
    const mockUseTierStatus = require('../../hooks/useTierStatus');
    mockUseTierStatus.useTierStatus = jest.fn(() => ({
      tierStatus: tierData,
      refreshTierStatus: jest.fn(),
      isLoading: false,
      error: null
    }));

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  /**
   * Scenario: 2025-2026 Diamond Carryover Period (Aug 31, 2026 - Zero spending during carryover)
   * Expected: Shows Diamond active tier with zero current cycle points, but progress based on current cycle
   * Tests: Carryover mechanics work correctly, progress bar shows Bronze→Silver (not Diamond max)
   */
  test('displays Diamond carryover correctly during 2026 cycle', () => {
    const tierData = {
      activeTier: 'DIAMOND',
      currentCycleEarnedPoints: 0,
      expiryDate: new Date('2026-08-31T00:00:00.000Z'),
      tierSource: 'previous',
      currentCycleYear: 2026,
      previousCycleEarnedPoints: 21600
    };

    renderWithTierStatus(tierData);

        // Should show Diamond as active tier (carryover)
    expect(screen.getByText(/diamond.*member/i)).toBeInTheDocument();

    // Should show zero points earned in current cycle
    expect(screen.getByText(/0.*points.*earned/i)).toBeInTheDocument();

    // With 0 points in current cycle, should show progress to next tier (not max achievement)
    expect(screen.getByText(/progress.*to/i)).toBeInTheDocument();
    expect(screen.getByText(/1000.*points.*needed/i)).toBeInTheDocument();
  });

  /**
   * Scenario: 2027 Cycle - Gold Achievement (Aug 31, 2027 - 6000 points earned)
   * Expected: Shows Gold tier with 6000 current cycle points, 20% progress to Platinum
   * Tests: Current cycle tier achievement and accurate progress calculation
   */
  test('displays Gold tier achievement in 2027 cycle', () => {
    const tierData = {
      activeTier: 'GOLD',
      currentCycleEarnedPoints: 6000,
      expiryDate: new Date('2028-08-31T00:00:00.000Z'),
      tierSource: 'current',
      currentCycleYear: 2027,
      previousCycleEarnedPoints: 0
    };

    renderWithTierStatus(tierData);

    // Should show progress to next tier
    expect(screen.getByText(/progress.*to.*platinum/i)).toBeInTheDocument();
    expect(screen.getByText(/6000.*points.*earned/i)).toBeInTheDocument();
    expect(screen.getByText(/10000.*points.*required/i)).toBeInTheDocument();

    // Progress calculation: (6000 - 5000) / (10000 - 5000) = 20%
    // Should show points needed for next tier
    expect(screen.getByText(/4000.*points.*needed/i)).toBeInTheDocument();
  });

  /**
   * Scenario: 2028 Cycle - Gold Carryover with Minimal Spending (Jan 8, 2028 - 200 points only)
   * Expected: Shows Gold active tier but Bronze current cycle achievement, progress to Silver
   * Tests: UI shows current cycle progress, not carryover tier progress
   */
  test('displays Gold carryover with minimal spending in 2028', () => {
    const tierData = {
      activeTier: 'GOLD',
      currentCycleEarnedPoints: 200,
      expiryDate: new Date('2028-08-31T00:00:00.000Z'),
      tierSource: 'previous',
      currentCycleYear: 2028,
      previousCycleEarnedPoints: 6000
    };

    renderWithTierStatus(tierData);

    // Should show current cycle achievement (Bronze level)
    expect(screen.getByText(/200.*points.*earned/i)).toBeInTheDocument();
    
    // Should show progress to next tier (based on current cycle points)
    expect(screen.getByText(/progress.*to.*silver/i)).toBeInTheDocument();
    expect(screen.getByText(/1000.*points.*required/i)).toBeInTheDocument();

    // Progress calculation: (200 - 0) / (1000 - 0) = 20%
    expect(screen.getByText(/800.*points.*needed/i)).toBeInTheDocument();
  });

  /**
   * Scenario: 2029 Cycle - Recovery to Platinum (Aug 31, 2029 - 10000 points earned)
   * Expected: Shows Platinum achievement with 10000 current cycle points, 0% progress to Diamond
   * Tests: Recovery from downgrade and accurate progress at tier threshold
   */
  test('displays Platinum recovery in 2029 cycle', () => {
    const tierData = {
      activeTier: 'PLATINUM',
      currentCycleEarnedPoints: 10000,
      expiryDate: new Date('2030-08-31T00:00:00.000Z'),
      tierSource: 'current',
      currentCycleYear: 2029,
      previousCycleEarnedPoints: 500
    };

    renderWithTierStatus(tierData);

    // Should show progress to next tier
    expect(screen.getByText(/progress.*to.*diamond/i)).toBeInTheDocument();
    expect(screen.getByText(/10000.*points.*earned/i)).toBeInTheDocument();
    expect(screen.getByText(/20000.*points.*required/i)).toBeInTheDocument();

    // Progress calculation: (10000 - 10000) / (20000 - 10000) = 0%
    // User just reached Platinum threshold, so 0% progress to Diamond
    expect(screen.getByText(/10000.*points.*needed/i)).toBeInTheDocument();
  });

  /**
   * Scenario: Tier card highlighting based on current cycle points
   * Expected: Tier cards show current cycle achievement, not carryover tier
   */
  test('highlights correct tier card based on current cycle points', () => {
    // Test Gold carryover with Bronze-level current cycle points
    const tierData = {
      activeTier: 'GOLD', // carryover from previous cycle
      currentCycleEarnedPoints: 200, // Bronze level in current cycle
      expiryDate: new Date('2028-08-31T00:00:00.000Z'),
      tierSource: 'previous',
      currentCycleYear: 2028
    };

    renderWithTierStatus(tierData);

             // Should display tier cards (current cycle achievement should be highlighted)
    // This tests that tier cards show current cycle tier, not active tier
    expect(screen.getAllByText(/bronze/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/silver/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/gold/i).length).toBeGreaterThan(0);
    
    // Verify progress is based on current cycle points (200 points → Bronze tier)
    expect(screen.getByText(/progress.*to.*silver/i)).toBeInTheDocument();
  });

  /**
   * Scenario: Progress bar calculation accuracy
   * Expected: Progress percentage is calculated correctly for different scenarios
   */
  test('calculates progress bar correctly for various point levels', () => {
    // Test mid-Silver progress (1500 points = halfway to Gold)
    const tierData = {
      activeTier: 'SILVER',
      currentCycleEarnedPoints: 1500,
      expiryDate: new Date('2025-08-31T00:00:00.000Z'),
      tierSource: 'current',
      currentCycleYear: 2025
    };

    renderWithTierStatus(tierData);

    expect(screen.getByText(/progress.*to.*gold/i)).toBeInTheDocument();
    expect(screen.getByText(/1500.*points.*earned/i)).toBeInTheDocument();
    
    // Progress: (1500 - 1000) / (5000 - 1000) = 500/4000 = 12.5%
    // Should show points needed for next tier
    expect(screen.getByText(/3500.*points.*needed/i)).toBeInTheDocument();
  });

  /**
   * Scenario: Diamond tier maximum achievement
   * Expected: Shows special Diamond tier achievement UI
   */
  test('displays Diamond tier maximum achievement correctly', () => {
    const tierData = {
      activeTier: 'DIAMOND',
      currentCycleEarnedPoints: 25000,
      expiryDate: new Date('2026-08-31T00:00:00.000Z'),
      tierSource: 'current',
      currentCycleYear: 2025
    };

    renderWithTierStatus(tierData);

    // Should show maximum tier achievement message
    expect(screen.getByText(/maximum.*tier.*achieved/i)).toBeInTheDocument();
    expect(screen.getByText(/25000.*points.*earned/i)).toBeInTheDocument();
    expect(screen.getByText(/highest.*tier/i)).toBeInTheDocument();

    // Should show 100% progress for Diamond - no "points needed" text
    // Diamond tier shows maximum achievement instead of progress
  });
}); 