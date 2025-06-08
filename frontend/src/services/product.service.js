import api from './api';

class ProductService {
  /**
   * Fetch products with filtering and pagination
   * Currently using mock data, but can be easily switched to real API
   * @param {Object} filters - Filter parameters
   * @returns {Promise} - Promise resolving to products data
   */
  async getProducts(filters = {}) {
    try {
      // For now, this service doesn't make actual API calls
      // since we're using mock data in the useProducts hook
      // When the Square API is ready, replace this with:
      // 
      // const params = new URLSearchParams();
      // if (filters.search) params.append('search', filters.search);
      // if (filters.category) params.append('category', filters.category);
      // if (filters.priceType) params.append('priceType', filters.priceType);
      // if (filters.page) params.append('page', filters.page);
      // if (filters.limit) params.append('limit', filters.limit);
      // 
      // const response = await api.get(`/products?${params.toString()}`);
      // return response.data;
      
      throw new Error('ProductService.getProducts() should not be called directly. Use the useProducts hook instead.');
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   * @param {number|string} productId - Product ID
   * @returns {Promise} - Promise resolving to product data
   */
  async getProduct(productId) {
    try {
      // When real API is available:
      // const response = await api.get(`/products/${productId}`);
      // return response.data;
      
      throw new Error('ProductService.getProduct() not implemented yet.');
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Get product categories
   * @returns {Promise} - Promise resolving to categories data
   */
  async getCategories() {
    try {
      // When real API is available:
      // const response = await api.get('/products/categories');
      // return response.data;
      
      // For now, return static categories
      return [
        { value: 'beverages', label: 'Beverages', count: 10 },
        { value: 'snacks', label: 'Snacks', count: 15 },
        { value: 'meals', label: 'Meals', count: 8 },
        { value: 'accessories', label: 'Accessories', count: 12 },
        { value: 'electronics', label: 'Electronics', count: 6 },
      ];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Sync products with Square API
   * This would be called periodically to update the local database
   * @returns {Promise} - Promise resolving to sync result
   */
  async syncWithSquare() {
    try {
      // When Square API integration is ready:
      // const response = await api.post('/products/sync');
      // return response.data;
      
      throw new Error('Square API sync not implemented yet.');
    } catch (error) {
      console.error('Error syncing with Square:', error);
      throw error;
    }
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise} - Promise resolving to search results
   */
  async searchProducts(query, options = {}) {
    try {
      // When real API is available:
      // const params = new URLSearchParams();
      // params.append('q', query);
      // if (options.category) params.append('category', options.category);
      // if (options.limit) params.append('limit', options.limit);
      // 
      // const response = await api.get(`/products/search?${params.toString()}`);
      // return response.data;
      
      throw new Error('ProductService.searchProducts() not implemented yet.');
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const productService = new ProductService();
export default productService; 