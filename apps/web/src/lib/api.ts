/**
 * API Client for backend communication
 * Handles image uploads and generation requests
 */

import { API_BASE_URL } from "../constants";

export interface UploadResponse {
  success: boolean;
  url?: string;
  fileName?: string;
  size?: number;
  mimeType?: string;
  error?: string;
}

export interface GenerateImageRequest {
  prompt: string;
  styleImageUrl: string;
  styleImageName?: string;
  model?: string;
  modelType?: string;
  outputStyle?: string;
  chatId?: string;
}

export interface GenerateImageResponse {
  success: boolean;
  generationId: string;
  status: "processing" | "completed" | "failed";
  creditsRemaining: number;
  model?: {
    id: string;
    name: string;
    type: string;
  };
  error?: string;
}

export interface Generation {
  id: string;
  userId: string;
  prompt: string;
  styleImageUrl: string;
  model: string;
  status: "processing" | "completed" | "failed";
  generatedImageUrl?: string | null;
  errorMessage?: string | null;
  metadata?: any;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListGenerationsResponse {
  generations: Generation[];
}

export interface GetGenerationResponse {
  generation: Generation;
}

export interface CreditsResponse {
  credits: number;
  totalUsed: number;
}

export interface CreditPackage {
  id: string;
  polarProductId: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
}

export interface GetCreditPackagesResponse {
  packages: CreditPackage[];
}

/**
 * Upload style reference image
 */
export async function uploadStyleImage(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/api/upload/style-image`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const json = await response.json();
    return { success: json.success, ...json.data };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Generate image with style reference
 */
export async function generateImage(
  request: GenerateImageRequest,
): Promise<GenerateImageResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generations/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Generation failed");
    }

    const json = await response.json();
    return { success: json.success, ...json.data };
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
}

/**
 * Get generation by ID
 */
export async function getGeneration(
  id: string,
): Promise<GetGenerationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generations/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch generation");
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Get generation error:", error);
    throw error;
  }
}

/**
 * List user's generations
 */
export async function listGenerations(
  limit: number = 20,
  offset: number = 0,
): Promise<ListGenerationsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/generations/list?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch generations");
    }

    const json = await response.json();
    return { generations: json.data };
  } catch (error) {
    console.error("List generations error:", error);
    throw error;
  }
}

/**
 * Get user credits
 */
export async function getCredits(): Promise<CreditsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generations/credits`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch credits");
    }

    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Get credits error:", error);
    throw error;
  }
}

/**
 * Get available credit packages
 */
export async function getCreditPackages(): Promise<GetCreditPackagesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generations/packages`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch credit packages");
    }

    const json = await response.json();
    return { packages: json.data };
  } catch (error) {
    console.error("Get credit packages error:", error);
    throw error;
  }
}

/**
 * Poll generation status until complete or failed
 */
export async function pollGenerationStatus(
  generationId: string,
  onUpdate?: (generation: Generation) => void,
  maxAttempts: number = 60,
  intervalMs: number = 2000,
): Promise<Generation> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const { generation } = await getGeneration(generationId);

      if (onUpdate) {
        onUpdate(generation);
      }

      if (generation.status === "completed" || generation.status === "failed") {
        return generation;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      attempts++;
    } catch (error) {
      console.error("Poll error:", error);
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error("Generation polling timed out");
}

/**
 * Chat API Functions
 */

export interface ChatConfig {
  imageCount: number;
  outputStyle: string;
  styleImageUrl: string | null;
  styleImageName: string | null;
}

export interface Chat {
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
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  images: string[];
  status: "pending" | "completed" | "failed" | null;
  error: string | null;
  createdAt: string;
}

export interface CreateChatRequest {
  name: string;
  modelId?: string;
  modelType?: string;
  imageCount?: number;
  outputStyle?: string;
}

export interface UpdateChatRequest {
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

/**
 * Create a new chat session
 */
export async function createChat(
  request: CreateChatRequest,
): Promise<{ success: boolean; chat: Chat }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create chat");
    }

    const json = await response.json();
    return { success: json.success, ...json.data };
  } catch (error) {
    console.error("Create chat error:", error);
    throw error;
  }
}

/**
 * List all chats for the user
 */
export async function listChats(): Promise<{
  success: boolean;
  chats: Chat[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to list chats");
    }

    const json = await response.json();
    return { success: json.success, chats: json.data };
  } catch (error) {
    console.error("List chats error:", error);
    throw error;
  }
}

/**
 * Get a specific chat with messages
 */
export async function getChat(
  chatId: string,
): Promise<{ success: boolean; chat: Chat; messages: ChatMessage[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get chat");
    }

    const json = await response.json();
    return { success: json.success, ...json.data };
  } catch (error) {
    console.error("Get chat error:", error);
    throw error;
  }
}

/**
 * Update a chat session
 */
export async function updateChatAPI(
  chatId: string,
  updates: UpdateChatRequest,
): Promise<{ success: boolean; chat: Chat }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update chat");
    }

    const json = await response.json();
    return { success: json.success, ...json.data };
  } catch (error) {
    console.error("Update chat error:", error);
    throw error;
  }
}

/**
 * Delete a chat session
 */
export async function deleteChatAPI(
  chatId: string,
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete chat");
    }

    const json = await response.json();
    return { success: json.success };
  } catch (error) {
    console.error("Delete chat error:", error);
    throw error;
  }
}

/**
 * Add a message to a chat
 */
export async function addChatMessage(
  chatId: string,
  message: {
    id?: string;
    role: "user" | "assistant";
    content: string;
    images?: string[];
    status?: "pending" | "completed" | "failed";
    error?: string;
  },
): Promise<{ success: boolean; messageId: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/chats/${chatId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
        credentials: "include",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add message");
    }

    const json = await response.json();
    return { success: json.success, ...json.data };
  } catch (error) {
    console.error("Add message error:", error);
    throw error;
  }
}

/**
 * Update a message in a chat
 */
export async function updateChatMessage(
  chatId: string,
  messageId: string,
  updates: {
    images?: string[];
    status?: "pending" | "completed" | "failed";
    error?: string;
  },
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/chats/${chatId}/messages/${messageId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
        credentials: "include",
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update message");
    }

    const json = await response.json();
    return { success: json.success };
  } catch (error) {
    console.error("Update message error:", error);
    throw error;
  }
}
