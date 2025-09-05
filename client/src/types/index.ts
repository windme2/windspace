export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  published: boolean;
  category_id: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  categories?: Category; // New field from API response
  view_count?: number;
  author_name?: string;
  author_avatar?: string;
  tags?: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  error?: string;
}

export interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: "food" | "travel" | "lifestyle" | "technology";
  imageSrc: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  slug: string;
}
