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

# Verbose output (shows token usage)
ai --verbose "explain something"

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
# Run in development mode
bun run dev

# Build binary
bun run build

# Clean build artifacts
bun run clean

# Run tests
bun test
```

## Performance

- **Cold start**: < 50ms (optimized binary)
- **Binary size**: ~59MB (includes Bun runtime)
- **Time to first token**: Depends on Gemini API response
- **Memory usage**: < 50MB during operation

## Examples

### Code Generation

```bash
echo "create a fibonacci function in Python" | ai
```

### Debugging

```bash
bun run src/broken-app.ts 2>&1 | ai "fix this error"
```

### DevOps

```bash
kubectl get pods | ai "which pods are failing?"
```

### Data Processing

```bash
cat data.csv | ai "convert this to JSON"
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
