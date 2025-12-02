import { db, userCredits, eq } from "@amaris/db";

/**
 * Service for managing user credits
 */

export interface UserCreditsInfo {
  credits: number;
  totalUsed: number;
}

/**
 * Get user credits, creating a default record if none exists
 */
export async function getUserCredits(userId: string): Promise<UserCreditsInfo> {
  let [credits] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId));

  if (!credits) {
    // Create credits record for new user with default free credits
    const defaultCredits = parseInt(
      process.env.DEFAULT_USER_CREDITS || "4",
      10,
    );
    const newCredits = {
      id: crypto.randomUUID(),
      userId,
      credits: defaultCredits,
      totalCreditsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(userCredits).values(newCredits);
    credits = newCredits as any;
  }

  return {
    credits: credits?.credits || 0,
    totalUsed: credits?.totalCreditsUsed || 0,
  };
}

/**
 * Check if user has sufficient credits
 */
export async function hasCredits(
  userId: string,
  amount: number = 1,
): Promise<boolean> {
  const [userCreditsRecord] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId));

  if (!userCreditsRecord) {
    // New users get 4 free credits
    return 4 >= amount;
  }

  return userCreditsRecord.credits >= amount;
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string,
  amount: number = 1,
): Promise<{ success: boolean; remainingCredits: number }> {
  const [userCreditsRecord] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId));

  if (!userCreditsRecord) {
    // Create new record with initial credits
    await db.insert(userCredits).values({
      id: crypto.randomUUID(),
      userId,
      credits: 4 - amount,
      totalCreditsUsed: amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, remainingCredits: 4 - amount };
  }

  if (userCreditsRecord.credits < amount) {
    return { success: false, remainingCredits: userCreditsRecord.credits };
  }

  await db
    .update(userCredits)
    .set({
      credits: userCreditsRecord.credits - amount,
      totalCreditsUsed: userCreditsRecord.totalCreditsUsed + amount,
      updatedAt: new Date(),
    })
    .where(eq(userCredits.userId, userId));

  return {
    success: true,
    remainingCredits: userCreditsRecord.credits - amount,
  };
}

/**
 * Add credits to user account (for subscriptions or purchases)
 */
export async function addCredits(
  userId: string,
  amount: number,
): Promise<{ success: boolean; newBalance: number }> {
  const [userCreditsRecord] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId));

  if (!userCreditsRecord) {
    // Create new record
    await db.insert(userCredits).values({
      id: crypto.randomUUID(),
      userId,
      credits: amount,
      totalCreditsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, newBalance: amount };
  }

  const newBalance = userCreditsRecord.credits + amount;

  await db
    .update(userCredits)
    .set({
      credits: newBalance,
      updatedAt: new Date(),
    })
    .where(eq(userCredits.userId, userId));

  return { success: true, newBalance };
}

/**
 * Reset credits to a specific amount (for monthly resets)
 */
export async function resetCredits(
  userId: string,
  amount: number,
): Promise<{ success: boolean; newBalance: number }> {
  const [userCreditsRecord] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId));

  if (!userCreditsRecord) {
    // Create new record
    await db.insert(userCredits).values({
      id: crypto.randomUUID(),
      userId,
      credits: amount,
      totalCreditsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true, newBalance: amount };
  }

  await db
    .update(userCredits)
    .set({
      credits: amount,
      updatedAt: new Date(),
    })
    .where(eq(userCredits.userId, userId));

  return { success: true, newBalance: amount };
}
