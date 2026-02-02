import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { articleAPI, setAuthToken, getAuthToken, ArticleData } from '../apiUtils';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to clear auth token
const clearAuthTokenForTest = () => {
  setAuthToken(null);
  sessionStorage.removeItem('admin_token');
};

describe('apiUtils', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    clearAuthTokenForTest();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('articleAPI', () => {
    it('getAll fetches all articles', async () => {
      const mockArticles = [{ id: 1, title: 'Test Article' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockArticles }),
      });

      const result = await articleAPI.getAll();
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles'),
        expect.any(Object)
      );
      expect(result.data).toEqual(mockArticles);
    });

    it('getById fetches article by id', async () => {
      const mockArticle = { id: 1, title: 'Test', slug: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockArticle }),
      });

      const result = await articleAPI.getById('1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles/1'),
        expect.any(Object)
      );
      expect(result.data).toEqual(mockArticle);
    });

    it('getByCategory fetches articles by category', async () => {
      const mockArticles = [{ id: 1, title: 'Tech Article' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockArticles }),
      });

      const result = await articleAPI.getByCategory('technology');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles'),
        expect.any(Object)
      );
      expect(result.data).toEqual(mockArticles);
    });

    it('search fetches articles by search query', async () => {
      const mockArticles = [{ id: 1, title: 'Search Result' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockArticles }),
      });

      const result = await articleAPI.search('react');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles'),
        expect.any(Object)
      );
      expect(result.data).toEqual(mockArticles);
    });

    it('create sends article data with auth token', async () => {
      setAuthToken('test-token');
      const articleData: ArticleData = {
        title: 'New Article',
        content: 'Content here',
        excerpt: 'Excerpt',
        slug: 'new-article',
        category_id: 1,
        published: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...articleData }),
      });

      await articleAPI.create(articleData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify(articleData),
        })
      );
    });

    it('update sends updated article data', async () => {
      setAuthToken('test-token');
      const updateData: Partial<ArticleData> = {
        title: 'Updated Article',
        content: 'Updated content',
        excerpt: 'Updated excerpt',
        slug: 'updated-article',
        category_id: 1,
        published: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...updateData }),
      });

      await articleAPI.update('1', updateData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles/1'),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('delete sends delete request with auth', async () => {
      setAuthToken('test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await articleAPI.delete('1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/articles/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('handles API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Not found' }),
      });

      await expect(articleAPI.getById('non-existent')).rejects.toThrow();
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(articleAPI.getAll()).rejects.toThrow('Network error');
    });
  });

  describe('Auth Token Management', () => {
    it('setAuthToken stores token', () => {
      setAuthToken('my-token');
      // Token is used in subsequent requests
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      articleAPI.create({
        title: 'Test',
        content: 'Content',
        excerpt: 'Excerpt',
        slug: 'test',
        category_id: 1,
        published: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer my-token',
          }),
        })
      );
    });

    it('setting token to null removes token', () => {
      setAuthToken('my-token');
      setAuthToken(null);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      articleAPI.getAll();

      // Should not include Authorization header after clearing
      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers?.Authorization).toBeUndefined();
    });
  });
});
