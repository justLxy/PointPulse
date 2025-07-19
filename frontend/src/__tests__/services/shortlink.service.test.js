import ShortlinkService from '../../services/shortlink.service';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');

describe('ShortlinkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://example.com'
      },
      writable: true
    });
  });

  describe('createShortlink', () => {
    it('should create a shortlink successfully', async () => {
      const mockShortlinkData = {
        slug: 'test-slug',
        targetUrl: 'https://example.com/target',
        eventId: 1
      };
      const mockResponse = { data: { id: 1, ...mockShortlinkData } };
      api.post.mockResolvedValue(mockResponse);

      const result = await ShortlinkService.createShortlink(mockShortlinkData);

      expect(api.post).toHaveBeenCalledWith('/shortlinks', mockShortlinkData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors when creating shortlink', async () => {
      const mockShortlinkData = { slug: 'test', targetUrl: 'https://example.com' };
      const mockError = {
        response: {
          data: { error: 'Slug already exists' }
        }
      };
      api.post.mockRejectedValue(mockError);

      await expect(ShortlinkService.createShortlink(mockShortlinkData))
        .rejects.toThrow('Slug already exists');
    });

    it('should handle network errors when creating shortlink', async () => {
      const mockShortlinkData = { slug: 'test', targetUrl: 'https://example.com' };
      api.post.mockRejectedValue(new Error('Network error'));

      await expect(ShortlinkService.createShortlink(mockShortlinkData))
        .rejects.toThrow('Failed to create shortlink');
    });
  });

  describe('getShortlinks', () => {
    it('should fetch shortlinks with default parameters', async () => {
      const mockResponse = { data: { shortlinks: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ShortlinkService.getShortlinks();

      expect(api.get).toHaveBeenCalledWith('/shortlinks', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch shortlinks with custom parameters', async () => {
      const params = {
        slug: 'test',
        eventId: 1,
        page: 2,
        limit: 20
      };
      const mockResponse = { data: { shortlinks: [], total: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ShortlinkService.getShortlinks(params);

      expect(api.get).toHaveBeenCalledWith('/shortlinks', { params });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors when fetching shortlinks', async () => {
      const mockError = {
        response: {
          data: { error: 'Unauthorized' }
        }
      };
      api.get.mockRejectedValue(mockError);

      await expect(ShortlinkService.getShortlinks())
        .rejects.toThrow('Unauthorized');
    });
  });

  describe('getShortlink', () => {
    it('should fetch a single shortlink by ID', async () => {
      const mockResponse = { data: { id: 1, slug: 'test', targetUrl: 'https://example.com' } };
      api.get.mockResolvedValue(mockResponse);

      const result = await ShortlinkService.getShortlink(1);

      expect(api.get).toHaveBeenCalledWith('/shortlinks/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors when fetching shortlink', async () => {
      const mockError = {
        response: {
          data: { error: 'Shortlink not found' }
        }
      };
      api.get.mockRejectedValue(mockError);

      await expect(ShortlinkService.getShortlink(999))
        .rejects.toThrow('Shortlink not found');
    });
  });

  describe('updateShortlink', () => {
    it('should update a shortlink successfully', async () => {
      const updateData = { slug: 'new-slug', targetUrl: 'https://new-example.com' };
      const mockResponse = { data: { id: 1, ...updateData } };
      api.patch.mockResolvedValue(mockResponse);

      const result = await ShortlinkService.updateShortlink(1, updateData);

      expect(api.patch).toHaveBeenCalledWith('/shortlinks/1', updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors when updating shortlink', async () => {
      const updateData = { slug: 'new-slug' };
      const mockError = {
        response: {
          data: { error: 'Slug already exists' }
        }
      };
      api.patch.mockRejectedValue(mockError);

      await expect(ShortlinkService.updateShortlink(1, updateData))
        .rejects.toThrow('Slug already exists');
    });
  });

  describe('deleteShortlink', () => {
    it('should delete a shortlink successfully', async () => {
      api.delete.mockResolvedValue({});

      await ShortlinkService.deleteShortlink(1);

      expect(api.delete).toHaveBeenCalledWith('/shortlinks/1');
    });

    it('should handle API errors when deleting shortlink', async () => {
      const mockError = {
        response: {
          data: { error: 'Shortlink not found' }
        }
      };
      api.delete.mockRejectedValue(mockError);

      await expect(ShortlinkService.deleteShortlink(999))
        .rejects.toThrow('Shortlink not found');
    });
  });

  describe('getEventShortlinks', () => {
    it('should fetch shortlinks for a specific event', async () => {
      const mockResponse = { data: [{ id: 1, slug: 'event1' }, { id: 2, slug: 'event2' }] };
      api.get.mockResolvedValue(mockResponse);

      const result = await ShortlinkService.getEventShortlinks(1);

      expect(api.get).toHaveBeenCalledWith('/shortlinks/events/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors when fetching event shortlinks', async () => {
      const mockError = {
        response: {
          data: { error: 'Event not found' }
        }
      };
      api.get.mockRejectedValue(mockError);

      await expect(ShortlinkService.getEventShortlinks(999))
        .rejects.toThrow('Event not found');
    });
  });

  describe('checkSlugExists', () => {
    it('should return false for empty slug', async () => {
      const result = await ShortlinkService.checkSlugExists('');
      expect(result).toBe(false);
    });

    it('should return false for null slug', async () => {
      const result = await ShortlinkService.checkSlugExists(null);
      expect(result).toBe(false);
    });

    it('should return true when slug exists', async () => {
      const mockResponse = { data: true };
      api.get.mockResolvedValue(mockResponse);

      const result = await ShortlinkService.checkSlugExists('existing-slug');

      expect(api.get).toHaveBeenCalledWith('/shortlinks/exists/existing-slug');
      expect(result).toBe(true);
    });

    it('should return false when slug does not exist', async () => {
      const mockResponse = { data: false };
      api.get.mockResolvedValue(mockResponse);

      const result = await ShortlinkService.checkSlugExists('new-slug');

      expect(api.get).toHaveBeenCalledWith('/shortlinks/exists/new-slug');
      expect(result).toBe(false);
    });

    it('should return false and log error when API call fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Network error');
      api.get.mockRejectedValue(mockError);

      const result = await ShortlinkService.checkSlugExists('test-slug');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to check slug availability:', mockError);
      consoleSpy.mockRestore();
    });
  });

  describe('getShortlinkUrl', () => {
    it('should generate correct shortlink URL', () => {
      const result = ShortlinkService.getShortlinkUrl('test-slug');
      expect(result).toBe('https://example.com/test-slug');
    });

    it('should handle different slug formats', () => {
      const result = ShortlinkService.getShortlinkUrl('my-test-123');
      expect(result).toBe('https://example.com/my-test-123');
    });
  });

  describe('isValidSlug', () => {
    it('should return true for valid slugs', () => {
      expect(ShortlinkService.isValidSlug('test')).toBe(true);
      expect(ShortlinkService.isValidSlug('test-slug')).toBe(true);
      expect(ShortlinkService.isValidSlug('test_slug')).toBe(true);
      expect(ShortlinkService.isValidSlug('test123')).toBe(true);
      expect(ShortlinkService.isValidSlug('test-slug-123')).toBe(true);
    });

    it('should return false for invalid slugs', () => {
      expect(ShortlinkService.isValidSlug('test slug')).toBe(false);
      expect(ShortlinkService.isValidSlug('test@slug')).toBe(false);
      expect(ShortlinkService.isValidSlug('test.slug')).toBe(false);
      expect(ShortlinkService.isValidSlug('test/slug')).toBe(false);
      expect(ShortlinkService.isValidSlug('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(ShortlinkService.isValidUrl('https://example.com')).toBe(true);
      expect(ShortlinkService.isValidUrl('http://example.com')).toBe(true);
      expect(ShortlinkService.isValidUrl('https://example.com/path')).toBe(true);
      expect(ShortlinkService.isValidUrl('https://example.com/path?param=value')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(ShortlinkService.isValidUrl('not-a-url')).toBe(false);
      expect(ShortlinkService.isValidUrl('example.com')).toBe(false);
      expect(ShortlinkService.isValidUrl('')).toBe(false);
      expect(ShortlinkService.isValidUrl('invalid://')).toBe(true); // This is actually a valid URL format
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from simple text', () => {
      expect(ShortlinkService.generateSlug('Hello World')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(ShortlinkService.generateSlug('Hello@World!')).toBe('helloworld');
      expect(ShortlinkService.generateSlug('Hello & World')).toBe('hello-world');
    });

    it('should handle multiple spaces and hyphens', () => {
      expect(ShortlinkService.generateSlug('Hello   World')).toBe('hello-world');
      expect(ShortlinkService.generateSlug('Hello--World')).toBe('hello-world');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(ShortlinkService.generateSlug('-Hello World-')).toBe('hello-world');
      expect(ShortlinkService.generateSlug('Hello World-')).toBe('hello-world');
    });

    it('should handle numbers and underscores', () => {
      expect(ShortlinkService.generateSlug('Test 123')).toBe('test-123');
      expect(ShortlinkService.generateSlug('Test_123')).toBe('test_123');
    });

    it('should handle empty string', () => {
      expect(ShortlinkService.generateSlug('')).toBe('');
    });

    it('should handle case conversion', () => {
      expect(ShortlinkService.generateSlug('HELLO WORLD')).toBe('hello-world');
      expect(ShortlinkService.generateSlug('HelloWorld')).toBe('helloworld');
    });
  });
}); 