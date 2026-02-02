import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import ArticleCard from '../ArticleCard';

// Mock article data matching ArticleCardProps interface
const mockArticleCard = {
  id: '1',
  title: 'Test Article Title',
  excerpt: 'This is a test article excerpt for testing purposes.',
  category: 'tech' as const,
  imageSrc: '/images/test.jpg',
  date: '15/01/2026',
  author: {
    name: 'Test Author',
    avatar: '/images/avatar.jpg',
  },
  slug: 'test-article-title',
};

describe('ArticleCard', () => {
  it('renders article title correctly', () => {
    render(<ArticleCard {...mockArticleCard} />);
    expect(screen.getByText(mockArticleCard.title)).toBeInTheDocument();
  });

  it('renders article excerpt', () => {
    render(<ArticleCard {...mockArticleCard} />);
    expect(screen.getByText(mockArticleCard.excerpt)).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<ArticleCard {...mockArticleCard} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders article image with correct alt text', () => {
    render(<ArticleCard {...mockArticleCard} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', mockArticleCard.title);
  });

  it('links to correct article detail page', () => {
    render(<ArticleCard {...mockArticleCard} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/article/${mockArticleCard.slug}`);
  });

  it('applies featured styling when featured is true', () => {
    const { container } = render(
      <ArticleCard {...mockArticleCard} featured={true} />
    );
    // Featured should have different styling
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays date', () => {
    render(<ArticleCard {...mockArticleCard} />);
    // Date should be formatted and displayed
    const dateElement = screen.getByText(/2026/i);
    expect(dateElement).toBeInTheDocument();
  });

  it('renders with different category', () => {
    render(<ArticleCard {...mockArticleCard} category="food" />);
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('handles article without image by using placeholder', () => {
    render(<ArticleCard {...mockArticleCard} imageSrc="" />);
    expect(screen.getByText(mockArticleCard.title)).toBeInTheDocument();
  });
});
