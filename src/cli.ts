import { Command } from 'commander';
import {
  loadConfig,
  setConfigValue,
  getConfigValue,
  resetConfig,
} from './config';
import { runConfigureTUI } from './configure';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('ai')
    .description('Fast AI assistant powered by Gemini Flash')
    .version('1.0.0')
    .argument('[prompt...]', 'Prompt to send to AI')
    .option('-m, --model <model>', 'Use specific model')
    .option('-v, --verbose', 'Show detailed output')
    .option('--debug', 'Show debug logs and full error details')
    .addHelpText(
      'after',
      `
Examples:
  $ ai "what is 2+2?"
  $ cat error.log | ai "what's the error?"
  $ git diff | ai "write a commit message"
  $ ai --model gemini-1.5-pro "complex task"
  $ ai configure
  $ ai config set model gemini-2.0-flash-exp

Piping:
  command | ai "prompt"          Pipe command output to AI
  ai "prompt" < file.txt         Redirect file to AI
  ai "prompt" > output.txt       Save AI response to file
`
    )
    .action(() => {
      // Main action handled in index.ts
    });

  // Configure command
  program
    .command('configure')
    .description('Open interactive configuration UI')
    .action(async () => {
      await runConfigureTUI();
      process.exit(0);
    });

  // Config subcommands
  const config = program.command('config').description('Manage configuration');

  config
    .command('show')
    .description('Show current configuration')
    .action(async () => {
      const cfg = await loadConfig();
      console.log(JSON.stringify(cfg, null, 2));
      process.exit(0);
    });

  config
    .command('set')
    .argument('<key>', 'Configuration key')
    .argument('<value>', 'Configuration value')
    .description('Set configuration value')
    .action(async (key: string, value: string) => {
      await setConfigValue(key, value);
      console.log(`✓ Set ${key} = ${value}`);
      process.exit(0);
    });

  config
    .command('get')
    .argument('<key>', 'Configuration key')
    .description('Get configuration value')
    .action(async (key: string) => {
      const value = await getConfigValue(key);
      if (value === undefined) {
        console.error(`✗ Key '${key}' not found`);
        process.exit(1);
      }
      console.log(value);
      process.exit(0);
    });

  config
    .command('reset')
    .description('Reset to default configuration')
    .action(async () => {
      await resetConfig();
      console.log('✓ Configuration reset to defaults');
      process.exit(0);
    });

  return program;
}
