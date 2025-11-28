import { db, styleReference, eq, desc } from "@amaris/db";

/**
 * Service for managing style reference records
 */

export interface StyleReferenceRecord {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  description?: string | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStyleReferenceInput {
  userId: string;
  name: string;
  imageUrl: string;
  description?: string;
}

/**
 * Create a new style reference
 */
export async function createStyleReference(
  input: CreateStyleReferenceInput,
): Promise<string> {
  const styleRefId = crypto.randomUUID();

  await db.insert(styleReference).values({
    id: styleRefId,
    userId: input.userId,
    name: input.name,
    imageUrl: input.imageUrl,
    description: input.description || null,
    usageCount: 0,
  });

  return styleRefId;
}

/**
 * Get a style reference by ID
 */
export async function getStyleReferenceById(
  styleRefId: string,
  userId: string,
): Promise<StyleReferenceRecord | null> {
  const [ref] = await db
    .select()
    .from(styleReference)
    .where(eq(styleReference.id, styleRefId));

  // Verify ownership
  if (ref && ref.userId !== userId) {
    return null;
  }

  return ref || null;
}

/**
 * List user's style references
 */
export async function listUserStyleReferences(
  userId: string,
): Promise<StyleReferenceRecord[]> {
  const references = await db
    .select()
    .from(styleReference)
    .where(eq(styleReference.userId, userId))
    .orderBy(desc(styleReference.createdAt));

  return references;
}

/**
 * Update style reference
 */
export async function updateStyleReference(
  styleRefId: string,
  _userId: string,
  updates: Partial<Pick<StyleReferenceRecord, "name" | "description">>,
): Promise<boolean> {
  await db
    .update(styleReference)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(styleReference.id, styleRefId));

  return true;
}

/**
 * Increment usage count for a style reference
 */
export async function incrementStyleReferenceUsage(
  styleRefId: string,
): Promise<void> {
  const [ref] = await db
    .select()
    .from(styleReference)
    .where(eq(styleReference.id, styleRefId));

  if (ref) {
    await db
      .update(styleReference)
      .set({
        usageCount: ref.usageCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(styleReference.id, styleRefId));
  }
}

/**
 * Delete a style reference
 */
export async function deleteStyleReference(
  styleRefId: string,
  userId: string,
): Promise<boolean> {
  // First verify ownership
  const ref = await getStyleReferenceById(styleRefId, userId);

  if (!ref) {
    return false;
  }

  await db.delete(styleReference).where(eq(styleReference.id, styleRefId));

  return true;
}

/**
 * Get most used style references for a user
 */
export async function getMostUsedStyleReferences(
  userId: string,
  limit: number = 10,
): Promise<StyleReferenceRecord[]> {
  const references = await db
    .select()
    .from(styleReference)
    .where(eq(styleReference.userId, userId))
    .orderBy(desc(styleReference.usageCount))
    .limit(limit);

  return references;
}
