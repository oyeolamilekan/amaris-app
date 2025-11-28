/**
 * Available AI models for image generation
 */

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

/**
 * Get model by ID
 */
export function getModelById(id: string): Model | undefined {
  return AVAILABLE_MODELS.find((model) => model.id === id);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: string): Model[] {
  return AVAILABLE_MODELS.filter((model) => model.provider === provider);
}

/**
 * Get default model
 */
export function getDefaultModel(): Model {
  return AVAILABLE_MODELS[0];
}

/**
 * Format cost display
 */
export function formatCost(cost: number): string {
  return `$${cost.toFixed(4)}`;
}
