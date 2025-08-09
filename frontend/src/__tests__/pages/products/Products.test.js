import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Products from '../../../pages/products/Products';
import { useProducts } from '../../../hooks/useProducts';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useTierStatus } from '../../../hooks/useTierStatus';

// Mock hooks
jest.mock('../../../hooks/useProducts');
jest.mock('../../../hooks/useCurrentUser');
jest.mock('../../../hooks/useTierStatus');

// Mock window.scrollTo
beforeAll(() => {
  window.scrollTo = jest.fn();
});

afterAll(() => {
  window.scrollTo.mockRestore();
});

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
      description: 'A test product',
      category: 'Test Category',
      imageUrl: null,
      rating: 4.5,
      reviewCount: 10,
      cashPrice: 10.99,
      pointsPrice: 1000,
      inStock: true,
      priceType: 'cash',
      variations: []
    },
    {
      id: 2,
      name: 'Test Product 2',
      description: 'Another test product',
      category: 'Test Category',
      imageUrl: null,
      rating: 4.0,
      reviewCount: 5,
      cashPrice: 15.99,
      pointsPrice: 1500,
      inStock: false,
      priceType: 'points',
      variations: []
    }
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
    jest.clearAllMocks();
    
    useProducts.mockReturnValue({
      products: mockProducts,
      totalCount: 2,
      isLoading: false,
      stats: {
        totalProducts: 2,
        cashProducts: 1,
        pointsProducts: 1,
        inStockProducts: 1,
        affordableProducts: 1
      },
      categories: [
        { value: 'beverages', label: 'Beverages' },
        { value: 'snacks', label: 'Snacks' }
      ]
    });

    useCurrentUser.mockReturnValue({
      currentUser: { id: 1, name: 'Test User' },
      availablePoints: 1000
    });

    useTierStatus.mockReturnValue({
      tierStatus: {
        activeTier: 'GOLD',
        currentCycleEarnedPoints: 5000,
        expiryDate: new Date('2025-08-31T00:00:00.000Z'),
        tierSource: 'current'
      },
      isLoading: false,
      error: null
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

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    
    expect(screen.getByText('2 products found')).toBeInTheDocument();
    expect(screen.getByText('1 cash items')).toBeInTheDocument();
    expect(screen.getByText('1 points items')).toBeInTheDocument();
    expect(screen.getByText('1 affordable')).toBeInTheDocument();
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

  it('handles payment type filters', () => {
    renderComponent();

    // Find the Cash Only button specifically in the filter section
    const cashOnlyButton = screen.getByRole('button', { name: /cash only/i });
    fireEvent.click(cashOnlyButton);

    expect(useProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        priceType: 'cash',
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

    // Check that the search and filter elements are still shown
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByText('Find Products')).toBeInTheDocument();
    
    // Verify no actual product data is shown when loading
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
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

  describe('ProductCard Price Display Logic', () => {
    it('displays prices when set to 0 (human intention)', () => {
      const productsWithZeroPrices = [
        {
          id: 1,
          name: 'Free Item',
          description: 'A free item with 0 price',
          category: 'Free',
          variations: [{
            id: 'var-1',
            name: 'Regular',
            cashPrice: 0,
            pointsPrice: undefined,
            inStock: true,
            redemptionType: 'cash',
            minimumTier: 'BRONZE'
          }]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithZeroPrices,
        totalCount: 1,
        isLoading: false,
        stats: { totalProducts: 1, cashProducts: 1, pointsProducts: 0, inStockProducts: 1, affordableProducts: 1 }
      });

      renderComponent();

      expect(screen.getByText('Free Item')).toBeInTheDocument();
      expect(screen.getAllByText('Cash Only')).toHaveLength(2); // One in filter, one in product card
      // Should display $0.00 since cashPrice is explicitly set to 0
      expect(screen.getByText('0.00')).toBeInTheDocument();
    });

    it('does not display prices when not set (undefined/null)', () => {
      const productsWithoutPrices = [
        {
          id: 1,
          name: 'No Price Item',
          description: 'An item with no price set',
          category: 'Test',
          variations: [{
            id: 'var-1',
            name: 'Regular',
            cashPrice: undefined,
            pointsPrice: null,
            inStock: true,
            redemptionType: 'cash',
            minimumTier: 'BRONZE'
          }]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithoutPrices,
        totalCount: 1,
        isLoading: false,
        stats: { totalProducts: 1, cashProducts: 1, pointsProducts: 0, inStockProducts: 1, affordableProducts: 1 }
      });

      renderComponent();

      expect(screen.getByText('No Price Item')).toBeInTheDocument();
      expect(screen.getAllByText('Cash Only')).toHaveLength(2); // One in filter, one in product card
      // Should NOT display any price since cashPrice is undefined
      expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument();
    });

    it('displays both prices when both are set to 0', () => {
      const productsWithBothZeroPrices = [
        {
          id: 1,
          name: 'Free Both Ways',
          description: 'Free with both payment methods',
          category: 'Free',
          variations: [{
            id: 'var-1',
            name: 'Regular',
            cashPrice: 0,
            pointsPrice: 0,
            inStock: true,
            redemptionType: 'both',
            minimumTier: 'BRONZE'
          }]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithBothZeroPrices,
        totalCount: 1,
        isLoading: false,
        stats: { totalProducts: 1, cashProducts: 0, pointsProducts: 0, inStockProducts: 1, affordableProducts: 1 }
      });

      renderComponent();

      expect(screen.getByText('Free Both Ways')).toBeInTheDocument();
      expect(screen.getAllByText('Cash & Points')).toHaveLength(2); // One in filter, one in product card
      expect(screen.getByText('0.00')).toBeInTheDocument();
      expect(screen.getByText('0 points')).toBeInTheDocument();
    });

    it('always displays price type tags regardless of price values', () => {
      const productsWithVariousPrices = [
        {
          id: 1,
          name: 'Cash Only Item',
          category: 'Test',
          variations: [{
            id: 'var-1',
            name: 'Regular',
            cashPrice: undefined,
            pointsPrice: undefined,
            inStock: true,
            redemptionType: 'cash',
            minimumTier: 'BRONZE'
          }]
        },
        {
          id: 2,
          name: 'Points Only Item',
          category: 'Test',
          variations: [{
            id: 'var-2',
            name: 'Regular',
            cashPrice: null,
            pointsPrice: null,
            inStock: true,
            redemptionType: 'points',
            minimumTier: 'BRONZE'
          }]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithVariousPrices,
        totalCount: 2,
        isLoading: false,
        stats: { totalProducts: 2, cashProducts: 1, pointsProducts: 1, inStockProducts: 2, affordableProducts: 2 }
      });

      renderComponent();

      // Price type tags should always be displayed
      expect(screen.getAllByText('Cash Only')).toHaveLength(2); // One in filter, one in product card
      expect(screen.getAllByText('Points Only')).toHaveLength(2); // One in filter, one in product card
    });
  });

  describe('Tier Requirements', () => {
    it('displays tier requirement when user does not meet minimum tier', () => {
      // Mock user with BRONZE tier
      useTierStatus.mockReturnValue({
        tierStatus: {
          activeTier: 'BRONZE',
          currentCycleEarnedPoints: 1000,
          expiryDate: new Date('2025-08-31T00:00:00.000Z'),
          tierSource: 'current'
        },
        isLoading: false,
        error: null
      });

      const productsWithTierRequirement = [
        {
          id: 1,
          name: 'Gold Tier Item',
          description: 'Requires Gold tier',
          category: 'Premium',
          variations: [{
            id: 'var-1',
            name: 'Regular',
            cashPrice: 10.99,
            pointsPrice: 1000,
            inStock: true,
            redemptionType: 'both',
            minimumTier: 'GOLD'
          }]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithTierRequirement,
        totalCount: 1,
        isLoading: false,
        stats: { totalProducts: 1, cashProducts: 1, pointsProducts: 1, inStockProducts: 1, affordableProducts: 1 }
      });

      renderComponent();

      expect(screen.getByText('Gold Tier Item')).toBeInTheDocument();
      expect(screen.getByText('GOLD Required')).toBeInTheDocument();
      // Should show lock icon (FiLock component renders as svg)
      const lockElements = screen.getAllByText('GOLD Required');
      expect(lockElements.length).toBeGreaterThan(0);
    });

    it('does not display tier requirement when user meets minimum tier', () => {
      // Mock user with PLATINUM tier (higher than GOLD)
      useTierStatus.mockReturnValue({
        tierStatus: {
          activeTier: 'PLATINUM',
          currentCycleEarnedPoints: 10000,
          expiryDate: new Date('2025-08-31T00:00:00.000Z'),
          tierSource: 'current'
        },
        isLoading: false,
        error: null
      });

      const productsWithTierRequirement = [
        {
          id: 1,
          name: 'Gold Tier Item',
          description: 'Requires Gold tier',
          category: 'Premium',
          variations: [{
            id: 'var-1',
            name: 'Regular',
            cashPrice: 10.99,
            pointsPrice: 1000,
            inStock: true,
            redemptionType: 'both',
            minimumTier: 'GOLD'
          }]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithTierRequirement,
        totalCount: 1,
        isLoading: false,
        stats: { totalProducts: 1, cashProducts: 1, pointsProducts: 1, inStockProducts: 1, affordableProducts: 1 }
      });

      renderComponent();

      expect(screen.getByText('Gold Tier Item')).toBeInTheDocument();
      // Should NOT show tier requirement since user has PLATINUM tier
      expect(screen.queryByText('GOLD Required')).not.toBeInTheDocument();
    });

    it('displays tier requirement in stock info section (right-aligned)', () => {
      useTierStatus.mockReturnValue({
        tierStatus: {
          activeTier: 'SILVER',
          currentCycleEarnedPoints: 2000,
          expiryDate: new Date('2025-08-31T00:00:00.000Z'),
          tierSource: 'current'
        },
        isLoading: false,
        error: null
      });

      const productsWithTierRequirement = [
        {
          id: 1,
          name: 'Diamond Tier Item',
          description: 'Requires Diamond tier',
          category: 'Premium',
          variations: [{
            id: 'var-1',
            name: 'Regular',
            cashPrice: 50.00,
            pointsPrice: 5000,
            inStock: false,
            stockQuantity: 0,
            redemptionType: 'both',
            minimumTier: 'DIAMOND'
          }]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithTierRequirement,
        totalCount: 1,
        isLoading: false,
        stats: { totalProducts: 1, cashProducts: 1, pointsProducts: 1, inStockProducts: 0, affordableProducts: 0 }
      });

      renderComponent();

      expect(screen.getByText('Diamond Tier Item')).toBeInTheDocument();
      expect(screen.getByText('Out of stock')).toBeInTheDocument();
      expect(screen.getByText('DIAMOND Required')).toBeInTheDocument();
      
      // Verify both stock status and tier requirement are displayed
      expect(screen.getByText('Out of stock')).toBeInTheDocument();
      expect(screen.getByText('DIAMOND Required')).toBeInTheDocument();
    });
  });

  describe('Variation Dropdown', () => {
    it('displays out of stock status in variation dropdown options', () => {
      const productsWithMultipleVariations = [
        {
          id: 1,
          name: 'Multi-Variation Product',
          description: 'Product with multiple variations',
          category: 'Test',
          variations: [
            {
              id: 'var-1',
              name: 'Small',
              cashPrice: 10.99,
              pointsPrice: 1000,
              inStock: true,
              stockQuantity: 5,
              redemptionType: 'both',
              minimumTier: 'BRONZE'
            },
            {
              id: 'var-2',
              name: 'Medium',
              cashPrice: 15.99,
              pointsPrice: 1500,
              inStock: false,
              stockQuantity: 0,
              redemptionType: 'both',
              minimumTier: 'BRONZE'
            },
            {
              id: 'var-3',
              name: 'Large',
              cashPrice: 20.99,
              pointsPrice: 2000,
              inStock: true,
              stockQuantity: 0, // Stock quantity is 0 but inStock is true
              redemptionType: 'both',
              minimumTier: 'BRONZE'
            }
          ]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithMultipleVariations,
        totalCount: 1,
        isLoading: false,
        stats: { totalProducts: 1, cashProducts: 1, pointsProducts: 1, inStockProducts: 1, affordableProducts: 1 }
      });

      renderComponent();

      expect(screen.getByText('Multi-Variation Product')).toBeInTheDocument();
      
      // Find the select dropdown
      const selectElement = screen.getByDisplayValue('Small');
      expect(selectElement).toBeInTheDocument();
      
      // Check that the dropdown contains the out of stock options
      const options = selectElement.querySelectorAll('option');
      expect(options).toHaveLength(3);
      
      // Check option text content
      expect(options[0].textContent).toBe('Small');
      expect(options[1].textContent).toBe('Medium (Out of Stock)');
      expect(options[2].textContent).toBe('Large (Out of Stock)');
    });

    it('allows variation selection and updates dropdown value', () => {
      const productsWithMultipleVariations = [
        {
          id: 1,
          name: 'Multi-Variation Product',
          description: 'Product with multiple variations',
          category: 'Test',
          variations: [
            {
              id: 'var-1',
              name: 'Basic',
              cashPrice: 5.99,
              pointsPrice: 500,
              inStock: true,
              stockQuantity: 10,
              redemptionType: 'cash',
              minimumTier: 'BRONZE'
            },
            {
              id: 'var-2',
              name: 'Premium',
              cashPrice: 15.99,
              pointsPrice: 1500,
              inStock: true,
              stockQuantity: 3,
              redemptionType: 'points',
              minimumTier: 'SILVER'
            }
          ]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithMultipleVariations,
        totalCount: 1,
        isLoading: false,
        stats: { totalProducts: 1, cashProducts: 1, pointsProducts: 1, inStockProducts: 1, affordableProducts: 1 }
      });

      renderComponent();

      expect(screen.getByText('Multi-Variation Product')).toBeInTheDocument();
      
      // Find the variation dropdown
      const selectElement = screen.getByDisplayValue('Basic');
      expect(selectElement).toBeInTheDocument();
      
      // Change to Premium variation
      fireEvent.change(selectElement, { target: { value: '1' } });
      
      // Verify the dropdown value changed
      expect(selectElement.value).toBe('1');
      
      // Verify options are present
      const options = selectElement.querySelectorAll('option');
      expect(options).toHaveLength(2);
      expect(options[0].textContent).toBe('Basic');
      expect(options[1].textContent).toBe('Premium');
    });

    it('does not show variation dropdown when only one variation exists', () => {
      const productsWithSingleVariation = [
        {
          id: 1,
          name: 'Single Variation Product',
          description: 'Product with only one variation',
          category: 'Test',
          variations: [
            {
              id: 'var-1',
              name: 'Standard',
              cashPrice: 10.99,
              pointsPrice: 1000,
              inStock: true,
              stockQuantity: 5,
              redemptionType: 'both',
              minimumTier: 'BRONZE'
            }
          ]
        }
      ];

      useProducts.mockReturnValue({
        products: productsWithSingleVariation,
        totalCount: 1,
        isLoading: false,
        stats: { totalProducts: 1, cashProducts: 1, pointsProducts: 1, inStockProducts: 1, affordableProducts: 1 }
      });

      renderComponent();

      expect(screen.getByText('Single Variation Product')).toBeInTheDocument();
      
      // Should not have a variation selector dropdown (only category and sorting dropdowns should exist)
      const allSelects = screen.getAllByRole('combobox');
      expect(allSelects).toHaveLength(2); // Only category and sorting selects, no variation select
      
      // Verify no variation dropdown by checking it doesn't have the specific variation values
      expect(screen.queryByDisplayValue('Standard')).not.toBeInTheDocument();
    });
  });
}); 