import { input, select, confirm } from '@inquirer/prompts';
import { loadConfig, saveConfig } from './config';
import { DEFAULT_MODEL, MODEL_CHOICES, type SupportedModel } from './models';

export async function runConfigureTUI() {
  console.log('\n🤖 AI CLI Configuration\n');

  // Skip validation to allow loading invalid configs that need to be fixed
  const config = await loadConfig(undefined, true);

  // API Key
  const apiKey = await input({
    message: 'Google API Key:',
    default: config.apiKey ?? '',
    validate: (value) => {
      if (!value || value.trim() === '') {
        return 'API key is required';
      }
      return true;
    },
  });

  // Model selection (use config.model if valid, otherwise DEFAULT_MODEL)
  const defaultModel = MODEL_CHOICES.some((m) => m.value === config.model)
    ? config.model
    : DEFAULT_MODEL;
  const model = await select({
    message: 'Select model:',
    choices: MODEL_CHOICES,
    default: defaultModel,
  });

  // Temperature
  const temperatureStr = await input({
    message: 'Temperature (0.0-1.0):',
    default: (config.temperature ?? 0.7).toString(),
    validate: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 1) {
        return 'Temperature must be between 0.0 and 1.0';
      }
      return true;
    },
  });

  // Max tokens
  const maxTokensStr = await input({
    message: 'Max tokens:',
    default: (config.maxTokens ?? 8192).toString(),
    validate: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        return 'Max tokens must be a positive number';
      }
      return true;
    },
  });

  // Save configuration
  const shouldSave = await confirm({
    message: 'Save configuration?',
    default: true,
  });

  if (shouldSave) {
    await saveConfig({
      ...config,
      apiKey: apiKey.trim(),
      model: model as SupportedModel, // model is guaranteed valid from select choices
      temperature: parseFloat(temperatureStr),
      maxTokens: parseInt(maxTokensStr, 10),
    });
    console.log('\n✓ Configuration saved!\n');
  } else {
    console.log('\n✗ Configuration not saved.\n');
  }
}
