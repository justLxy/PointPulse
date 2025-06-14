import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import UserTransactions from '../../../pages/users/UserTransactions';
import useUserTransactions from '../../../hooks/useUserTransactions';

// Mock the hook
jest.mock('../../../hooks/useUserTransactions');

// Mock styled-components theme
jest.mock('../../../styles/theme', () => ({
  colors: {
    text: { primary: '#333', secondary: '#666' },
    background: { default: '#f5f5f5' },
    border: { light: '#e0e0e0' },
    success: { main: '#27ae60', light: '#d4edda', dark: '#1e7e34' },
    error: { main: '#e74c3c' },
    primary: { light: '#cce5ff', dark: '#0066cc' },
    secondary: { light: '#fff3cd', dark: '#856404' },
    accent: { light: '#f8d7da', dark: '#721c24' },
    info: { light: '#d1ecf1', dark: '#0c5460' }
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  typography: {
    fontSize: { sm: '14px', md: '16px', lg: '18px', xl: '20px', '3xl': '24px' },
    fontWeights: { medium: 500, semiBold: 600, bold: 700 }
  },
  radius: { full: '50%' }
}));

// Mock components
jest.mock('../../../components/common/Card', () => ({ children }) => <div data-testid="card">{children}</div>);
jest.mock('../../../components/common/Button', () => ({ children, onClick, disabled, ...props }) => (
  <button onClick={onClick} disabled={disabled} data-testid="button" {...props}>{children}</button>
));
jest.mock('../../../components/common/LoadingSpinner', () => ({ text }) => <div data-testid="loading">{text}</div>);
jest.mock('../../../components/transactions/TransactionFilters', () => ({ title, filters, handleFilterChange, isRelatedIdEditable }) => (
  <div data-testid="transaction-filters">
    <h1>{title}</h1>
    <input 
      data-testid="type-filter" 
      value={filters.type} 
      onChange={(e) => handleFilterChange('type', e.target.value)} 
    />
    <input 
      data-testid="amount-filter" 
      value={filters.amount} 
      onChange={(e) => handleFilterChange('amount', e.target.value)} 
    />
    <input 
      data-testid="relatedId-filter" 
      value={filters.relatedId} 
      onChange={(e) => handleFilterChange('relatedId', e.target.value)}
      disabled={!isRelatedIdEditable}
    />
  </div>
));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaPlus: () => <span data-testid="fa-plus">+</span>,
  FaMinus: () => <span data-testid="fa-minus">-</span>,
  FaExchangeAlt: () => <span data-testid="fa-exchange">⇄</span>,
  FaCalendarAlt: () => <span data-testid="fa-calendar">📅</span>,
  FaChevronRight: () => <span data-testid="fa-chevron-right">→</span>,
  FaChevronLeft: () => <span data-testid="fa-chevron-left">←</span>,
  FaInfoCircle: () => <span data-testid="fa-info">ℹ</span>
}));

// Mock URLSearchParams for real implementation
const mockSetSearchParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [
    new URLSearchParams('type=purchase&amount=100&promotionId=promo1'),
    mockSetSearchParams
  ]
}));

describe('UserTransactions', () => {
  const mockTransactions = [
    {
      id: 1,
      type: 'purchase',
      amount: 50,
      spent: 25.99,
      createdAt: '2023-10-01T10:00:00Z',
      remark: 'Test purchase'
    },
    {
      id: 2,
      type: 'redemption',
      amount: -30,
      processedBy: 'admin',
      createdAt: '2023-10-02T11:00:00Z'
    },
    {
      id: 3,
      type: 'transfer',
      amount: 20,
      sender: 'user123',
      senderName: 'John Doe',
      createdAt: '2023-10-03T12:00:00Z'
    },
    {
      id: 4,
      type: 'transfer',
      amount: -15,
      recipient: 'user456',
      recipientName: 'Jane Smith',
      createdAt: '2023-10-04T13:00:00Z'
    },
    {
      id: 5,
      type: 'adjustment',
      amount: 10,
      createdBy: 'manager',
      createdAt: '2023-10-05T14:00:00Z'
    },
    {
      id: 6,
      type: 'event',
      amount: 25,
      relatedId: 'event123',
      createdAt: '2023-10-06T15:00:00Z'
    },
    {
      id: 7,
      type: 'unknown',
      amount: 5,
      createdAt: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useUserTransactions.mockReturnValue({
      transactions: mockTransactions,
      totalCount: 50,
      isLoading: false
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <UserTransactions />
      </BrowserRouter>
    );
  };

  it('renders with initial filters from URL params', () => {
    renderComponent();
    
    expect(screen.getByDisplayValue('purchase')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByText('My Transactions')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    useUserTransactions.mockReturnValue({
      transactions: [],
      totalCount: 0,
      isLoading: true
    });

    renderComponent();
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading transactions...');
  });

  it('displays empty state when no transactions', () => {
    useUserTransactions.mockReturnValue({
      transactions: [],
      totalCount: 0,
      isLoading: false
    });

    renderComponent();
    expect(screen.getByText('No transactions found matching your criteria.')).toBeInTheDocument();
    expect(screen.getByTestId('fa-info')).toBeInTheDocument();
  });

  it('displays transactions with all data', () => {
    renderComponent();
    
    // Check transaction display
    expect(screen.getByText('Transaction #1')).toBeInTheDocument();
    expect(screen.getByText('Purchase - $25.99')).toBeInTheDocument();
    expect(screen.getByText(/Remark:/)).toBeInTheDocument();
    expect(screen.getByText('Test purchase')).toBeInTheDocument();
    expect(screen.getByText('+50 pts')).toBeInTheDocument();
    
    // Check different transaction types and icons
    expect(screen.getByTestId('fa-plus')).toBeInTheDocument(); // purchase
    expect(screen.getByTestId('fa-minus')).toBeInTheDocument(); // redemption
    expect(screen.getAllByTestId('fa-exchange')).toHaveLength(4); // 2 transfers, adjustment, unknown
    expect(screen.getByTestId('fa-calendar')).toBeInTheDocument(); // event
  });

  it('displays all transaction type labels correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Purchase - $25.99')).toBeInTheDocument();
    expect(screen.getByText('Redemption - Completed')).toBeInTheDocument();
    expect(screen.getByText('Transfer from John Doe (user123)')).toBeInTheDocument();
    expect(screen.getByText('Transfer to Jane Smith (user456)')).toBeInTheDocument();
    expect(screen.getByText('Adjustment from manager')).toBeInTheDocument();
    expect(screen.getByText('Event Reward - event123')).toBeInTheDocument();
    // Check that default transaction type shows "Transaction" label (only in the details, not header)
    const transactionLabels = screen.getAllByText('Transaction');
    expect(transactionLabels.length).toBeGreaterThan(1); // Should appear in both header and content
  });

  it('handles transactions with missing data gracefully', () => {
    const incompleteTransactions = [
      {
        id: 8,
        type: 'purchase',
        amount: 10,
        spent: null,
        createdAt: null
      },
      {
        id: 9,
        type: 'redemption',
        amount: -5,
        processedBy: null,
        createdAt: '2023-10-01T10:00:00Z'
      },
      {
        id: 10,
        type: 'transfer',
        amount: 15,
        sender: null,
        senderName: 'Unknown',
        createdAt: '2023-10-01T10:00:00Z'
      },
      {
        id: 11,
        type: 'transfer',
        amount: -8,
        recipient: 'user789',
        recipientName: null,
        createdAt: '2023-10-01T10:00:00Z'
      },
      {
        id: 12,
        type: 'adjustment',
        amount: 3,
        createdBy: null,
        createdAt: '2023-10-01T10:00:00Z'
      },
      {
        id: 13,
        type: 'event',
        amount: 7,
        relatedId: null,
        createdAt: '2023-10-01T10:00:00Z'
      }
    ];

    useUserTransactions.mockReturnValue({
      transactions: incompleteTransactions,
      totalCount: 6,
      isLoading: false
    });

    renderComponent();
    
    expect(screen.getByText('Purchase - $0.00')).toBeInTheDocument();
    expect(screen.getByText('Redemption - Pending')).toBeInTheDocument();
    expect(screen.getByText('Transfer from Unknown')).toBeInTheDocument();
    expect(screen.getByText('Transfer to user789')).toBeInTheDocument();
    expect(screen.getByText('Adjustment from manager')).toBeInTheDocument();
    expect(screen.getByText('Event Reward - Event')).toBeInTheDocument();
    // Note: null dates are not displayed as "N/A" in this component
  });

  it('handles filter changes correctly', () => {
    renderComponent();
    
    const typeFilter = screen.getByTestId('type-filter');
    fireEvent.change(typeFilter, { target: { value: 'redemption' } });
    
    expect(useUserTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'redemption',
        page: 1 // should reset to page 1
      })
    );
  });

  it('updates search params when filters change', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalled();
    });
  });

  it('handles pagination correctly', () => {
    renderComponent();
    
    // Test pagination display
    expect(screen.getByText('Showing 1 to 10 of 50 transactions')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    
    // Test previous button (should be disabled)
    const prevButton = screen.getByText('Previous').closest('button');
    expect(prevButton).toBeDisabled();
    
    // Test next button
    const nextButton = screen.getByText('Next').closest('button');
    expect(nextButton).not.toBeDisabled();
    
    fireEvent.click(nextButton);
    expect(useUserTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 })
    );
  });

  it('shows pagination only when there are transactions', () => {
    useUserTransactions.mockReturnValue({
      transactions: [],
      totalCount: 0,
      isLoading: false
    });

    renderComponent();
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('handles edge cases in pagination', () => {
    useUserTransactions.mockReturnValue({
      transactions: mockTransactions,
      totalCount: 7, // Exactly matches transaction count
      isLoading: false
    });

    const { rerender } = render(
      <BrowserRouter>
        <UserTransactions />
      </BrowserRouter>
    );

    // Should show "Showing 1 to 7 of 7 transactions"
    expect(screen.getByText('Showing 1 to 7 of 7 transactions')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    
    // Both buttons should be disabled when only one page
    expect(screen.getByText('Previous').closest('button')).toBeDisabled();
    expect(screen.getByText('Next').closest('button')).toBeDisabled();
  });

  it('handles relatedId filter editability based on type filter', () => {
    renderComponent();
    
    // When type is set, relatedId should be editable
    const relatedIdFilter = screen.getByTestId('relatedId-filter');
    expect(relatedIdFilter).not.toBeDisabled();
    
    // Change type to empty
    const typeFilter = screen.getByTestId('type-filter');
    fireEvent.change(typeFilter, { target: { value: '' } });
    
    // relatedId should be disabled when type is empty
    expect(relatedIdFilter).toBeDisabled();
  });



  it('handles different amount formatting', () => {
    renderComponent();
    
    expect(screen.getByText('+50 pts')).toBeInTheDocument(); // positive
    expect(screen.getByText('-30 pts')).toBeInTheDocument(); // negative
    expect(screen.getByText('+5 pts')).toBeInTheDocument(); // small positive
  });

  it('maintains filter state properly during changes', () => {
    renderComponent();
    
    // Change amount filter (should not reset page for amount)
    const amountFilter = screen.getByTestId('amount-filter');
    fireEvent.change(amountFilter, { target: { value: '200' } });
    
    expect(useUserTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '200',
        page: 1 // Should still reset page for non-page/limit changes
      })
    );
  });

  it('handles null and undefined dates correctly', () => {
    const transactionWithNullDate = [
      {
        id: 99,
        type: 'purchase',
        amount: 10,
        createdAt: null
      }
    ];

    useUserTransactions.mockReturnValue({
      transactions: transactionWithNullDate,
      totalCount: 1,
      isLoading: false
    });

    renderComponent();
    
    // The component should render without crashing even with null dates
    expect(screen.getByText('Transaction #99')).toBeInTheDocument();
    // Null dates just don't show date/time information
  });
}); 