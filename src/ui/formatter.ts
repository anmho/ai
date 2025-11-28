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

    // Store original line for structure checks
    const originalLine = line;

    // Process inline formatting first (applies to all line types)
    // Bold (**text**) - remove asterisks, make bold
    line = line.replace(/\*\*(.+?)\*\*/g, (_, text) =>
      this.colorize(text, colors.bold)
    );

    // Italic (*text*) - remove asterisks for cleaner look
    // Use a more careful regex to avoid matching list markers
    line = line.replace(/(?<!\*)\*([^*\s]+[^*]*?[^*\s])\*(?!\*)/g, '$1');

    // Inline code (`code`) - subtle yellow
    line = line.replace(/`([^`]+)`/g, (_, code) =>
      this.colorize(code, colors.yellow)
    );

    // Links [text](url) - show text in blue, hide URL
    line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, (_, text) =>
      this.colorize(text, colors.brightBlue)
    );

    // Strikethrough (~~text~~) - dim text
    line = line.replace(/~~(.+?)~~/g, (_, text) =>
      this.colorize(text, colors.dim)
    );

    // Headers - use simple formatting (check original line for structure)
    if (originalLine.startsWith('### ')) {
      return this.colorize('  ' + line.slice(4), colors.cyan);
    }
    if (originalLine.startsWith('## ')) {
      return this.colorize(line.slice(3), colors.bold + colors.cyan);
    }
    if (originalLine.startsWith('# ')) {
      return this.colorize(line.slice(2), colors.bold + colors.brightCyan);
    }

    // Horizontal rule
    if (originalLine.match(/^[-*_]{3,}\s*$/)) {
      return this.colorize('  ───────────────────────────────', colors.brightBlack);
    }

    // List items - simple bullet or number (now with inline formatting already applied)
    // Handle nested bullets (with leading spaces) - check original line
    const nestedBulletMatch = originalLine.match(/^(\s*)\*\s+/);
    if (nestedBulletMatch) {
      const indent = nestedBulletMatch[1];
      return indent + this.colorize('• ', colors.brightBlack) + line.slice(nestedBulletMatch[0].length);
    }

    // Handle nested numbered lists - check original line
    const nestedNumberMatch = originalLine.match(/^(\s*)(\d+\.)\s+/);
    if (nestedNumberMatch) {
      const indent = nestedNumberMatch[1];
      const number = nestedNumberMatch[2];
      return indent + this.colorize(number + ' ', colors.brightBlack) + line.slice(nestedNumberMatch[0].length);
    }

    // Blockquotes
    if (originalLine.startsWith('> ')) {
      return this.colorize('  │ ', colors.brightBlack) + line.slice(2);
    }

    return line;
  }

  private formatCodeBlock(content: string, lang: string): string {
    const trimmed = content.trim();

    if (!this.shouldColorize()) {
      return `${trimmed}`;
    }

    // Simple indented code block with subtle border
    const lines = trimmed.split('\n');
    const formatted = lines.map(line =>
      this.colorize('  │ ', colors.brightBlack) + this.colorize(line, colors.brightWhite)
    ).join('\n');

    const topBorder = this.colorize('  ┌' + (lang ? '─ ' + lang + ' ' : ''), colors.brightBlack);
    const bottomBorder = this.colorize('  └', colors.brightBlack);

    return `${topBorder}\n${formatted}\n${bottomBorder}`;
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

export function formatTimingStats(
  coldStart: number,
  streamTime: number,
  totalTime: number,
  inputTokens?: number,
  outputTokens?: number,
  totalTokens?: number
): string {
  if (isTTY()) {
    const dim = colors.dim;
    const brightBlack = colors.brightBlack;
    const cyan = colors.cyan;
    const magenta = colors.magenta;
    const reset = colors.reset;

    if (inputTokens !== undefined && outputTokens !== undefined && totalTokens !== undefined) {
      return (
        `\n${dim}${brightBlack}─────────────────────────────────────────────────────────${reset}\n` +
        `${dim}Cold start:${reset}  ${cyan}${coldStart.toFixed(2)}s${reset}     ${dim}Input:${reset}  ${magenta}${inputTokens.toLocaleString()}${reset} ${dim}tokens${reset}\n` +
        `${dim}Stream time:${reset} ${cyan}${streamTime.toFixed(2)}s${reset}     ${dim}Output:${reset} ${magenta}${outputTokens.toLocaleString()}${reset} ${dim}tokens${reset}\n` +
        `${dim}Total time:${reset}  ${cyan}${totalTime.toFixed(2)}s${reset}     ${dim}Total:${reset}  ${magenta}${totalTokens.toLocaleString()}${reset} ${dim}tokens${reset}\n` +
        `${dim}${brightBlack}─────────────────────────────────────────────────────────${reset}`
      );
    }

    return (
      `\n${dim}${brightBlack}───────────────────────────────${reset}\n` +
      `${dim}Cold start:${reset}  ${cyan}${coldStart.toFixed(2)}s${reset}\n` +
      `${dim}Stream time:${reset} ${cyan}${streamTime.toFixed(2)}s${reset}\n` +
      `${dim}Total time:${reset}  ${cyan}${totalTime.toFixed(2)}s${reset}\n` +
      `${dim}${brightBlack}───────────────────────────────${reset}`
    );
  }

  if (inputTokens !== undefined && outputTokens !== undefined && totalTokens !== undefined) {
    return (
      `\n─────────────────────────────────────────────────────────\n` +
      `Cold start:  ${coldStart.toFixed(2)}s     Input:  ${inputTokens.toLocaleString()} tokens\n` +
      `Stream time: ${streamTime.toFixed(2)}s     Output: ${outputTokens.toLocaleString()} tokens\n` +
      `Total time:  ${totalTime.toFixed(2)}s     Total:  ${totalTokens.toLocaleString()} tokens\n` +
      `─────────────────────────────────────────────────────────`
    );
  }

  return (
    `\n───────────────────────────────\n` +
    `Cold start:  ${coldStart.toFixed(2)}s\n` +
    `Stream time: ${streamTime.toFixed(2)}s\n` +
    `Total time:  ${totalTime.toFixed(2)}s\n` +
    `───────────────────────────────`
  );
}
