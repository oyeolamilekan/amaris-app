/**
 * Controllers Barrel Export
 *
 * Central export point for all controller modules.
 * Makes imports cleaner and more maintainable.
 *
 * @example
 * // Instead of:
 * import { uploadStyleImage } from './controllers/upload.controller';
 * import { generateImage } from './controllers/generations.controller';
 *
 * // Use:
 * import { uploadStyleImage, generateImage } from './controllers';
 */

// Upload Controller
export {
  uploadStyleImage,
  uploadBase64Image,
} from "./upload.controller";

// Generations Controller
export {
  generateImage,
  listGenerations,
  getGeneration,
  getCredits,
  getCreditPackages,
  saveStyleReference,
  getStyleReferences,
} from "./generations.controller";
