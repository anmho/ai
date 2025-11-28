/**
 * List of supported Gemini models
 */
export const SUPPORTED_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
] as const;

export type SupportedModel = (typeof SUPPORTED_MODELS)[number];

/**
 * Model metadata with display names for UI
 */
export const MODEL_CHOICES = [
  {
    name: 'Gemini Flash Lite 2.0',
    value: 'gemini-2.0-flash-lite',
  },
  {
    name: 'Gemini Flash 2.0 (Fastest, Recommended)',
    value: 'gemini-2.0-flash',
  },
  {
    name: 'Gemini Flash Lite 2.5',
    value: 'gemini-2.5-flash-lite',
  },
  {
    name: 'Gemini Flash 2.5',
    value: 'gemini-2.5-flash',
  },
] as const;

export const DEFAULT_MODEL: SupportedModel = 'gemini-2.0-flash';

/**
 * Check if a model is supported
 */
export function isSupportedModel(model: string): model is SupportedModel {
  return SUPPORTED_MODELS.includes(model as SupportedModel);
}

/**
 * Get a list of supported models as a formatted string
 */
export function getSupportedModelsList(): string {
  return SUPPORTED_MODELS.map((m) => `  - ${m}`).join('\n');
}
