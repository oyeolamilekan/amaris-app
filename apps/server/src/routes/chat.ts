import { Hono } from "hono";
import { requireAuth, type Variables } from "../middleware/auth";
import {
  createChatSession,
  getChat,
  listChats,
  updateChatSession,
  deleteChatSession,
  addMessage,
  updateChatMessage,
} from "../controllers/chat.controller";

const app = new Hono<{ Variables: Variables }>();

/**
 * POST /api/chats
 * Create a new chat session
 */
app.post("/", requireAuth, createChatSession);

/**
 * GET /api/chats
 * List all chats for the authenticated user
 */
app.get("/", requireAuth, listChats);

/**
 * GET /api/chats/:id
 * Get a specific chat with messages
 */
app.get("/:id", requireAuth, getChat);

/**
 * PATCH /api/chats/:id
 * Update a chat session
 */
app.patch("/:id", requireAuth, updateChatSession);

/**
 * DELETE /api/chats/:id
 * Delete a chat session
 */
app.delete("/:id", requireAuth, deleteChatSession);

/**
 * POST /api/chats/:id/messages
 * Add a message to a chat
 */
app.post("/:id/messages", requireAuth, addMessage);

/**
 * PATCH /api/chats/:id/messages/:messageId
 * Update a message in a chat
 */
app.patch("/:id/messages/:messageId", requireAuth, updateChatMessage);

export default app;
