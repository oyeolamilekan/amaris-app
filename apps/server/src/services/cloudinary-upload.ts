import { v2 as cloudinary } from "cloudinary";

/**
 * Service for handling image uploads to Cloudinary
 * Replaces local/base64 storage with cloud storage
 */

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  secureUrl?: string;
  fileName?: string;
  width?: number;
  height?: number;
  format?: string;
  error?: string;
}

/**
 * Initialize Cloudinary configuration
 */
function initializeCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary credentials. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

// Initialize on module load
try {
  initializeCloudinary();
} catch (error) {
  console.warn("Cloudinary not configured:", error);
}

/**
 * Validate image file
 */
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp", "gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(
  mimeType: string,
  fileSize: number,
): { valid: boolean; error?: string } {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check mime type
  const format = mimeType.split("/")[1]?.toLowerCase();
  if (!format || !ALLOWED_FORMATS.includes(format)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_FORMATS.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Upload image buffer to Cloudinary
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  userId: string,
  folder: string = "amaris/style-images",
): Promise<CloudinaryUploadResult> {
  try {
    // Validate file
    const validation = validateFile(mimeType, buffer.length);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Convert buffer to base64 for Cloudinary upload
    const base64Image = `data:${mimeType};base64,${buffer.toString("base64")}`;

    // Generate unique public ID
    const timestamp = Date.now();
    const sanitizedFileName = fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_");
    const publicId = `${folder}/${userId}/${timestamp}-${sanitizedFileName}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      public_id: publicId,
      resource_type: "image",
      folder: folder,
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
      tags: ["style-image", `user:${userId}`],
    });

    return {
      success: true,
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      fileName: fileName,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Upload image from base64 string to Cloudinary
 */
export async function uploadBase64ToCloudinary(
  base64Data: string,
  fileName: string,
  userId: string,
  folder: string = "amaris/style-images",
): Promise<CloudinaryUploadResult> {
  try {
    // Extract mime type and base64 data
    let mimeType = "image/png";
    let base64String = base64Data;

    if (base64Data.startsWith("data:")) {
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches[1] && matches[2]) {
        mimeType = matches[1];
        base64String = matches[2];
      }
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, "base64");

    return await uploadImageToCloudinary(
      buffer,
      fileName,
      mimeType,
      userId,
      folder,
    );
  } catch (error) {
    console.error("Base64 to Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete image from Cloudinary by public ID
 */
export async function deleteImageFromCloudinary(
  publicId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return { success: true };
    } else {
      return {
        success: false,
        error: `Failed to delete image: ${result.result}`,
      };
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  },
): string {
  try {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width: options?.width,
          height: options?.height,
          crop: options?.crop || "limit",
          quality: options?.quality || "auto",
          fetch_format: options?.format || "auto",
        },
      ],
      secure: true,
    });
  } catch (error) {
    console.error("Error generating optimized URL:", error);
    throw error;
  }
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}
