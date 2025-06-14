import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateTransaction from '../../../pages/transactions/CreateTransaction';
import UserService from '../../../services/user.service';
import TransactionService from '../../../services/transaction.service';
import PromotionService from '../../../services/promotion.service';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock html5-qrcode to avoid camera access issues in tests
jest.mock('html5-qrcode', () => ({
  Html5Qrcode: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
}));

// Mock services with minimal implementation
jest.mock('../../../services/user.service', () => ({
  lookupUserByUTORid: jest.fn(),
}));

jest.mock('../../../services/transaction.service', () => ({
  createPurchase: jest.fn(),
}));

jest.mock('../../../services/promotion.service', () => ({
  getPromotions: jest.fn(),
}));

describe('CreateTransaction', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    utorid: 'testuser',
    points: 1000,
    promotions: [
      {
        id: 3,
        name: 'One-time Bonus',
        type: 'one-time',
        points: 50,
      },
    ],
  };

  const mockPromotions = [
    {
      id: 1,
      name: 'Double Points',
      type: 'automatic',
      rate: 0.01,
      startTime: '2024-01-01T00:00:00Z',
      endTime: null,
    },
    {
      id: 2,
      name: 'Big Spender',
      type: 'automatic',
      points: 100,
      minSpending: 50,
      startTime: '2024-01-01T00:00:00Z',
      endTime: null,
    },
  ];

  const mockTransaction = {
    id: 123,
    utorid: mockUser.utorid,
    type: 'purchase',
    amount: -25.00,
    earned: 150,
    remark: 'Test purchase',
  };

  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <CreateTransaction />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    PromotionService.getPromotions.mockResolvedValue({
      results: mockPromotions,
    });
    
    UserService.lookupUserByUTORid.mockImplementation((utorid) => {
      if (utorid === 'testuser') {
        return Promise.resolve(mockUser);
      }
      return Promise.reject(new Error('User not found'));
    });
    
    TransactionService.createPurchase.mockResolvedValue(mockTransaction);
  });

  describe('User Search', () => {
    it('searches for user successfully', async () => {
      renderComponent();
      
      // Enter UTORid and search
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      fireEvent.click(searchButton);
      
      // Wait for user information to appear
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
        expect(screen.getByText(mockUser.utorid)).toBeInTheDocument();
        expect(screen.getByText((content, element) => {
          return element.tagName.toLowerCase() === 'p' && content.includes('Current Points:');
        })).toBeInTheDocument();
      });
      
      // Verify services were called
      expect(UserService.lookupUserByUTORid).toHaveBeenCalledWith('testuser');
    });

    it('handles user not found error', async () => {
      renderComponent();
      
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'nonexistent' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument();
      });
    });

    it('validates empty UTORid input', async () => {
      renderComponent();
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a utorid/i)).toBeInTheDocument();
      });
    });
  });

  describe('Promotion Management', () => {
    it('displays available promotions after user search', async () => {
      renderComponent();
      
      // Search for user first
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      fireEvent.click(searchButton);
      
      // Wait for promotions to load
      await waitFor(() => {
        expect(screen.getByText('Double Points (Automatic)')).toBeInTheDocument();
        expect(screen.getByText('Big Spender (Automatic)')).toBeInTheDocument();
        expect(screen.getByText('One-time Bonus')).toBeInTheDocument();
      });
    });

    it('applies automatic promotions when amount meets criteria', async () => {
      renderComponent();
      
      // Search for user
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Enter amount that meets big spender criteria
      const amountInput = screen.getByPlaceholderText(/enter purchase amount/i);
      fireEvent.change(amountInput, { target: { value: '60' } });
      
      // Check that automatic promotions are applied
      await waitFor(() => {
        const appliedElements = screen.getAllByText('Applied');
        expect(appliedElements.length).toBeGreaterThan(0);
      });
    });

    it('toggles one-time promotions', async () => {
      renderComponent();
      
      // Search for user
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('One-time Bonus')).toBeInTheDocument();
      });
      
      // Click on one-time promotion
      const oneTimePromotion = screen.getByText('One-time Bonus').closest('div');
      if (oneTimePromotion) {
        fireEvent.click(oneTimePromotion);
        
        // Verify promotion is selected by checking if it's in the selected promotions list
        await waitFor(() => {
          expect(screen.getByText('1')).toBeInTheDocument(); // Promotions Applied count
        });
      }
    });
  });

  describe('Transaction Creation', () => {
    it('creates transaction successfully with complete flow', async () => {
      renderComponent();
      
      // Step 1: Search for user
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Step 2: Enter transaction details
      const amountInput = screen.getByPlaceholderText(/enter purchase amount/i);
      const remarkInput = screen.getByPlaceholderText(/add a note/i);
      
      fireEvent.change(amountInput, { target: { value: '25.00' } });
      fireEvent.change(remarkInput, { target: { value: 'Test purchase' } });
      
      // Step 3: Submit transaction
      const submitButton = screen.getByRole('button', { name: /complete transaction/i });
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      fireEvent.click(submitButton);
      
      // Step 4: Verify success page
      await waitFor(() => {
        expect(screen.getByText('Transaction Completed!')).toBeInTheDocument();
        expect(screen.getByText(`#${mockTransaction.id}`)).toBeInTheDocument();
        expect(screen.getByText(mockUser.name)).toBeInTheDocument();
        expect(screen.getByText('$25.00')).toBeInTheDocument();
      });
      
      // Verify service was called with correct data
      expect(TransactionService.createPurchase).toHaveBeenCalledWith({
        utorid: mockUser.utorid,
        spent: 25.00,
        promotionIds: expect.any(Array),
        remark: 'Test purchase',
      });
    });

    it('validates required fields before submission', async () => {
      renderComponent();
      
      // Try to submit without user
      const submitButton = screen.getByRole('button', { name: /complete transaction/i });
      expect(submitButton).toBeDisabled();
      
      // Search for user but don't enter amount
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Submit button should still be disabled without amount
      expect(submitButton).toBeDisabled();
      
      // Enter invalid amount
      const amountInput = screen.getByPlaceholderText(/enter purchase amount/i);
      fireEvent.change(amountInput, { target: { value: '0' } });
      
      expect(submitButton).toBeDisabled();
    });

    it('handles transaction creation error', async () => {
      TransactionService.createPurchase.mockRejectedValue(new Error('Transaction failed'));
      
      renderComponent();
      
      // Complete user search and enter valid data
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      const amountInput = screen.getByPlaceholderText(/enter purchase amount/i);
      fireEvent.change(amountInput, { target: { value: '25.00' } });
      
      const submitButton = screen.getByRole('button', { name: /complete transaction/i });
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/transaction failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Reset', () => {
    it('resets form when creating new transaction', async () => {
      renderComponent();
      
      // Complete a transaction first
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      const amountInput = screen.getByPlaceholderText(/enter purchase amount/i);
      fireEvent.change(amountInput, { target: { value: '25.00' } });
      
      const submitButton = screen.getByRole('button', { name: /complete transaction/i });
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Transaction Completed!')).toBeInTheDocument();
      });
      
      // Click new transaction button
      const newTransactionButton = screen.getByRole('button', { name: /new transaction/i });
      fireEvent.click(newTransactionButton);
      
      // Verify form is reset
      await waitFor(() => {
        const resetUtoridInput = screen.getByPlaceholderText(/enter utorid/i);
        expect(resetUtoridInput).toHaveValue('');
        expect(screen.queryByRole('heading', { level: 3, name: mockUser.name })).not.toBeInTheDocument();
      });
    });
  });

  describe('Points Calculation', () => {
    it('calculates points correctly with promotions', async () => {
      renderComponent();
      
      // Search for user
      const utoridInput = screen.getByPlaceholderText(/enter utorid/i);
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(utoridInput, { target: { value: 'testuser' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 3, name: mockUser.name })).toBeInTheDocument();
      });
      
      // Enter amount
      const amountInput = screen.getByPlaceholderText(/enter purchase amount/i);
      fireEvent.change(amountInput, { target: { value: '25.00' } });
      
      // Check points calculation in summary
      await waitFor(() => {
        expect(screen.getByText(/points earned/i)).toBeInTheDocument();
        // Base points (25 * 100 / 25 = 100) + automatic promotions
        expect(screen.getByText(/\d+ points/)).toBeInTheDocument();
      });
    });
  });

  describe('QR Scanner', () => {
    it('opens and closes QR scanner modal', async () => {
      renderComponent();
      
      // Open scanner
      const scanButton = screen.getByRole('button', { name: /scan qr/i });
      fireEvent.click(scanButton);
      
      await waitFor(() => {
        expect(screen.getByText('Scan Customer QR Code')).toBeInTheDocument();
      });
      
      // Close scanner
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Scan Customer QR Code')).not.toBeInTheDocument();
      });
    });
  });
}); 