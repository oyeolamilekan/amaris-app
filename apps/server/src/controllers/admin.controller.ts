import type { Context } from "hono";
import { db, eq } from "@amaris/db";
import { creditPackage } from "@amaris/db/schema/auth";
import { z } from "zod";

// Schemas
const createPackageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  credits: z.number().int().positive(),
  price: z.number().int().positive(), // in cents
  polarProductId: z.string().min(1),
});

const updatePackageSchema = z.object({
  name: z.string().min(1).optional(),
  credits: z.number().int().positive().optional(),
  price: z.number().int().positive().optional(),
  polarProductId: z.string().min(1).optional(),
});

/**
 * List all credit packages
 */
export const listPackages = async (c: Context) => {
  const packages = await db.select().from(creditPackage);
  return c.json(packages);
};

/**
 * Create a new credit package
 */
export const createPackage = async (c: Context) => {
  try {
    const body = await c.req.json();
    const data = createPackageSchema.parse(body);

    await db.insert(creditPackage).values({
      ...data,
      currency: "usd",
    });
    return c.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: error.errors }, 400);
    }
    console.error("Failed to create package:", error);
    return c.json({ error: "Failed to create package" }, 500);
  }
};

/**
 * Update an existing credit package
 */
export const updatePackage = async (c: Context) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const data = updatePackageSchema.parse(body);

    await db
      .update(creditPackage)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(creditPackage.id, id));

    return c.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: error.errors }, 400);
    }
    console.error("Failed to update package:", error);
    return c.json({ error: "Failed to update package" }, 500);
  }
};

/**
 * Delete a credit package
 */
export const deletePackage = async (c: Context) => {
  const id = c.req.param("id");
  try {
    await db.delete(creditPackage).where(eq(creditPackage.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete package:", error);
    return c.json({ error: "Failed to delete package" }, 500);
  }
};
