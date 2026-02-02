import { Router, Request, Response } from "express";
import { requireAuth, writeRateLimiter } from "../middleware/security";
import supabase from "../lib/supabase";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "crypto";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/upload/image
 * Upload an image to Supabase Storage
 * Requires authentication
 */
router.post(
  "/upload/image",
  requireAuth,
  writeRateLimiter,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const file = req.file;
      
      // Optimize image with sharp
      const optimizedImage = await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();

      // Generate unique filename
      const fileExt = 'webp';
      const fileName = `${randomUUID()}.${fileExt}`;
      const filePath = `article-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(filePath, optimizedImage, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ 
          error: "Failed to upload image",
          details: error.message 
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      return res.json({
        success: true,
        url: urlData.publicUrl,
        fileName: fileName,
        size: optimizedImage.length,
        originalSize: file.size,
      });

    } catch (error: any) {
      console.error('Image upload error:', error);
      return res.status(500).json({ 
        error: "Internal server error",
        message: error.message 
      });
    }
  }
);

/**
 * DELETE /api/upload/image/:fileName
 * Delete an image from Supabase Storage
 * Requires authentication
 */
router.delete(
  "/upload/image/:fileName",
  requireAuth,
  writeRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const { fileName } = req.params;
      
      if (!fileName) {
        return res.status(400).json({ error: "File name is required" });
      }

      const filePath = `article-images/${fileName}`;

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('article-images')
        .remove([filePath]);

      if (error) {
        console.error('Supabase delete error:', error);
        return res.status(500).json({ 
          error: "Failed to delete image",
          details: error.message 
        });
      }

      return res.json({
        success: true,
        message: "Image deleted successfully",
      });

    } catch (error: any) {
      console.error('Image delete error:', error);
      return res.status(500).json({ 
        error: "Internal server error",
        message: error.message 
      });
    }
  }
);

export { router as uploadRouter };
