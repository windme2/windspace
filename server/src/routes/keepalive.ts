import { Router, Request, Response } from "express";
import { db } from "../services/database";
import logger from "../lib/logger";

const router = Router();

/**
 * @swagger
 * /api/keepalive:
 *   get:
 *     summary: Keep-alive endpoint to prevent Supabase from sleeping
 *     description: |
 *       This endpoint performs a lightweight database query to keep the Supabase 
 *       connection alive and prevent the free-tier database from going to sleep.
 *       
 *       Use this with a cron job service like:
 *       - GitHub Actions (scheduled workflows)
 *       - cron-job.org (free cron service)
 *       - UptimeRobot (free monitoring)
 *       - Render/Railway cron jobs
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Database is awake and responding
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "alive"
 *                 database:
 *                   type: string
 *                   example: "connected"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 responseTime:
 *                   type: number
 *                   description: Response time in milliseconds
 *       503:
 *         description: Database connection failed
 */
router.get("/keepalive", async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Perform a lightweight query to keep Supabase awake
    // This queries the categories table which should be small
    const categories = await db.getCategories();
    
    const responseTime = Date.now() - startTime;
    
    logger.info("Keep-alive ping successful", {
      responseTime,
      categoriesCount: categories?.length || 0,
    });

    res.json({
      status: "alive",
      database: "connected",
      timestamp: new Date().toISOString(),
      responseTime,
      message: "Supabase is awake and responding",
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    logger.error("Keep-alive ping failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      responseTime,
    });

    res.status(503).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      responseTime,
      message: "Failed to connect to database",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @swagger
 * /api/keepalive/ping:
 *   get:
 *     summary: Simple ping endpoint (no database)
 *     description: Returns a simple response without querying the database. Use for basic uptime monitoring.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 */
router.get("/keepalive/ping", (req: Request, res: Response) => {
  res.json({
    status: "pong",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @swagger
 * /api/keepalive/warm:
 *   get:
 *     summary: Warm up the database with multiple queries
 *     description: |
 *       Performs multiple database queries to fully wake up Supabase.
 *       Use this after a long period of inactivity.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Database warmed up successfully
 */
router.get("/keepalive/warm", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const results: { query: string; time: number; success: boolean }[] = [];

  try {
    // Query 1: Get categories
    const catStart = Date.now();
    await db.getCategories();
    results.push({ query: "categories", time: Date.now() - catStart, success: true });

    // Query 2: Get articles (published only)
    const artStart = Date.now();
    await db.getArticles(true);
    results.push({ query: "articles", time: Date.now() - artStart, success: true });

    const totalTime = Date.now() - startTime;

    logger.info("Database warm-up completed", { totalTime, results });

    res.json({
      status: "warmed",
      database: "connected",
      timestamp: new Date().toISOString(),
      totalTime,
      queries: results,
      message: "Database is fully warmed up",
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;

    logger.error("Database warm-up failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      totalTime,
      results,
    });

    res.status(503).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      totalTime,
      queries: results,
      message: "Failed to warm up database",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as keepaliveRouter };
