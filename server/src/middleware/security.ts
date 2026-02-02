import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { verifyAccessToken } from "../services/auth";

// Rate limiter for admin login - prevent brute force attacks
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Too many login attempts, please try again later",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for successful logins
  skipSuccessfulRequests: true,
});

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    error: "Too many requests, please slow down"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for write operations (POST/PUT/DELETE)
export const writeRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 write requests per minute
  message: {
    error: "Too many write requests, please slow down"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT Auth middleware - verify JWT token
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("❌ ADMIN_PASSWORD not configured");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  // Extract token from Bearer header
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) {
    res.status(401).json({ error: "Unauthorized - No token provided" });
    return;
  }

  // First try JWT verification
  const decoded = verifyAccessToken(token);
  if (decoded) {
    // Valid JWT token
    (req as any).user = decoded;
    next();
    return;
  }

  // Fallback to simple password check (for backward compatibility)
  if (token === adminPassword) {
    (req as any).user = { role: 'admin', username: 'admin' };
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized - Invalid token" });
};

// XSS sanitization helper
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URLs (can be used for XSS)
  sanitized = sanitized.replace(/data:/gi, '');
  
  return sanitized;
};

// Input validation helpers
export const validateArticleInput = (req: Request, res: Response, next: NextFunction): void => {
  const { title, content } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "Valid title is required" });
    return;
  }

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    res.status(400).json({ error: "Valid content is required" });
    return;
  }

  if (title.length > 500) {
    res.status(400).json({ error: "Title too long (max 500 characters)" });
    return;
  }

  if (content.length > 100000) {
    res.status(400).json({ error: "Content too long (max 100,000 characters)" });
    return;
  }

  // Sanitize HTML content
  req.body.content = sanitizeHtml(content);

  next();
};

export const validateCategoryInput = (req: Request, res: Response, next: NextFunction): void => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Valid category name is required" });
    return;
  }

  if (name.length > 100) {
    res.status(400).json({ error: "Category name too long (max 100 characters)" });
    return;
  }

  next();
};

// Validate file upload
export const validateFileUpload = (allowedTypes: string[], maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // Check file type
    const fileType = req.file.mimetype;
    if (!allowedTypes.includes(fileType)) {
      res.status(400).json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      });
      return;
    }

    // Check file size
    if (req.file.size > maxSize) {
      res.status(400).json({ 
        error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB` 
      });
      return;
    }

    next();
  };
};

// HTTPS redirect middleware (for production)
export const httpsRedirect = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production') {
    // Check X-Forwarded-Proto header (used by proxies like Heroku, Railway)
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https') {
      res.redirect(301, `https://${req.hostname}${req.url}`);
      return;
    }
  }
  next();
};

// Sanitize error messages - don't leak sensitive info
export const sanitizeError = (error: any): string => {
  if (process.env.NODE_ENV === "production") {
    // In production, return generic messages
    return "An error occurred";
  }
  // In development, show more details (but still avoid showing stack traces to client)
  return error?.message || "An error occurred";
};
