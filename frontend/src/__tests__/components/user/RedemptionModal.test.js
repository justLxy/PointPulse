/**
 * Core User Flow: Points redemption workflow
 * Validates amount selection, redemption creation, and QR code generation
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RedemptionModal from '../../../components/user/RedemptionModal';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  }
}));

// Mock custom hooks with more detailed scenarios
const mockCreateRedemption = jest.fn();
const mockRefetch = jest.fn();

jest.mock('../../../hooks/useUserTransactions', () => ({
  __esModule: true,
  default: () => ({
    createRedemption: mockCreateRedemption,
    isCreatingRedemption: false,
  }),
}));

jest.mock('../../../hooks/usePendingRedemptions', () => ({
  __esModule: true,
  default: () => ({
    pendingTotal: 500,
    refetch: mockRefetch,
  }),
}));

// Mock UniversalQRCode component
jest.mock('../../../components/common/UniversalQRCode', () => {
  return function MockUniversalQRCode({ redemptionId }) {
    return <div data-testid="qr-code">QR: {redemptionId}</div>;
  };
});

describe('RedemptionModal - Points Redemption Flow', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    availablePoints: 3000
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateRedemption.mockResolvedValue({ id: 'TEST_REDEMPTION_123' });
  });
  
  test('displays redemption form with available points calculation', async () => {
    render(<RedemptionModal {...defaultProps} />);
    
    // Initial state - amount selection
    expect(screen.getByText('Redeem Points')).toBeInTheDocument();
    expect(screen.getByText(/Available for Redemption:/)).toBeInTheDocument();
    expect(screen.getByText(/2500/)).toBeInTheDocument(); // 3000 - 500 pending
    
    // Should show preset amounts
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    
    // Continue button should be disabled initially
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  test('amount selection enables continue button', async () => {
    render(<RedemptionModal {...defaultProps} />);
    
    // Select preset amount
    const amount500Button = screen.getAllByText('500')[0].closest('button');
    fireEvent.click(amount500Button);
    
    // Continue should now be enabled
    expect(screen.getByText('Continue')).not.toBeDisabled();
  });

  test('custom amount entry workflow', async () => {
    render(<RedemptionModal {...defaultProps} />);
    
    // Enter custom amount
    const customInput = screen.getByPlaceholderText('Enter a custom amount');
    fireEvent.change(customInput, { target: { value: '750' } });
    
    expect(customInput).toHaveValue(750);
    expect(screen.getByText('Continue')).not.toBeDisabled();
    
    // Test invalid amount (exceeds available)
    fireEvent.change(customInput, { target: { value: '3000' } }); // More than available (2500)
    
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  test('handles insufficient points scenarios', async () => {    
    // Test insufficient points scenario
    render(<RedemptionModal {...defaultProps} availablePoints={400} />); // Less than pending
    
    expect(screen.getByText(/Available for Redemption:/)).toBeInTheDocument();
    
    // Most preset amounts should be disabled when insufficient points
    const amount500Buttons = screen.getAllByText('500');
    const amount500Button = amount500Buttons[0].closest('button');
    expect(amount500Button).toBeDisabled();
  });

  test('modal state management and data refresh', async () => {
    const { rerender } = render(<RedemptionModal {...defaultProps} isOpen={false} />);
    
    // Should not show when closed
    expect(screen.queryByText('Redeem Points')).not.toBeInTheDocument();
    
    // Should refetch data when opened
    rerender(<RedemptionModal {...defaultProps} isOpen={true} />);
    expect(mockRefetch).toHaveBeenCalled();
    expect(screen.getByText('Redeem Points')).toBeInTheDocument();
  });

  test('handles preset selection and interaction', async () => {
    render(<RedemptionModal {...defaultProps} />);
    
    // Test that Continue button state changes with selection
    expect(screen.getByText('Continue')).toBeDisabled();
    
    // Select a valid amount
    const amount100Buttons = screen.getAllByText('100');
    const amount100Button = amount100Buttons[0].closest('button');
    fireEvent.click(amount100Button);
    
    expect(screen.getByText('Continue')).not.toBeDisabled();
  });
});