import { isTTY } from '../input';
import type { Config } from '../config';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  // Text colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Bright colors
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
};

export class MarkdownFormatter {
  private config: Config;
  private buffer = '';
  private inCodeBlock = false;
  private codeBlockLang = '';
  private codeBlockContent = '';

  constructor(config: Config) {
    this.config = config;
  }

  private shouldColorize(): boolean {
    return this.config.ui.colors && isTTY();
  }

  private colorize(text: string, color: string): string {
    return this.shouldColorize() ? `${color}${text}${colors.reset}` : text;
  }

  formatChunk(chunk: string): string {
    if (!this.config.ui.markdown) {
      return chunk;
    }

    this.buffer += chunk;
    let output = '';
    let processed = 0;

    // Process complete lines
    while (true) {
      const newlineIndex = this.buffer.indexOf('\n', processed);
      if (newlineIndex === -1) break;

      const line = this.buffer.slice(processed, newlineIndex);
      output += this.formatLine(line) + '\n';
      processed = newlineIndex + 1;
    }

    // Keep remaining in buffer
    this.buffer = this.buffer.slice(processed);

    // Handle code block closing if buffer ends with ```
    if (this.buffer.endsWith('```')) {
      if (this.inCodeBlock) {
        output += this.formatCodeBlock(
          this.codeBlockContent,
          this.codeBlockLang
        );
        this.inCodeBlock = false;
        this.codeBlockContent = '';
        this.codeBlockLang = '';
        this.buffer = '';
      }
    }

    return output;
  }

  flush(): string {
    let output = '';

    // Process remaining buffer
    if (this.buffer) {
      if (this.inCodeBlock) {
        this.codeBlockContent += this.buffer;
        output += this.formatCodeBlock(
          this.codeBlockContent,
          this.codeBlockLang
        );
      } else {
        output += this.formatLine(this.buffer);
      }
    }

    this.buffer = '';
    return output;
  }

  private formatLine(line: string): string {
    // Code block start
    if (line.startsWith('```')) {
      if (this.inCodeBlock) {
        // End code block
        const result = this.formatCodeBlock(
          this.codeBlockContent,
          this.codeBlockLang
        );
        this.inCodeBlock = false;
        this.codeBlockContent = '';
        this.codeBlockLang = '';
        return result;
      } else {
        // Start code block
        this.inCodeBlock = true;
        this.codeBlockLang = line.slice(3).trim();
        return '';
      }
    }

    // If in code block, collect content
    if (this.inCodeBlock) {
      this.codeBlockContent += line + '\n';
      return '';
    }

    // Headers
    if (line.startsWith('### ')) {
      return this.colorize(line.slice(4), colors.bold + colors.cyan);
    }
    if (line.startsWith('## ')) {
      return this.colorize(line.slice(3), colors.bold + colors.brightCyan);
    }
    if (line.startsWith('# ')) {
      return this.colorize(line.slice(2), colors.bold + colors.brightCyan);
    }

    // Bold (**text**)
    line = line.replace(/\*\*(.+?)\*\*/g, (_, text) =>
      this.colorize(text, colors.bold)
    );

    // Italic (*text*)
    line = line.replace(/\*(.+?)\*/g, (_, text) =>
      this.colorize(text, colors.italic)
    );

    // Inline code (`code`)
    line = line.replace(/`([^`]+)`/g, (_, code) =>
      this.colorize(code, colors.brightYellow)
    );

    // Links [text](url)
    line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, (_, text) =>
      this.colorize(text, colors.blue)
    );

    return line;
  }

  private formatCodeBlock(content: string, lang: string): string {
    if (!this.shouldColorize()) {
      return `\n${content}\n`;
    }

    const border = this.colorize('─'.repeat(60), colors.brightBlack);
    const langLabel = lang
      ? this.colorize(` ${lang} `, colors.brightBlack)
      : '';

    return `\n${border}\n${langLabel}\n${this.colorize(
      content.trim(),
      colors.brightWhite
    )}\n${border}\n`;
  }
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
