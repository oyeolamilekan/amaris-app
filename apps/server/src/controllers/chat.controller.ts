import type { Context } from "hono";
import type { Variables } from "../middleware/auth";
import {
  DEFAULT_IMAGE_COUNT,
  DEFAULT_MODEL_ID,
  DEFAULT_MODEL_TYPE,
  DEFAULT_OUTPUT_STYLE,
} from "../constants";
import {
  createChat,
  getChatById,
  listUserChats,
  updateChat,
  deleteChat,
  getChatWithMessages,
  createMessage,
  updateMessage,
  type CreateChatInput,
  type UpdateChatInput,
  type CreateMessageInput,
} from "../services";

/**
 * Chat Controller
 * Handles chat session management
 */

/**
 * Create a new chat session
 */
export async function createChatSession(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const body = await c.req.json();

    const input: CreateChatInput = {
      userId,
      name: body.name || "New Conversation",
      modelId: body.modelId || DEFAULT_MODEL_ID,
      modelType: body.modelType || DEFAULT_MODEL_TYPE,
      imageCount: body.imageCount || DEFAULT_IMAGE_COUNT,
      outputStyle: body.outputStyle || DEFAULT_OUTPUT_STYLE,
    };

    const chatId = await createChat(input);
    const chat = await getChatById(chatId, userId);

    return c.json({
      success: true,
      message: "Chat session created successfully",
      data: { chat },
    });
  } catch (error) {
    console.error("Create chat error:", error);
    return c.json({ error: "Failed to create chat" }, 500);
  }
}

/**
 * Get a specific chat with messages
 */
export async function getChat(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const chatId = c.req.param("id");

    const result = await getChatWithMessages(chatId, userId);

    if (!result) {
      return c.json({ error: "Chat not found" }, 404);
    }

    return c.json({
      success: true,
      message: "Chat fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Get chat error:", error);
    return c.json({ error: "Failed to fetch chat" }, 500);
  }
}

/**
 * List all chats for a user
 */
export async function listChats(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const chats = await listUserChats(userId);

    return c.json({
      success: true,
      message: "Chats listed successfully",
      data: chats,
    });
  } catch (error) {
    console.error("List chats error:", error);
    return c.json({ error: "Failed to fetch chats" }, 500);
  }
}

/**
 * Update a chat session
 */
export async function updateChatSession(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const chatId = c.req.param("id");
    const body = await c.req.json();

    const updates: UpdateChatInput = {
      name: body.name,
      draft: body.draft,
      isGenerating: body.isGenerating,
      modelId: body.modelId,
      modelType: body.modelType,
      imageCount: body.imageCount,
      outputStyle: body.outputStyle,
      styleImageUrl: body.styleImageUrl,
      styleImageName: body.styleImageName,
    };

    await updateChat(chatId, userId, updates);
    const chat = await getChatById(chatId, userId);

    return c.json({
      success: true,
      message: "Chat updated successfully",
      data: { chat },
    });
  } catch (error) {
    console.error("Update chat error:", error);
    return c.json({ error: "Failed to update chat" }, 500);
  }
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const chatId = c.req.param("id");

    const success = await deleteChat(chatId, userId);

    return c.json({
      success,
      message: "Chat deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Delete chat error:", error);
    return c.json({ error: "Failed to delete chat" }, 500);
  }
}

/**
 * Add a message to a chat
 */
export async function addMessage(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const chatId = c.req.param("id");
    const body = await c.req.json();

    // Verify chat ownership
    const chat = await getChatById(chatId, userId);
    if (!chat) {
      return c.json({ error: "Chat not found" }, 404);
    }

    const input: CreateMessageInput = {
      id: body.id,
      chatId,
      role: body.role,
      content: body.content,
      images: body.images,
      status: body.status,
      error: body.error,
    };

    const messageId = await createMessage(input);

    return c.json({
      success: true,
      message: "Message added successfully",
      data: { messageId },
    });
  } catch (error) {
    console.error("Add message error:", error);
    return c.json({ error: "Failed to add message" }, 500);
  }
}

/**
 * Update a message in a chat
 */
export async function updateChatMessage(c: Context<{ Variables: Variables }>) {
  try {
    const userId = c.get("userId") as string;
    const chatId = c.req.param("id");
    const messageId = c.req.param("messageId");
    const body = await c.req.json();

    // Verify chat ownership
    const chat = await getChatById(chatId, userId);
    if (!chat) {
      return c.json({ error: "Chat not found" }, 404);
    }

    const updates: {
      images?: string[];
      status?: "pending" | "completed" | "failed";
      error?: string;
    } = {};

    if (body.images !== undefined) updates.images = body.images;
    if (body.status !== undefined) updates.status = body.status;
    if (body.error !== undefined) updates.error = body.error;

    console.log(`📝 Updating message ${messageId} in chat ${chatId}:`, updates);

    await updateMessage(messageId, updates);

    return c.json({
      success: true,
      message: "Message updated successfully",
      data: {},
    });
  } catch (error) {
    console.error("Update message error:", error);
    return c.json({ error: "Failed to update message" }, 500);
  }
}
