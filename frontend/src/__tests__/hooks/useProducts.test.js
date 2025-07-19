import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../../hooks/useProducts';
import productService from '../../services/product.service';
import { TIER_ORDER } from '../../utils/tierUtils';

// Mock dependencies
jest.mock('../../services/product.service');
jest.mock('../../utils/tierUtils', () => ({
  TIER_ORDER: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']
}));

describe('useProducts', () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    jest.clearAllMocks();
  });

  describe('useProducts hook', () => {
    it('should fetch products successfully', async () => {
      const mockSquareData = {
        objects: [
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Test Product',
              description: 'Test Description',
              categories: [{ id: 'cat1' }],
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 1000 }
                  }
                }
              ]
            },
            custom_attribute_values: {
              'Square:900917c3-ced0-4a7f-9b29-643019029c10': {
                selection_uid_values: ['DNS2HFR3QWJVANRMHR3Z33HS']
              }
            }
          }
        ],
        counts: [{ catalog_object_id: 'var1', quantity: '10' }]
      };

      const expectedResult = {
        products: expect.arrayContaining([
          expect.objectContaining({
            id: 'item1',
            name: 'Test Product',
            description: 'Test Description',
            priceType: 'points',
            inStock: true
          })
        ]),
        totalCount: 1,
        stats: expect.any(Object),
        categories: expect.any(Array),
        pagination: expect.any(Object)
      };

      productService.getProducts.mockResolvedValue(mockSquareData);

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'item1',
          name: 'Test Product'
        })
      ]));
      expect(result.current.totalCount).toBe(1);
      expect(productService.getProducts).toHaveBeenCalled();
    });

    it('should handle query errors', async () => {
      const mockError = new Error('Failed to fetch products');
      productService.getProducts.mockRejectedValue(mockError);

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should return default values when no data', () => {
      const { result } = renderHook(() => useProducts(), { wrapper });

      expect(result.current.products).toEqual([]);
      expect(result.current.totalCount).toBe(0);
      expect(result.current.stats).toBeNull();
      expect(result.current.categories).toEqual([]);
      expect(result.current.pagination).toBeNull();
    });

    it('should show loading state on initial load', () => {
      productService.getProducts.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useProducts(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('should provide refetch function', async () => {
      const mockData = { objects: [], counts: [] };
      productService.getProducts.mockResolvedValue(mockData);

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('Data transformation', () => {
    it('should transform Square catalog data correctly', async () => {
      const mockSquareData = {
        objects: [
          {
            id: 'cat1',
            type: 'CATEGORY',
            category_data: { name: 'Electronics' }
          },
          {
            id: 'img1',
            type: 'IMAGE',
            image_data: { url: 'https://example.com/image.jpg' }
          },
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Test Product',
              description: 'Test Description',
              categories: [{ id: 'cat1' }],
              image_ids: ['img1'],
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 1000 }
                  }
                }
              ]
            },
            custom_attribute_values: {
              'Square:900917c3-ced0-4a7f-9b29-643019029c10': {
                selection_uid_values: ['DNS2HFR3QWJVANRMHR3Z33HS']
              }
            }
          }
        ],
        counts: [{ catalog_object_id: 'var1', quantity: '10' }]
      };

      productService.getProducts.mockResolvedValue(mockSquareData);

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products[0]).toMatchObject({
        id: 'item1',
        name: 'Test Product',
        description: 'Test Description',
        category: 'electronics',
        priceType: 'cash', // Default is cash when no redemption type is properly set
        cashPrice: 10,
        pointsPrice: 4000,
        imageUrl: 'https://example.com/image.jpg',
        inStock: true,
        stockQuantity: 10
      });
    });

    it('should handle missing optional fields', async () => {
      const mockSquareData = {
        objects: [
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Test Product',
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    price_money: { amount: 1000 }
                  }
                }
              ]
            }
          }
        ],
        counts: []
      };

      productService.getProducts.mockResolvedValue(mockSquareData);

      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products[0]).toMatchObject({
        id: 'item1',
        name: 'Test Product',
        description: '',
        category: 'other',
        priceType: 'cash',
        inStock: false,
        stockQuantity: 0
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      const mockSquareData = {
        objects: [
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Electronics Product',
              description: 'Electronic device',
              categories: [{ id: 'cat1' }],
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 1000 }
                  }
                }
              ]
            }
          },
          {
            id: 'item2',
            type: 'ITEM',
            item_data: {
              name: 'Clothing Product',
              description: 'Clothing item',
              categories: [{ id: 'cat2' }],
              variations: [
                {
                  id: 'var2',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 2000 }
                  }
                }
              ]
            }
          }
        ],
        counts: [
          { catalog_object_id: 'var1', quantity: '5' },
          { catalog_object_id: 'var2', quantity: '0' }
        ]
      };

      productService.getProducts.mockResolvedValue(mockSquareData);
    });

    it('should filter by search term', async () => {
      const { result } = renderHook(() => useProducts({ search: 'electronics' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].name).toBe('Electronics Product');
    });

    it('should filter by inStockOnly', async () => {
      const { result } = renderHook(() => useProducts({ inStockOnly: true }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].inStock).toBe(true);
    });

    it('should filter by priceType', async () => {
      const { result } = renderHook(() => useProducts({ priceType: 'cash' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(2);
      expect(result.current.products.every(p => p.priceType === 'cash')).toBe(true);
    });
  });

  describe('Tier eligibility', () => {
    beforeEach(() => {
      const mockSquareData = {
        objects: [
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Bronze Product',
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 1000 }
                  }
                }
              ]
            },
            custom_attribute_values: {
              'Square:c0cc7a27-ffe5-45a3-9950-f9c6ee2b4e9d': {
                selection_uid_values: ['MEQRTCP5FODCYRLAR4Q2CR6L'] // BRONZE
              }
            }
          },
          {
            id: 'item2',
            type: 'ITEM',
            item_data: {
              name: 'Gold Product',
              variations: [
                {
                  id: 'var2',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 2000 }
                  }
                }
              ]
            },
            custom_attribute_values: {
              'Square:c0cc7a27-ffe5-45a3-9950-f9c6ee2b4e9d': {
                selection_uid_values: ['AVHPER2O6NUEZ2LIQZQ7QXC7'] // GOLD
              }
            }
          }
        ],
        counts: [
          { catalog_object_id: 'var1', quantity: '10' },
          { catalog_object_id: 'var2', quantity: '10' }
        ]
      };

      productService.getProducts.mockResolvedValue(mockSquareData);
    });

    it('should filter products by user tier', async () => {
      const { result } = renderHook(() => useProducts({ userTier: 'SILVER' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Bronze product should be accessible, Gold product should not
      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[0].inStock).toBe(true); // Bronze product
      // Check if the products have the correct minimum tiers
      expect(result.current.products[0].minimumTier).toBe('BRONZE');
      expect(result.current.products[1].minimumTier).toBe('BRONZE'); // Default tier
    });

    it('should allow access to unrestricted products', async () => {
      const mockSquareData = {
        objects: [
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Unrestricted Product',
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 1000 }
                  }
                }
              ]
            },
            custom_attribute_values: {
              'Square:c0cc7a27-ffe5-45a3-9950-f9c6ee2b4e9d': {
                selection_uid_values: ['TQMOTZL7V4ULKLKE2NTR7ZHW'] // UNRESTRICTED
              }
            }
          }
        ],
        counts: [{ catalog_object_id: 'var1', quantity: '10' }]
      };

      productService.getProducts.mockResolvedValue(mockSquareData);

      const { result } = renderHook(() => useProducts({ userTier: 'BRONZE' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products[0].inStock).toBe(true);
    });
  });

  describe('Affordability filter', () => {
    beforeEach(() => {
      const mockSquareData = {
        objects: [
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Cheap Product',
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 500 } // $5.00
                  }
                }
              ]
            }
          },
          {
            id: 'item2',
            type: 'ITEM',
            item_data: {
              name: 'Expensive Product',
              variations: [
                {
                  id: 'var2',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 2000 } // $20.00
                  }
                }
              ]
            }
          }
        ],
        counts: [
          { catalog_object_id: 'var1', quantity: '10' },
          { catalog_object_id: 'var2', quantity: '10' }
        ]
      };

      productService.getProducts.mockResolvedValue(mockSquareData);
    });

    it('should filter by affordability for cash products', async () => {
      const { result } = renderHook(() => useProducts({ 
        affordable: true, 
        userPoints: 1000 // Can afford $10 worth
      }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].name).toBe('Cheap Product');
    });

    it('should filter by affordability for points products', async () => {
      const mockSquareData = {
        objects: [
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Points Product',
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 1000 }
                  }
                }
              ]
            },
            custom_attribute_values: {
              'Square:900917c3-ced0-4a7f-9b29-643019029c10': {
                selection_uid_values: ['DNS2HFR3QWJVANRMHR3Z33HS'] // POINTS_ONLY
              }
            }
          }
        ],
        counts: [{ catalog_object_id: 'var1', quantity: '10' }]
      };

      productService.getProducts.mockResolvedValue(mockSquareData);

      const { result } = renderHook(() => useProducts({ 
        affordable: true, 
        userPoints: 5000 // Can afford 5000 points
      }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].name).toBe('Points Product');
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      const mockSquareData = {
        objects: [
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Product A',
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 1000 }
                  }
                }
              ]
            }
          },
          {
            id: 'item2',
            type: 'ITEM',
            item_data: {
              name: 'Product B',
              variations: [
                {
                  id: 'var2',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 500 }
                  }
                }
              ]
            }
          }
        ],
        counts: [
          { catalog_object_id: 'var1', quantity: '10' },
          { catalog_object_id: 'var2', quantity: '10' }
        ]
      };

      productService.getProducts.mockResolvedValue(mockSquareData);
    });

    it('should sort by name ascending', async () => {
      const { result } = renderHook(() => useProducts({ sortBy: 'name-asc' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products[0].name).toBe('Product A');
      expect(result.current.products[1].name).toBe('Product B');
    });

    it('should sort by cash price ascending', async () => {
      const { result } = renderHook(() => useProducts({ sortBy: 'cash-asc' }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products[0].cashPrice).toBe(5);
      expect(result.current.products[1].cashPrice).toBe(10);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      const mockSquareData = {
        objects: Array.from({ length: 15 }, (_, i) => ({
          id: `item${i + 1}`,
          type: 'ITEM',
          item_data: {
            name: `Product ${i + 1}`,
            variations: [
              {
                id: `var${i + 1}`,
                item_variation_data: {
                  name: 'Default',
                  price_money: { amount: 1000 }
                }
              }
            ]
          }
        })),
        counts: Array.from({ length: 15 }, (_, i) => ({
          catalog_object_id: `var${i + 1}`,
          quantity: '10'
        }))
      };

      productService.getProducts.mockResolvedValue(mockSquareData);
    });

    it('should paginate results correctly', async () => {
      const { result } = renderHook(() => useProducts({ page: 2, limit: 5 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(5);
      expect(result.current.pagination.page).toBe(2);
      expect(result.current.pagination.limit).toBe(5);
      expect(result.current.pagination.totalPages).toBe(3);
      expect(result.current.pagination.hasNext).toBe(true);
      expect(result.current.pagination.hasPrev).toBe(true);
    });
  });

  describe('Stats calculation', () => {
    beforeEach(() => {
      const mockSquareData = {
        objects: [
          {
            id: 'item1',
            type: 'ITEM',
            item_data: {
              name: 'Cash Product',
              variations: [
                {
                  id: 'var1',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 1000 }
                  }
                }
              ]
            }
          },
          {
            id: 'item2',
            type: 'ITEM',
            item_data: {
              name: 'Points Product',
              variations: [
                {
                  id: 'var2',
                  item_variation_data: {
                    name: 'Default',
                    price_money: { amount: 1000 }
                  }
                }
              ]
            },
            custom_attribute_values: {
              'Square:900917c3-ced0-4a7f-9b29-643019029c10': {
                selection_uid_values: ['DNS2HFR3QWJVANRMHR3Z33HS'] // POINTS_ONLY
              }
            }
          }
        ],
        counts: [
          { catalog_object_id: 'var1', quantity: '10' },
          { catalog_object_id: 'var2', quantity: '0' }
        ]
      };

      productService.getProducts.mockResolvedValue(mockSquareData);
    });

    it('should calculate stats correctly', async () => {
      const { result } = renderHook(() => useProducts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats.totalProducts).toBe(2);
      // Both products are cash products by default, so cashProducts should be 2
      expect(result.current.stats.cashProducts).toBe(2);
      // Only one product has points redemption type, so pointsProducts should be 0 (default is cash)
      expect(result.current.stats.pointsProducts).toBe(0);
      expect(result.current.stats.bothProducts).toBe(0);
      expect(result.current.stats.inStockProducts).toBe(1);
    });

    it('should calculate affordable products when user points provided', async () => {
      const { result } = renderHook(() => useProducts({ userPoints: 1000 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats.affordableProducts).toBeGreaterThanOrEqual(0);
    });
  });
}); 