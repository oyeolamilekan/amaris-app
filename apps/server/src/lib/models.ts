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
 * Get model by type string
 */
export function getModelByType(type: string): Model | undefined {
  return AVAILABLE_MODELS.find((model) => model.type === type);
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
  const defaultModel = AVAILABLE_MODELS[0];
  if (!defaultModel) {
    throw new Error("No models available");
  }
  return defaultModel;
}

/**
 * Validate if model ID exists
 */
export function isValidModelId(id: string): boolean {
  return AVAILABLE_MODELS.some((model) => model.id === id);
}

/**
 * Get model type for API call
 */
export function getModelType(modelId: string): string | undefined {
  const model = getModelById(modelId);
  return model?.type;
}

/**
 * Calculate cost for generation
 */
export function calculateGenerationCost(modelId: string): number {
  const model = getModelById(modelId);
  return model?.cost || 0;
}
