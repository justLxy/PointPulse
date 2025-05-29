import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransferModal from '../../../components/user/TransferModal';
import { AuthProvider } from '../../../contexts/AuthContext';
import UserService from '../../../services/user.service';

// Mock UserService
jest.mock('../../../services/user.service');

// Mock useUserTransactions hook
jest.mock('../../../hooks/useUserTransactions', () => ({
  __esModule: true,
  default: () => ({
    transferPoints: jest.fn(),
    isTransferringPoints: false
  })
}));

// Mock AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { utorid: 'testuser123' }
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Test wrapper component
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('TransferModal Component', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    availablePoints: 1000,
    prefillUtorid: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <TestWrapper>
        <TransferModal {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Transfer Points/i)).toBeInTheDocument();
    expect(screen.getByText(/Select the amount of points/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum: 1000 points/i)).toBeInTheDocument();
  });

  it('renders preset amount options', () => {
    render(
      <TestWrapper>
        <TransferModal {...defaultProps} />
      </TestWrapper>
    );
    
    const presetAmounts = [100, 200, 500, 1000, 2000, 5000];
    presetAmounts.forEach(amount => {
      expect(screen.getByText(amount.toString())).toBeInTheDocument();
    });
  });

  it('handles custom amount input', () => {
    render(
      <TestWrapper>
        <TransferModal {...defaultProps} />
      </TestWrapper>
    );
    
    const customInput = screen.getByPlaceholderText(/Enter points amount/i);
    fireEvent.change(customInput, { target: { value: '750' } });
    expect(customInput.value).toBe('750');
  });

  it('shows error for invalid amount', () => {
    render(
      <TestWrapper>
        <TransferModal {...defaultProps} />
      </TestWrapper>
    );
    
    const customInput = screen.getByPlaceholderText(/Enter points amount/i);
    fireEvent.change(customInput, { target: { value: '1500' } });
    
    expect(screen.getByText(/Exceeds available points/i)).toBeInTheDocument();
  });

  it('prefills utorid when provided', async () => {
    render(
      <TestWrapper>
        <TransferModal {...defaultProps} prefillUtorid="testuser" />
      </TestWrapper>
    );
    
    // First click continue to go to step 2
    const customInput = screen.getByPlaceholderText(/Enter points amount/i);
    fireEvent.change(customInput, { target: { value: '500' } });
    
    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);
    
    // Now we should see the UTORid input
    const utoridInput = await screen.findByPlaceholderText(/Enter recipient's UTORid/i);
    expect(utoridInput.value).toBe('testuser');
  });
}); 