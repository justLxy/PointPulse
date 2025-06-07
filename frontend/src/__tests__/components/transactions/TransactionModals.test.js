import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  ViewTransactionModal, 
  MarkSuspiciousModal, 
  ApproveRedemptionModal 
} from '../../../components/transactions/TransactionModals';

// Mock styled-components theme
jest.mock('../../../styles/theme', () => ({
  colors: {
    text: { primary: '#333', secondary: '#666' },
    border: { light: '#e0e0e0' },
    success: { main: '#27ae60' },
    error: { main: '#e74c3c', light: '#f8d7da' },
    background: { default: '#f8f9fa' }
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
  typography: {
    fontSize: { sm: '14px', lg: '18px', xl: '20px' },
    fontWeights: { medium: 500, semiBold: 600, bold: 700 }
  },
  radius: { md: '8px' }
}));

// Mock components
jest.mock('../../../components/common/Modal', () => ({ children, isOpen, onClose, title, size }) => 
  isOpen ? <div data-testid="modal" data-title={title} data-size={size}>{children}</div> : null
);

jest.mock('../../../components/common/Button', () => ({ children, onClick, loading, disabled, color, variant, style }) => (
  <button 
    onClick={onClick} 
    disabled={disabled || loading}
    data-color={color}
    data-variant={variant}
    data-loading={loading}
    style={style}
  >
    {loading ? 'Loading...' : children}
  </button>
));

jest.mock('../../../components/common/Badge', () => ({ children, color, style }) => (
  <span data-testid="badge" data-color={color} style={style}>{children}</span>
));

describe('TransactionModals', () => {
  const mockFormatDate = jest.fn((date) => '2024-01-15');
  const mockFormatTime = jest.fn((time) => '10:30 AM');
  const mockOnClose = jest.fn();
  const mockHandleMarkAsSuspicious = jest.fn();
  const mockHandleApproveTransaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ViewTransactionModal', () => {
    const baseTransaction = {
      id: 'TXN123',
      type: 'purchase',
      amount: 100,
      userName: 'John Doe',
      createdBy: 'Admin'
    };

    it('renders null when transaction is not provided', () => {
      const { container } = render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={null}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders transaction details for purchase type', () => {
      const transaction = { 
        ...baseTransaction, 
        spent: 50,
        suspicious: true,
        remark: 'Test remark',
        description: 'Test description',
        note: 'Test note'
      };

      render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Transaction Details: TXN123');
      expect(screen.getByText('Purchase')).toBeInTheDocument();
      expect(screen.getByText('+ 100 points')).toBeInTheDocument();
      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Test remark')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Test note')).toBeInTheDocument();
      expect(screen.getByText('Suspicious')).toBeInTheDocument();
    });

    it('renders transfer_in transaction with positive amount', () => {
      const transaction = { 
        ...baseTransaction, 
        type: 'transfer_in',
        amount: 50
      };

      render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Transfer In')).toBeInTheDocument();
      expect(screen.getByText('+ 50 points')).toBeInTheDocument();
    });

    it('renders transfer_out transaction with negative amount', () => {
      const transaction = { 
        ...baseTransaction, 
        type: 'transfer_out',
        amount: 30
      };

      render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Transfer Out')).toBeInTheDocument();
      expect(screen.getByText('- 30 points')).toBeInTheDocument();
    });

    it('renders adjustment transactions', () => {
      const addTransaction = { 
        ...baseTransaction, 
        type: 'adjustment_add',
        amount: 25
      };

      const { rerender } = render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={addTransaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Point Increase')).toBeInTheDocument();
      expect(screen.getByText('+ 25 points')).toBeInTheDocument();

      const removeTransaction = { 
        ...baseTransaction, 
        type: 'adjustment_remove',
        amount: 15
      };

      rerender(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={removeTransaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Point Decrease')).toBeInTheDocument();
      expect(screen.getByText('- 15 points')).toBeInTheDocument();
    });

    it('renders event transaction', () => {
      const transaction = { 
        ...baseTransaction, 
        type: 'event',
        amount: 20
      };

      render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Event')).toBeInTheDocument();
      expect(screen.getByText('+ 20 points')).toBeInTheDocument();
    });

    it('renders redemption transaction with status badge', () => {
      const transaction = { 
        ...baseTransaction, 
        type: 'redemption',
        amount: 40,
        status: 'pending'
      };

      render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Redemption')).toBeInTheDocument();
      expect(screen.getByText('- 40 points')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders different redemption statuses', () => {
      const approvedTransaction = { 
        ...baseTransaction, 
        type: 'redemption',
        amount: 30,
        status: 'approved'
      };

      const { rerender } = render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={approvedTransaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Approved')).toBeInTheDocument();

      const rejectedTransaction = { 
        ...baseTransaction, 
        type: 'redemption',
        amount: 30,
        status: 'rejected'
      };

      rerender(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={rejectedTransaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('renders promotion information', () => {
      const transaction = { 
        ...baseTransaction,
        promotionIds: ['PROMO1', 'PROMO2'],
        relatedPromotion: { name: 'Summer Sale', id: 'PROMO1' }
      };

      render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('PROMO1, PROMO2')).toBeInTheDocument();
      expect(screen.getByText('Summer Sale')).toBeInTheDocument();
    });

    it('renders event information', () => {
      const transaction = { 
        ...baseTransaction,
        relatedEvent: { name: 'Tech Conference', id: 'EVENT1' }
      };

      render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Tech Conference')).toBeInTheDocument();
    });

    it('falls back to user email and utorid', () => {
      const transaction = { 
        ...baseTransaction,
        userName: undefined,
        userEmail: 'test@example.com'
      };

      const { rerender } = render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();

      const transactionWithUtorid = { 
        ...baseTransaction,
        userName: undefined,
        userEmail: undefined,
        utorid: 'student123'
      };

      rerender(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transactionWithUtorid}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('student123')).toBeInTheDocument();
    });

    it('shows unknown user when no user info available', () => {
      const transaction = { 
        ...baseTransaction,
        userName: undefined,
        userEmail: undefined,
        utorid: undefined
      };

      render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      expect(screen.getByText('Unknown User')).toBeInTheDocument();
    });

    it('handles close button click', () => {
      render(
        <ViewTransactionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={baseTransaction}
          formatDate={mockFormatDate}
          formatTime={mockFormatTime}
        />
      );

      fireEvent.click(screen.getByText('Close'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('MarkSuspiciousModal', () => {
    const baseTransaction = {
      id: 'TXN123',
      type: 'purchase',
      suspicious: false
    };

    it('renders null when transaction is not provided', () => {
      const { container } = render(
        <MarkSuspiciousModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={null}
          handleMarkAsSuspicious={mockHandleMarkAsSuspicious}
          isMarkingAsSuspicious={false}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders mark as suspicious modal for non-suspicious transaction', () => {
      const { container } = render(
        <MarkSuspiciousModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={baseTransaction}
          handleMarkAsSuspicious={mockHandleMarkAsSuspicious}
          isMarkingAsSuspicious={false}
        />
      );

      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Mark as Suspicious');
      expect(container.textContent).toMatch(/mark as suspicious transaction #TXN123/);
      expect(container.textContent).toMatch(/This will deduct the points from the user's account/);
    });

    it('renders clear suspicious flag modal for suspicious transaction', () => {
      const suspiciousTransaction = { ...baseTransaction, suspicious: true };

      const { container } = render(
        <MarkSuspiciousModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={suspiciousTransaction}
          handleMarkAsSuspicious={mockHandleMarkAsSuspicious}
          isMarkingAsSuspicious={false}
        />
      );

      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Clear Suspicious Flag');
      expect(container.textContent).toMatch(/clear the suspicious flag for transaction #TXN123/);
      expect(container.textContent).toMatch(/This will credit the points back to the user's account/);
    });

    it('renders redemption-specific message', () => {
      const redemptionTransaction = { ...baseTransaction, type: 'redemption' };

      const { container } = render(
        <MarkSuspiciousModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={redemptionTransaction}
          handleMarkAsSuspicious={mockHandleMarkAsSuspicious}
          isMarkingAsSuspicious={false}
        />
      );

      expect(container.textContent).toMatch(/Note: Marking processed redemptions as suspicious will not affect the user's points balance/);
    });

    it('handles cancel button click', () => {
      render(
        <MarkSuspiciousModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={baseTransaction}
          handleMarkAsSuspicious={mockHandleMarkAsSuspicious}
          isMarkingAsSuspicious={false}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles mark as suspicious button click', () => {
      render(
        <MarkSuspiciousModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={baseTransaction}
          handleMarkAsSuspicious={mockHandleMarkAsSuspicious}
          isMarkingAsSuspicious={false}
        />
      );

      fireEvent.click(screen.getByText('Mark as Suspicious'));
      expect(mockHandleMarkAsSuspicious).toHaveBeenCalledWith(true);
    });

    it('handles clear suspicious flag button click', () => {
      const suspiciousTransaction = { ...baseTransaction, suspicious: true };

      render(
        <MarkSuspiciousModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={suspiciousTransaction}
          handleMarkAsSuspicious={mockHandleMarkAsSuspicious}
          isMarkingAsSuspicious={false}
        />
      );

      fireEvent.click(screen.getByText('Clear Suspicious Flag'));
      expect(mockHandleMarkAsSuspicious).toHaveBeenCalledWith(false);
    });

    it('disables buttons when loading', () => {
      render(
        <MarkSuspiciousModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={baseTransaction}
          handleMarkAsSuspicious={mockHandleMarkAsSuspicious}
          isMarkingAsSuspicious={true}
        />
      );

      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('ApproveRedemptionModal', () => {
    const baseTransaction = {
      id: 'TXN123',
      amount: 100,
      userName: 'John Doe',
      relatedPromotion: { name: 'Summer Sale' }
    };

    it('renders null when transaction is not provided', () => {
      const { container } = render(
        <ApproveRedemptionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={null}
          handleApproveTransaction={mockHandleApproveTransaction}
          isApprovingTransaction={false}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders approve redemption modal', () => {
      render(
        <ApproveRedemptionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={baseTransaction}
          handleApproveTransaction={mockHandleApproveTransaction}
          isApprovingTransaction={false}
        />
      );

      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Approve Redemption');
      expect(screen.getByText('TXN123')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('- 100 points')).toBeInTheDocument();
      expect(screen.getByText('Summer Sale')).toBeInTheDocument();
    });

    it('falls back to user email and utorid', () => {
      const transaction = { 
        ...baseTransaction,
        userName: undefined,
        userEmail: 'test@example.com'
      };

      const { rerender } = render(
        <ApproveRedemptionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          handleApproveTransaction={mockHandleApproveTransaction}
          isApprovingTransaction={false}
        />
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();

      const transactionWithUtorid = { 
        ...baseTransaction,
        userName: undefined,
        userEmail: undefined,
        utorid: 'student123'
      };

      rerender(
        <ApproveRedemptionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transactionWithUtorid}
          handleApproveTransaction={mockHandleApproveTransaction}
          isApprovingTransaction={false}
        />
      );

      expect(screen.getByText('student123')).toBeInTheDocument();
    });

    it('shows unknown user and promotion when not available', () => {
      const transaction = { 
        ...baseTransaction,
        userName: undefined,
        userEmail: undefined,
        utorid: undefined,
        relatedPromotion: undefined
      };

      render(
        <ApproveRedemptionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={transaction}
          handleApproveTransaction={mockHandleApproveTransaction}
          isApprovingTransaction={false}
        />
      );

      expect(screen.getByText('Unknown User')).toBeInTheDocument();
      expect(screen.getByText('Unknown Promotion')).toBeInTheDocument();
    });

    it('handles cancel button click', () => {
      render(
        <ApproveRedemptionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={baseTransaction}
          handleApproveTransaction={mockHandleApproveTransaction}
          isApprovingTransaction={false}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('handles approve redemption button click', () => {
      render(
        <ApproveRedemptionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={baseTransaction}
          handleApproveTransaction={mockHandleApproveTransaction}
          isApprovingTransaction={false}
        />
      );

      fireEvent.click(screen.getByText('Approve Redemption'));
      expect(mockHandleApproveTransaction).toHaveBeenCalledTimes(1);
    });

    it('disables buttons when loading', () => {
      render(
        <ApproveRedemptionModal 
          isOpen={true} 
          onClose={mockOnClose} 
          transaction={baseTransaction}
          handleApproveTransaction={mockHandleApproveTransaction}
          isApprovingTransaction={true}
        />
      );

      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
}); 