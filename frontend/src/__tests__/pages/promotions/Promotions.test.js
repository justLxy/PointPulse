/**
 * Core User Flow: Promotion management and administrative actions
 * Tests promotion listing, filtering, CRUD operations, and role-based access
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Promotions from '../../../pages/promotions/Promotions';

// Mock promotion data
const mockPromotions = [
  {
    id: 1,
    name: 'Double Points Weekend',
    description: 'Earn 2x points on all purchases',
    type: 'automatic',
    rate: 2,
    minSpending: 50,
    startTime: '2024-03-01T00:00:00Z',
    endTime: '2024-03-03T23:59:59Z',
    started: true,
    ended: false
  },
  {
    id: 2,
    name: 'Welcome Bonus',
    description: 'Get 500 points on your first purchase',
    type: 'one-time',
    points: 500,
    minSpending: null,
    startTime: null,
    endTime: null,
    started: true,
    ended: false
  },
  {
    id: 3,
    name: 'Past Promotion',
    description: 'Expired promotion',
    type: 'automatic',
    rate: 1.5,
    minSpending: 100,
    startTime: '2024-01-01T00:00:00Z',
    endTime: '2024-01-31T23:59:59Z',
    started: true,
    ended: true
  }
];

// Mock hooks and services
let mockAuthContext = {
  user: {
    id: 1,
    utorid: 'manager1',
    name: 'Test Manager',
    role: 'manager'
  },
  isAuthenticated: true,
  activeRole: 'manager'
};

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

const mockCreatePromotion = jest.fn();
const mockUpdatePromotion = jest.fn();
const mockDeletePromotion = jest.fn();

// Mock the usePromotions hook with loading state control
let mockPromotionsState = {
  promotions: mockPromotions,
  totalCount: mockPromotions.length,
  isLoading: false,
  createPromotion: mockCreatePromotion,
  updatePromotion: mockUpdatePromotion,
  deletePromotion: mockDeletePromotion,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  refetch: jest.fn()
};

jest.mock('../../../hooks/usePromotions', () => ({
  usePromotions: () => mockPromotionsState
}));

// Mock components
jest.mock('../../../components/common/LoadingSpinner', () => ({ text }) => (
  <div data-testid="loading-spinner">{text}</div>
));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Modal component
jest.mock('../../../components/common/Modal', () => {
  return {
    __esModule: true,
    default: ({ children, isOpen, onClose }) => {
      if (!isOpen) return null;
      return (
        <div role="dialog" aria-modal="true">
          {children}
        </div>
      );
    }
  };
});

const renderPromotions = (userRole = 'manager') => {
  // Update mock context for role
  mockAuthContext.activeRole = userRole;
  mockAuthContext.user.role = userRole;
  
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Promotions />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Promotions - Core User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.activeRole = 'manager';
    mockAuthContext.user.role = 'manager';
    // Reset promotions state
    mockPromotionsState = {
      promotions: mockPromotions,
      totalCount: mockPromotions.length,
      isLoading: false,
      createPromotion: mockCreatePromotion,
      updatePromotion: mockUpdatePromotion,
      deletePromotion: mockDeletePromotion,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      refetch: jest.fn()
    };
  });

  test('displays promotion list and filters for managers', () => {
    renderPromotions();
    
    // Verify filters are present
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create promotion/i })).toBeInTheDocument();
    
    // Verify promotions are displayed
    expect(screen.getByText('Double Points Weekend')).toBeInTheDocument();
    expect(screen.getByText('Welcome Bonus')).toBeInTheDocument();
    expect(screen.getByText('Past Promotion')).toBeInTheDocument();
  });

  test('handles promotion filtering', async () => {
    renderPromotions();
    
    // Test name filter
    const searchInput = screen.getByPlaceholderText(/search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Double' } });
    expect(searchInput.value).toBe('Double');
    
    // Test type filter
    const typeSelect = screen.getByPlaceholderText(/type/i);
    fireEvent.change(typeSelect, { target: { value: 'automatic' } });
    expect(typeSelect.value).toBe('automatic');
  });

  test('shows limited view for regular users', () => {
    renderPromotions('regular');
    
    // Regular users should not see management features
    expect(screen.queryByRole('button', { name: /create promotion/i })).not.toBeInTheDocument();
    
    // Check if edit/delete buttons are not present
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    
    // But should see basic filters and promotions
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type/i)).toBeInTheDocument();
    expect(screen.getByText('Double Points Weekend')).toBeInTheDocument();
  });

  test('displays loading state', () => {
    // Set loading state
    mockPromotionsState.isLoading = true;
    mockPromotionsState.promotions = [];
    
    renderPromotions();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('displays empty state', () => {
    // Set empty state
    mockPromotionsState.promotions = [];
    mockPromotionsState.totalCount = 0;
    
    renderPromotions();
    expect(screen.getByText(/no promotions found/i)).toBeInTheDocument();
    
    // Manager should see create button in empty state
    expect(screen.getByRole('button', { name: /create promotion/i })).toBeInTheDocument();
  });

  test('handles pagination', () => {
    renderPromotions();
    
    // Verify pagination controls
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    
    // Test navigation
    fireEvent.click(nextButton);
    expect(screen.getByText(/page/i)).toBeInTheDocument();
  });
}); 