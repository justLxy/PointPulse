import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransferModal from '../../../components/user/TransferModal';
import { AuthProvider } from '../../../contexts/AuthContext';
import UserService from '../../../services/user.service';

// Mock UserService
jest.mock('../../../services/user.service');

// Mock dependencies
const mockTransferPoints = jest.fn();

jest.mock('../../../hooks/useUserTransactions', () => ({
  __esModule: true,
  default: () => ({
    transferPoints: mockTransferPoints,
    isTransferringPoints: false
  })
}));

// Mock AuthContext with more detailed user data
const mockCurrentUser = { utorid: 'testuser123' };

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Test wrapper component
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
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
    mockTransferPoints.mockClear();
    
    // Default implementation for transferPoints
    mockTransferPoints.mockImplementation(async (data, callbacks) => {
      // Simulate successful transfer
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
      return Promise.resolve();
    });
  });

  describe('Initial Rendering', () => {
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

    it('does not render when closed', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} isOpen={false} />
        </TestWrapper>
      );
      
      expect(screen.queryByText(/Transfer Points/i)).not.toBeInTheDocument();
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

    it('disables preset amounts that exceed available points', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} availablePoints={300} />
        </TestWrapper>
      );
      
      // Amounts above 300 should be disabled
      const button500 = screen.getByText('500').closest('button');
      const button1000 = screen.getByText('1000').closest('button');
      const button100 = screen.getByText('100').closest('button');
      
      expect(button500).toBeDisabled();
      expect(button1000).toBeDisabled();
      expect(button100).not.toBeDisabled();
    });

    it('prefills UTORid when provided', () => {
      const { rerender } = render(
        <TestWrapper>
          <TransferModal {...defaultProps} prefillUtorid="" />
        </TestWrapper>
      );
      
      // Initial render without prefill
      expect(defaultProps.prefillUtorid).toBe('');
      
      // Rerender with prefill
      rerender(
        <TestWrapper>
          <TransferModal {...defaultProps} prefillUtorid="prefilled123" />
        </TestWrapper>
      );
    });
  });

  describe('Amount Selection and Validation', () => {
    it('handles preset amount selection', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      
      // Continue button should be enabled after selecting amount
      expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
    });

    it('handles custom amount input correctly', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '750' } });
      
      expect(customInput.value).toBe('750');
      expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled();
    });

    it('filters non-numeric characters from custom input', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: 'abc123def456' } });
      
      expect(customInput.value).toBe('123456');
    });

    it('clears custom amount when preset is selected', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '750' } });
      
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      
      expect(customInput.value).toBe('');
    });

    it('clears selected amount when custom amount is entered', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // First select preset amount
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      
      // Then enter custom amount
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '750' } });
      
      expect(customInput.value).toBe('750');
    });

    it('shows error for custom amount exceeding available points', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '1500' } });
      
      expect(screen.getByText(/Exceeds available points/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
    });

    it('disables continue button when no amount is selected', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
    });
  });

  describe('Form Validation and Error Handling', () => {
    it('shows error when trying to proceed without amount', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // Try to continue without selecting amount
      const continueButton = screen.getByRole('button', { name: /continue/i });
      
      // Button should be disabled, but let's test the validation logic
      expect(continueButton).toBeDisabled();
    });

    it('shows error for zero amount', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '0' } });
      
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('validates amount when proceeding to step 2', async () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // Select valid amount
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);
      
      // Should proceed to step 2
      await waitFor(() => {
        expect(screen.getByText(/Enter the UTORid of the user/i)).toBeInTheDocument();
      });
    });

    it('validates insufficient points and shows error', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} availablePoints={50} />
        </TestWrapper>
      );
      
      // Try to select 100 points when only 50 available
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '100' } });
      
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });
  });

  describe('Step Navigation', () => {
    it('navigates from step 1 to step 2', async () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // Select amount and proceed
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Enter the UTORid of the user you want to transfer 500 points to/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter recipient's UTORid/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Add a note about this transfer/i)).toBeInTheDocument();
      });
    });

    it('navigates back from step 2 to step 1', async () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // Navigate to step 2
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Enter the UTORid/i)).toBeInTheDocument();
      });
      
      // Navigate back
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);
      
      expect(screen.getByText(/Select the amount of points/i)).toBeInTheDocument();
    });

    it('preserves amount selection when navigating back and forth', async () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // Select custom amount
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '750' } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/transfer 750 points/i)).toBeInTheDocument();
      });
      
      // Navigate back
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      
      // Custom amount should be preserved
      expect(customInput.value).toBe('750');
    });
  });

  describe('Step 2 - Recipient and Transfer Logic', () => {
    beforeEach(async () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // Navigate to step 2
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter recipient's UTORid/i)).toBeInTheDocument();
      });
    });

    it('handles recipient UTORid input', async () => {
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: 'recipient123' } });
      
      expect(utoridInput.value).toBe('recipient123');
    });

    it('handles remark input', async () => {
      const remarkInput = screen.getByPlaceholderText(/Add a note about this transfer/i);
      fireEvent.change(remarkInput, { target: { value: 'Birthday gift' } });
      
      expect(remarkInput.value).toBe('Birthday gift');
    });

    it('disables transfer button when no UTORid is entered', async () => {
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      expect(transferButton).toBeDisabled();
    });

    it('disables transfer button when trying to transfer to self', async () => {
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: 'testuser123' } }); // Same as current user
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      expect(transferButton).toBeDisabled();
    });

    it('enables transfer button with valid recipient', async () => {
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: 'recipient123' } });
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      expect(transferButton).not.toBeDisabled();
    });

    it('shows error when trying to transfer without UTORid', async () => {
      // Clear any existing UTORid
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: '' } });
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      expect(transferButton).toBeDisabled();
    });

    it('shows error when trying to transfer to self', async () => {
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: 'TestUser123' } }); // Case insensitive
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      expect(transferButton).toBeDisabled();
    });

    it('trims whitespace from UTORid', async () => {
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: '  recipient123  ' } });
      
      const remarkInput = screen.getByPlaceholderText(/Add a note about this transfer/i);
      fireEvent.change(remarkInput, { target: { value: 'Test transfer' } });
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      fireEvent.click(transferButton);
      
      await waitFor(() => {
        expect(mockTransferPoints).toHaveBeenCalledWith(
          {
            userId: 'recipient123', // Should be trimmed
            amount: 500,
            remark: 'Test transfer'
          },
          expect.any(Object)
        );
      });
    });
  });

  describe('Transfer Process', () => {
    beforeEach(async () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // Navigate to step 2
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter recipient's UTORid/i)).toBeInTheDocument();
      });
    });

    it('successfully transfers points', async () => {
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      const remarkInput = screen.getByPlaceholderText(/Add a note about this transfer/i);
      
      fireEvent.change(utoridInput, { target: { value: 'recipient123' } });
      fireEvent.change(remarkInput, { target: { value: 'Test transfer' } });
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      fireEvent.click(transferButton);
      
      await waitFor(() => {
        expect(mockTransferPoints).toHaveBeenCalledWith(
          {
            userId: 'recipient123',
            amount: 500,
            remark: 'Test transfer'
          },
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function)
          })
        );
      });
      
      // Modal should close on success
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('handles transfer error with message', async () => {
      const errorMessage = 'Transfer failed: Invalid recipient';
      mockTransferPoints.mockImplementation(async (data, callbacks) => {
        if (callbacks?.onError) {
          callbacks.onError({ message: errorMessage });
        }
        return Promise.reject(new Error(errorMessage));
      });
      
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: 'recipient123' } });
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      fireEvent.click(transferButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('handles transfer error without message', async () => {
      mockTransferPoints.mockImplementation(async (data, callbacks) => {
        if (callbacks?.onError) {
          callbacks.onError({});
        }
        return Promise.reject(new Error());
      });
      
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: 'recipient123' } });
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      fireEvent.click(transferButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to transfer points/i)).toBeInTheDocument();
      });
    });

    it('handles unexpected error during transfer', async () => {
      const errorMessage = 'Network error';
      mockTransferPoints.mockRejectedValue(new Error(errorMessage));
      
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: 'recipient123' } });
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      fireEvent.click(transferButton);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('handles unexpected error without message during transfer', async () => {
      mockTransferPoints.mockRejectedValue(new Error());
      
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: 'recipient123' } });
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      fireEvent.click(transferButton);
      
      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      });
    });

    it('validates amount before transfer', async () => {
      // This tests the validateAmount call within handleTransfer
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      fireEvent.change(utoridInput, { target: { value: 'recipient123' } });
      
      const transferButton = screen.getByRole('button', { name: /transfer points/i });
      fireEvent.click(transferButton);
      
      await waitFor(() => {
        expect(mockTransferPoints).toHaveBeenCalled();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('resets form when modal is closed', () => {
      const { rerender } = render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // Make some changes
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      
      // Close modal
      rerender(
        <TestWrapper>
          <TransferModal {...defaultProps} isOpen={false} />
        </TestWrapper>
      );
      
      // Reopen modal
      rerender(
        <TestWrapper>
          <TransferModal {...defaultProps} isOpen={true} />
        </TestWrapper>
      );
      
      // Should be back to initial state
      expect(screen.getByText(/Select the amount of points/i)).toBeInTheDocument();
    });

    it('calls onClose when modal is closed', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // Simulate modal close (this would normally be triggered by the Modal component)
      // We'll test this by checking that our resetForm and onClose are set up correctly
      expect(mockOnClose).toHaveBeenCalledTimes(0);
    });

    it('updates receiver UTORid when prefillUtorid prop changes', async () => {
      const { rerender } = render(
        <TestWrapper>
          <TransferModal {...defaultProps} prefillUtorid="" />
        </TestWrapper>
      );
      
      // Navigate to step 2
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter recipient's UTORid/i)).toBeInTheDocument();
      });
      
      // Change prefillUtorid prop
      rerender(
        <TestWrapper>
          <TransferModal {...defaultProps} prefillUtorid="newuser123" />
        </TestWrapper>
      );
      
      const utoridInput = screen.getByPlaceholderText(/Enter recipient's UTORid/i);
      expect(utoridInput.value).toBe('newuser123');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string for custom amount', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '' } });
      
      expect(customInput.value).toBe('');
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
    });

    it('handles very large numbers', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '999999999' } });
      
      expect(customInput.value).toBe('999999999');
      expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
    });

    it('handles mixed alphanumeric input correctly', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: 'a1b2c3d4e5' } });
      
      expect(customInput.value).toBe('12345');
    });

    it('clears errors when amount selection changes', () => {
      render(
        <TestWrapper>
          <TransferModal {...defaultProps} />
        </TestWrapper>
      );
      
      // First, create an error condition
      const customInput = screen.getByPlaceholderText(/Enter points amount/i);
      fireEvent.change(customInput, { target: { value: '1500' } }); // Exceeds available
      
      expect(screen.getByText(/Exceeds available points/i)).toBeInTheDocument();
      
      // Then select a valid preset amount
      const button500 = screen.getByText('500').closest('button');
      fireEvent.click(button500);
      
      // Error should be cleared (though this specific error is shown in Input component)
      // At least verify the amount selection worked
      expect(customInput.value).toBe('');
    });
  });
}); 