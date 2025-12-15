import { db, eq } from "@amaris/db";
import { creditPackage, user } from "@amaris/db/schema/auth";
import { userCredits } from "@amaris/db/schema/generations";
import type {
  CreatePackageInput,
  UpdatePackageInput,
} from "../validators/admin";

/**
 * Service for admin operations
 */

/**
 * List all credit packages
 */
export async function getAllPackages() {
  return await db.select().from(creditPackage);
}

/**
 * Create a new credit package
 */
export async function createCreditPackage(input: CreatePackageInput) {
  await db.insert(creditPackage).values({
    ...input,
    currency: "usd",
  });
}

/**
 * Update an existing credit package
 */
export async function updateCreditPackage(
  id: string,
  input: UpdatePackageInput,
) {
  await db
    .update(creditPackage)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(creditPackage.id, id));
}

/**
 * Delete a credit package
 */
export async function deleteCreditPackage(id: string) {
  await db.delete(creditPackage).where(eq(creditPackage.id, id));
}

/**
 * List all users with their credits
 */
export async function getAllUsersWithCredits() {
  return await db
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
}

/**
 * Update user credits
 */
export async function updateUserCreditBalance(userId: string, credits: number) {
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
}
