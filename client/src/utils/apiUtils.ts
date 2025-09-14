import { Article, ApiResponse, PaginatedApiResponse } from "../types";

// API Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Article creation interface
export interface ArticleData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category_id: number;
  author_name?: string;
  author_avatar?: string;
  tags?: string[];
  published?: boolean;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  category?: string;
  published?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// API utility functions
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} - ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};

// Article CRUD operations
export const articleAPI = {
  // Get all articles with pagination
  getAll: (
    params?: PaginationParams
  ): Promise<PaginatedApiResponse<Article>> => {
    const queryParams = new URLSearchParams();
    if (params?.page && params?.limit) {
      queryParams.append(
        "offset",
        ((params.page - 1) * params.limit).toString()
      );
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.category) queryParams.append("category", params.category);
    if (params?.published !== undefined)
      queryParams.append("published", params.published.toString());

    const query = queryParams.toString();
    return apiCall<PaginatedApiResponse<Article>>(
      `/api/articles${query ? `?${query}` : ""}`
    );
  },

  // Get articles by category
  getByCategory: (
    category: string,
    params?: Omit<PaginationParams, "category">
  ): Promise<PaginatedApiResponse<Article>> =>
    articleAPI.getAll({ ...params, category }),

  // Get single article
  getById: (id: string): Promise<ApiResponse<Article>> =>
    apiCall<ApiResponse<Article>>(`/api/articles/${id}`),

  // Create new article
  create: (articleData: ArticleData): Promise<ApiResponse<Article>> =>
    apiCall<ApiResponse<Article>>("/api/articles", {
      method: "POST",
      body: JSON.stringify(articleData),
    }),

  // Update article
  update: (
    id: string,
    articleData: Partial<ArticleData>
  ): Promise<ApiResponse<Article>> =>
    apiCall<ApiResponse<Article>>(`/api/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(articleData),
    }),

  // Delete article
  delete: (id: string): Promise<ApiResponse<null>> =>
    apiCall<ApiResponse<null>>(`/api/articles/${id}`, {
      method: "DELETE",
    }),

  // Search articles
  search: (query: string, params?: Omit<PaginationParams, "category">): Promise<PaginatedApiResponse<Article>> => {
    const queryParams = new URLSearchParams();
    queryParams.append("search", query);
    
    if (params?.page && params?.limit) {
      queryParams.append(
        "offset",
        ((params.page - 1) * params.limit).toString()
      );
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.published !== undefined)
      queryParams.append("published", params.published.toString());

    return apiCall<PaginatedApiResponse<Article>>(`/api/articles?${queryParams.toString()}`);
  },
};

// Tag interface
export interface TagData {
  tag: string;
  count: number;
}
