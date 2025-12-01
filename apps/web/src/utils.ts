/**
 * Dashboard Utility Functions
 */

import { getDefaultModel } from "@/lib/models";
import type { ChatSession, ChatMessage } from "./types";
import type { Generation } from "@/lib/api";
import { DEFAULT_IMAGE_COUNT } from "./constants";

/**
 * Create a new chat session
 */
export function createChatSession(index: number): ChatSession {
  const id = crypto.randomUUID();
  return {
    id,
    name: `New Conversation ${index}`,
    createdAt: new Date().toISOString(),
    draft: "",
    isGenerating: false,
    messages: [],
    model: getDefaultModel(),
    config: {
      imageCount: DEFAULT_IMAGE_COUNT,
      styleImagePreview: null,
      styleImageUrl: null,
      styleImageName: null,
      isUploading: false,
    },
  };
}

/**
 * Format timestamp to display time
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Convert generation history to chat messages
 */
export function convertGenerationsToMessages(
  generations: Generation[],
): ChatMessage[] {
  const sorted = [...generations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const messages: ChatMessage[] = [];

  sorted.forEach((generation) => {
    messages.push({
      id: `history-user-${generation.id}`,
      role: "user",
      content: generation.prompt,
      createdAt: generation.createdAt,
      images: [],
    });

    messages.push({
      id: `history-assistant-${generation.id}`,
      role: "assistant",
      content: "",
      createdAt: generation.updatedAt || generation.createdAt,
      images: generation.generatedImageUrl
        ? [generation.generatedImageUrl]
        : [],
      status:
        generation.status === "failed"
          ? "failed"
          : generation.status === "completed"
            ? "completed"
            : "pending",
      error: generation.errorMessage ?? null,
    });
  });

  return messages;
}

/**
 * Find the latest style image URL from generations
 */
export function findLatestStyleImage(generations: Generation[]): string | null {
  const latest = [...generations].reverse().find((item) => item.styleImageUrl);
  return latest?.styleImageUrl ?? null;
}

/**
 * Update a specific chat in the chats array
 */
export function updateChat(
  chats: ChatSession[],
  chatId: string,
  updates: Partial<ChatSession> | ((chat: ChatSession) => ChatSession),
): ChatSession[] {
  return chats.map((chat) => {
    if (chat.id !== chatId) return chat;
    if (typeof updates === "function") {
      return updates(chat);
    }
    return { ...chat, ...updates };
  });
}
