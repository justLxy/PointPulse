/**
 * Core User Flow: Dashboard main interface and navigation
 * Tests role-based UI display, points management, and key user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';

// Mock the AuthContext
const mockAuthContext = {
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
  // Update mock context for role
  mockAuthContext.activeRole = userRole;
  mockAuthContext.user.role = userRole;
  
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
};

describe('Dashboard - Main User Interface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default role
    mockAuthContext.activeRole = 'regular';
    mockAuthContext.user.role = 'regular';
  });

  test('displays welcome message and points overview', () => {
    renderDashboard();
    
    expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument();
    expect(screen.getByText('Your Points Balance')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
  });

  test('shows redemption and transfer actions for points', async () => {
    renderDashboard();
    
    // Should show action buttons - use more specific selectors
    const redeemButton = screen.getByRole('button', { name: /redeem points/i });
    const transferButtons = screen.getAllByText(/transfer/i);
    
    expect(redeemButton).toBeInTheDocument();
    expect(transferButtons.length).toBeGreaterThan(0);
    
    // Test modal opening
    fireEvent.click(redeemButton);
    await waitFor(() => {
      expect(screen.getByTestId('redemption-modal')).toBeInTheDocument();
    });
    
    // Close modal
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('redemption-modal')).not.toBeInTheDocument();
    });
  });

  test('displays role-specific shortcuts for regular users', () => {
    renderDashboard('regular');
    
    expect(screen.getByText('My Transactions')).toBeInTheDocument();
    expect(screen.getByText('Transfer Points')).toBeInTheDocument();
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  test('displays role-specific shortcuts for cashiers', () => {
    renderDashboard('cashier');
    
    // Cashiers should see different shortcuts
    expect(screen.queryByText('My Transactions')).not.toBeInTheDocument();
    expect(screen.queryByText('Transfer Points')).not.toBeInTheDocument();
  });

  test('displays role-specific shortcuts for managers', () => {
    renderDashboard('manager');
    
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    // Should not show regular user shortcuts
    expect(screen.queryByText('My Transactions')).not.toBeInTheDocument();
  });

  test('shows user QR code for transactions', () => {
    renderDashboard();
    
    expect(screen.getByText('Your Universal QR Code')).toBeInTheDocument();
    expect(screen.getByTestId('universal-qr-code')).toBeInTheDocument();
  });

  test('displays upcoming events section', () => {
    renderDashboard();
    
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  test('displays active promotions section', () => {
    renderDashboard();
    
    expect(screen.getByText('Active Promotions')).toBeInTheDocument();
    expect(screen.getByText('Test Promotion')).toBeInTheDocument();
  });

  test('handles transfer modal workflow', async () => {
    renderDashboard();
    
    // Click transfer button from points actions - use getAllByRole to handle multiple elements
    const transferButtons = screen.getAllByRole('button', { name: /transfer/i });
    // Use the first transfer button (from points actions)
    fireEvent.click(transferButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByTestId('transfer-modal')).toBeInTheDocument();
      expect(screen.getByText('Available: 1500')).toBeInTheDocument();
    });
    
    // Close modal
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('transfer-modal')).not.toBeInTheDocument();
    });
  });

  test('displays member level and progress information', () => {
    renderDashboard();
    
    // Should show some level information (the exact content depends on points calculation)
    // Just verify the level system is rendered
    expect(screen.getByText(/level/i)).toBeInTheDocument();
  });
}); 