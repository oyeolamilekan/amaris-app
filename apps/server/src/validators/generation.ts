import { z } from "zod";

/**
 * Validation schema for image generation request
 */
export const generateImageSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(1000, "Prompt must be less than 1000 characters"),
  styleImageUrl: z.url("Style image must be a valid URL"),
  styleImageName: z.string().optional(),
  model: z.string().min(1, "Model is required").optional(),
  modelType: z.string().optional(),
  outputStyle: z.string().optional(),
  chatId: z.string().optional(),
});

/**
 * Validation schema for style reference creation
 */
export const styleReferenceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  imageUrl: z.url("Image URL must be valid"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

/**
 * Type exports for use in routes
 */
export type GenerateImageInput = z.infer<typeof generateImageSchema>;
export type StyleReferenceInput = z.infer<typeof styleReferenceSchema>;
