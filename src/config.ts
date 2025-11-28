import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import {
  isSupportedModel,
  getSupportedModelsList,
  DEFAULT_MODEL,
  type SupportedModel,
} from './models';

export interface Config {
  apiKey?: string;
  model: SupportedModel;
  maxTokens: number;
  temperature: number;
  ui: { colors: boolean; spinner: boolean; markdown: boolean };
}

const DEFAULT_CONFIG: Config = {
  model: DEFAULT_MODEL,
  maxTokens: 8192,
  temperature: 0.7,
  ui: { colors: true, spinner: true, markdown: true },
};

const CONFIG_DIR = join(homedir(), '.config', 'ai');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

// Parse and validate config (always checks structure/types, optionally checks values)
function parseConfig(raw: unknown, validateValues = true): Config {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid config: expected object');
  }

  const obj = raw as Record<string, unknown>;

  // Check types
  if (typeof obj.model !== 'string')
    throw new Error(`Invalid model type: expected string`);
  if (typeof obj.maxTokens !== 'number')
    throw new Error(`Invalid maxTokens type: expected number`);
  if (typeof obj.temperature !== 'number')
    throw new Error(`Invalid temperature type: expected number`);
  if (typeof obj.ui !== 'object' || obj.ui === null)
    throw new Error('Invalid ui: expected object');

  const ui = obj.ui as Record<string, unknown>;
  if (
    typeof ui.colors !== 'boolean' ||
    typeof ui.spinner !== 'boolean' ||
    typeof ui.markdown !== 'boolean'
  ) {
    throw new Error('Invalid ui: expected boolean properties');
  }

  if (obj.apiKey !== undefined && typeof obj.apiKey !== 'string') {
    throw new Error(`Invalid apiKey type: expected string`);
  }

  // Check values (optional)
  if (validateValues) {
    if (!isSupportedModel(obj.model)) {
      throw new Error(
        `Unsupported model: "${obj.model}"\n\n` +
          `Supported models:\n${getSupportedModelsList()}\n\n` +
          `To fix this, run: ai configure`
      );
    }
    if (obj.maxTokens < 1)
      throw new Error(`Invalid maxTokens: ${obj.maxTokens}. Must be >= 1`);
    if (obj.temperature < 0 || obj.temperature > 1) {
      throw new Error(
        `Invalid temperature: ${obj.temperature}. Must be between 0.0 and 1.0`
      );
    }
  }

  return {
    apiKey: obj.apiKey as string | undefined,
    model: obj.model as SupportedModel,
    maxTokens: obj.maxTokens,
    temperature: obj.temperature,
    ui: {
      colors: ui.colors as boolean,
      spinner: ui.spinner as boolean,
      markdown: ui.markdown as boolean,
    },
  };
}

export async function loadConfig(
  path = CONFIG_PATH,
  skipValidation = false
): Promise<Config> {
  // Return defaults if no file
  if (!existsSync(path)) {
    return { ...DEFAULT_CONFIG };
  }

  // Load file
  const data = await readFile(path, 'utf-8');
  const rawConfig = JSON.parse(data);

  // Merge with defaults
  const rawObj =
    typeof rawConfig === 'object' && rawConfig !== null
      ? (rawConfig as Record<string, unknown>)
      : {};
  const merged = {
    ...DEFAULT_CONFIG,
    ...rawObj,
    ui: {
      ...DEFAULT_CONFIG.ui,
      ...(typeof rawObj.ui === 'object' && rawObj.ui !== null ? rawObj.ui : {}),
    },
  };

  // Parse and validate
  return parseConfig(merged, !skipValidation);
}

export async function saveConfig(config: Config): Promise<void> {
  parseConfig(config, true); // Validate before saving

  if (!existsSync(CONFIG_DIR)) await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  await chmod(CONFIG_PATH, 0o600);
}

export async function getConfigValue(key: string): Promise<unknown> {
  const config = await loadConfig();
  let value: unknown = config;

  for (const k of key.split('.')) {
    if (typeof value === 'object' && value !== null && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }

  return value;
}

export async function setConfigValue(
  key: string,
  value: string
): Promise<void> {
  const config = await loadConfig();
  const keys = key.split('.');
  let target = config as unknown as Record<string, unknown>;

  // Walk through nested keys (e.g., "ui.colors" -> walk to "ui", then set "colors")
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!k) continue;

    const next = target[k];
    if (next === undefined) {
      target[k] = {};
      target = target[k] as Record<string, unknown>;
    } else if (typeof next === 'object' && next !== null) {
      // Use existing object
      target = next as Record<string, unknown>;
    } else {
      throw new Error(`Cannot set nested key: ${k} is not an object`);
    }
  }

  const lastKey = keys[keys.length - 1];
  if (!lastKey) throw new Error('Invalid config key path');

  // Parse string value to correct type (boolean, number, or string)
  target[lastKey] =
    value === 'true'
      ? true
      : value === 'false'
      ? false
      : !isNaN(Number(value))
      ? Number(value)
      : value;

  await saveConfig(config);
}

export async function resetConfig(): Promise<void> {
  await saveConfig({ ...DEFAULT_CONFIG });
}

export async function getApiKey(): Promise<string | undefined> {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.AI_API_KEY ??
    (await loadConfig()).apiKey
  );
}
