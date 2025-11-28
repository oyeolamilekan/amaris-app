import type { Context } from "hono";
import type { Variables } from "../middleware/auth";
import {
  uploadImageToCloudinary,
  uploadBase64ToCloudinary,
  isCloudinaryConfigured,
} from "../services/cloudinary-upload";

/**
 * Upload Controller
 * Handles image upload business logic
 */

/**
 * Upload style image from multipart form data
 */
export async function uploadStyleImage(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return c.json(
        {
          error:
            "Image upload service not configured. Please contact administrator.",
        },
        503,
      );
    }

    const body = await c.req.parseBody();
    const file = body["image"];

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No image file provided" }, 400);
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      return c.json(
        { error: "Invalid file type. Allowed: JPG, PNG, WEBP, GIF" },
        400,
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ error: "File too large. Maximum size is 10MB" }, 400);
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await uploadImageToCloudinary(
      buffer,
      file.name,
      file.type,
      userId,
    );

    if (!result.success) {
      return c.json({ error: result.error || "Upload failed" }, 500);
    }

    return c.json({
      success: true,
      url: result.secureUrl || result.url, // Prefer secure URL
      publicId: result.publicId,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload image",
      },
      500,
    );
  }
}

/**
 * Upload image from base64 encoded string
 */
export async function uploadBase64Image(
  c: Context<{ Variables: Variables }>,
) {
  try {
    const userId = c.get("userId");
    if (!userId) {
      return c.json({ error: "User not authenticated" }, 401);
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return c.json(
        {
          error:
            "Image upload service not configured. Please contact administrator.",
        },
        503,
      );
    }

    const body = await c.req.json();
    const { image, fileName, mimeType } = body;

    if (!image) {
      return c.json({ error: "No image data provided" }, 400);
    }

    // Upload to Cloudinary
    const result = await uploadBase64ToCloudinary(
      image,
      fileName || "uploaded-image.png",
      userId,
    );

    if (!result.success) {
      return c.json({ error: result.error || "Upload failed" }, 500);
    }

    return c.json({
      success: true,
      url: result.secureUrl || result.url,
      publicId: result.publicId,
      fileName: fileName || "uploaded-image.png",
      mimeType: mimeType || "image/png",
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error("Base64 upload error:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process image",
      },
      500,
    );
  }
}
