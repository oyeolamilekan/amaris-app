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
export const DEFAULT_GENERATION_DIMENSIONS = { width: 1024, height: 1024 };
export const GENERATION_CREDIT_COST = 1;

// Upload Constraints
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
