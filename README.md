# AI CLI

Fast AI assistant powered by Google Gemini Flash - optimized for speed and simplicity.

## Features

- ⚡ **Ultra-fast** - Optimized for < 50ms startup time
- 🚀 **Streaming responses** - See results in real-time
- 📝 **Piping support** - Integrate with any command
- 🎨 **Beautiful UI** - Spinners and formatted output
- ⚙️ **Easy configuration** - Interactive TUI for setup
- 🔧 **Flexible** - Multiple Gemini models supported

## Installation

### Quick Install (Recommended)

```bash
bun run link
```

This builds the binary and symlinks it globally using `bun link`. The `ai` command will be available system-wide.

### Uninstall

```bash
bun run unlink
```

### Manual Install

```bash
# Build the binary
bun run build

# Copy to your preferred location
cp dist/ai ~/.local/bin/ai
# or
sudo cp dist/ai /usr/local/bin/ai
```

## Setup

After installation, configure your Google API key:

```bash
ai configure
```

Or set it via environment variable:

```bash
# Any of these work:
export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
export GOOGLE_API_KEY="your-api-key-here"
export AI_API_KEY="your-api-key-here"
```

Get your API key from: https://aistudio.google.com/app/apikey

## Usage

### Basic Usage

```bash
# Ask a question
ai "what is 2+2?"

# Multi-line prompt
ai "explain quantum computing in simple terms"
```

### Piping

```bash
# Analyze log files
cat error.log | ai "what's the error?"

# Git commit messages
git diff | ai "write a commit message for these changes"

# Supabase setup
supabase status | ai "create a .env file with these values"

# Docker analysis
docker ps | ai "which containers are using the most resources?"

# Code review
cat src/index.ts | ai "review this code"
```

### Redirection

```bash
# Read from file
ai "summarize this" < document.txt

# Save output
ai "explain TCP/IP" > explanation.md

# Combine both
cat code.js | ai "add comments" > code-commented.js
```

### Options

```bash
# Use a different model
ai --model gemini-1.5-pro "complex analysis task"

# Debug mode (shows full error details and configuration)
ai --debug "test prompt"

# Help
ai --help
```

### Configuration

```bash
# Interactive configuration
ai configure

# View current config
ai config show

# Set specific values
ai config set model gemini-2.0-flash-exp
ai config set temperature 0.9
ai config set maxTokens 4096

# Get specific value
ai config get model

# Reset to defaults
ai config reset
```

## Available Models

- `gemini-2.0-flash-exp` (Default - Fastest, Recommended)
- `gemini-1.5-flash`
- `gemini-1.5-pro`
- `gemini-pro`

## Configuration File

Configuration is stored at `~/.config/ai/config.json`:

```json
{
  "apiKey": "your-api-key",
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

## Development

```bash
# Run in development mode (without compiling)
bun run dev

# Or run directly
bun src/index.ts "your prompt"

# Build binary (required after code changes)
bun run build

# Build and link (compile + make available globally)
bun run link

# Note: After making code changes, you MUST rebuild
# Running 'bun link' alone will NOT recompile the binary
# Use 'bun run build' or 'bun run link' instead

# Clean build artifacts
bun run clean

# Run tests
bun test
```

## Performance

The CLI automatically displays performance metrics after each request:

```
─────────────────────────────────────────────────────────
Cold start:  0.61s     Input:  50 tokens
Stream time: 0.59s     Output: 2 tokens
Total time:  0.61s     Total:  52 tokens
─────────────────────────────────────────────────────────
```

- **Cold start**: Time from program start to first token received
- **Stream time**: Total time for streaming the complete response
- **Total time**: Overall execution time including program initialization
- **Token usage**: Input, output, and total tokens used for the request

Typical metrics:
- **Binary size**: ~59MB (includes Bun runtime)
- **Time to first token**: 0.5-1.5s (depends on Gemini API response)
- **Memory usage**: < 50MB during operation

## Examples

### Code Generation

```bash
echo "create a fibonacci function in Python" | ai
```

**Response:**
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

```
─────────────────────────────────────────────────────────
Cold start:  0.54s     Input:  58 tokens
Stream time: 0.61s     Output: 45 tokens
Total time:  0.55s     Total:  103 tokens
─────────────────────────────────────────────────────────
```

### Debugging

```bash
bun run src/broken-app.ts 2>&1 | ai "fix this error"
```

**Response:**
```
The error shows you're trying to access a property on undefined. Add a null
check before accessing the property:

if (user && user.name) {
  console.log(user.name);
}
```

### DevOps

```bash
kubectl get pods | ai "which pods are failing?"
```

**Response:**
```
Based on the output, these pods are failing:

• backend-api-7d9f8b6c4-x8k2p - CrashLoopBackOff
• worker-queue-5c8d9f7b2-m4n1k - Error

The backend API is repeatedly crashing and the worker queue has encountered
an error. Check the logs with:

kubectl logs backend-api-7d9f8b6c4-x8k2p
kubectl logs worker-queue-5c8d9f7b2-m4n1k
```

### Data Processing

```bash
cat data.csv | ai "convert this to JSON"
```

**Response:**
```json
[
  {
    "name": "Alice",
    "age": 30,
    "city": "New York"
  },
  {
    "name": "Bob",
    "age": 25,
    "city": "San Francisco"
  }
]
```

## Troubleshooting

### API Key Not Found

```bash
# Set via environment variable
export GOOGLE_API_KEY="your-key"

# Or configure interactively
ai configure
```

### Binary Not Found

Make sure the installation directory is in your PATH:

```bash
# For ~/.local/bin
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# For /usr/local/bin (usually already in PATH)
echo $PATH
```

### Permission Denied

```bash
chmod +x ~/.local/bin/ai
# or
sudo chmod +x /usr/local/bin/ai
```

## License

MIT

## Credits

Built with:
- [Bun](https://bun.sh) - Fast JavaScript runtime
- [Vercel AI SDK](https://sdk.vercel.ai) - AI integration
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Ora](https://github.com/sindresorhus/ora) - Spinner
- [Inquirer](https://github.com/SBoudrias/Inquirer.js) - Interactive prompts
