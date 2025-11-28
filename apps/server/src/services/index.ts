/**
 * Services Barrel Export
 *
 * Central export point for all service modules.
 * Makes imports cleaner and more maintainable.
 *
 * @example
 * // Instead of:
 * import { getUserCredits } from './services/credits';
 * import { createGeneration } from './services/generation';
 *
 * // Use:
 * import { getUserCredits, createGeneration } from './services';
 */

// Credits Service
export {
  getUserCredits,
  hasCredits,
  deductCredits,
  addCredits,
  resetCredits,
  type UserCreditsInfo,
} from "./credits";

// Generation Service
export {
  createGeneration,
  getGenerationById,
  listUserGenerations,
  updateGeneration,
  completeGeneration,
  failGeneration,
  deleteGeneration,
  getUserGenerationCount,
  type GenerationRecord,
  type CreateGenerationInput,
  type UpdateGenerationInput,
} from "./generation";

// Style Reference Service
export {
  createStyleReference,
  getStyleReferenceById,
  listUserStyleReferences,
  updateStyleReference,
  incrementStyleReferenceUsage,
  deleteStyleReference,
  getMostUsedStyleReferences,
  type StyleReferenceRecord,
  type CreateStyleReferenceInput,
} from "./style-reference";

// AI Processor Service
export { processGeneration, type ProcessGenerationInput } from "./ai-processor";

// Cloudinary Upload Service
export {
  uploadImageToCloudinary,
  uploadBase64ToCloudinary,
  deleteImageFromCloudinary,
  getOptimizedImageUrl,
  isCloudinaryConfigured,
  type CloudinaryUploadResult,
} from "./cloudinary-upload";

// Chat Service
export {
  createChat,
  getChatById,
  listUserChats,
  updateChat,
  deleteChat,
  createMessage,
  getChatMessages,
  updateMessage,
  deleteChatMessages,
  getChatWithMessages,
  getUserChatCount,
  type ChatRecord,
  type ChatMessageRecord,
  type CreateChatInput,
  type UpdateChatInput,
  type CreateMessageInput,
} from "./chat";
