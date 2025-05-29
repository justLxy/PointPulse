import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

// Mock custom hooks - correct path from test file location to hooks directory
jest.mock('../../../hooks/useUserTransactions', () => ({
  __esModule: true,
  default: () => ({
    createRedemption: jest.fn().mockImplementation(({ amount }) => {
      if (amount > 10000) {
        return Promise.reject(new Error('Redemption limit exceeded'));
      }
      return Promise.resolve();
    }),
    isCreatingRedemption: false,
  }),
}));

jest.mock('../../../hooks/usePendingRedemptions', () => ({
  __esModule: true,
  default: () => ({
    pendingTotal: 500,
    refetch: jest.fn(),
  }),
}));

describe('RedemptionModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    availablePoints: 3000
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders initial step correctly when open', () => {
    render(<RedemptionModal {...defaultProps} />);
    
    expect(screen.getByText('Redeem Points')).toBeInTheDocument();
    expect(screen.getByText(/Select the amount of points you'd like to redeem/i)).toBeInTheDocument();
    
    // Verify preset amount options
    [100, 200, 500, 1000, 2000, 5000].forEach(amount => {
      expect(screen.getByText(`${amount}`)).toBeInTheDocument();
    });
    
    // Verify points information - use more flexible text matching for numbers that may be split
    expect(screen.getByText(/Total Points:/)).toBeInTheDocument();
    expect(screen.getByText(/3000/)).toBeInTheDocument();
    expect(screen.getByText(/Pending Redemptions:/)).toBeInTheDocument();
    // Use more specific text matching to avoid multiple matches
    expect(screen.getByText(/Available for Redemption:/)).toBeInTheDocument();
    expect(screen.getByText(/2500/)).toBeInTheDocument();
    
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('allows selecting preset amounts', () => {
    render(<RedemptionModal {...defaultProps} />);
    
    const option500 = screen.getByText('500');
    fireEvent.click(option500);
    
    expect(screen.getByText('Continue')).not.toBeDisabled();
  });

  it('allows entering custom amount', async () => {
    render(<RedemptionModal {...defaultProps} />);
    
    const customInput = screen.getByPlaceholderText('Enter a custom amount');
    fireEvent.change(customInput, { target: { value: '750' } });
    
    expect(customInput).toHaveValue(750);
    expect(screen.getByText('Continue')).not.toBeDisabled();
  });

  it('disables continue button for insufficient amount', async () => {
    render(<RedemptionModal {...defaultProps} />);
    
    const customInput = screen.getByPlaceholderText('Enter a custom amount');
    fireEvent.change(customInput, { target: { value: '2600' } }); // Above available (2500)
    
    // The Continue button should be disabled for amounts above available
    expect(screen.getByText('Continue')).toBeDisabled();
  });

  it('navigates to step 2 when amount is valid', async () => {
    render(<RedemptionModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('500'));
    fireEvent.click(screen.getByText('Continue'));
    
    await waitFor(() => {
      expect(screen.getByText(/You're about to redeem 500 points/i)).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
      expect(screen.getByText('Confirm Redemption')).toBeInTheDocument();
    });
  });

  it('allows returning from step 2 to step 1', async () => {
    render(<RedemptionModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('500'));
    fireEvent.click(screen.getByText('Continue'));
    
    await screen.findByText(/You're about to redeem 500 points/i);
    
    fireEvent.click(screen.getByText('Back'));
    
    expect(screen.getByText(/Select the amount of points you'd like to redeem/i)).toBeInTheDocument();
  });

  it('allows entering remark in step 2', async () => {
    render(<RedemptionModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('500'));
    fireEvent.click(screen.getByText('Continue'));
    
    await screen.findByText(/You're about to redeem 500 points/i);
    
    const remarkInput = screen.getByPlaceholderText('e.g., Lunch discount');
    fireEvent.change(remarkInput, { target: { value: 'Lunch discount' } });
    
    expect(remarkInput).toHaveValue('Lunch discount');
  });

  it('does not render when closed', () => {
    render(<RedemptionModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Redeem Points')).not.toBeInTheDocument();
  });
});