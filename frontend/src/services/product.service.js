import api from './api';

class ProductService {
  /**
   * Fetch products with optional filtering parameters.
   * @param {Object} filters
   */
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.priceType) params.append('priceType', filters.priceType);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
}

// Export singleton instance with only the used method
export default new ProductService(); 