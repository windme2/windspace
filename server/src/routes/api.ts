import { Router } from "express";
import { db } from "../services/database";
import {
  loginRateLimiter,
  writeRateLimiter,
  requireAuth,
  validateArticleInput,
  validateCategoryInput,
  sanitizeError,
} from "../middleware/security";
import { generateTokenPair, verifyRefreshToken } from "../services/auth";

const router = Router();

// Admin Authentication Endpoint - with JWT
router.post("/admin/login", loginRateLimiter, (req, res) => {
  try {
    const { password } = req.body;

    // Get admin password from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate environment variable is set
    if (!adminPassword) {
      console.error("❌ ADMIN_PASSWORD not set in environment");
      return res.status(500).json({ success: false, error: "Server configuration error" });
    }

    // Validate password
    if (password === adminPassword) {
      // Generate JWT tokens
      const tokens = generateTokenPair({
        userId: 'admin',
        username: 'admin',
        role: 'admin',
      });

      return res.json({ 
        success: true, 
        message: "Authentication successful",
        ...tokens,
      });
    }

    // Invalid password
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  } catch (error) {
    console.error("Error in admin login:", error);
    return res.status(500).json({ success: false, error: "Authentication failed" });
  }
});

// Refresh token endpoint
router.post("/admin/refresh", (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    });

    return res.json({
      success: true,
      ...tokens,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ error: "Failed to refresh token" });
  }
});

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

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category slug
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, excerpt, content
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedArticles'
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/articles/{slug}:
 *   get:
 *     summary: Get article by slug
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Article slug
 *     responses:
 *       200:
 *         description: Article details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 */
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

// Protected write endpoints - require authentication
router.post("/articles", requireAuth, writeRateLimiter, validateArticleInput, async (req, res) => {
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
    return res.status(500).json({ error: sanitizeError(error) });
  }
});

router.put("/articles/:id", requireAuth, writeRateLimiter, validateArticleInput, async (req, res) => {
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
    return res.status(500).json({ error: sanitizeError(error) });
  }
});

router.delete("/articles/:id", requireAuth, writeRateLimiter, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    await db.deleteArticle(id);
    return res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return res.status(500).json({ error: sanitizeError(error) });
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

router.post("/categories", requireAuth, writeRateLimiter, validateCategoryInput, async (req, res) => {
  try {
    const { name, description } = req.body;

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
    return res.status(500).json({ error: sanitizeError(error) });
  }
});

router.put("/categories/:id", requireAuth, writeRateLimiter, validateCategoryInput, async (req, res) => {
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
    return res.status(500).json({ error: sanitizeError(error) });
  }
});

router.delete("/categories/:id", requireAuth, writeRateLimiter, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    await db.deleteCategory(id);
    return res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ error: sanitizeError(error) });
  }
});

export { router };
