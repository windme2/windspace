import { Article } from '../types';

// Helper function to format date to Gregorian (Western) calendar in DD/MM/YYYY format
const formatDateToGregorian = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Force Gregorian calendar using Intl.DateTimeFormat with en-GB locale for DD/MM/YYYY format
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    calendar: 'gregory'
  }).format(date);
};

// Interface for display article used by components
export interface ArticleDisplay {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'food' | 'travel' | 'lifestyle' | 'tech';
  imageSrc: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  featured: boolean;
  tags: string[];
  slug: string;
}

// Map category slugs to display categories
const mapCategory = (categorySlug?: string): 'food' | 'travel' | 'lifestyle' | 'tech' => {
  if (!categorySlug) return 'food'; // Default to food instead of travel
  
  switch (categorySlug.toLowerCase()) {
    case 'food': return 'food';
    case 'travel': return 'travel'; 
    case 'lifestyle': return 'lifestyle';
    case 'technology': return 'tech';
    case 'tech': return 'tech';
    default: return 'food'; // Default to food instead of travel
  }
};

export const convertArticle = (article: Article, forceCategory?: string): ArticleDisplay => ({
  id: article.id?.toString() || String(article.id),
  title: article.title,
  excerpt: article.excerpt,
  content: article.content,
  category: forceCategory ? mapCategory(forceCategory) : mapCategory(article.categories?.slug || article.categories?.name || 'food'),
  imageSrc: article.featured_image || '/placeholder.svg',
  date: article.created_at ? formatDateToGregorian(article.created_at) : formatDateToGregorian(new Date().toISOString()),
  author: {
    name: article.author_name && article.author_name.trim() !== '' ? article.author_name : 'WindSpace Team',
    avatar: article.author_avatar || '/placeholder.svg'
  },
  featured: false,
  tags: article.tags || [],
  slug: article.slug
});

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};