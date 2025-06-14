import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateAdjustment from '../../../pages/transactions/CreateAdjustment';
import UserService from '../../../services/user.service';
import TransactionService from '../../../services/transaction.service';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock services with minimal implementation
jest.mock('../../../services/user.service', () => ({
  searchUserByUTORid: jest.fn(),
  getTransactions: jest.fn(),
}));

jest.mock('../../../services/transaction.service', () => ({
  createAdjustment: jest.fn(),
}));

describe('CreateAdjustment', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    utorid: 'testuser',
    points: 1000,
  };

  const mockTransactions = [
    { 
      id: 1, 
      type: 'purchase', 
      amount: -100, 
      remark: 'Test purchase', 
      createdAt: '2024-01-01' 
    },
    { 
      id: 2, 
      type: 'reward', 
      amount: 50, 
      remark: 'Test reward', 
      createdAt: '2024-01-02' 
    },
  ];

  const mockAdjustmentResponse = {
    id: 3,
    utorid: mockUser.utorid,
    type: 'adjustment',
    amount: 200,
    relatedId: 1,
    remark: 'Test adjustment',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    UserService.searchUserByUTORid.mockImplementation((utorid) => {
      if (utorid === 'testuser') {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    });
    UserService.getTransactions.mockResolvedValue({ results: mockTransactions });
  });

  const renderComponent = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CreateAdjustment />
      </QueryClientProvider>
    );
  };

  describe('User Search', () => {
    it('handles user not found error', async () => {
      renderComponent();
      
      const userInput = screen.getByPlaceholderText(/enter utorid/i);
      fireEvent.change(userInput, { target: { value: 'nonexistent' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument();
      });
    });

    it('displays user information after successful search', async () => {
      renderComponent();
      
      const userInput = screen.getByPlaceholderText(/enter utorid/i);
      fireEvent.change(userInput, { target: { value: 'testuser' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
        expect(screen.getByText(mockUser.utorid)).toBeInTheDocument();
        expect(screen.getByText('Points Balance:')).toBeInTheDocument();
        expect(screen.getByText((content, element) => {
          return element.tagName.toLowerCase() === 'strong' && content === '1000';
        })).toBeInTheDocument();
      });
    });
  });

  describe('Transaction Management', () => {
    it('allows searching transactions', async () => {
      renderComponent();
      
      // Search for user first
      const userInput = screen.getByPlaceholderText(/enter utorid/i);
      fireEvent.change(userInput, { target: { value: 'testuser' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText(/test purchase/i)).toBeInTheDocument();
      });
      
      // Search transactions
      const transactionSearchInput = screen.getByPlaceholderText(/search by transaction/i);
      fireEvent.change(transactionSearchInput, { target: { value: 'purchase' } });
      
      await waitFor(() => {
        expect(screen.getByText(/test purchase/i)).toBeInTheDocument();
        expect(screen.queryByText(/test reward/i)).not.toBeInTheDocument();
      });
    });

    it('allows selecting a transaction for adjustment', async () => {
      renderComponent();
      
      // Search for user first
      const userInput = screen.getByPlaceholderText(/enter utorid/i);
      fireEvent.change(userInput, { target: { value: 'testuser' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText(/test purchase/i)).toBeInTheDocument();
      });
      
      // Select transaction by clicking on the transaction item
      const transactionItem = screen.getByText(/test purchase/i).closest('div');
      fireEvent.click(transactionItem);
      
      // Verify transaction is selected (check if adjustment form appears)
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter point amount/i)).toBeInTheDocument();
      });
    });
  });

  describe('Adjustment Creation', () => {
    it('validates required fields before submission', async () => {
      renderComponent();
      
      // Initially, no submit button should be visible
      expect(screen.queryByRole('button', { name: /complete adjustment/i })).not.toBeInTheDocument();
      
      // Search for user
      const userInput = screen.getByPlaceholderText(/enter utorid/i);
      fireEvent.change(userInput, { target: { value: 'testuser' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText(/test purchase/i)).toBeInTheDocument();
      });
      
      // Select transaction
      const transactionItem = screen.getByText(/test purchase/i).closest('div');
      fireEvent.click(transactionItem);
      
      // Wait for adjustment form to appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter point amount/i)).toBeInTheDocument();
      });
      
      // Fill adjustment details
      const amountInput = screen.getByPlaceholderText(/enter point amount/i);
      fireEvent.change(amountInput, { target: { value: '200' } });
      
      const remarkInput = screen.getByPlaceholderText(/add a note/i);
      fireEvent.change(remarkInput, { target: { value: 'Test adjustment' } });
      
      // Submit button should now be available and enabled
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /complete adjustment/i });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('creates adjustment transaction successfully', async () => {
      TransactionService.createAdjustment.mockResolvedValueOnce(mockAdjustmentResponse);
      
      renderComponent();
      
      // Search for user
      const userInput = screen.getByPlaceholderText(/enter utorid/i);
      fireEvent.change(userInput, { target: { value: 'testuser' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText(/test purchase/i)).toBeInTheDocument();
      });
      
      // Select transaction
      const transactionItem = screen.getByText(/test purchase/i).closest('div');
      fireEvent.click(transactionItem);
      
      // Wait for adjustment form to appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter point amount/i)).toBeInTheDocument();
      });
      
      // Fill adjustment details
      const amountInput = screen.getByPlaceholderText(/enter point amount/i);
      fireEvent.change(amountInput, { target: { value: '200' } });
      
      const remarkInput = screen.getByPlaceholderText(/add a note/i);
      fireEvent.change(remarkInput, { target: { value: 'Test adjustment' } });
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /complete adjustment/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create Another Adjustment')).toBeInTheDocument();
      });
    });

    it('handles adjustment creation error', async () => {
      TransactionService.createAdjustment.mockRejectedValueOnce(new Error('Failed to create adjustment'));
      
      renderComponent();
      
      // Search for user
      const userInput = screen.getByPlaceholderText(/enter utorid/i);
      fireEvent.change(userInput, { target: { value: 'testuser' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText(/test purchase/i)).toBeInTheDocument();
      });
      
      // Select transaction
      const transactionItem = screen.getByText(/test purchase/i).closest('div');
      fireEvent.click(transactionItem);
      
      // Wait for adjustment form to appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter point amount/i)).toBeInTheDocument();
      });
      
      // Fill adjustment details
      const amountInput = screen.getByPlaceholderText(/enter point amount/i);
      fireEvent.change(amountInput, { target: { value: '200' } });
      
      const remarkInput = screen.getByPlaceholderText(/add a note/i);
      fireEvent.change(remarkInput, { target: { value: 'Test adjustment' } });
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /complete adjustment/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to create adjustment')).toBeInTheDocument();
        expect(toast.error).toHaveBeenCalledWith('Failed to create adjustment');
      });
    });
  });

  describe('Form Reset', () => {
    it('resets form when Create Another Adjustment is clicked', async () => {
      TransactionService.createAdjustment.mockResolvedValueOnce(mockAdjustmentResponse);
      
      renderComponent();
      
      // Search for user
      const userInput = screen.getByPlaceholderText(/enter utorid/i);
      fireEvent.change(userInput, { target: { value: 'testuser' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Wait for transactions to load
      await waitFor(() => {
        expect(screen.getByText(/test purchase/i)).toBeInTheDocument();
      });
      
      // Select transaction
      const transactionItem = screen.getByText(/test purchase/i).closest('div');
      fireEvent.click(transactionItem);
      
      // Wait for adjustment form to appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter point amount/i)).toBeInTheDocument();
      });
      
      // Fill adjustment details
      const amountInput = screen.getByPlaceholderText(/enter point amount/i);
      fireEvent.change(amountInput, { target: { value: '200' } });
      
      const remarkInput = screen.getByPlaceholderText(/add a note/i);
      fireEvent.change(remarkInput, { target: { value: 'Test adjustment' } });
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /complete adjustment/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create Another Adjustment')).toBeInTheDocument();
      });
      
      // Click Create Another Adjustment
      const resetButton = screen.getByText('Create Another Adjustment');
      fireEvent.click(resetButton);
      
      // Verify form is reset
      await waitFor(() => {
        expect(screen.queryByRole('heading', { level: 3, name: mockUser.name })).not.toBeInTheDocument();
        expect(screen.queryByText(/test purchase/i)).not.toBeInTheDocument();
        const newUserInput = screen.getByPlaceholderText(/enter utorid/i);
        expect(newUserInput.value).toBe('');
      });
    });
  });
}); 