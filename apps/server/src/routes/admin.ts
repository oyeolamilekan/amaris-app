import { Hono } from "hono";
import { requireAdmin } from "../middleware/admin";
import {
  listPackages,
  createPackage,
  updatePackage,
  deletePackage,
  listUsers,
  updateUserCredits,
} from "../controllers/admin.controller";

const app = new Hono();

/**
 * GET /api/admin/packages
 * List all credit packages
 */
app.get("/packages", requireAdmin, listPackages);

/**
 * POST /api/admin/packages
 * Create a new credit package
 */
app.post("/packages", requireAdmin, createPackage);

/**
 * PUT /api/admin/packages/:id
 * Update an existing credit package
 */
app.put("/packages/:id", requireAdmin, updatePackage);

/**
 * DELETE /api/admin/packages/:id
 * Delete a credit package
 */
app.delete("/packages/:id", requireAdmin, deletePackage);

/**
 * GET /api/admin/users
 * List all users with their credits
 */
app.get("/users", requireAdmin, listUsers);

/**
 * PUT /api/admin/users/:userId/credits
 * Update user credits
 */
app.put("/users/:userId/credits", requireAdmin, updateUserCredits);

export default app;
