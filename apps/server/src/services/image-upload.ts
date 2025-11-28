import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

/**
 * Service for handling image uploads
 * Stores images locally and returns public URLs
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

/**
 * Get upload directory path
 */
function getUploadDir(): string {
  // Store in public uploads directory
  return join(process.cwd(), "public", "uploads", "styles");
}

/**
 * Get allowed image extensions
 */
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file type and size
 */
function validateFile(
  fileName: string,
  fileSize: number,
): { valid: boolean; error?: string } {
  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check extension
  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename
 */
function generateFileName(originalName: string): string {
  const ext = originalName.substring(originalName.lastIndexOf("."));
  const uniqueId = randomUUID();
  const timestamp = Date.now();
  return `style-${timestamp}-${uniqueId}${ext}`;
}

/**
 * Upload image from buffer
 */
export async function uploadImage(
  buffer: Buffer,
  originalFileName: string,
  _userId: string,
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(originalFileName, buffer.length);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Ensure upload directory exists
    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileName = generateFileName(originalFileName);
    const filePath = join(uploadDir, fileName);

    // Write file
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/styles/${fileName}`;

    return {
      success: true,
      url: publicUrl,
      fileName,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Upload image from base64 string
 */
export async function uploadImageFromBase64(
  base64Data: string,
  originalFileName: string,
  _userId: string,
): Promise<UploadResult> {
  try {
    // Remove data URL prefix if present
    const base64String = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64String, "base64");

    return await uploadImage(buffer, originalFileName, _userId);
  } catch (error) {
    console.error("Error uploading base64 image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * For now, we'll use a simple base64 data URL approach
 * This stores the image as a data URL directly without file system storage
 */
export async function createDataUrl(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Parse multipart form data to extract image
 * This is a simple implementation - in production use a proper multipart parser
 */
export function parseMultipartImage(_body: string): {
  buffer: Buffer | null;
  fileName: string | null;
  mimeType: string | null;
} {
  // This is a placeholder - Hono has built-in multipart support
  // We'll handle this in the route using c.req.parseBody()
  return {
    buffer: null,
    fileName: null,
    mimeType: null,
  };
}
