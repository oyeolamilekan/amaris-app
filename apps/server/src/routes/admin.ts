import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, eq } from "@amaris/db";
import { creditPackage } from "@amaris/db/schema/auth";
import { auth } from "@amaris/auth";

const app = new Hono();

// Middleware to check for admin role
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || !session.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Cast user to any to access role property since it was recently added
  const user = session.user as any;

  if (user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await next();
});

// List packages
app.get("/packages", async (c) => {
  const packages = await db.select().from(creditPackage);
  return c.json(packages);
});

// Create package
app.post(
  "/packages",
  zValidator(
    "json",
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      credits: z.number().int().positive(),
      price: z.number().int().positive(), // in cents
      polarProductId: z.string().min(1),
    })
  ),
  async (c) => {
    const data = c.req.valid("json");

    try {
      await db.insert(creditPackage).values({
        ...data,
        currency: "usd",
      });
      return c.json({ success: true });
    } catch (error) {
      console.error("Failed to create package:", error);
      return c.json({ error: "Failed to create package" }, 500);
    }
  }
);

// Update package
app.put(
  "/packages/:id",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1).optional(),
      credits: z.number().int().positive().optional(),
      price: z.number().int().positive().optional(),
      polarProductId: z.string().min(1).optional(),
    })
  ),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    try {
      await db
        .update(creditPackage)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(creditPackage.id, id));

      return c.json({ success: true });
    } catch (error) {
      console.error("Failed to update package:", error);
      return c.json({ error: "Failed to update package" }, 500);
    }
  }
);

// Delete package
app.delete("/packages/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await db.delete(creditPackage).where(eq(creditPackage.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete package:", error);
    return c.json({ error: "Failed to delete package" }, 500);
  }
});

export default app;
