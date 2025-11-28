/**
 * Dashboard Constants
 */

import type { AspectRatioOption } from "./types";

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { id: "1:1", label: "Square", ratio: "1:1", width: "w-12" },
  { id: "16:9", label: "Landscape", ratio: "16:9", width: "w-16" },
  { id: "9:16", label: "Portrait", ratio: "9:16", width: "w-8" },
  { id: "4:3", label: "Classic", ratio: "4:3", width: "w-14" },
];

export const DEFAULT_ASPECT_RATIO = "1:1";
export const DEFAULT_IMAGE_COUNT = 1;
export const FREE_TIER_CREDITS = 50;
export const PRO_TIER_CREDITS = 420;
export const FREE_TIER_MAX_IMAGES = 3;
export const PRO_TIER_MAX_IMAGES = 6;

export const POLL_MAX_ATTEMPTS = 90;
export const POLL_INTERVAL_MS = 1500;

export const OUTPUT_STYLE_OPTIONS = [
  { id: "realistic", label: "Realistic", icon: "📸" },
  { id: "anime", label: "Anime", icon: "🎌" },
  { id: "digital-art", label: "Digital Art", icon: "🎨" },
  { id: "oil-painting", label: "Oil Painting", icon: "🖼️" },
  { id: "3d-render", label: "3D Render", icon: "🧊" },
];
