import { formatError } from './ui/formatter';

/**
 * Central error handler that processes errors and displays user-friendly messages
 */
export function handleError(error: unknown, debug: boolean = false): never {
  // Debug mode: show full error details
  if (debug) {
    console.error('\n--- Debug Information ---');
    console.error(
      'Error type:',
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }

  if (!(error instanceof Error)) {
    console.error(formatError('An unexpected error occurred'));
    console.error('\nFor more details, run with --debug flag');
    process.exit(1);
  }

  const message = error.message.toLowerCase();
  let errorMsg: string;
  let suggestions: string[] = [];

  // API Key errors
  if (message.includes('api key') || message.includes('apikey')) {
    errorMsg = 'API key not found or invalid';
    suggestions = [
      'To fix this:',
      '  1. Run: ai configure',
      '  2. Or set: export GOOGLE_GENERATIVE_AI_API_KEY="your-key"',
      '  3. Get a key: https://aistudio.google.com/app/apikey',
    ];
  }
  // Rate limit errors
  else if (message.includes('rate limit') || message.includes('429')) {
    errorMsg = 'Rate limit exceeded';
    suggestions = ['Please wait a moment and try again.'];
  }
  // Network errors
  else if (
    message.includes('network') ||
    message.includes('enotfound') ||
    message.includes('econnrefused') ||
    message.includes('timeout')
  ) {
    errorMsg = 'Network error';
    suggestions = ['Check your internet connection and try again.'];
  }
  // Model errors
  else if (message.includes('model')) {
    errorMsg = 'Invalid model specified';
    suggestions = [
      'Available models:',
      '  - gemini-2.0-flash (default)',
      '  - gemini-2.0-flash-lite',
      '  - gemini-1.5-flash',
      '  - gemini-1.5-pro',
    ];
  }
  // Config errors
  else if (message.includes('config') || message.includes('configuration')) {
    errorMsg = 'Configuration error';
    suggestions = ['Try running: ai configure'];
  }
  // Generic error
  else {
    errorMsg = error.message ?? 'An unexpected error occurred';
    suggestions = ['For more details, run with --debug flag'];
  }

  console.error(formatError(errorMsg));
  if (suggestions.length > 0) {
    console.error('');
    suggestions.forEach((s) => console.error(s));
  }

  process.exit(1);
}
