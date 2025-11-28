#!/usr/bin/env bun

import { createProgram } from './cli';
import { getInput } from './input';
import { sendPrompt } from './ai';
import { createSpinner } from './ui/spinner';
import { handleError } from './errors';
import { formatError } from './ui/formatter';

// Track program start time
const programStartTime = performance.now();

// Handle graceful shutdown on Ctrl+C
process.on('SIGINT', () => {
  process.stdout.write('\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.stdout.write('\n');
  process.exit(0);
});

async function main() {
  const program = createProgram();

  // Parse arguments
  await program.parseAsync(process.argv);

  // Get the parsed options and arguments
  const opts = program.opts();
  const args = program.args;

  // Check if this is a subcommand (configure, config, etc.)
  // If not, we need a prompt
  const isSubcommand =
    process.argv.includes('configure') || process.argv.includes('config');

  if (!isSubcommand) {
    // If we have a prompt (either as argument or piped), process it
    if (args.length > 0 || process.stdin.isTTY === false) {
      try {
        // Combine prompt from args
        const promptArg = args.join(' ');

        // Get input (handles both piped input and prompt)
        const fullPrompt = await getInput(promptArg);

        if (!fullPrompt.trim()) {
          console.error(formatError('No prompt provided'));
          console.error(
            'Usage: ai "your prompt here" or command | ai "question"'
          );
          console.error('Run "ai --help" for more information');
          process.exit(1);
        }

        // Create spinner and start it before making the request
        const spinner = createSpinner('Thinking...');
        spinner?.start();

        // Send prompt to Gemini
        const result = await sendPrompt(
          fullPrompt,
          opts.model,
          opts.verbose,
          opts.debug
        );

        // Keep spinner running until we get the first chunk
        let firstChunk = true;
        let firstTokenTime = 0;
        const responseStartTime = performance.now();

        for await (const chunk of result.textStream) {
          if (firstChunk) {
            // Record time to first token (cold start)
            firstTokenTime = performance.now();
            const coldStart = (firstTokenTime - programStartTime) / 1000;
            console.error(`Cold start: ${coldStart.toFixed(2)}s`);

            // Stop spinner when we get the first chunk
            spinner?.stop();
            firstChunk = false;
          }
          process.stdout.write(chunk);
        }

        // Ensure spinner is stopped
        spinner?.stop();

        // Add newline at the end
        process.stdout.write('\n');

        // Calculate and display total response time
        const totalTime = (performance.now() - responseStartTime) / 1000;
        console.error(`Completed in ${totalTime.toFixed(2)}s`);

        // Show usage stats in verbose mode
        if (opts.verbose) {
          const usage = await result.usage;
          console.error(`\n--- Usage ---`);
          console.error(`Prompt tokens: ${usage.inputTokens}`);
          console.error(`Completion tokens: ${usage.outputTokens}`);
          console.error(`Total tokens: ${usage.totalTokens}`);
        }
      } catch (error: unknown) {
        handleError(error, opts.debug);
      }
    } else {
      // No arguments and no piped input - show error
      console.error(formatError('No prompt provided'));
      console.error('Usage: ai "your prompt here" or command | ai "question"');
      console.error('Run "ai --help" for more information');
      process.exit(1);
    }
  }
}

main();
