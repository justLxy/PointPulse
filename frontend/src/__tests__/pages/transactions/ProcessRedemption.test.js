import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProcessRedemption from '../../../pages/transactions/ProcessRedemption';
import TransactionService from '../../../services/transaction.service';
import { useTransactions } from '../../../hooks/useTransactions';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('../../../services/transaction.service');
jest.mock('../../../hooks/useTransactions');
jest.mock('react-hot-toast');
jest.mock('html5-qrcode', () => ({
  Html5Qrcode: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(),
    stop: jest.fn().mockResolvedValue(),
    clear: jest.fn()
  }))
}));

// Mock styled-components theme
jest.mock('../../../styles/theme', () => ({
  colors: {
    text: { primary: '#333', secondary: '#666' },
    background: { default: '#f5f5f5', paper: '#fff' },
    border: { light: '#e0e0e0' },
    success: { main: '#27ae60' },
    error: { main: '#e74c3c', light: '#f8d7da', dark: '#721c24' },
    primary: { main: '#007bff', light: '#cce5ff' }
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  typography: {
    fontSize: { sm: '14px', md: '16px', lg: '18px', xl: '20px', '2xl': '22px', '3xl': '24px' },
    fontWeights: { medium: 500, semiBold: 600, bold: 700 }
  },
  radius: { md: '8px', full: '50%' },
  shadows: { sm: '0 1px 3px rgba(0,0,0,0.1)', md: '0 4px 6px rgba(0,0,0,0.1)' }
}));

// Mock components
jest.mock('../../../components/common/Card', () => {
  const Card = ({ children }) => <div data-testid="card">{children}</div>;
  Card.Header = ({ children }) => <div data-testid="card-header">{children}</div>;
  Card.Title = ({ children }) => <h2 data-testid="card-title">{children}</h2>;
  Card.Body = ({ children }) => <div data-testid="card-body">{children}</div>;
  return Card;
});
jest.mock('../../../components/common/Button', () => ({ children, onClick, disabled, loading, ...props }) => (
  <button onClick={onClick} disabled={disabled || loading} data-testid="button" {...props}>
    {loading ? 'Loading...' : children}
  </button>
));
jest.mock('../../../components/common/Input', () => ({ value, onChange, placeholder, leftIcon }) => (
  <div>
    {leftIcon}
    <input 
      data-testid="input" 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
    />
  </div>
));
jest.mock('../../../components/common/LoadingSpinner', () => ({ text }) => 
  <div data-testid="loading">{text}</div>
);
jest.mock('../../../components/common/Modal', () => ({ children, isOpen, onClose, title }) => 
  isOpen ? (
    <div data-testid="modal">
      <h3>{title}</h3>
      <button onClick={onClose} data-testid="modal-close">Close</button>
      {children}
    </div>
  ) : null
);

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaSearch: () => <span data-testid="fa-search">🔍</span>,
  FaCheck: () => <span data-testid="fa-check">✓</span>,
  FaExclamationCircle: () => <span data-testid="fa-error">⚠</span>,
  FaSpinner: () => <span data-testid="fa-spinner">⟲</span>,
  FaQrcode: () => <span data-testid="fa-qrcode">📱</span>
}));

// Mock URL constructor and location
global.URL = jest.fn().mockImplementation((url) => ({
  searchParams: {
    get: jest.fn().mockReturnValue(null)
  }
}));

const mockLocationSearch = jest.fn().mockReturnValue('');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ search: mockLocationSearch() })
}));

describe('ProcessRedemption', () => {
  let queryClient;
  const mockProcessRedemption = jest.fn();
  const mockPendingRedemptions = [
    {
      id: 1,
      utorid: 'user123',
      amount: -50,
      redeemed: 50,
      createdAt: '2023-10-01T10:00:00Z',
      remark: 'Test redemption'
    },
    {
      id: 2,
      utorid: 'user456',
      amount: -30,
      redeemed: 30,
      createdAt: '2023-10-02T11:00:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    // Setup default mocks
    useTransactions.mockReturnValue({
      processRedemption: mockProcessRedemption,
      isProcessing: false
    });

    TransactionService.getPendingRedemptions.mockResolvedValue({
      results: mockPendingRedemptions,
      count: 2
    });
    TransactionService.lookupRedemption.mockResolvedValue(mockPendingRedemptions[0]);
    TransactionService.getPendingRedemptionsByUtorid.mockResolvedValue(mockPendingRedemptions);
    
    mockProcessRedemption.mockResolvedValue({
      id: 1,
      redeemed: 50,
      processedBy: 'test'
    });

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProcessRedemption />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders initial page with all elements', async () => {
    renderComponent();
    
    expect(screen.getByText('Process Redemption')).toBeInTheDocument();
    expect(screen.getByText(/Enter a redemption ID or UTORid/)).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByText('Scan QR')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('All Pending Redemption Requests')).toBeInTheDocument();
    });
  });

  it('displays pending redemptions list', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Redemption #1')).toBeInTheDocument();
      expect(screen.getByText('Redemption #2')).toBeInTheDocument();
      expect(screen.getByText('-50 pts')).toBeInTheDocument();
      expect(screen.getByText('-30 pts')).toBeInTheDocument();
      expect(screen.getByText('user123')).toBeInTheDocument();
      expect(screen.getByText('user456')).toBeInTheDocument();
    });
  });

  it('shows loading state', async () => {
    TransactionService.getPendingRedemptions.mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading pending redemptions...');
    });
  });

  it('shows empty state when no redemptions', async () => {
    TransactionService.getPendingRedemptions.mockResolvedValue({
      results: [],
      count: 0
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('No pending redemption requests found.')).toBeInTheDocument();
    });
  });

  it('handles redemption search by ID with debounce', async () => {
    renderComponent();
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: '123' } });
    
    // Fast forward past debounce delay
    act(() => {
      jest.advanceTimersByTime(1250);
    });
    
    await waitFor(() => {
      expect(TransactionService.lookupRedemption).toHaveBeenCalledWith(123);
    });
  });

  it('handles user filter search', async () => {
    renderComponent();
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'user123' } });
    
    act(() => {
      jest.advanceTimersByTime(1250);
    });
    
    await waitFor(() => {
      expect(TransactionService.getPendingRedemptionsByUtorid).toHaveBeenCalledWith('user123');
    });
  });

  it('processes redemption successfully from list', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Redemption #1')).toBeInTheDocument();
    });
    
    const processButtons = screen.getAllByText('Process Now');
    fireEvent.click(processButtons[0]);
    
    await waitFor(() => {
      expect(mockProcessRedemption).toHaveBeenCalledWith(1);
    });
  });

  it('processes redemption successfully from input', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Redemption #1')).toBeInTheDocument();
    });
    
    const processButtons = screen.getAllByText('Process Now');
    fireEvent.click(processButtons[0]);
    
    await waitFor(() => {
      expect(mockProcessRedemption).toHaveBeenCalledWith(1);
    });
  });

  it('handles lookup redemption error', async () => {
    TransactionService.lookupRedemption.mockRejectedValue(new Error('Redemption not found'));
    
    renderComponent();
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: '999' } });
    
    act(() => {
      jest.advanceTimersByTime(1250);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Redemption not found')).toBeInTheDocument();
    });
  });

  it('handles process redemption error', async () => {
    mockProcessRedemption.mockRejectedValue(new Error('Processing failed'));
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Redemption #1')).toBeInTheDocument();
    });
    
    const processButtons = screen.getAllByText('Process Now');
    fireEvent.click(processButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Processing failed')).toBeInTheDocument();
    });
  });

  it('handles QR scanner modal', async () => {
    renderComponent();
    
    const scanButton = screen.getByText('Scan QR');
    fireEvent.click(scanButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Scan Redemption QR Code')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  it('handles numeric input for redemption lookup', async () => {
    renderComponent();
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: '123' } });
    
    act(() => {
      jest.advanceTimersByTime(1250);
    });
    
    await waitFor(() => {
      expect(TransactionService.lookupRedemption).toHaveBeenCalledWith(123);
    });
  });

  it('handles alphabetic input for user filter', async () => {
    renderComponent();
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'testuser' } });
    
    act(() => {
      jest.advanceTimersByTime(1250);
    });
    
    // The component should process this as user filter
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('handles invalid QR data gracefully', async () => {
    renderComponent();
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'invalid-qr-data' } });
    
    act(() => {
      jest.advanceTimersByTime(1250);
    });
    
    // Should try to use as utorid and show redemption ID filter
    await waitFor(() => {
      expect(screen.getByText('invalid-qr-data')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    TransactionService.getPendingRedemptions.mockResolvedValue({
      results: mockPendingRedemptions,
      count: 20 // More than one page
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Showing 1 to 9 of 20 redemption requests/)).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(TransactionService.getPendingRedemptions).toHaveBeenCalledWith({
        page: 2,
        limit: 9
      });
    });
  });

  it('handles reset functionality', async () => {
    renderComponent();
    
    // Set up a filter first
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'user123' } });
    
    act(() => {
      jest.advanceTimersByTime(1250);
    });
    
    await waitFor(() => {
      expect(screen.getByText('user123')).toBeInTheDocument();
      expect(screen.getByText('Clear Filter')).toBeInTheDocument();
    });
    
    const clearFilterButton = screen.getByText('Clear Filter');
    fireEvent.click(clearFilterButton);
    
    await waitFor(() => {
      expect(screen.getByText('All Pending Redemption Requests')).toBeInTheDocument();
    });
  });

  it('handles user filter with no results', async () => {
    TransactionService.getPendingRedemptionsByUtorid.mockResolvedValue([]);
    
    renderComponent();
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    
    act(() => {
      jest.advanceTimersByTime(1250);
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No pending redemptions found for user nonexistent');
    });
  });

  it('handles URL params on mount', async () => {
    const mockData = btoa(JSON.stringify({
      context: 'redemption',
      redemptionId: '123'
    }));
    
    mockLocationSearch.mockReturnValue(`?data=${encodeURIComponent(mockData)}`);
    global.URL.mockImplementationOnce(() => ({
      searchParams: {
        get: jest.fn().mockReturnValue(mockData)
      }
    }));
    
    Object.defineProperty(window, 'location', {
      value: { href: `http://localhost?data=${encodeURIComponent(mockData)}` },
      writable: true
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(TransactionService.lookupRedemption).toHaveBeenCalled();
    });
  });

  it('formats dates correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      // Should show formatted date in the format: "2023/10/1 06:00:00"
      expect(screen.getByText(/2023\/10\/1/)).toBeInTheDocument();
    });
  });

  it('handles missing date gracefully', async () => {
    TransactionService.getPendingRedemptions.mockResolvedValue({
      results: [{
        id: 1,
        utorid: 'user123',
        amount: -50,
        createdAt: null
      }],
      count: 1
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Redemption #1')).toBeInTheDocument();
      // Should not crash with null date
    });
  });

  it('shows processing state for individual redemptions', async () => {
    useTransactions.mockReturnValue({
      processRedemption: jest.fn().mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      ),
      isProcessing: true
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Redemption #1')).toBeInTheDocument();
    });
    
    const processButtons = screen.getAllByText('Process Now');
    fireEvent.click(processButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('handles empty input gracefully', async () => {
    renderComponent();
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: '' } });
    
    act(() => {
      jest.advanceTimersByTime(1250);
    });
    
    // Should not make any API calls for empty input
    expect(TransactionService.lookupRedemption).not.toHaveBeenCalled();
    expect(TransactionService.getPendingRedemptionsByUtorid).not.toHaveBeenCalled();
  });
}); 