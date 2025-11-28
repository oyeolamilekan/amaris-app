/**
 * Dashboard Types
 */

import type { Model } from "@/lib/models";

export interface AspectRatioOption {
  id: string;
  label: string;
  ratio: string;
  width: string;
}

export interface CustomerState {
  activeSubscriptions?: Array<Record<string, unknown>>;
}

export type MessageStatus = "pending" | "completed" | "failed";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  images: string[];
  status?: MessageStatus;
  error?: string | null;
}

export interface ChatConfig {
  aspectRatio: string;
  imageCount: number;
  styleImagePreview: string | null;
  styleImageUrl: string | null;
  styleImageName: string | null;
  isUploading: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  createdAt: string;
  draft: string;
  isGenerating: boolean;
  messages: ChatMessage[];
  config: ChatConfig;
  model: Model;
}
