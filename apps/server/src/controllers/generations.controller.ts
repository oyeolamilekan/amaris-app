import type { Context } from "hono";
import type { Variables } from "../middleware/auth";
import type {
  GenerateImageInput,
  StyleReferenceInput,
} from "../validators/generation";
import {
  getUserCredits,
  deductCredits,
  createGeneration,
  getGenerationById,
  listUserGenerations,
  createStyleReference,
  listUserStyleReferences,
  processGeneration,
} from "../services";
import { validateGenerationRequest } from "../lib/ai";
import { getModelById, getDefaultModel, isValidModelId } from "../lib/models";
import { db } from "@amaris/db";
import { creditPackage } from "@amaris/db/schema/auth";

/**
 * Generations Controller
 * Handles image generation business logic
 */

/**
 * Start a new image generation
 */
export async function generateImage(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const body = (await c.req.json()) as GenerateImageInput;
    const {
      prompt,
      styleImageUrl,
      styleImageName,
      model,
      outputStyle,
      chatId,
    } = body;

    // Validate request
    const validation = validateGenerationRequest({
      prompt,
    });

    if (!validation.valid) {
      return c.json({ error: validation.error }, 400);
    }

    // Check user credits
    const userCreditsInfo = await getUserCredits(userId);

    if (userCreditsInfo.credits < 1) {
      return c.json(
        { error: "Insufficient credits. Please upgrade to Pro." },
        402,
      );
    }

    // Validate and get model
    let selectedModel = getDefaultModel();
    if (model && isValidModelId(model)) {
      selectedModel = getModelById(model)!;
    }

    // Create generation record
    const generationId = await createGeneration({
      userId,
      chatId,
      prompt,
      styleImageUrl,
      model: selectedModel.type,
      creditsUsed: 1,
      dimensions: { width: 1024, height: 1024 },
      styleImageName,
      outputStyle,
    });

    // Deduct credits
    const { success, remainingCredits } = await deductCredits(userId, 1);

    if (!success) {
      return c.json({ error: "Failed to deduct credits" }, 500);
    }

    // Process generation asynchronously (fire and forget)
    processGeneration({
      generationId,
      prompt,
      styleImageUrl,
      model: selectedModel,
      userId,
    }).catch((error) => {
      console.error(`Failed to queue generation ${generationId}:`, error);
    });

    return c.json({
      success: true,
      generationId,
      status: "processing",
      creditsRemaining: remainingCredits,
      model: {
        id: selectedModel.id,
        name: selectedModel.name,
        type: selectedModel.type,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return c.json({ error: "Failed to start generation" }, 500);
  }
}

/**
 * List user's generations with pagination
 */
export async function listGenerations(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = parseInt(c.req.query("offset") || "0");

    const generations = await listUserGenerations(userId, limit, offset);

    return c.json({ generations });
  } catch (error) {
    console.error("List generations error:", error);
    return c.json({ error: "Failed to fetch generations" }, 500);
  }
}

/**
 * Get a specific generation by ID
 */
export async function getGeneration(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const generationId = c.req.param("id");

    const gen = await getGenerationById(generationId, userId);

    if (!gen) {
      return c.json({ error: "Generation not found" }, 404);
    }

    return c.json({ generation: gen });
  } catch (error) {
    console.error("Get generation error:", error);
    return c.json({ error: "Failed to fetch generation" }, 500);
  }
}

/**
 * Get user's credit balance
 */
export async function getCredits(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    console.log(`Fetching credits for user: ${userId}`);
    const credits = await getUserCredits(userId);
    console.log(`Credits found:`, credits);

    return c.json({
      credits: credits.credits,
      totalUsed: credits.totalUsed,
    });
  } catch (error) {
    console.error("Get credits error:", error);
    return c.json({ error: "Failed to fetch credits" }, 500);
  }
}

/**
 * Save a new style reference
 */
export async function saveStyleReference(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const body = (await c.req.json()) as StyleReferenceInput;
    const { name, imageUrl, description } = body;

    const styleRefId = await createStyleReference({
      userId,
      name,
      imageUrl,
      description,
    });

    return c.json({ success: true, styleReferenceId: styleRefId });
  } catch (error) {
    console.error("Save style reference error:", error);
    return c.json({ error: "Failed to save style reference" }, 500);
  }
}

/**
 * Get user's saved style references
 */
export async function getStyleReferences(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const references = await listUserStyleReferences(userId);

    return c.json({ styleReferences: references });
  } catch (error) {
    console.error("List style references error:", error);
    return c.json({ error: "Failed to fetch style references" }, 500);
  }
}

/**
 * Get available credit packages
 */
export async function getCreditPackages(c: Context<{ Variables: Variables }>) {
  try {
    const packages = await db.select().from(creditPackage);
    return c.json({ packages });
  } catch (error) {
    console.error("Get credit packages error:", error);
    return c.json({ error: "Failed to fetch credit packages" }, 500);
  }
}
