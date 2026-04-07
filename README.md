# OpenCrawdi 🤖

An AI-powered coding agent similar to Cline/Claude Code that uses Ollama for local AI inference and Telegram as the user interface.

## Features

- 🤖 AI coding agent powered by Ollama (local LLM)
- 💬 Telegram bot interface for easy access
- 📁 File operations (read, write, edit)
- ⚙️ Command execution capabilities
- 🔒 Local-first (your code never leaves your machine)

## Prerequisites

- Node.js 18+ (with pnpm)
- [Ollama](https://ollama.ai/) installed and running
- A Telegram bot token (from [@BotFather](https://t.me/botfather))

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up Ollama:**
   ```bash
   # Install and start Ollama, then pull a model
   ollama pull llama3.1
   ```

3. **Create a Telegram bot:**
   - Open Telegram and chat with [@BotFather](https://t.me/botfather)
   - Send `/newbot` and follow the instructions
   - Copy the bot token you receive

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your TELEGRAM_BOT_TOKEN
   ```

5. **Run in development mode:**
   ```bash
   pnpm dev
   ```

6. **Start chatting with your bot on Telegram!**

## Development

```bash
# Development with hot reload
pnpm dev

# Build TypeScript
pnpm build

# Run production build
pnpm start
```

## Configuration

Edit `.env` to configure:

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `TELEGRAM_USE_POLLING` - Set to `true` for local development
- `OLLAMA_BASE_URL` - Ollama API endpoint (default: http://localhost:11434)
- `OLLAMA_MODEL` - Model to use (default: llama3.1)

## Usage

Send messages to your Telegram bot:

- `/start` - Get started
- `/help` - Show available commands
- `/status` - Check bot status
- `/clear` - Clear conversation history

Or just send any message to interact with the AI agent!

## Architecture

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed architecture and development guidelines.

## License

ISC
