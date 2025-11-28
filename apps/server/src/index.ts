import "dotenv/config";
import { auth } from "@amaris/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import generationRoutes from "./routes/generations";
import uploadRoutes from "./routes/upload";
import chatRoutes from "./routes/chat";
import webhookRoutes from "./routes/webhooks";
import "./queue/webhook";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN || "",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Mount generation routes
app.route("/api/generations", generationRoutes);

// Mount upload routes
app.route("/api/upload", uploadRoutes);

// Mount chat routes
app.route("/api/chats", chatRoutes);

// Mount webhook routes
app.route("/api/webhooks", webhookRoutes);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
