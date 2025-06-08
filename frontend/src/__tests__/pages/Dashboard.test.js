/**
 * Scenario: Dashboard displays user information and core functionality
 * Expected: 1) User sees their profile data; 2) Role-based UI permissions work; 3) Key interactions function properly
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../../pages/Dashboard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock QR code library (third-party dependency)
jest.mock('qrcode.react', () => ({
  QRCodeCanvas: ({ value, ...props }) => (
    <div data-testid="qr-code-canvas" data-value={value} {...props}>
      QR Code: {value}
    </div>
  )
}));

// Mock react-hot-toast (third-party notification library)
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  }
}));

// Create mock auth context
const mockAuthContext = {
  user: {
    id: 1,
    utorid: 'testuser',
    name: 'John Doe',
    role: 'regular',
    points: 1500
  },
  currentUser: {
    id: 1,
    utorid: 'testuser',
    name: 'John Doe',
    role: 'regular',
    points: 1500
  },
  isAuthenticated: true,
  activeRole: 'regular',
  updateCurrentUser: jest.fn(),
  logout: jest.fn()
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

// Mock react-router for navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock hooks directly for more reliable data flow
jest.mock('../../hooks/useUserProfile', () => ({
  __esModule: true,
  default: () => ({
    profile: {
      id: 1,
      utorid: 'testuser',
      name: 'John Doe',
      role: 'regular',
      points: 1500,
      verified: true,
      email: 'john.doe@mail.utoronto.ca'
    },
    isLoading: false,
    error: null,
    updateProfile: jest.fn(),
    isUpdating: false,
    updateAvatar: jest.fn(),
    isUpdatingAvatar: false,
    updatePassword: jest.fn(),
    isUpdatingPassword: false
  })
}));

jest.mock('../../hooks/useUserTransactions', () => ({
  __esModule: true,
  default: () => ({
    transactions: [
      { 
        id: 1, 
        type: 'purchase', 
        amount: 100, 
        createdAt: '2024-01-01T00:00:00Z', 
        spent: 25.00 
      }
    ],
    isLoading: false,
    error: null,
    createRedemption: jest.fn(),
    isCreatingRedemption: false,
    transferPoints: jest.fn(),
    isTransferringPoints: false
  })
}));

jest.mock('../../hooks/useEvents', () => ({
  __esModule: true,
  default: () => ({
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
  })
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

jest.mock('../../hooks/usePendingRedemptions', () => ({
  __esModule: true,
  default: () => ({
    pendingTotal: 0,
    refetch: jest.fn()
  })
}));

const renderDashboard = (userRole = 'regular') => {
  // Update mock context for role
  mockAuthContext.activeRole = userRole;
  mockAuthContext.user.role = userRole;
  mockAuthContext.currentUser.role = userRole;
  
  // Create a new QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0
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
    mockAuthContext.currentUser.role = 'regular';
  });

  /**
   * Scenario: User views dashboard main page
   * Expected: Profile data and points balance are displayed
   */
  test('displays user profile data and points balance', async () => {
    renderDashboard();
    
    // Wait for async content to load
    await waitFor(() => {
      expect(screen.getByText(/welcome.*john.*doe/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('1500')).toBeInTheDocument();
    });
  });

  /**
   * Scenario: User attempts point redemption and transfer workflows
   * Expected: Modal interactions work correctly
   */
  test('handles point management workflows', async () => {
    renderDashboard();
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/welcome.*john.*doe/i)).toBeInTheDocument();
    });
    
    // Test redemption workflow
    const redeemButton = screen.getByRole('button', { name: /redeem/i });
    fireEvent.click(redeemButton);
    
    await waitFor(() => {
      expect(screen.getByText(/select.*amount/i)).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Test transfer workflow
    const transferButtons = screen.getAllByRole('button', { name: /transfer/i });
    fireEvent.click(transferButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/transfer.*points/i)).toBeInTheDocument();
    });
  });

  /**
   * Scenario: User navigates dashboard with role-based features
   * Expected: Appropriate navigation options are available based on user role
   */
  test('displays role-appropriate navigation', async () => {
    renderDashboard('regular');
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/my.*transactions/i)).toBeInTheDocument();
      expect(screen.getByText(/products/i)).toBeInTheDocument();
    });
  });

  /**
   * Scenario: User accesses QR code functionality
   * Expected: QR code component is rendered
   */
  test('provides QR code access', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByTestId('qr-code-canvas')).toBeInTheDocument();
    });
  });

  /**
   * Scenario: Dashboard displays dynamic content (events, promotions, tier info)
   * Expected: Mock data is rendered correctly
   */
  test('renders dynamic content sections', async () => {
    renderDashboard();
    
    // Wait for async content to load first
    await waitFor(() => {
      expect(screen.getByText(/welcome.*john.*doe/i)).toBeInTheDocument();
    });
    
    // Wait for events to load
    await waitFor(() => {
      expect(screen.getByText(/test.*event/i)).toBeInTheDocument();
      expect(screen.getByText(/test.*location/i)).toBeInTheDocument();
    });
    
    // Wait for promotions to load
    await waitFor(() => {
      expect(screen.getAllByText(/test.*promotion/i).length).toBeGreaterThan(0);
    });
    
    // Verify tier system functionality
    await waitFor(() => {
      expect(screen.getAllByText(/silver/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/progress/i)).toBeInTheDocument();
    });
  });
});

describe('Dashboard - Tier System Multi-Year Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.activeRole = 'regular';
    mockAuthContext.user.role = 'regular';
    mockAuthContext.currentUser.role = 'regular';
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
        queries: { 
          retry: false,
          staleTime: 0,
          cacheTime: 0
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

  /**
   * Scenario: 2025-2026 Diamond Carryover Period (Aug 31, 2026 - Zero spending during carryover)
   * Expected: Shows Diamond active tier with zero current cycle points, but progress based on current cycle
   * Tests: Carryover mechanics work correctly, progress bar shows Bronze→Silver (not Diamond max)
   */
  test('displays Diamond carryover correctly during 2026 cycle', async () => {
    const tierData = {
      activeTier: 'DIAMOND',
      currentCycleEarnedPoints: 0,
      expiryDate: new Date('2026-08-31T00:00:00.000Z'),
      tierSource: 'previous',
      currentCycleYear: 2026,
      previousCycleEarnedPoints: 21600
    };

    renderWithTierStatus(tierData);

    // Wait for content to load and verify tier display
    await waitFor(() => {
      expect(screen.getByText(/diamond.*member/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/0.*points.*earned/i)).toBeInTheDocument();
      expect(screen.getByText(/progress.*to/i)).toBeInTheDocument();
      expect(screen.getByText(/1000.*points.*needed/i)).toBeInTheDocument();
    });
  });

  /**
   * Scenario: 2027 Cycle - Gold Achievement (Aug 31, 2027 - 6000 points earned)
   * Expected: Shows Gold tier with 6000 current cycle points, 20% progress to Platinum
   * Tests: Current cycle tier achievement and accurate progress calculation
   */
  test('displays Gold tier achievement in 2027 cycle', async () => {
    const tierData = {
      activeTier: 'GOLD',
      currentCycleEarnedPoints: 6000,
      expiryDate: new Date('2028-08-31T00:00:00.000Z'),
      tierSource: 'current',
      currentCycleYear: 2027,
      previousCycleEarnedPoints: 0
    };

    renderWithTierStatus(tierData);

    await waitFor(() => {
      expect(screen.getByText(/progress.*to.*platinum/i)).toBeInTheDocument();
      expect(screen.getByText(/6000.*points.*earned/i)).toBeInTheDocument();
      expect(screen.getByText(/10000.*points.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/4000.*points.*needed/i)).toBeInTheDocument();
    });
  });

  /**
   * Scenario: 2028 Cycle - Gold Carryover with Minimal Spending (Jan 8, 2028 - 200 points only)
   * Expected: Shows Gold active tier but Bronze current cycle achievement, progress to Silver
   * Tests: UI shows current cycle progress, not carryover tier progress
   */
  test('displays Gold carryover with minimal spending in 2028', async () => {
    const tierData = {
      activeTier: 'GOLD',
      currentCycleEarnedPoints: 200,
      expiryDate: new Date('2028-08-31T00:00:00.000Z'),
      tierSource: 'previous',
      currentCycleYear: 2028,
      previousCycleEarnedPoints: 6000
    };

    renderWithTierStatus(tierData);

    await waitFor(() => {
      expect(screen.getByText(/200.*points.*earned/i)).toBeInTheDocument();
      expect(screen.getByText(/progress.*to.*silver/i)).toBeInTheDocument();
      expect(screen.getByText(/1000.*points.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/800.*points.*needed/i)).toBeInTheDocument();
    });
  });

  /**
   * Scenario: 2029 Cycle - Recovery to Platinum (Aug 31, 2029 - 10000 points earned)
   * Expected: Shows Platinum achievement with 10000 current cycle points, 0% progress to Diamond
   * Tests: Recovery from downgrade and accurate progress at tier threshold
   */
  test('displays Platinum recovery in 2029 cycle', async () => {
    const tierData = {
      activeTier: 'PLATINUM',
      currentCycleEarnedPoints: 10000,
      expiryDate: new Date('2030-08-31T00:00:00.000Z'),
      tierSource: 'current',
      currentCycleYear: 2029,
      previousCycleEarnedPoints: 500
    };

    renderWithTierStatus(tierData);

    await waitFor(() => {
      expect(screen.getByText(/progress.*to.*diamond/i)).toBeInTheDocument();
      expect(screen.getByText(/10000.*points.*earned/i)).toBeInTheDocument();
      expect(screen.getByText(/20000.*points.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/10000.*points.*needed/i)).toBeInTheDocument();
    });
  });

  /**
   * Scenario: Tier card highlighting based on current cycle points
   * Expected: Tier cards show current cycle achievement, not carryover tier
   */
  test('highlights correct tier card based on current cycle points', async () => {
    const tierData = {
      activeTier: 'GOLD', // carryover from previous cycle
      currentCycleEarnedPoints: 200, // Bronze level in current cycle
      expiryDate: new Date('2028-08-31T00:00:00.000Z'),
      tierSource: 'previous',
      currentCycleYear: 2028
    };

    renderWithTierStatus(tierData);

    await waitFor(() => {
      expect(screen.getAllByText(/bronze/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/silver/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/gold/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/progress.*to.*silver/i)).toBeInTheDocument();
    });
  });

  /**
   * Scenario: Progress bar calculation accuracy
   * Expected: Progress percentage is calculated correctly for different scenarios
   */
  test('calculates progress bar correctly for various point levels', async () => {
    const tierData = {
      activeTier: 'SILVER',
      currentCycleEarnedPoints: 1500,
      expiryDate: new Date('2025-08-31T00:00:00.000Z'),
      tierSource: 'current',
      currentCycleYear: 2025
    };

    renderWithTierStatus(tierData);

    await waitFor(() => {
      expect(screen.getByText(/progress.*to.*gold/i)).toBeInTheDocument();
      expect(screen.getByText(/1500.*points.*earned/i)).toBeInTheDocument();
      expect(screen.getByText(/3500.*points.*needed/i)).toBeInTheDocument();
    });
  });

  /**
   * Scenario: Diamond tier maximum achievement
   * Expected: Shows special Diamond tier achievement UI
   */
  test('displays Diamond tier maximum achievement correctly', async () => {
    const tierData = {
      activeTier: 'DIAMOND',
      currentCycleEarnedPoints: 25000,
      expiryDate: new Date('2026-08-31T00:00:00.000Z'),
      tierSource: 'current',
      currentCycleYear: 2025
    };

    renderWithTierStatus(tierData);

    await waitFor(() => {
      expect(screen.getByText(/maximum.*tier.*achieved/i)).toBeInTheDocument();
      expect(screen.getByText(/25000.*points.*earned/i)).toBeInTheDocument();
      expect(screen.getByText(/highest.*tier/i)).toBeInTheDocument();
    });
  });
}); 