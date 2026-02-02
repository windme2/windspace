import { describe, it, expect } from 'vitest';
import { convertArticle, shuffleArray, ArticleDisplay } from '../articleUtils';
import { Article } from '../../types';

describe('articleUtils', () => {
  describe('convertArticle', () => {
    it('converts API article to frontend format', () => {
      const apiArticle: Article = {
        id: 1,
        title: 'Test Article',
        slug: 'test-article',
        excerpt: 'Test excerpt',
        content: 'Test content',
        featured_image: '/test.jpg',
        published: true,
        category_id: 1,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
        categories: {
          id: 1,
          name: 'Technology',
          slug: 'technology',
          description: 'Tech articles',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      };

      const result = convertArticle(apiArticle);
      
      expect(result).toBeDefined();
      expect(result.title).toBe('Test Article');
      expect(result.slug).toBe('test-article');
      expect(result.category).toBe('tech');
      expect(result.imageSrc).toBe('/test.jpg');
    });

    it('handles article without category', () => {
      const apiArticle: Article = {
        id: 1,
        title: 'Test',
        slug: 'test',
        excerpt: 'Excerpt',
        content: 'Content',
        featured_image: '/test.jpg',
        published: true,
        category_id: 1,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      const result = convertArticle(apiArticle);
      expect(result).toBeDefined();
      expect(result.category).toBe('food'); // Default category
    });

    it('handles article without featured_image', () => {
      const apiArticle: Article = {
        id: 1,
        title: 'Test',
        slug: 'test',
        excerpt: 'Excerpt',
        content: 'Content',
        published: true,
        category_id: 1,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
      };

      const result = convertArticle(apiArticle);
      expect(result.imageSrc).toBe('/placeholder.svg');
    });

    it('handles forceCategory parameter', () => {
      const apiArticle: Article = {
        id: 1,
        title: 'Test',
        slug: 'test',
        excerpt: 'Excerpt',
        content: 'Content',
        published: true,
        category_id: 1,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
        categories: {
          id: 1,
          name: 'Technology',
          slug: 'technology',
          description: 'Tech articles',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      };

      const result = convertArticle(apiArticle, 'travel');
      expect(result.category).toBe('travel');
    });

    it('sets default author when author_name is empty', () => {
      const apiArticle: Article = {
        id: 1,
        title: 'Test',
        slug: 'test',
        excerpt: 'Excerpt',
        content: 'Content',
        published: true,
        category_id: 1,
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
        author_name: '',
      };

      const result = convertArticle(apiArticle);
      expect(result.author.name).toBe('WindSpace Team');
    });
  });

  describe('shuffleArray', () => {
    it('shuffles array elements', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = shuffleArray(original);
      
      // Array should have same length
      expect(shuffled.length).toBe(original.length);
      
      // Should contain same elements
      expect(shuffled.sort((a, b) => a - b)).toEqual(original);
    });

    it('returns new array without modifying original', () => {
      const original = [1, 2, 3];
      const shuffled = shuffleArray(original);
      
      expect(shuffled).not.toBe(original);
      expect(original).toEqual([1, 2, 3]);
    });

    it('handles empty array', () => {
      const result = shuffleArray([]);
      expect(result).toEqual([]);
    });

    it('handles single element array', () => {
      const result = shuffleArray([1]);
      expect(result).toEqual([1]);
    });
  });
});
