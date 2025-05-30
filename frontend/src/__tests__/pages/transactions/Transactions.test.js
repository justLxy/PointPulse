/**
 * Core User Flow: Transaction management and administrative actions
 * Tests transaction listing, filtering, viewing details, and management operations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Transactions from '../../../pages/transactions/Transactions';

// Mock transaction data
const mockTransactions = [
  {
    id: 1,
    type: 'purchase',
    amount: 100,
    spent: 25.00,
    utorid: 'user1',
    createdAt: '2024-01-01T10:00:00Z',
    suspicious: false,
    createdBy: 'cashier1'
  },
  {
    id: 2,
    type: 'redemption',
    amount: -500,
    utorid: 'user2',
    createdAt: '2024-01-02T14:30:00Z',
    suspicious: false,
    processedBy: null
  },
  {
    id: 3,
    type: 'transfer',
    amount: -200,
    utorid: 'user1',
    createdAt: '2024-01-03T09:15:00Z',
    suspicious: true,
    relatedUser: { name: 'Jane Doe', utorid: 'user2' }
  }
];

// Mock hooks
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    activeRole: 'manager'
  })
}));

const mockMarkAsSuspicious = jest.fn();
const mockApproveRedemption = jest.fn();

jest.mock('../../../hooks/useTransactions', () => ({
  useTransactions: () => ({
    transactions: mockTransactions,
    isLoading: false,
    totalCount: 3,
    markAsSuspicious: mockMarkAsSuspicious,
    approveRedemption: mockApproveRedemption,
    isMarkingAsSuspicious: false,
    isApprovingRedemption: false,
    refetch: jest.fn()
  })
}));

// Mock components with simplified implementations
jest.mock('../../../components/transactions/TransactionFilters', () => ({ 
  filters, 
  handleFilterChange,
  isSuperuser,
  isManager
}) => (
  <div data-testid="transaction-filters">
    <input 
      placeholder="Search by name or UTORid"
      value={filters.name}
      onChange={(e) => handleFilterChange('name', e.target.value)}
    />
    <select 
      value={filters.type}
      onChange={(e) => handleFilterChange('type', e.target.value)}
    >
      <option value="">All Types</option>
      <option value="purchase">Purchase</option>
      <option value="redemption">Redemption</option>
      <option value="transfer">Transfer</option>
    </select>
    <select 
      value={filters.suspicious}
      onChange={(e) => handleFilterChange('suspicious', e.target.value)}
    >
      <option value="">All</option>
      <option value="true">Suspicious</option>
      <option value="false">Normal</option>
    </select>
    {isManager && <div data-testid="manager-filters">Manager Filters</div>}
  </div>
));

jest.mock('../../../components/transactions/TransactionList', () => ({ 
  transactions,
  isLoading,
  handleViewTransaction,
  handleMarkAsSuspiciousClick,
  handleApproveTransactionClick,
  isSuperuser,
  isManager
}) => (
  <div data-testid="transaction-list">
    {isLoading ? (
      <div>Loading transactions...</div>
    ) : (
      transactions.map(transaction => (
        <div key={transaction.id} data-testid={`transaction-${transaction.id}`}>
          <span>{transaction.type} - {transaction.amount} points</span>
          <button onClick={() => handleViewTransaction(transaction)}>View</button>
          {isManager && (
            <>
              <button onClick={() => handleMarkAsSuspiciousClick(transaction)}>
                {transaction.suspicious ? 'Clear Suspicious' : 'Mark Suspicious'}
              </button>
              {transaction.type === 'redemption' && !transaction.processedBy && (
                <button onClick={() => handleApproveTransactionClick(transaction)}>
                  Approve
                </button>
              )}
            </>
          )}
        </div>
      ))
    )}
  </div>
));

jest.mock('../../../components/transactions/TransactionModals', () => ({
  ViewTransactionModal: ({ isOpen, onClose, transaction }) => 
    isOpen ? (
      <div data-testid="view-transaction-modal">
        <h3>Transaction Details: {transaction?.type}</h3>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
    
  MarkSuspiciousModal: ({ isOpen, onClose, transaction, handleMarkAsSuspicious }) => 
    isOpen ? (
      <div data-testid="mark-suspicious-modal">
        <h3>Mark Transaction as Suspicious</h3>
        <button onClick={() => {
          handleMarkAsSuspicious(!transaction.suspicious);
          // Simulate successful API call
          setTimeout(() => {
            const callback = mockMarkAsSuspicious.mock.calls[mockMarkAsSuspicious.mock.calls.length - 1]?.[1]?.onSuccess;
            if (callback) callback();
          }, 0);
        }}>
          Confirm
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
    
  ApproveRedemptionModal: ({ isOpen, onClose, handleApproveTransaction }) => 
    isOpen ? (
      <div data-testid="approve-redemption-modal">
        <h3>Approve Redemption</h3>
        <button onClick={() => {
          handleApproveTransaction();
          // Simulate successful API call
          setTimeout(() => {
            const callback = mockApproveRedemption.mock.calls[mockApproveRedemption.mock.calls.length - 1]?.[1]?.onSuccess;
            if (callback) callback();
          }, 0);
        }}>Approve</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
}));

const renderTransactions = (userRole = 'manager') => {
  return render(
    <MemoryRouter>
      <Transactions />
    </MemoryRouter>
  );
};

describe('Transactions - Transaction Management Interface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarkAsSuspicious.mockClear();
    mockApproveRedemption.mockClear();
  });

  test('renders transaction management interface with filters and list', () => {
    renderTransactions();
    
    expect(screen.getByTestId('transaction-filters')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-list')).toBeInTheDocument();
  });

  test('displays transactions in the list', () => {
    renderTransactions();
    
    expect(screen.getByTestId('transaction-1')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-2')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-3')).toBeInTheDocument();
    
    expect(screen.getByText('purchase - 100 points')).toBeInTheDocument();
    expect(screen.getByText('redemption - -500 points')).toBeInTheDocument();
    expect(screen.getByText('transfer - -200 points')).toBeInTheDocument();
  });

  test('handles transaction filtering by name', () => {
    renderTransactions();
    
    const searchInput = screen.getByPlaceholderText('Search by name or UTORid');
    fireEvent.change(searchInput, { target: { value: 'user1' } });
    
    expect(searchInput.value).toBe('user1');
  });

  test('handles transaction filtering by type', () => {
    renderTransactions();
    
    const typeSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(typeSelect, { target: { value: 'purchase' } });
    
    expect(typeSelect.value).toBe('purchase');
  });

  test('handles suspicious transaction filtering', () => {
    renderTransactions();
    
    const suspiciousSelect = screen.getByDisplayValue('All');
    fireEvent.change(suspiciousSelect, { target: { value: 'true' } });
    
    expect(suspiciousSelect.value).toBe('true');
  });

  test('opens view transaction modal workflow', async () => {
    renderTransactions();
    
    // Click view button for first transaction
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByTestId('view-transaction-modal')).toBeInTheDocument();
      expect(screen.getByText('Transaction Details: purchase')).toBeInTheDocument();
    });
    
    // Close modal
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('view-transaction-modal')).not.toBeInTheDocument();
    });
  });

  test('handles mark suspicious workflow for managers', async () => {
    renderTransactions();
    
    // Find mark suspicious button for first transaction
    const suspiciousButtons = screen.getAllByText('Mark Suspicious');
    fireEvent.click(suspiciousButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByTestId('mark-suspicious-modal')).toBeInTheDocument();
    });
    
    // Confirm marking as suspicious
    fireEvent.click(screen.getByText('Confirm'));
    
    // Wait for the simulated API success callback
    await waitFor(() => {
      expect(mockMarkAsSuspicious).toHaveBeenCalled();
    }, { timeout: 100 });
  });

  test('handles approve redemption workflow', async () => {
    renderTransactions();
    
    // Find approve button for redemption transaction
    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('approve-redemption-modal')).toBeInTheDocument();
    });
    
    // Approve the redemption
    fireEvent.click(screen.getAllByText('Approve')[1]); // Second one is in the modal
    
    // Wait for the simulated API success callback
    await waitFor(() => {
      expect(mockApproveRedemption).toHaveBeenCalled();
    }, { timeout: 100 });
  });

  test('shows manager-specific features for authorized users', () => {
    renderTransactions();
    
    expect(screen.getByTestId('manager-filters')).toBeInTheDocument();
    expect(screen.getAllByText('Mark Suspicious').length).toBeGreaterThan(0);
    expect(screen.getByText('Approve')).toBeInTheDocument();
  });

  test('displays clear suspicious option for already suspicious transactions', () => {
    renderTransactions();
    
    // The third transaction is suspicious, so should show "Clear Suspicious"
    expect(screen.getByText('Clear Suspicious')).toBeInTheDocument();
  });

  test('closes modals when cancel buttons are clicked', async () => {
    renderTransactions();
    
    // Open mark suspicious modal
    const suspiciousButtons = screen.getAllByText('Mark Suspicious');
    fireEvent.click(suspiciousButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByTestId('mark-suspicious-modal')).toBeInTheDocument();
    });
    
    // Cancel the action
    fireEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('mark-suspicious-modal')).not.toBeInTheDocument();
    });
  });

  test('shows approve button only for unprocessed redemptions', () => {
    renderTransactions();
    
    // Only one redemption transaction that's unprocessed should have approve button
    const approveButtons = screen.getAllByText('Approve');
    expect(approveButtons).toHaveLength(1);
  });
}); 