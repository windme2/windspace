import { Router } from "express";
import { db } from "../services/database";
import { requireAuth, writeRateLimiter } from "../middleware/security";
import supabase from "../lib/supabase";

const router = Router();

/**
 * GET /api/articles/:articleId/comments
 * Get all approved comments for an article
 */
router.get("/articles/:articleId/comments", async (req, res) => {
  try {
    const { articleId } = req.params;

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("article_id", articleId)
      .eq("is_approved", true)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.json({ data });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
});

/**
 * POST /api/comments
 * Submit a new comment (goes to moderation)
 */
router.post("/comments", writeRateLimiter, async (req, res) => {
  try {
    const { article_id, author_name, author_email, content, parent_id } = req.body;

    // Validation
    if (!article_id || !author_name || !author_email || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (content.length < 3 || content.length > 2000) {
      return res.status(400).json({ 
        error: "Comment must be between 3 and 2000 characters" 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(author_email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Insert comment
    // @ts-ignore - Supabase type inference issue
    const table: any = supabase.from("comments");
    const insertQuery: any = table.insert({
      article_id,
      author_name,
      author_email,
      content,
      parent_id: parent_id || null,
      is_approved: false, // Requires moderation
    });
    
    const { data, error } = await insertQuery.select().single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Comment submitted for moderation",
      data,
    });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ error: "Failed to create comment" });
  }
});

/**
 * PATCH /api/comments/:id/approve
 * Approve a comment (admin only)
 */
router.patch(
  "/comments/:id/approve",
  requireAuth,
  writeRateLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;

      // @ts-ignore - Supabase type inference issue
      const table: any = supabase.from("comments");
      const updateQuery: any = table.update({ is_approved: true });
      
      const { data, error } = await updateQuery
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return res.json({ success: true, data });
    } catch (error: any) {
      console.error("Error approving comment:", error);
      return res.status(500).json({ error: "Failed to approve comment" });
    }
  }
);

/**
 * DELETE /api/comments/:id
 * Delete a comment (admin only)
 */
router.delete(
  "/comments/:id",
  requireAuth,
  writeRateLimiter,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      return res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

/**
 * GET /api/comments/pending
 * Get all pending comments for moderation (admin only)
 */
router.get("/comments/pending", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        articles:article_id (
          title,
          slug
        )
      `)
      .eq("is_approved", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ data });
  } catch (error: any) {
    console.error("Error fetching pending comments:", error);
    return res.status(500).json({ error: "Failed to fetch pending comments" });
  }
});

export { router as commentsRouter };
