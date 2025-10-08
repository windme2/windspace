import supabase from "../lib/supabase";

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  published: boolean;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleInsert {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featured_image?: string | null;
  published?: boolean;
  category_id?: number | null;
  author_name?: string | null;
  author_avatar?: string | null;
  tags?: string[] | null;
}

export interface ArticleUpdate {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  featured_image?: string | null;
  published?: boolean;
  category_id?: number | null;
  author_name?: string | null;
  author_avatar?: string | null;
  tags?: string[] | null;
}

export class SupabaseService {
  // Articles with category filtering
  async getArticles(published = true) {
    const query = supabase
      .from("articles")
      .select(
        `
        *,
        categories (
          id,
          name,
          slug
        )
      `
      )
      .order("created_at", { ascending: false });

    if (published) {
      query.eq("published", true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    return data;
  }

  async getArticlesByCategory(categoryId: number, published = true) {
    const query = supabase
      .from("articles")
      .select(
        `
        *,
        categories (
          id,
          name,
          slug
        )
      `
      )
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    if (published) {
      query.eq("published", true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch articles by category: ${error.message}`);
    }

    return data;
  }

  async getArticlesByCategorySlug(categorySlug: string, published = true) {
    const query = supabase
      .from("articles")
      .select(
        `
        *,
        categories!inner (
          id,
          name,
          slug
        )
      `
      )
      .eq("categories.slug", categorySlug)
      .order("created_at", { ascending: false });

    if (published) {
      query.eq("published", true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Failed to fetch articles by category slug: ${error.message}`
      );
    }

    return data;
  }

  async getArticleById(id: number) {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        categories (
          id,
          name,
          slug
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch article: ${error.message}`);
    }

    return data;
  }

  async getArticleBySlug(slug: string) {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        categories (
          id,
          name,
          slug,
          description
        )
      `
      )
      .eq("slug", slug)
      .single();

    if (error) {
      throw new Error(`Failed to fetch article: ${error.message}`);
    }

    return data;
  }

  async createArticle(article: ArticleInsert) {
    const { data, error } = await (supabase as any)
      .from("articles")
      .insert({
        ...article,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create article: ${error.message}`);
    }

    return data;
  }

  async updateArticle(id: number, updates: ArticleUpdate) {
    const { data, error } = await (supabase as any)
      .from("articles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update article: ${error.message}`);
    }

    return data;
  }

  async deleteArticle(id: number) {
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete article: ${error.message}`);
    }

    return { success: true };
  }

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data;
  }

  async getCategoryById(id: number) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return data;
  }

  async getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return data;
  }

  async createCategory(category: {
    name: string;
    slug: string;
    description?: string | null;
  }) {
    const { data, error } = await (supabase as any)
      .from("categories")
      .insert({
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return data;
  }

  async updateCategory(
    id: number,
    updates: { name?: string; slug?: string; description?: string | null }
  ) {
    const { data, error } = await (supabase as any)
      .from("categories")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return data;
  }

  async deleteCategory(id: number) {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }

    return { success: true };
  }
}

export const db = new SupabaseService();
