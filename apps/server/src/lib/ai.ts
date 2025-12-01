import { gateway } from "@ai-sdk/gateway";

// Image generation configuration
export const IMAGE_GENERATION_CONFIG = {
  maxPromptLength: 1000,
  maxStyleImageSize: 10 * 1024 * 1024, // 10MB
  supportedImageFormats: ["image/png", "image/jpeg", "image/webp"],
};

// Helper to validate image generation request
export function validateGenerationRequest(data: {
  prompt: string;
  styleImageSize?: number;
  styleImageFormat?: string;
}): { valid: boolean; error?: string } {
  if (!data.prompt || data.prompt.trim().length === 0) {
    return { valid: false, error: "Prompt is required" };
  }

  if (data.prompt.length > IMAGE_GENERATION_CONFIG.maxPromptLength) {
    return {
      valid: false,
      error: `Prompt must be less than ${IMAGE_GENERATION_CONFIG.maxPromptLength} characters`,
    };
  }

  if (
    data.styleImageSize &&
    data.styleImageSize > IMAGE_GENERATION_CONFIG.maxStyleImageSize
  ) {
    return {
      valid: false,
      error: `Style image must be less than ${IMAGE_GENERATION_CONFIG.maxStyleImageSize / (1024 * 1024)}MB`,
    };
  }

  if (
    data.styleImageFormat &&
    !IMAGE_GENERATION_CONFIG.supportedImageFormats.includes(
      data.styleImageFormat,
    )
  ) {
    return {
      valid: false,
      error: `Image format must be one of: ${IMAGE_GENERATION_CONFIG.supportedImageFormats.join(", ")}`,
    };
  }

  return { valid: true };
}

// Export gateway for use in routes
// Gateway routes all AI requests through Vercel AI Gateway for caching, rate limiting, and analytics
export { gateway };

// Default models - using Google Gemini through AI Gateway
export const DEFAULT_TEXT_MODEL = "google/gemini-2.5-flash-preview";
export const DEFAULT_VISION_MODEL = "google/gemini-2.5-flash-preview"; // Gemini has vision capabilities
export const DEFAULT_IMAGE_MODEL = "google/gemini-2.5-flash-image-preview"; // For image generation
