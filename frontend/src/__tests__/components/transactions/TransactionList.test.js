import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import TransactionList from '../../../components/transactions/TransactionList';
import theme from '../../../styles/theme';
import { FaPlus, FaMinus, FaEye } from 'react-icons/fa';

// Mock child components
jest.mock('../../../components/common/LoadingSpinner', () => {
  return function LoadingSpinner({ text }) {
    return <div data-testid="loading-spinner">{text}</div>;
  };
});

jest.mock('../../../components/transactions/TransactionItem', () => {
  return function TransactionItem({ transaction, handleViewTransaction }) {
    return (
      <div data-testid={`transaction-${transaction.id}`}>
        Transaction #{transaction.id}
        <button onClick={() => handleViewTransaction(transaction)}>View</button>
      </div>
    );
  };
});

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('TransactionList', () => {
  const defaultProps = {
    isLoading: false,
    transactions: [],
    startIndex: 1,
    endIndex: 10,
    totalCount: 0,
    totalPages: 1,
    filters: { page: 1 },
    handleFilterChange: jest.fn(),
    getTransactionIcon: jest.fn((type) => <FaEye />),
    getTransactionDetailsLabel: jest.fn((transaction) => `Details for ${transaction.id}`),
    isSuperuser: false,
    isManager: false,
    handleViewTransaction: jest.fn(),
    handleMarkAsSuspiciousClick: jest.fn(),
    handleApproveTransactionClick: jest.fn(),
    formatDate: jest.fn((date) => '2023-12-01'),
    formatTime: jest.fn((time) => '10:30 AM'),
  };

  const mockTransactions = [
    { id: 1, type: 'purchase', amount: 100 },
    { id: 2, type: 'redemption', amount: -50 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner when isLoading is true', () => {
    renderWithTheme(
      <TransactionList {...defaultProps} isLoading={true} />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  it('should show empty state when no transactions exist', () => {
    renderWithTheme(
      <TransactionList {...defaultProps} transactions={[]} />
    );

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
    expect(screen.getByText(/No transactions match your search criteria/)).toBeInTheDocument();
  });

  it('should show empty state when transactions is null', () => {
    renderWithTheme(
      <TransactionList {...defaultProps} transactions={null} />
    );

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });

  it('should render table header and transactions when data exists', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        totalCount={2}
      />
    );

    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Transaction')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    expect(screen.getByTestId('transaction-1')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-2')).toBeInTheDocument();
  });

  it('should display correct pagination info', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        startIndex={1}
        endIndex={2}
        totalCount={10}
        totalPages={5}
      />
    );

    expect(screen.getByText('Showing 1 to 2 of 10 transactions')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('should handle previous page button click', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        filters={{ page: 2 }}
        totalPages={5}
      />
    );

    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('page', 1);
  });

  it('should handle next page button click', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        filters={{ page: 1 }}
        totalPages={5}
      />
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('page', 2);
  });

  it('should disable previous button on first page', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        filters={{ page: 1 }}
      />
    );

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        filters={{ page: 5 }}
        totalPages={5}
      />
    );

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should handle edge case when endIndex exceeds totalCount', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        startIndex={8}
        endIndex={12}
        totalCount={10}
      />
    );

    expect(screen.getByText('Showing 8 to 10 of 10 transactions')).toBeInTheDocument();
  });

  it('should show "Page 1 of 1" when totalPages is 0', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        totalPages={0}
      />
    );

    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('should pass all props correctly to TransactionItem', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        isSuperuser={true}
        isManager={true}
      />
    );

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(defaultProps.handleViewTransaction).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it('should prevent page going below 1 when clicking previous', () => {
    renderWithTheme(
      <TransactionList 
        {...defaultProps} 
        transactions={mockTransactions}
        filters={{ page: 1 }}
      />
    );

    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);

    // When on page 1, the button is disabled, so no callback should be triggered
    expect(defaultProps.handleFilterChange).not.toHaveBeenCalled();
  });
}); 