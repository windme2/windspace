import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

vi.mock('../../lib/supabase', () => ({
  default: mockSupabase,
}));

describe('Database Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Articles', () => {
    it('should fetch all articles', async () => {
      const mockArticles = [
        { id: 1, title: 'Article 1', slug: 'article-1' },
        { id: 2, title: 'Article 2', slug: 'article-2' },
      ];

      mockSupabase.order.mockResolvedValueOnce({
        data: mockArticles,
        error: null,
      });

      mockSupabase.from('articles');
      mockSupabase.select('*');
      mockSupabase.eq('published', true);
      const result = await mockSupabase.order('created_at', { ascending: false });

      expect(result.data).toEqual(mockArticles);
      expect(result.error).toBeNull();
    });

    it('should fetch article by slug', async () => {
      const mockArticle = { id: 1, title: 'Test Article', slug: 'test-article' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockArticle,
        error: null,
      });

      mockSupabase.from('articles');
      mockSupabase.select('*');
      mockSupabase.eq('slug', 'test-article');
      const result = await mockSupabase.single();

      expect(result.data).toEqual(mockArticle);
    });

    it('should handle article not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      mockSupabase.from('articles');
      mockSupabase.select('*');
      mockSupabase.eq('slug', 'non-existent');
      const result = await mockSupabase.single();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });

    it('should create new article', async () => {
      const newArticle = {
        title: 'New Article',
        slug: 'new-article',
        content: 'Content here',
        excerpt: 'Excerpt',
        category_id: 1,
        published: true,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 3, ...newArticle },
        error: null,
      });

      mockSupabase.from('articles');
      mockSupabase.insert(newArticle);
      mockSupabase.select();
      const result = await mockSupabase.single();

      expect(result.data.id).toBe(3);
      expect(result.data.title).toBe('New Article');
    });

    it('should update existing article', async () => {
      const updates = { title: 'Updated Title' };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 1, title: 'Updated Title' },
        error: null,
      });

      mockSupabase.from('articles');
      mockSupabase.update(updates);
      mockSupabase.eq('id', 1);
      mockSupabase.select();
      const result = await mockSupabase.single();

      expect(result.data.title).toBe('Updated Title');
    });

    it('should delete article', async () => {
      mockSupabase.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      mockSupabase.from('articles');
      mockSupabase.delete();
      const result = await mockSupabase.eq('id', 1);

      expect(result.error).toBeNull();
    });
  });

  describe('Categories', () => {
    it('should fetch all categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Technology', slug: 'technology' },
        { id: 2, name: 'Travel', slug: 'travel' },
      ];

      mockSupabase.order.mockResolvedValueOnce({
        data: mockCategories,
        error: null,
      });

      mockSupabase.from('categories');
      mockSupabase.select('*');
      const result = await mockSupabase.order('name');

      expect(result.data).toEqual(mockCategories);
    });

    it('should fetch category by slug', async () => {
      const mockCategory = { id: 1, name: 'Technology', slug: 'technology' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCategory,
        error: null,
      });

      mockSupabase.from('categories');
      mockSupabase.select('*');
      mockSupabase.eq('slug', 'technology');
      const result = await mockSupabase.single();

      expect(result.data.name).toBe('Technology');
    });
  });

  describe('Comments', () => {
    it('should fetch approved comments for article', async () => {
      const mockComments = [
        { id: 1, content: 'Great article!', is_approved: true },
        { id: 2, content: 'Thanks for sharing', is_approved: true },
      ];

      mockSupabase.order.mockResolvedValueOnce({
        data: mockComments,
        error: null,
      });

      mockSupabase.from('comments');
      mockSupabase.select('*');
      mockSupabase.eq('article_id', 1);
      mockSupabase.eq('is_approved', true);
      const result = await mockSupabase.order('created_at');

      expect(result.data).toHaveLength(2);
    });

    it('should create new comment (pending approval)', async () => {
      const newComment = {
        article_id: 1,
        author_name: 'John',
        author_email: 'john@example.com',
        content: 'Nice article!',
        is_approved: false,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 1, ...newComment },
        error: null,
      });

      mockSupabase.from('comments');
      mockSupabase.insert(newComment);
      mockSupabase.select();
      const result = await mockSupabase.single();

      expect(result.data.is_approved).toBe(false);
    });
  });

  describe('Newsletter', () => {
    it('should add new subscriber', async () => {
      const subscriber = {
        email: 'test@example.com',
        is_active: true,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 1, ...subscriber },
        error: null,
      });

      mockSupabase.from('newsletter_subscribers');
      mockSupabase.insert(subscriber);
      mockSupabase.select();
      const result = await mockSupabase.single();

      expect(result.data.email).toBe('test@example.com');
    });

    it('should handle duplicate email', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: '23505', message: 'Duplicate key' },
      });

      mockSupabase.from('newsletter_subscribers');
      mockSupabase.insert({ email: 'existing@example.com' });
      mockSupabase.select();
      const result = await mockSupabase.single();

      expect(result.error).toBeTruthy();
      expect(result.error.code).toBe('23505');
    });
  });
});
