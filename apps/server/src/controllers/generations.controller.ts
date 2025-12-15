import type { Context } from "hono";
import type { Variables } from "../middleware/auth";
import {
  GENERATION_CREDIT_COST,
  DEFAULT_GENERATION_DIMENSIONS,
  DEFAULT_PAGE_SIZE,
} from "../constants";
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

    if (userCreditsInfo.credits < GENERATION_CREDIT_COST) {
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
      creditsUsed: GENERATION_CREDIT_COST,
      dimensions: DEFAULT_GENERATION_DIMENSIONS,
      styleImageName,
      outputStyle,
    });

    // Deduct credits
    const { success, remainingCredits } = await deductCredits(
      userId,
      GENERATION_CREDIT_COST,
    );

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
      message: "Generation started successfully",
      data: {
        generationId,
        status: "processing",
        creditsRemaining: remainingCredits,
        model: {
          id: selectedModel.id,
          name: selectedModel.name,
          type: selectedModel.type,
        },
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
    const limit = parseInt(
      c.req.query("limit") || DEFAULT_PAGE_SIZE.toString(),
    );
    const offset = parseInt(c.req.query("offset") || "0");

    const generations = await listUserGenerations(userId, limit, offset);

    return c.json({
      success: true,
      message: "Generations listed successfully",
      data: generations,
    });
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

    return c.json({
      success: true,
      message: "Generation fetched successfully",
      data: { generation: gen },
    });
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
      success: true,
      message: "Credits fetched successfully",
      data: {
        credits: credits.credits,
        totalUsed: credits.totalUsed,
      },
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

    return c.json({
      success: true,
      message: "Style reference saved successfully",
      data: { styleReferenceId: styleRefId },
    });
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

    return c.json({
      success: true,
      message: "Style references fetched successfully",
      data: references,
    });
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
    return c.json({
      success: true,
      message: "Credit packages fetched successfully",
      data: packages,
    });
  } catch (error) {
    console.error("Get credit packages error:", error);
    return c.json({ error: "Failed to fetch credit packages" }, 500);
  }
}
