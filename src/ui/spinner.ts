import ora, { type Ora } from 'ora';
import { isTTY } from '../input';

export function createSpinner(message: string = 'Thinking...'): Ora | null {
  // Only show spinner in TTY
  if (!isTTY()) {
    return null;
  }

  // Create spinner that outputs to stderr
  return ora({
    text: message,
    stream: process.stderr,
  });
}
