import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import TransactionItem from '../../../components/transactions/TransactionItem';
import theme from '../../../styles/theme';
import { FaPlus, FaMinus, FaEye, FaExchangeAlt } from 'react-icons/fa';

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('TransactionItem', () => {
  const mockProps = {
    getTransactionIcon: jest.fn((type) => {
      switch (type) {
        case 'purchase': return <FaPlus />;
        case 'redemption': return <FaMinus />;
        case 'transfer': return <FaExchangeAlt />;
        default: return <FaEye />;
      }
    }),
    getTransactionDetailsLabel: jest.fn(),
    handleViewTransaction: jest.fn(),
    handleMarkAsSuspiciousClick: jest.fn(),
    handleApproveTransactionClick: jest.fn(),
    formatDate: jest.fn().mockReturnValue('2023-12-01'),
    formatTime: jest.fn().mockReturnValue('10:30 AM'),
    isSuperuser: false,
    isManager: false,
  };

  const baseTransaction = {
    id: 123,
    type: 'purchase',
    amount: 100,
    createdAt: '2023-12-01T10:30:00Z',
    suspicious: false,
    status: 'completed'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockProps.getTransactionDetailsLabel.mockImplementation((transaction) => `Details for ${transaction.type}`);
    mockProps.formatDate.mockReturnValue('2023-12-01');
    mockProps.formatTime.mockReturnValue('10:30 AM');
  });

  it('should return null when transaction is not provided', () => {
    const { container } = renderWithTheme(
      <TransactionItem {...mockProps} transaction={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render basic transaction information', () => {
    renderWithTheme(
      <TransactionItem {...mockProps} transaction={baseTransaction} />
    );

    expect(screen.getByText(/Transaction #123/)).toBeInTheDocument();
    expect(screen.getByText('Purchase')).toBeInTheDocument();
    expect(screen.getByText(/\+ 100 points/)).toBeInTheDocument();
    expect(screen.getByText('Details for purchase')).toBeInTheDocument();
  });

  it('should format different transaction types correctly', () => {
    const transactions = [
      { ...baseTransaction, type: 'transfer_in' },
      { ...baseTransaction, type: 'transfer_out' },
      { ...baseTransaction, type: 'adjustment_add' },
      { ...baseTransaction, type: 'adjustment_remove' },
      { ...baseTransaction, type: 'event' }
    ];

    transactions.forEach((transaction, index) => {
      const { unmount } = renderWithTheme(
        <TransactionItem {...mockProps} transaction={transaction} />
      );
      
      const expectedTypes = ['Transfer In', 'Transfer Out', 'Point Increase', 'Point Decrease', 'Event'];
      expect(screen.getByText(expectedTypes[index])).toBeInTheDocument();
      unmount();
    });
  });

  it('should display negative amount correctly', () => {
    const negativeTransaction = { ...baseTransaction, amount: -50 };
    renderWithTheme(
      <TransactionItem {...mockProps} transaction={negativeTransaction} />
    );

    expect(screen.getByText(/- 50 points/)).toBeInTheDocument();
  });

  it('should display suspicious badge when transaction is suspicious', () => {
    const suspiciousTransaction = { ...baseTransaction, suspicious: true };
    renderWithTheme(
      <TransactionItem {...mockProps} transaction={suspiciousTransaction} />
    );

    expect(screen.getByText('Suspicious')).toBeInTheDocument();
  });

  it('should display redemption status badges', () => {
    const statuses = ['pending', 'approved', 'rejected'];
    const expectedTexts = ['Pending', 'Approved', 'Rejected'];

    statuses.forEach((status, index) => {
      const transaction = { ...baseTransaction, type: 'redemption', status };
      const { unmount } = renderWithTheme(
        <TransactionItem {...mockProps} transaction={transaction} />
      );
      
      expect(screen.getByText(expectedTexts[index])).toBeInTheDocument();
      unmount();
    });
  });

  it('should display date and time when createdAt is provided', () => {
    const { container } = renderWithTheme(
      <TransactionItem {...mockProps} transaction={baseTransaction} />
    );

    expect(mockProps.formatDate).toHaveBeenCalledWith('2023-12-01T10:30:00Z');
    expect(mockProps.formatTime).toHaveBeenCalledWith('2023-12-01T10:30:00Z');
    expect(screen.getByText(/Date:/)).toBeInTheDocument();
    
    // Check that the formatted date and time appear in the container
    expect(container.textContent).toContain('2023-12-01');
    expect(container.textContent).toContain('10:30 AM');
  });

  it('should handle view transaction button click', () => {
    renderWithTheme(
      <TransactionItem {...mockProps} transaction={baseTransaction} />
    );

    const viewButton = screen.getByRole('button');
    fireEvent.click(viewButton);

    expect(mockProps.handleViewTransaction).toHaveBeenCalledWith(baseTransaction);
  });

  it('should show approve button for superuser on pending redemptions', () => {
    const pendingRedemption = {
      ...baseTransaction,
      type: 'redemption',
      status: 'pending'
    };

    renderWithTheme(
      <TransactionItem 
        {...mockProps} 
        transaction={pendingRedemption}
        isSuperuser={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // View + Approve
    
    fireEvent.click(buttons[1]);
    expect(mockProps.handleApproveTransactionClick).toHaveBeenCalledWith(pendingRedemption);
  });

  it('should show mark suspicious button for managers', () => {
    renderWithTheme(
      <TransactionItem 
        {...mockProps} 
        transaction={baseTransaction}
        isManager={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2); // View + Mark Suspicious
    
    fireEvent.click(buttons[1]);
    expect(mockProps.handleMarkAsSuspiciousClick).toHaveBeenCalledWith(baseTransaction);
  });

  it('should show different styling for suspicious mark button when transaction is suspicious', () => {
    const suspiciousTransaction = { ...baseTransaction, suspicious: true };
    renderWithTheme(
      <TransactionItem 
        {...mockProps} 
        transaction={suspiciousTransaction}
        isManager={true}
      />
    );

    const suspiciousButton = screen.getAllByRole('button')[1];
    expect(suspiciousButton).toHaveAttribute('title', 'Clear suspicious flag');
  });

  it('should show correct title for non-suspicious transactions', () => {
    renderWithTheme(
      <TransactionItem 
        {...mockProps} 
        transaction={baseTransaction}
        isManager={true}
      />
    );

    const suspiciousButton = screen.getAllByRole('button')[1];
    expect(suspiciousButton).toHaveAttribute('title', 'Mark as suspicious');
  });

  it('should call helper functions with correct parameters', () => {
    renderWithTheme(
      <TransactionItem {...mockProps} transaction={baseTransaction} />
    );

    expect(mockProps.getTransactionIcon).toHaveBeenCalledWith('purchase');
    expect(mockProps.getTransactionDetailsLabel).toHaveBeenCalledWith(baseTransaction);
    expect(mockProps.formatDate).toHaveBeenCalledWith('2023-12-01T10:30:00Z');
    expect(mockProps.formatTime).toHaveBeenCalledWith('2023-12-01T10:30:00Z');
  });

  it('should handle transaction without createdAt', () => {
    const transactionWithoutDate = { ...baseTransaction, createdAt: null };
    renderWithTheme(
      <TransactionItem {...mockProps} transaction={transactionWithoutDate} />
    );

    expect(screen.queryByText(/Date:/)).not.toBeInTheDocument();
  });

  it('should show all buttons for superuser manager', () => {
    const pendingRedemption = {
      ...baseTransaction,
      type: 'redemption',
      status: 'pending'
    };

    renderWithTheme(
      <TransactionItem 
        {...mockProps} 
        transaction={pendingRedemption}
        isSuperuser={true}
        isManager={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3); // View + Approve + Mark Suspicious
  });
}); 