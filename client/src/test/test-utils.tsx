import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

/**
 * Custom providers wrapper for testing
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </HelmetProvider>
  );
};

/**
 * Custom render function with providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

/**
 * Mock article data for testing
 */
export const mockArticle = {
  id: '1',
  title: 'Test Article Title',
  slug: 'test-article-title',
  excerpt: 'This is a test article excerpt for testing purposes.',
  content: '<p>This is the full content of the test article.</p>',
  image: '/images/test.jpg',
  published: true,
  published_at: '2026-01-15T10:00:00Z',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
  tags: ['test', 'react'],
  views: 100,
  category: {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    color: '#8B5CF6',
  },
  author: {
    id: 1,
    name: 'Test Author',
    avatar_url: '/images/avatar.jpg',
  },
};

/**
 * Mock category data for testing
 */
export const mockCategory = {
  id: 1,
  name: 'Technology',
  slug: 'technology',
  description: 'Technology articles',
  color: '#8B5CF6',
  icon: 'cpu',
};

/**
 * Create multiple mock articles
 */
export const createMockArticles = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockArticle,
    id: String(index + 1),
    title: `Test Article ${index + 1}`,
    slug: `test-article-${index + 1}`,
  }));
};

/**
 * Wait for async operations
 */
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
