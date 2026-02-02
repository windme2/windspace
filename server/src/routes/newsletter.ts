import { Router } from "express";
import { requireAuth, writeRateLimiter } from "../middleware/security";
import supabase from "../lib/supabase";

const router = Router();

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
router.post("/newsletter/subscribe", writeRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email is required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Check if already subscribed
    const { data: existing, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", email)
      .single();

    if (existing) {
      if ((existing as any).is_active) {
        return res.status(400).json({ 
          error: "This email is already subscribed" 
        });
      } else {
        // Reactivate subscription
        // @ts-ignore - Supabase type inference issue
        const table: any = supabase.from("newsletter_subscribers");
        const updateQuery: any = table.update({ 
          is_active: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        });
        const { error: updateError } = await updateQuery.eq("email", email);

        if (updateError) throw updateError;

        return res.json({
          success: true,
          message: "Successfully resubscribed to newsletter",
        });
      }
    }

    // Insert new subscriber
    // @ts-ignore - Supabase type inference issue
    const table: any = supabase.from("newsletter_subscribers");
    const insertQuery: any = table.insert({
      email,
      is_active: true,
      is_verified: false, // Could add email verification later
    });
    
    const { data, error } = await insertQuery.select().single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Successfully subscribed to newsletter",
      data,
    });
  } catch (error: any) {
    console.error("Error subscribing to newsletter:", error);
    return res.status(500).json({ error: "Failed to subscribe" });
  }
});

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe from newsletter
 */
router.post("/newsletter/unsubscribe", writeRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // @ts-ignore - Supabase type inference issue
    const table: any = supabase.from("newsletter_subscribers");
    const updateQuery: any = table.update({ 
      is_active: false,
      unsubscribed_at: new Date().toISOString(),
    });
    
    const { error } = await updateQuery.eq("email", email);

    if (error) throw error;

    return res.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  } catch (error: any) {
    console.error("Error unsubscribing:", error);
    return res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

/**
 * GET /api/newsletter/subscribers
 * Get all active subscribers (admin only)
 */
router.get("/newsletter/subscribers", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("is_active", true)
      .order("subscribed_at", { ascending: false });

    if (error) throw error;

    return res.json({
      data,
      total: data.length,
    });
  } catch (error: any) {
    console.error("Error fetching subscribers:", error);
    return res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

/**
 * GET /api/newsletter/stats
 * Get newsletter statistics (admin only)
 */
router.get("/newsletter/stats", requireAuth, async (req, res) => {
  try {
    const { data: active, error: activeError } = await supabase
      .from("newsletter_subscribers")
      .select("id", { count: 'exact' })
      .eq("is_active", true);

    const { data: total, error: totalError } = await supabase
      .from("newsletter_subscribers")
      .select("id", { count: 'exact' });

    if (activeError || totalError) throw activeError || totalError;

    return res.json({
      active: active?.length || 0,
      total: total?.length || 0,
      inactive: (total?.length || 0) - (active?.length || 0),
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export { router as newsletterRouter };
