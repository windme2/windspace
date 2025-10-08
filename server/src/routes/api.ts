import { Router } from "express";
import { db } from "../services/database";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API documentation
router.get("/api", (req, res) => {
  res.json({
    message: "WindSpace API",
    version: "1.0.0",
    endpoints: {
      articles: {
        "GET /api/articles": "Get all articles",
        "GET /api/articles/:slug": "Get article by slug",
        "POST /api/articles": "Create new article",
        "PUT /api/articles/:id": "Update article",
        "DELETE /api/articles/:id": "Delete article",
      },
      categories: {
        "GET /api/categories": "Get all categories",
        "GET /api/categories/:slug": "Get category by slug",
        "POST /api/categories": "Create new category",
        "PUT /api/categories/:id": "Update category",
        "DELETE /api/categories/:id": "Delete category",
      },
      auth: {
        "POST /api/auth/login": "Login admin",
        "POST /api/auth/logout": "Logout",
        "GET /api/auth/verify": "Verify token",
      },
    },
  });
});

// Articles routes
router.get("/articles", async (req, res) => {
  try {
    const { category, limit, offset, published, search } = req.query;

    let articles: any[];

    try {
      // Try to get data from Supabase database first
      if (category) {
        articles = await db.getArticlesByCategorySlug(
          category as string,
          published !== "false"
        );
      } else {
        articles = await db.getArticles(published !== "false");
      }
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return res.status(500).json({ error: "Database connection failed" });
    }

    // Filter by search query if provided
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      articles = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm) ||
        article.excerpt.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        (article.tags && article.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))) ||
        (article.category && article.category.name.toLowerCase().includes(searchTerm))
      );
    }

    // Pagination
    const limitNum = parseInt(limit as string) || 10;
    const offsetNum = parseInt(offset as string) || 0;
    const total = articles.length;
    const paginatedArticles = articles.slice(offsetNum, offsetNum + limitNum);

    return res.json({
      data: paginatedArticles,
      pagination: {
        page: Math.floor(offsetNum / limitNum) + 1,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      meta: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return res.status(500).json({ error: "Failed to fetch articles" });
  }
});

router.get("/articles/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const article = await db.getArticleBySlug(slug);
    return res.json({ data: article });
  } catch (error) {
    console.error("Error fetching article from database:", error);
    return res.status(404).json({ error: "Article not found" });
  }
});

// Tags routes
router.get("/tags", async (req, res) => {
  try {
    const articles: any[] = await db.getArticles(true); // only published articles

    // Extract all tags and count articles for each tag
    const tagCounts: Record<string, number> = {};
    articles.forEach(article => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by count (descending)
    const tagsWithCounts = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number));

    return res.json({
      data: tagsWithCounts,
      total: tagsWithCounts.length
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res.status(500).json({ error: "Failed to fetch tags" });
  }
});

router.post("/articles", async (req, res) => {
  try {
    const { 
      title, 
      content, 
      excerpt, 
      featured_image, 
      published, 
      category_id,
      author_name,
      author_avatar,
      tags
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    const newArticle = await db.createArticle({
      title,
      slug,
      content,
      excerpt,
      featured_image,
      published: published || false,
      category_id,
      author_name: author_name || "Wind Space Team",
      author_avatar: author_avatar || "/placeholder.svg",
      tags: tags || []
    });

    return res.status(201).json({ data: newArticle });
  } catch (error) {
    console.error("Error creating article:", error);
    return res.status(500).json({ error: "Failed to create article" });
  }
});

router.put("/articles/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    const updatedArticle = await db.updateArticle(id, updates);
    return res.json({ data: updatedArticle });
  } catch (error) {
    console.error("Error updating article:", error);
    return res.status(500).json({ error: "Failed to update article" });
  }
});

router.delete("/articles/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    await db.deleteArticle(id);
    return res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return res.status(500).json({ error: "Failed to delete article" });
  }
});

// Categories routes
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.getCategories();
    return res.json({ data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/categories/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await db.getCategoryBySlug(slug);
    return res.json({ data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(404).json({ error: "Category not found" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();

    const newCategory = await db.createCategory({
      name,
      slug,
      description,
    });

    return res.status(201).json({ data: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ error: "Failed to create category" });
  }
});

router.put("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const updatedCategory = await db.updateCategory(id, updates);
    return res.json({ data: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    await db.deleteCategory(id);
    return res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ error: "Failed to delete category" });
  }
});

export { router };
