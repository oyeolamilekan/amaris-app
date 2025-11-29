import { auth } from "@amaris/auth";
import type { Context, Next } from "hono";

/**
 * Middleware to check for admin role
 * Verifies authentication and checks if user has 'admin' role
 */
export const requireAdmin = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || !session.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Cast user to any to access role property since it was recently added to the schema
  // and might not be fully typed in the inferred types yet
  const user = session.user as any;

  if (user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  c.set("session", session);
  c.set("userId", session.user.id);

  await next();
};
