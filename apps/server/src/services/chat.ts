import { db, chat, chatMessage, eq, and, desc } from "@amaris/db";

/**
 * Service for managing chat sessions and messages
 */

export interface ChatRecord {
  id: string;
  userId: string;
  name: string;
  draft: string;
  isGenerating: boolean;
  modelId: string;
  modelType: string;
  imageCount: number;
  outputStyle: string;
  styleImageUrl: string | null;
  styleImageName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageRecord {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  images: string[];
  status: "pending" | "completed" | "failed" | null;
  error: string | null;
  createdAt: Date;
}

export interface CreateChatInput {
  userId: string;
  name: string;
  modelId?: string;
  modelType?: string;
  imageCount?: number;
  outputStyle?: string;
}

export interface UpdateChatInput {
  name?: string;
  draft?: string;
  isGenerating?: boolean;
  modelId?: string;
  modelType?: string;
  imageCount?: number;
  outputStyle?: string;
  styleImageUrl?: string;
  styleImageName?: string;
}

export interface CreateMessageInput {
  id?: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  status?: "pending" | "completed" | "failed";
  error?: string;
}

/**
 * Create a new chat session
 */
export async function createChat(input: CreateChatInput): Promise<string> {
  const chatId = crypto.randomUUID();

  await db.insert(chat).values({
    id: chatId,
    userId: input.userId,
    name: input.name,
    modelId: input.modelId || "gemini-2.0-flash-exp",
    modelType: input.modelType || "google:gemini-2.0-flash-exp",
    imageCount: input.imageCount || 1,
    outputStyle: input.outputStyle || "realistic",
  });

  return chatId;
}

/**
 * Get a chat by ID
 */
export async function getChatById(
  chatId: string,
  userId: string,
): Promise<ChatRecord | null> {
  const [result] = await db
    .select()
    .from(chat)
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)));

  return (result as ChatRecord) || null;
}

/**
 * List all chats for a user
 */
export async function listUserChats(userId: string): Promise<ChatRecord[]> {
  const chats = await db
    .select()
    .from(chat)
    .where(eq(chat.userId, userId))
    .orderBy(desc(chat.updatedAt));

  return chats as ChatRecord[];
}

/**
 * Update a chat
 */
export async function updateChat(
  chatId: string,
  userId: string,
  updates: UpdateChatInput,
): Promise<void> {
  await db
    .update(chat)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
}

/**
 * Delete a chat
 */
export async function deleteChat(
  chatId: string,
  userId: string,
): Promise<boolean> {
  await db
    .delete(chat)
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)));

  return true;
}

/**
 * Create a message in a chat
 */
export async function createMessage(
  input: CreateMessageInput,
): Promise<string> {
  const messageId = input.id || crypto.randomUUID();

  await db.insert(chatMessage).values({
    id: messageId,
    chatId: input.chatId,
    role: input.role,
    content: input.content,
    images: input.images || [],
    status: input.status || null,
    error: input.error || null,
  });

  return messageId;
}

/**
 * Get all messages for a chat
 */
export async function getChatMessages(
  chatId: string,
): Promise<ChatMessageRecord[]> {
  const messages = await db
    .select()
    .from(chatMessage)
    .where(eq(chatMessage.chatId, chatId))
    .orderBy(chatMessage.createdAt);

  return messages as ChatMessageRecord[];
}

/**
 * Update a message
 */
export async function updateMessage(
  messageId: string,
  updates: {
    images?: string[];
    status?: "pending" | "completed" | "failed";
    error?: string;
  },
): Promise<void> {
  await db
    .update(chatMessage)
    .set(updates)
    .where(eq(chatMessage.id, messageId));
}

/**
 * Delete all messages in a chat
 */
export async function deleteChatMessages(chatId: string): Promise<void> {
  await db.delete(chatMessage).where(eq(chatMessage.chatId, chatId));
}

/**
 * Get chat with messages
 */
export async function getChatWithMessages(
  chatId: string,
  userId: string,
): Promise<{ chat: ChatRecord; messages: ChatMessageRecord[] } | null> {
  const chatData = await getChatById(chatId, userId);
  if (!chatData) return null;

  const messages = await getChatMessages(chatId);

  return {
    chat: chatData,
    messages,
  };
}

/**
 * Get user's chat count
 */
export async function getUserChatCount(userId: string): Promise<number> {
  const chats = await db.select().from(chat).where(eq(chat.userId, userId));
  return chats.length;
}
