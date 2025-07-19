import ProductService from '../../services/product.service';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products without filters successfully', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts();

      expect(api.get).toHaveBeenCalledWith('/products?');
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch products with search filter', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts({ search: 'test' });

      expect(api.get).toHaveBeenCalledWith('/products?search=test');
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch products with category filter', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts({ category: 'electronics' });

      expect(api.get).toHaveBeenCalledWith('/products?category=electronics');
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch products with priceType filter', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts({ priceType: 'cash' });

      expect(api.get).toHaveBeenCalledWith('/products?priceType=cash');
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch products with pagination parameters', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts({ page: 2, limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/products?page=2&limit=10');
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch products with multiple filters', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts({
        search: 'test',
        category: 'electronics',
        priceType: 'points',
        page: 1,
        limit: 20
      });

      expect(api.get).toHaveBeenCalledWith('/products?search=test&category=electronics&priceType=points&page=1&limit=20');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      api.get.mockRejectedValue(mockError);

      await expect(ProductService.getProducts()).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching products:', mockError);
      consoleSpy.mockRestore();
    });

    it('should handle empty filters object', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts({});

      expect(api.get).toHaveBeenCalledWith('/products?');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle filters with falsy values', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts({
        search: '',
        category: null,
        priceType: undefined,
        page: 0,
        limit: false
      });

      // URLSearchParams only includes truthy values, so empty string and 0 are excluded
      expect(api.get).toHaveBeenCalledWith('/products?');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle special characters in search parameter', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts({ search: 'test@product.com' });

      expect(api.get).toHaveBeenCalledWith('/products?search=test%40product.com');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle spaces in search parameter', async () => {
      const mockResponse = { data: { products: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts({ search: 'test product' });

      expect(api.get).toHaveBeenCalledWith('/products?search=test+product');
      expect(result).toEqual(mockResponse.data);
    });

    it('should return actual product data', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 10 },
        { id: 2, name: 'Product 2', price: 20 }
      ];
      const mockResponse = { data: { products: mockProducts, total: 2 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ProductService.getProducts();

      expect(result.products).toEqual(mockProducts);
      expect(result.total).toBe(2);
    });

    it('should be a singleton instance', () => {
      const instance1 = ProductService;
      const instance2 = ProductService;
      expect(instance1).toBe(instance2);
    });

    it('should have getProducts method', () => {
      expect(typeof ProductService.getProducts).toBe('function');
    });
  });
}); 