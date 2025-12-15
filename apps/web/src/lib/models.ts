import { AVAILABLE_MODELS, type Model } from "../constants";

export { AVAILABLE_MODELS };
export type { Model };

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
