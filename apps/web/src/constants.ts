/**
 * Application Constants
 * Centralized configuration values for the frontend
 */

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Dashboard Constants
export const DEFAULT_IMAGE_COUNT = 1;
export const FREE_TIER_CREDITS = 50;
export const PRO_TIER_CREDITS = 420;
export const FREE_TIER_MAX_IMAGES = 3;
export const PRO_TIER_MAX_IMAGES = 6;

// Polling Configuration
export const POLL_MAX_ATTEMPTS = 90;
export const POLL_INTERVAL_MS = 1500;

// Style Options
export const OUTPUT_STYLE_OPTIONS = [
  { id: "realistic", label: "Realistic", icon: "📸" },
  { id: "anime", label: "Anime", icon: "🎌" },
  { id: "digital-art", label: "Digital Art", icon: "🎨" },
  { id: "oil-painting", label: "Oil Painting", icon: "🖼️" },
  { id: "3d-render", label: "3D Render", icon: "🧊" },
];

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
