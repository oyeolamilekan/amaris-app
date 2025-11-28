import { z } from "zod";

/**
 * Validation schema for image generation request
 */
export const generateImageSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(1000, "Prompt must be less than 1000 characters"),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3"], {
    message: "Invalid aspect ratio",
  }),
  styleImageUrl: z.string().url("Style image must be a valid URL"),
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
  imageUrl: z.string().url("Image URL must be valid"),
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
