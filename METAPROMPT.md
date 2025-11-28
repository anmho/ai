# Metaprompt: AI CLI Tool with Bun

Build a fast, portable command-line interface tool called `ai` using Bun that provides seamless access to AI APIs with support for piping, redirection, and beautiful loading indicators.

## Core Requirements

### 1. Technology Stack
- **Runtime**: Bun (for speed and portability)
- **Language**: TypeScript
- **AI Library**: Vercel AI SDK (`ai` and `@ai-sdk/google`)
- **Default Model**: Gemini Flash 2.0 (ultra-fast responses)
- **Binary Compilation**: Use `bun build --compile` to create a standalone executable
- **Focus**: SPEED - optimize for fastest possible responses and lowest latency
- **Keep it simple**: Single provider (Google), clean implementation

### 2. Functionality

#### Input Methods
The CLI must support multiple input methods:

1. **Direct prompt**: `ai "what is 2+2?"`
2. **Piped input**: `cat log.txt | ai "what is the error"`
3. **Piped with prompt**: `supabase status | ai "create a .env file for this"`
4. **File input**: `ai --file log.txt "analyze this"`
5. **Stdin when no TTY**: `echo "hello" | ai "translate to Spanish"`

#### Command Syntax
```bash
ai [options] [prompt]
ai [options] < input.txt
command | ai [options] [prompt]
ai configure              # Open TUI for configuration
ai config show           # Show current configuration
ai config set <key> <value>  # Set config value via CLI
```

### 3. Features

#### Required Features
- **Google Gemini Support** (via Vercel AI SDK):
  - **Default**: Gemini Flash 2.0 (ultra-fast, recommended)
  - **Configurable models**:
    - `gemini-2.0-flash-exp` (fastest)
    - `gemini-1.5-flash`
    - `gemini-1.5-pro`
    - `gemini-pro`
  - Easy to extend to other providers later

- **Configuration**:
  - Config file at `~/.config/ai/config.json`
  - Environment variable: `GOOGLE_API_KEY` (or `AI_API_KEY`)
  - Model selection
  - Temperature and max tokens parameters
  - **Interactive TUI Configuration** (`ai configure`):
    - Simple, fast terminal UI for setup
    - Set/edit Google API key
    - Select model (Flash, Pro, etc.)
    - Configure temperature and max tokens
    - Test API connection before saving
    - Navigate with arrow keys, save with Enter
    - Auto-save to `~/.config/ai/config.json`
  - **CLI Configuration Commands**:
    - `ai config show` - Display current configuration
    - `ai config set apiKey <key>` - Set Google API key
    - `ai config set model gemini-2.0-flash-exp` - Set model
    - `ai config get model` - Get current model
    - `ai config reset` - Reset to defaults

- **Streaming Support**:
  - Stream AI responses in real-time
  - Beautiful loading indicators while waiting
  - Preserve markdown formatting in output

- **Error Handling**:
  - Graceful handling of API errors
  - Rate limiting detection
  - Network errors with retry logic
  - Clear error messages

#### Nice-to-Have Features
- **Conversation history**: `ai --continue` to continue last conversation
- **Template support**: `ai --template bug-analysis < error.log`
- **Token counting**: Show token usage with `--verbose`
- **Cost estimation**: Show estimated API cost
- **Output formatting**: `--json`, `--markdown`, `--plain`

### 4. User Experience

#### Loading Indicators
Use beautiful spinners/loaders:
- **While waiting for API**: Show animated spinner (use ASCII art or Unicode spinners)
- **While streaming**: Show typing indicator
- **Examples**:
  ```
  ⠋ Thinking...
  ⠙ Analyzing your input...
  ⠹ Generating response...
  ```

#### Output Formatting
- Syntax highlighting for code blocks (if in TTY)
- Preserve markdown formatting
- Word wrapping for terminal width
- Color support (detect TTY and disable colors for pipes)

### 5. Installation & Distribution

#### Makefile/Install Script
Create both a Makefile and install script that:

1. **Build the binary** (optimized for speed and size):
   ```bash
   bun build --compile --minify --sourcemap ./src/index.ts --outfile ai
   ```

2. **Install to system**:
   - Copy to `/usr/local/bin/ai` (or `~/.local/bin/ai`)
   - Make executable with `chmod +x`
   - Create config directory if needed

3. **Makefile targets**:
   ```makefile
   make build    # Build the binary
   make install  # Install to /usr/local/bin
   make uninstall # Remove from system
   make test     # Run tests
   ```

#### Cross-platform Support
- macOS (ARM64 and x64)
- Linux (x64 and ARM64)
- Windows (optional, but nice to have)

### 6. Configuration Example

```json
{
  "apiKey": "AIza...",
  "model": "gemini-2.0-flash-exp",
  "maxTokens": 8192,
  "temperature": 0.7,
  "ui": {
    "colors": true,
    "spinner": true,
    "markdown": true
  }
}
```

### 7. Usage Examples

```bash
# Simple question
ai "what is the capital of France?"

# Analyze piped input
cat error.log | ai "what's the error here?"

# Combine command output with prompt
supabase status | ai "create a .env file with these values"

# Configure settings
ai configure

# Show configuration
ai config show

# Save output
cat code.js | ai "review this code" > review.md

# Verbose mode with token usage
ai --verbose "explain TCP/IP"

# Custom model
ai --model gemini-1.5-pro "complex analysis task..."

# Multiple commands
git diff | ai "write a commit message for these changes"
docker ps | ai "which containers are using the most resources?"
```

### 8. Implementation Details

#### Project Structure
```
ai/
├── src/
│   ├── index.ts           # Main entry point
│   ├── cli.ts             # CLI argument parsing
│   ├── config.ts          # Configuration management
│   ├── gemini.ts          # Gemini API client (using AI SDK)
│   ├── configure.ts       # TUI for configuration
│   ├── ui/
│   │   ├── spinner.ts     # Loading indicators
│   │   ├── formatter.ts   # Output formatting
│   │   └── colors.ts      # Color utilities
│   ├── input.ts           # Handle stdin/pipes/files
│   └── utils.ts           # Helper functions
├── Makefile
├── install.sh
├── package.json
├── tsconfig.json
└── README.md
```

#### Key Implementation Points

1. **Using Vercel AI SDK with Gemini**:
   ```typescript
   import { google } from '@ai-sdk/google';
   import { streamText } from 'ai';

   const result = await streamText({
     model: google('gemini-2.0-flash-exp'),
     prompt: userPrompt,
   });

   for await (const chunk of result.textStream) {
     process.stdout.write(chunk);
   }
   ```

2. **Detect stdin**: Check if data is being piped
   ```typescript
   const isStdinPiped = !process.stdin.isTTY;
   ```

3. **Read piped data**:
   ```typescript
   async function readStdin(): Promise<string> {
     const chunks: Uint8Array[] = [];
     for await (const chunk of process.stdin) {
       chunks.push(chunk);
     }
     return Buffer.concat(chunks).toString('utf-8');
   }
   ```

4. **Stream responses with AI SDK**:
   ```typescript
   for await (const chunk of result.textStream) {
     process.stdout.write(chunk);
   }
   ```

5. **Spinner only in TTY**:
   ```typescript
   const showSpinner = process.stdout.isTTY;
   ```

6. **Fast startup with lazy loading**:
   ```typescript
   // Parse args first (fast)
   const args = parseArgs(process.argv);

   // Only load AI SDK when actually needed
   if (args.command === 'configure') {
     // Don't load AI SDK for config commands
     const { runConfigureTUI } = await import('./configure.js');
     await runConfigureTUI();
   } else {
     // Load AI SDK only when making AI requests
     const { google } = await import('@ai-sdk/google');
     const { streamText } = await import('ai');
     // ... make request
   }
   ```

### 9. Testing

Include tests for:
- Argument parsing
- Config loading
- Provider switching
- Piped input handling
- Error handling
- Output formatting

Use `bun test`:
```typescript
import { test, expect } from "bun:test";

test("parses command line arguments", () => {
  // Test implementation
});
```

### 10. Documentation

Create a comprehensive README.md with:
- Quick start guide
- Installation instructions for all platforms
- Configuration examples
- Usage examples
- API provider setup instructions
- Troubleshooting section
- Contributing guidelines

### 11. Performance Goals

- **Cold start (CRITICAL)**: < 50ms - MUST be instant
- **Time to first token**: Minimize all overhead, stream immediately when API responds
- **Binary size**: < 30MB (optimized compilation)
- **Memory usage**: < 50MB during normal operation
- **Startup optimizations**:
  - Lazy load AI SDK only when needed
  - Cache config file reads
  - Minimal dependencies (bundle only what's needed)
  - Use `bun build --compile --minify` for smaller, faster binary
  - Avoid unnecessary imports at startup
  - Parse args before loading heavy modules

### 12. Security Considerations

- Never log API keys
- Store config file with appropriate permissions (600)
- Support environment variables for CI/CD
- Warn if API keys are in command history
- Option to use system keychain for API keys

## Implementation Steps

1. Set up Bun project with TypeScript and AI SDK
2. Implement fast CLI argument parsing (before loading heavy modules)
3. Create lightweight configuration system
4. Implement Gemini integration with AI SDK
5. Add streaming support with real-time output
6. Create UI components (spinner, formatter)
7. Handle stdin/piping efficiently
8. Build TUI for `ai configure` command
9. Add error handling and validation
10. Optimize for fast startup (lazy loading, minimal imports)
11. Create build script with `bun build --compile --minify`
12. Write Makefile with build/install/uninstall
13. Write installation script
14. Add tests
15. Write documentation
16. Benchmark and optimize startup time (target < 50ms)

## Deliverables

- Standalone executable binary (`ai`)
- Makefile with build/install/uninstall targets
- Installation script (`install.sh`)
- Comprehensive README.md
- Configuration template
- Test suite
- Clean, maintainable TypeScript codebase
