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
    
    // Use more flexible text matching for split text
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(mockAuthContext.user.points.toString())).toBeInTheDocument();
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
      expect(screen.getByText('Available: 1500')).toBeInTheDocument();
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
    expect(screen.getByText('My Transactions')).toBeInTheDocument();
    expect(screen.getByText('Transfer Points')).toBeInTheDocument();
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
    
    // Verify mock data is displayed (business data, not UI labels)
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Test Promotion')).toBeInTheDocument();
    
    // Verify tier system functionality (semantic content) - use getAllByText for multiple matches
    expect(screen.getAllByText(/silver/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/progress/i)).toBeInTheDocument();
  });
}); 