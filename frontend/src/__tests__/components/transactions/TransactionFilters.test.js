import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import TransactionFilters from '../../../components/transactions/TransactionFilters';
import theme from '../../../styles/theme';

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('TransactionFilters', () => {
  const defaultProps = {
    filters: {},
    handleFilterChange: jest.fn(),
    isSuperuser: false,
    isManager: false,
    isRelatedIdEditable: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render basic filters for non-manager users', () => {
    renderWithProviders(<TransactionFilters {...defaultProps} />);

    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Transaction Type')).toBeInTheDocument();
    expect(screen.getByText('Related ID')).toBeInTheDocument();
    expect(screen.getByText('Promotion')).toBeInTheDocument();
    expect(screen.getByText('Amount Filter')).toBeInTheDocument();
    expect(screen.getByText('Points Amount')).toBeInTheDocument();

    expect(screen.queryByText('User')).not.toBeInTheDocument();
    expect(screen.queryByText('Create Adjustment')).not.toBeInTheDocument();
  });

  it('should render manager-specific filters and actions for managers', () => {
    renderWithProviders(
      <TransactionFilters {...defaultProps} isManager={true} />
    );

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Created By')).toBeInTheDocument();
    expect(screen.getByText('Transaction Status')).toBeInTheDocument();
    expect(screen.getByText('Create Adjustment')).toBeInTheDocument();
  });

  it('should render custom title when provided', () => {
    renderWithProviders(
      <TransactionFilters {...defaultProps} title="Custom Title" />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should handle user search input change', () => {
    renderWithProviders(
      <TransactionFilters {...defaultProps} isManager={true} />
    );

    const userInput = screen.getByPlaceholderText('Search by utorid or name');
    fireEvent.change(userInput, { target: { value: 'test user' } });

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('name', 'test user');
  });

  it('should handle created by input change', () => {
    renderWithProviders(
      <TransactionFilters {...defaultProps} isManager={true} />
    );

    const createdByInput = screen.getByPlaceholderText("Creator's username");
    fireEvent.change(createdByInput, { target: { value: 'admin' } });

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('createdBy', 'admin');
  });

  it('should handle transaction type select change', () => {
    renderWithProviders(<TransactionFilters {...defaultProps} />);

    const typeSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(typeSelect, { target: { value: 'purchase' } });

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('type', 'purchase');
  });

  it('should handle related ID input when editable', () => {
    renderWithProviders(
      <TransactionFilters {...defaultProps} isRelatedIdEditable={true} />
    );

    const relatedIdInput = screen.getByPlaceholderText('Related ID');
    fireEvent.change(relatedIdInput, { target: { value: '123' } });

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('relatedId', '123');
    expect(relatedIdInput).not.toBeDisabled();
  });

  it('should disable related ID input when not editable', () => {
    renderWithProviders(
      <TransactionFilters {...defaultProps} isRelatedIdEditable={false} />
    );

    const relatedIdInput = screen.getByPlaceholderText('Related ID');
    expect(relatedIdInput).toBeDisabled();
  });

  it('should handle promotion ID input change', () => {
    renderWithProviders(<TransactionFilters {...defaultProps} />);

    const promotionInput = screen.getByPlaceholderText('Promotion ID');
    fireEvent.change(promotionInput, { target: { value: '456' } });

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('promotionId', '456');
  });

  it('should handle amount operator select change', () => {
    renderWithProviders(<TransactionFilters {...defaultProps} />);

    const operatorSelect = screen.getByDisplayValue('Greater than or equal');
    fireEvent.change(operatorSelect, { target: { value: 'lte' } });

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('operator', 'lte');
  });

  it('should handle amount input change', () => {
    renderWithProviders(<TransactionFilters {...defaultProps} />);

    const amountInput = screen.getByPlaceholderText('Amount');
    fireEvent.change(amountInput, { target: { value: '100' } });

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('amount', '100');
  });

  it('should handle suspicious status select change for managers', () => {
    renderWithProviders(
      <TransactionFilters {...defaultProps} isManager={true} />
    );

    const suspiciousSelect = screen.getByDisplayValue('All Transactions');
    fireEvent.change(suspiciousSelect, { target: { value: 'true' } });

    expect(defaultProps.handleFilterChange).toHaveBeenCalledWith('suspicious', 'true');
  });

  it('should display current filter values', () => {
    const filtersWithValues = {
      name: 'john',
      createdBy: 'admin',
      type: 'purchase',
      relatedId: '123',
      promotionId: '456',
      operator: 'lte',
      amount: '100',
      suspicious: 'true',
    };

    renderWithProviders(
      <TransactionFilters
        {...defaultProps}
        filters={filtersWithValues}
        isManager={true}
        isRelatedIdEditable={true}
      />
    );

    expect(screen.getByDisplayValue('john')).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Purchase')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('456')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Less than or equal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Suspicious Only')).toBeInTheDocument();
  });

  it('should render all transaction type options', () => {
    renderWithProviders(<TransactionFilters {...defaultProps} />);

    const typeSelect = screen.getByDisplayValue('All Types');
    fireEvent.click(typeSelect);

    expect(screen.getByText('Purchase')).toBeInTheDocument();
    expect(screen.getByText('Redemption')).toBeInTheDocument();
    expect(screen.getByText('Transfer')).toBeInTheDocument();
    expect(screen.getByText('Adjustment')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
  });

  it('should render Create Adjustment link with correct path', () => {
    renderWithProviders(
      <TransactionFilters {...defaultProps} isManager={true} />
    );

    const createButton = screen.getByText('Create Adjustment');
    expect(createButton.closest('a')).toHaveAttribute('href', '/transactions/adjustment');
  });
}); 