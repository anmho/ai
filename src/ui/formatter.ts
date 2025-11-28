import { isTTY } from '../input';

export function formatOutput(text: string): string {
  // For now, just return text as-is
  // Can add markdown formatting, syntax highlighting, etc. later
  return text;
}

export function formatError(message: string): string {
  if (isTTY()) {
    return `\x1b[31m✗ ${message}\x1b[0m`;
  }
  return `✗ ${message}`;
}

export function formatSuccess(message: string): string {
  if (isTTY()) {
    return `\x1b[32m✓ ${message}\x1b[0m`;
  }
  return `✓ ${message}`;
}
