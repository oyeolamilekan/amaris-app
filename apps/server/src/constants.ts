/**
 * Application Constants
 * Centralized configuration values for the server
 */

// AI Models
export interface Model {
  id: string;
  name: string;
  type: string;
  provider: string;
  cost: number;
  color: string;
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "gemini-2.5-flash-image",
    name: "Gemini 2.5 Flash Image",
    type: "google/gemini-2.5-flash-image-preview",
    provider: "Google",
    cost: 0.02,
    color: "#4285F4",
  },
];

export const DEFAULT_MODEL_ID = "gemini-2.0-flash-exp";
export const DEFAULT_MODEL_TYPE = "google:gemini-2.0-flash-exp";

// Generation Defaults
export const DEFAULT_IMAGE_COUNT = 1;
export const DEFAULT_OUTPUT_STYLE = "realistic";

export interface GenerationDimensions {
  width: number;
  height: number;
}

export const DEFAULT_GENERATION_DIMENSIONS: GenerationDimensions = {
  width: 1024,
  height: 1024,
};

export const GENERATION_CREDIT_COST = 1;

// Upload Constraints
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

export type AllowedImageType =
  | "image/jpeg"
  | "image/jpg"
  | "image/png"
  | "image/webp"
  | "image/gif";

export const ALLOWED_IMAGE_TYPES: AllowedImageType[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Generation Types
export interface GenerationRecord {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGenerationInput {
  userId: string;
  prompt: string;
  styleImageUrl: string;
  model: string;
  creditsUsed: number;
  dimensions: GenerationDimensions;
  styleImageName?: string;
  outputStyle?: string;
  chatId?: string;
}

export interface UpdateGenerationInput {
  status?: "processing" | "completed" | "failed";
  generatedImageUrl?: string;
  errorMessage?: string;
  metadata?: any;
}

// Style Reference Types
export interface StyleReferenceRecord {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  description?: string | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStyleReferenceInput {
  userId: string;
  name: string;
  imageUrl: string;
  description?: string;
}

// AI Processor Types
export interface ProcessGenerationInput {
  generationId: string;
  prompt: string;
  styleImageUrl: string;
  model?: Model;
  userId: string;
}

// Chat Types
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
