import type { Context } from "hono";
import { db, eq } from "@amaris/db";
import { creditPackage, user } from "@amaris/db/schema/auth";
import { userCredits } from "@amaris/db/schema/generations";
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

const updateUserCreditsSchema = z.object({
  credits: z.number().int().min(0),
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
      return c.json(
        { error: "Validation failed", details: (error as any).errors },
        400,
      );
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
      return c.json(
        { error: "Validation failed", details: (error as any).errors },
        400,
      );
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

/**
 * List all users with their credits
 */
export const listUsers = async (c: Context) => {
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: (user as any).role,
      createdAt: user.createdAt,
      credits: userCredits.credits,
    })
    .from(user)
    .leftJoin(userCredits, eq(user.id, userCredits.userId));

  return c.json(users);
};

/**
 * Update user credits
 */
export const updateUserCredits = async (c: Context) => {
  const userId = c.req.param("userId");
  try {
    const body = await c.req.json();
    const { credits } = updateUserCreditsSchema.parse(body);

    // Check if user credits record exists
    const [existing] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId));

    if (existing) {
      await db
        .update(userCredits)
        .set({ credits, updatedAt: new Date() })
        .where(eq(userCredits.userId, userId));
    } else {
      await db.insert(userCredits).values({
        id: crypto.randomUUID(),
        userId,
        credits,
      });
    }

    return c.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Validation failed", details: (error as any).errors },
        400,
      );
    }
    console.error("Failed to update user credits:", error);
    return c.json({ error: "Failed to update user credits" }, 500);
  }
};
