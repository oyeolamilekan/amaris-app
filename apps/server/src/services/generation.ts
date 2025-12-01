import { db, generation, eq, and, desc } from "@amaris/db";

/**
 * Service for managing image generation records
 */

export interface GenerationRecord {
  id: string;
  userId: string;
  prompt: string;
  styleImageUrl: string;
  model: string;
  status: "processing" | "completed" | "failed";
  generatedImageUrl?: string | null;
  errorMessage?: string | null;
  metadata?: any;
  creditsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGenerationInput {
  userId: string;
  prompt: string;
  styleImageUrl: string;
  model: string;
  creditsUsed: number;
  dimensions: { width: number; height: number };
  styleImageName?: string;
  outputStyle?: string;
  chatId?: string;
}

export interface UpdateGenerationInput {
  status?: "processing" | "completed" | "failed";
  generatedImageUrl?: string;
  errorMessage?: string;
  metadata?: any;
}

/**
 * Create a new generation record
 */
export async function createGeneration(
  input: CreateGenerationInput,
): Promise<string> {
  const generationId = crypto.randomUUID();

  await db.insert(generation).values({
    id: generationId,
    userId: input.userId,
    chatId: input.chatId,
    prompt: input.prompt,
    styleImageUrl: input.styleImageUrl,
    model: input.model,
    outputStyle: input.outputStyle,
    status: "processing",
    creditsUsed: input.creditsUsed,
    metadata: {
      dimensions: input.dimensions,
      styleImageName: input.styleImageName,
    },
  } as any);

  return generationId;
}

/**
 * Get a generation by ID
 */
export async function getGenerationById(
  generationId: string,
  userId: string,
): Promise<GenerationRecord | null> {
  const [gen] = await db
    .select()
    .from(generation)
    .where(and(eq(generation.id, generationId), eq(generation.userId, userId)));

  return (gen as GenerationRecord) || null;
}

/**
 * List user's generations with pagination
 */
export async function listUserGenerations(
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<GenerationRecord[]> {
  const generations = await db
    .select()
    .from(generation)
    .where(eq(generation.userId, userId))
    .orderBy(desc(generation.createdAt))
    .limit(limit)
    .offset(offset);

  return generations as GenerationRecord[];
}

/**
 * Update a generation record
 */
export async function updateGeneration(
  generationId: string,
  updates: UpdateGenerationInput,
): Promise<void> {
  await db
    .update(generation)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(generation.id, generationId));
}

/**
 * Mark generation as completed
 */
export async function completeGeneration(
  generationId: string,
  generatedImageUrl: string,
  metadata?: any,
): Promise<void> {
  await updateGeneration(generationId, {
    status: "completed",
    generatedImageUrl,
    metadata,
  });
}

/**
 * Mark generation as failed
 */
export async function failGeneration(
  generationId: string,
  errorMessage: string,
): Promise<void> {
  await updateGeneration(generationId, {
    status: "failed",
    errorMessage,
  });
}

/**
 * Delete a generation
 */
export async function deleteGeneration(
  generationId: string,
  userId: string,
): Promise<boolean> {
  await db
    .delete(generation)
    .where(and(eq(generation.id, generationId), eq(generation.userId, userId)));

  return true;
}

/**
 * Get generation count for user
 */
export async function getUserGenerationCount(userId: string): Promise<number> {
  const generations = await db
    .select()
    .from(generation)
    .where(eq(generation.userId, userId));

  return generations.length;
}
