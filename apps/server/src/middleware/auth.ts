import { auth } from "@amaris/auth";

export type Variables = {
  session: any;
  userId: string;
};

/**
 * Middleware to check authentication
 * Extracts session from Better-Auth and sets userId in context
 */
export const requireAuth = async (c: any, next: () => Promise<void>) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("session", session);
  c.set("userId", session.user.id as string);
  await next();
};
