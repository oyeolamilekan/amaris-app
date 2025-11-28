import { Hono } from "hono";
import { requireAuth, type Variables } from "../middleware/auth";
import { uploadStyleImage, uploadBase64Image } from "../controllers";

const app = new Hono<{ Variables: Variables }>();

/**
 * POST /api/upload/style-image
 * Upload a style reference image to Cloudinary
 * Accepts multipart/form-data with an image file
 */
app.post("/style-image", requireAuth, uploadStyleImage);

/**
 * POST /api/upload/base64
 * Alternative endpoint that accepts base64 encoded image and uploads to Cloudinary
 */
app.post("/base64", requireAuth, uploadBase64Image);

export default app;
