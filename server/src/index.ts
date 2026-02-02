import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

// Initialize Sentry early
import "./lib/sentry";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { router as apiRouter } from "./routes/api";
import { uploadRouter } from "./routes/upload";
import { commentsRouter } from "./routes/comments";
import { newsletterRouter } from "./routes/newsletter";
import { keepaliveRouter } from "./routes/keepalive";
import { apiRateLimiter } from "./middleware/security";
import { swaggerSpec } from "./lib/swagger";
import logger, { httpLogger, logStartup } from "./lib/logger";
import "./lib/supabase"; // Initialize Supabase connection
import * as Sentry from "@sentry/node";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());

// Use Winston HTTP logger in production, Morgan in development
if (process.env.NODE_ENV === "production") {
  app.use(httpLogger);
} else {
  app.use(morgan("dev"));
}

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "WindSpace API Documentation",
}));

// Serve swagger spec as JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Apply rate limiting to all API routes
app.use("/api", apiRateLimiter);

// CORS Configuration - secure for production
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // In development, if no CORS_ORIGIN is set, allow all
      if (allowedOrigins.length === 0 && process.env.NODE_ENV !== "production") {
        console.warn("⚠️  CORS_ORIGIN not set - allowing all origins in development");
        return callback(null, true);
      }

      // In production, require CORS_ORIGIN to be set
      if (allowedOrigins.length === 0) {
        console.error("❌ CORS_ORIGIN not configured in production");
        return callback(new Error("CORS not configured"));
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`⚠️  CORS blocked request from: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body parser with reasonable limits (prevent DoS)
app.use(express.json({ limit: "2mb" })); // Reduced from 50mb
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api", apiRouter);
app.use("/api", uploadRouter);
app.use("/api", commentsRouter);
app.use("/api", newsletterRouter);
app.use("/api", keepaliveRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🌟 Windspace Thai Blog API",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      health: "/health",
      api: "/api",
      articles: "/api/articles",
      categories: "/api/categories",
      docs: "/api-docs",
    },
  });
});

// 404 handler - removed for now, will add later if needed

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error:", { error: err.message, stack: err.stack });
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong!",
    });
  }
);

// Start server
app.listen(PORT, () => {
  logStartup(Number(PORT), process.env.NODE_ENV || "development");
  logger.info(`📚 API documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
