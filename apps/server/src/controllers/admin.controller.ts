import type { Context } from "hono";
import { z } from "zod";
import {
  createPackageSchema,
  updatePackageSchema,
  updateUserCreditsSchema,
} from "../validators/admin";
import {
  getAllPackages,
  createCreditPackage,
  updateCreditPackage,
  deleteCreditPackage,
  getAllUsersWithCredits,
  updateUserCreditBalance,
} from "../services";

/**
 * Admin Controller
 * Handles administrative tasks
 */

/**
 * List all credit packages
 */
export const listPackages = async (c: Context) => {
  try {
    const packages = await getAllPackages();
    return c.json({
      success: true,
      message: "Packages successfully fetched",
      data: packages,
    });
  } catch (error) {
    console.error("List packages error:", error);
    return c.json({ error: "Failed to fetch packages" }, 500);
  }
};

/**
 * Create a new credit package
 */
export const createPackage = async (c: Context) => {
  try {
    const body = await c.req.json();
    const data = createPackageSchema.parse(body);

    await createCreditPackage(data);
    return c.json({
      success: true,
      message: "Package successfully created",
      data: {},
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Validation failed", details: (error as any).errors },
        400,
      );
    }
    console.error("Create package error:", error);
    return c.json({ error: "Failed to create package" }, 500);
  }
};

/**
 * Update an existing credit package
 */
export const updatePackage = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const data = updatePackageSchema.parse(body);

    await updateCreditPackage(id, data);

    return c.json({
      success: true,
      message: "Package successfully updated",
      data: {},
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Validation failed", details: (error as any).errors },
        400,
      );
    }
    console.error("Update package error:", error);
    return c.json({ error: "Failed to update package" }, 500);
  }
};

/**
 * Delete a credit package
 */
export const deletePackage = async (c: Context) => {
  try {
    const id = c.req.param("id");
    await deleteCreditPackage(id);
    return c.json({
      success: true,
      message: "Package successfully deleted",
      data: {},
    });
  } catch (error) {
    console.error("Delete package error:", error);
    return c.json({ error: "Failed to delete package" }, 500);
  }
};

/**
 * List all users with their credits
 */
export const listUsers = async (c: Context) => {
  try {
    const users = await getAllUsersWithCredits();
    return c.json({
      success: true,
      message: "Users successfully fetched",
      data: users,
    });
  } catch (error) {
    console.error("List users error:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
};

/**
 * Update user credits
 */
export const updateUserCredits = async (c: Context) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const { credits } = updateUserCreditsSchema.parse(body);

    await updateUserCreditBalance(userId, credits);

    return c.json({
      success: true,
      message: "User credits successfully updated",
      data: {},
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Validation failed", details: (error as any).errors },
        400,
      );
    }
    console.error("Update user credits error:", error);
    return c.json({ error: "Failed to update user credits" }, 500);
  }
};
