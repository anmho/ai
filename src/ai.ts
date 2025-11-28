import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { loadConfig, getApiKey } from './config';

export async function sendPrompt(
  prompt: string,
  modelOverride?: string,
  verbose?: boolean,
  debug?: boolean
) {
  const config = await loadConfig();

  if (debug) {
    console.error('\n--- Debug: Configuration ---');
    console.error('Config loaded:', JSON.stringify(config, null, 2));
  }

  // Get API key - checks env vars first, then config
  const apiKey = await getApiKey();

  if (debug) {
    console.error('API Key found:', apiKey ? 'Yes (hidden)' : 'No');

    // Determine API key source
    let apiKeySource = 'none';
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      apiKeySource = 'GOOGLE_GENERATIVE_AI_API_KEY env var';
    } else if (process.env.GOOGLE_API_KEY) {
      apiKeySource = 'GOOGLE_API_KEY env var';
    } else if (process.env.AI_API_KEY) {
      apiKeySource = 'AI_API_KEY env var';
    } else if (config.apiKey) {
      apiKeySource = 'config file';
    }

    console.error('API Key source:', apiKeySource);
  }

  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'Google API key not found. Set it using:\n' +
        '  - ai configure (interactive setup)\n' +
        '  - export GOOGLE_GENERATIVE_AI_API_KEY="your-key"\n' +
        '  - export GOOGLE_API_KEY="your-key"\n' +
        '  - ai config set apiKey "your-key"'
    );
  }

  // Create Google provider instance with API key passed directly
  const googleProvider = createGoogleGenerativeAI({ apiKey });

  const model = modelOverride ?? config.model;

  if (debug || verbose) {
    console.error(`\n--- Request Details ---`);
    console.error(`Model: ${model}`);
    console.error(`Temperature: ${config.temperature}`);
    console.error(`Max tokens: ${config.maxTokens}`);
    console.error(`Prompt length: ${prompt.length} characters`);
    console.error('---\n');
  }

  const result = await streamText({
    model: googleProvider(model),
    system: config.systemPrompt,
    prompt,
    maxOutputTokens: config.maxTokens,
    temperature: config.temperature,
  });

  return result;
}
