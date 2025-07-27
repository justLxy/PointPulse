const productController = require('../../controllers/productController');
const axios = require('axios');

jest.mock('axios');

describe('productController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('listProducts', () => {
    it('should return products and counts on success', async () => {
      const mockCatalog = {
        data: {
          objects: [
            {
              type: 'ITEM',
              item_data: {
                variations: [
                  { id: 'var1' },
                  { id: 'var2' }
                ]
              }
            },
            { type: 'CATEGORY' },
            { type: 'IMAGE' }
          ]
        }
      };
      const mockInventory = {
        data: {
          counts: [
            { catalog_object_id: 'var1', quantity: '10' },
            { catalog_object_id: 'var2', quantity: '5' }
          ]
        }
      };
      axios.get.mockResolvedValueOnce(mockCatalog);
      axios.post.mockResolvedValueOnce(mockInventory);

      await productController.listProducts(req, res, next);

      expect(axios.get).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        objects: mockCatalog.data.objects,
        counts: mockInventory.data.counts
      });
    });

    it('should return products with empty counts if no variations', async () => {
      const mockCatalog = {
        data: {
          objects: [
            { type: 'CATEGORY' },
            { type: 'IMAGE' }
          ]
        }
      };
      axios.get.mockResolvedValueOnce(mockCatalog);

      await productController.listProducts(req, res, next);

      expect(axios.get).toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        objects: mockCatalog.data.objects,
        counts: []
      });
    });

    it('should handle inventory fetch failure gracefully', async () => {
      const mockCatalog = {
        data: {
          objects: [
            {
              type: 'ITEM',
              item_data: {
                variations: [ { id: 'var1' } ]
              }
            }
          ]
        }
      };
      axios.get.mockResolvedValueOnce(mockCatalog);
      axios.post.mockRejectedValueOnce(new Error('Inventory error'));

      await productController.listProducts(req, res, next);

      expect(axios.get).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        objects: mockCatalog.data.objects,
        counts: []
      });
    });

    it('should call next(error) on catalog fetch failure', async () => {
      const error = new Error('Catalog error');
      axios.get.mockRejectedValueOnce(error);

      await productController.listProducts(req, res, next);

      expect(axios.get).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
}); 