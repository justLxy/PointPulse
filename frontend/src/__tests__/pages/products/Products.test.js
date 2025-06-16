import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Products from '../../../pages/products/Products';
import { useProducts } from '../../../hooks/useProducts';
import { useCurrentUser } from '../../../hooks/useCurrentUser';

// Mock hooks
jest.mock('../../../hooks/useProducts');
jest.mock('../../../hooks/useCurrentUser');

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Products', () => {
  const mockProducts = [
    {
      id: 1,
      name: 'Test Product 1',
      category: 'beverages',
      pointsPrice: 100,
      cashPrice: 5.99,
    },
    {
      id: 2,
      name: 'Test Product 2',
      category: 'snacks',
      pointsPrice: 200,
      cashPrice: 10.99,
    },
  ];

  const renderComponent = (initialEntries = ['/products']) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Products />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    useCurrentUser.mockReturnValue({
      currentUser: { id: 1, name: 'Test User' },
      availablePoints: 500,
    });

    useProducts.mockReturnValue({
      products: mockProducts,
      totalCount: 2,
      isLoading: false,
      stats: {
        cashProducts: 2,
        pointsProducts: 2,
        affordableProducts: 2,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders products page with filters', () => {
    renderComponent();

    expect(screen.getByText('Find Products')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    expect(screen.getByText('All Items')).toBeInTheDocument();
  });

  it('displays products and stats', () => {
    renderComponent();

    expect(screen.getByText('2 products found')).toBeInTheDocument();
    expect(screen.getByText('2 cash items')).toBeInTheDocument();
    expect(screen.getByText('2 points items')).toBeInTheDocument();
    expect(screen.getByText('2 affordable')).toBeInTheDocument();
  });

  it('handles search input', async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search by name');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    await waitFor(() => {
      expect(useProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test search',
        })
      );
    });
  });

  it('handles category filter', () => {
    renderComponent();

    const categorySelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(categorySelect, { target: { value: 'beverages' } });

    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'beverages',
      })
    );
  });

  it('handles payment type filters', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Cash Only'));

    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        priceType: 'cash',
        affordable: false,
      })
    );
  });

  it('handles affordable filter', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Can Purchase'));

    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        affordable: true,
      })
    );
  });

  it('handles sorting', () => {
    renderComponent();

    const sortSelect = screen.getByDisplayValue('No Sorting');
    fireEvent.change(sortSelect, { target: { value: 'points-asc' } });

    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'points-asc',
      })
    );
  });

  it('shows loading state', () => {
    useProducts.mockReturnValue({
      products: [],
      totalCount: 0,
      isLoading: true,
      stats: null,
    });

    renderComponent();

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    useProducts.mockReturnValue({
      products: [],
      totalCount: 0,
      isLoading: false,
      stats: null,
    });

    renderComponent();

    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('handles pagination', () => {
    useProducts.mockReturnValue({
      products: mockProducts,
      totalCount: 25,
      isLoading: false,
      stats: { cashProducts: 25, pointsProducts: 25, affordableProducts: 25 },
    });

    renderComponent();

    expect(screen.getByText('Showing 1 to 12 of 25 products')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
      })
    );
  });

  it('disables affordable filter when user not logged in', () => {
    useCurrentUser.mockReturnValue({
      currentUser: null,
      availablePoints: 0,
    });

    renderComponent();

    const affordableButton = screen.getByText('Can Purchase').closest('button');
    expect(affordableButton).toBeDisabled();
  });
}); 