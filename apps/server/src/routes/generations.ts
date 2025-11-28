import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { requireAuth, type Variables } from "../middleware/auth";
import {
  generateImageSchema,
  styleReferenceSchema,
} from "../validators/generation";
import {
  generateImage,
  listGenerations,
  getGeneration,
  getCredits,
  getCreditPackages,
  saveStyleReference,
  getStyleReferences,
} from "../controllers";

const app = new Hono<{ Variables: Variables }>();

/**
 * POST /api/generations/generate
 * Start a new image generation
 */
app.post(
  "/generate",
  requireAuth,
  zValidator("json", generateImageSchema),
  generateImage,
);

/**
 * GET /api/generations/list
 * List user's generations with pagination
 */
app.get("/list", requireAuth, listGenerations);

/**
 * GET /api/generations/credits
 * Get user's credit balance
 */
app.get("/credits", requireAuth, getCredits);

/**
 * GET /api/generations/packages
 * Get available credit packages
 */
app.get("/packages", requireAuth, getCreditPackages);

/**
 * GET /api/generations/style-references
 * Get user's saved style references
 */
app.get("/style-references", requireAuth, getStyleReferences);

/**
 * GET /api/generations/:id
 * Get a specific generation by ID
 */
app.get("/:id", requireAuth, getGeneration);

/**
 * POST /api/generations/style-reference
 * Save a new style reference
 */
app.post(
  "/style-reference",
  requireAuth,
  zValidator("json", styleReferenceSchema),
  saveStyleReference,
);

export default app;
