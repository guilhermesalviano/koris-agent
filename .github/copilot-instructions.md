# OpenCrawDI Architecture & Development Guide

This document provides comprehensive guidance for AI coding assistants and developers working on the OpenCrawDI codebase.

## Project Overview

OpenCrawDI is an AI-powered coding agent similar to Cline/Claude Code that uses Ollama for local AI inference. It features dual interfaces (Telegram bot + CLI) with a unified backend for processing user messages and executing coding tasks.

### Key Characteristics

- 🤖 **Local-first**: Powered by Ollama - your code never leaves your machine
- 💬 **Dual Interface**: Works via Telegram bot OR CLI
- 🔒 **Privacy-focused**: All AI inference happens locally
- 📁 **File Operations**: Read, write, and list directories
- ⚙️ **Command Execution**: Run shell commands with approval workflow
- 🔍 **Code Search**: Search through codebase
- 🎯 **Mock-first**: Demonstrates capabilities before complex AI implementation

### Current Status

**Version**: 1.0.0  
**Status**: Mock implementation, Ollama integration pending  
**Last Updated**: 2026-04-07

The current version includes **mock implementations** that demonstrate the agent's planned capabilities. These will be progressively replaced with real implementations.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interfaces                      │
├──────────────────────┬──────────────────────────────────┤
│   CLI Interface      │     Telegram Bot                 │
│   (interface.ts)     │     (bot.ts)                     │
└──────────┬───────────┴────────────┬─────────────────────┘
           │                        │
           └────────────┬───────────┘
                        ▼
           ┌────────────────────────┐
           │   Message Processor    │
           │   (processor.ts)       │
           └────────────┬───────────┘
                        │
           ┌────────────┴───────────┐
           │                        │
           ▼                        ▼
    ┌─────────────┐        ┌──────────────┐
    │  Commands   │        │ Instructions │
    │(commands.ts)│        │  Detection   │
    └─────────────┘        └──────────────┘
```

### Design Principles

1. **Shared Processing Logic**: Both CLI and Telegram use the same message processor
2. **Interface Separation**: Interface-specific code isolated in separate modules
3. **Type Safety**: Full TypeScript with strict mode enabled
4. **ESM**: Modern ES modules with `.js` extensions
5. **Mock Before Integrate**: Prove UX before implementing complex backends

## Project Structure

```
src/
├── config/
│   └── index.ts              # Environment configuration & validation
├── infrastructure/
│   └── logger.ts             # Winston-based structured logging
├── agent/
│   ├── processor.ts          # Main message processing hub
│   ├── commands.ts           # Centralized command handler
│   └── [future: ollama.ts, tools.ts]
├── sub-instructions/
│   ├── detect-instruction.ts # Pattern-based instruction detection
│   ├── read-file.ts          # File reading with Markdown escaping
│   └── list-directory.ts     # Directory listing with Markdown escaping
├── cli/
│   └── interface.ts          # CLI interface with readline & ANSI colors
├── telegram/
│   ├── bot.ts                # Telegram bot initialization
│   └── handlers.ts           # Telegram message handlers
├── types.ts                  # Shared TypeScript interfaces
└── index.ts                  # Entry point (selects Telegram or CLI mode)
```

## Core Components

### 1. Message Processor (`src/agent/processor.ts`)

**Purpose**: Central hub for processing all user messages regardless of interface.

**Key Functions**:
- `processUserMessage(message: string, source: 'telegram' | 'cli'): Promise<string>`
  - Main entry point for all message processing
  - Routes to appropriate handler (commands vs instructions)
  - Returns formatted response string

**Message Flow**:
1. Receives message from interface (CLI or Telegram)
2. Checks if message is a command (starts with `/`)
3. If command: delegates to centralized command handler
4. If not command: detects instruction type and handles accordingly
5. Returns response to calling interface

**Instruction Types**:
- `read_file` - Read file contents
- `write_file` - Create or modify files
- `list_dir` - List directory contents
- `execute_command` - Execute shell commands
- `search` - Search in files
- `unknown` - Unrecognized instruction

**Important**: All responses must escape special Markdown characters for Telegram compatibility using `escapeMarkdown()` helper.

### 2. Command Handler (`src/agent/commands.ts`)

**Purpose**: Centralized command handling for both CLI and Telegram interfaces.

**Key Functions**:
- `handleCommand(command: string, context: CommandContext): CommandResult`
- `isCommand(message: string): boolean`
- `getAvailableCommands(source: 'telegram' | 'cli'): string[]`

**Available Commands**:
| Command | CLI | Telegram | Description |
|---------|-----|----------|-------------|
| `/start` | ✅ | ✅ | Welcome message |
| `/help` | ✅ | ✅ | Show available commands |
| `/status` | ✅ | ✅ | Show bot/session status |
| `/stats` | ✅ | ❌ | Show CLI session statistics |
| `/clear` | ✅ | ✅ | Clear screen/history |
| `/reset` | ✅ | ✅ | Reset session |
| `/exit` | ✅ | ❌ | Exit CLI (not applicable for Telegram) |

**CommandContext Interface**:
```typescript
interface CommandContext {
  source: 'telegram' | 'cli';
  session?: {
    messageCount: number;
    startTime: Date;
  };
  rl?: readline.Interface;
}
```

**CommandResult Interface**:
```typescript
interface CommandResult {
  response?: string;        // Text response to display
  action?: 'exit' | 'clear' | 'reset' | 'none';  // Action to perform
  handled: boolean;         // Whether command was recognized
}
```

### 3. CLI Interface (`src/cli/interface.ts`)

**Purpose**: Terminal-based interface with rich formatting and session management.

**Features**:
- ANSI color-coded output
- Session tracking (message count, uptime)
- Graceful Ctrl+C handling
- Thinking indicators during processing
- Response formatting (highlighted lists, code blocks)

**Session State**:
```typescript
interface SessionState {
  messageCount: number;
  startTime: Date;
}
```

**Color Scheme**:
- `cyan` - User prompts and highlights
- `green` - Assistant responses and success messages
- `red` - Errors
- `yellow` - Warnings
- `gray/dim` - Secondary information

### 4. Telegram Bot (`src/telegram/bot.ts`)

**Purpose**: Telegram interface for remote access to agent capabilities.

**Message Format**: Uses Telegram Markdown for formatting responses.

**Integration**: Calls `processUserMessage(message, 'telegram')` for all messages.

**Important**: All text containing special characters MUST be escaped using the `escapeMarkdown()` helper to prevent "can't parse entities" errors.

### 5. Sub-Instructions

**Purpose**: Modular instruction handlers with proper Markdown escaping.

**Location**: `src/sub-instructions/`

**Key Modules**:
- `detect-instruction.ts` - Pattern-based natural language detection
- `read-file.ts` - File reading with proper error handling
- `list-directory.ts` - Directory listing with size formatting

**Critical**: All sub-instruction handlers MUST escape Markdown special characters before returning responses for Telegram compatibility.

## Tool Detection Patterns

The agent detects instructions using pattern matching in `src/sub-instructions/detect-instruction.ts`:

### Read File
**Triggers**: `read`, `show me`, `cat`  
**Pattern**: `/(read|show|cat)\s+["']?([^\s"']+)["']?/i`  
**Example**: "read src/config.ts"

### Write File
**Triggers**: `write`, `create file`, `save`  
**Pattern**: `/(write|create|save).*?["']?([^\s"']+)["']?/i`  
**Example**: "create file config.json"

### List Directory
**Triggers**: `list`, `ls`, `show directory`  
**Pattern**: `/(list|ls|directory)\s+["']?([^\s"']+)["']?/i`  
**Example**: "list src/" or "list ." (current directory)

### Execute Command
**Triggers**: `run`, `execute`, `command`  
**Pattern**: `/(run|execute)(?:\s+command)?\s+["']?(.+?)["']?$/i`  
**Example**: "run npm install"

### Search
**Triggers**: `search`, `find`  
**Pattern**: `/(search|find)\s+(?:for\s+)?["']?(.+?)["']?$/i`  
**Example**: "search for config"

## Agent Capabilities

### Current (Mock Implementation)

1. **File Operations**
   - Reading file contents (mock)
   - Writing/creating files (mock with approval prompt)
   - Listing directories (mock with file sizes)

2. **Command Execution**
   - Shell command execution (mock with approval prompt)
   - Output display

3. **Search Operations**
   - File content search (mock results)
   - Pattern matching

### Planned (Ollama Integration)

The system is designed to integrate with Ollama for:
- Natural language understanding
- Code analysis and generation
- Context-aware responses
- Tool calling capabilities
- Conversation history management
- Streaming responses for better UX

## Configuration

### Environment Variables

See `.env.example` for required configuration:

```bash
# Required for Telegram mode
TELEGRAM_BOT_TOKEN=your_token_here

# Optional
LOG_LEVEL=info                    # info, debug, error
ENVIRONMENT=development           # development, production
OLLAMA_BASE_URL=http://localhost:11434  # Ollama API endpoint
OLLAMA_MODEL=llama3.1            # Model to use
```

### Logging

Logger is configured in `src/infrastructure/logger.ts`:
- Uses Winston for structured logging
- Outputs JSON format to console
- Includes timestamps and environment metadata
- Log levels: info, debug, error, warn

## Usage Guide

### CLI Mode

```bash
# Development with hot reload
pnpm dev:cli

# Production build
pnpm start:cli
```

**Example Session**:
```
> /help
[Shows available commands]

> read package.json
[Shows file contents]

> list .
[Lists current directory]

> /stats
[Shows session statistics]

> /exit
[Exits cleanly]
```

### Telegram Mode

```bash
# Development with hot reload
pnpm dev

# Production build
pnpm start
```

**Example Conversation**:
```
User: /start
Bot: 👋 Welcome to OpenCrawdi! [...]

User: read package.json
Bot: 📄 Reading file: package.json [...]

User: list src/
Bot: 📁 Directory listing: /path/to/src [...]

User: /status
Bot: ✅ Bot Status [...]
```

## Development Guidelines

### For AI Coding Assistants

When working on this codebase:

1. **Use centralized command handler** (`src/agent/commands.ts`) for all command-related changes
2. **Respect interface separation**: CLI-specific code in `cli/`, Telegram in `telegram/`
3. **Update command responses**: Ensure proper formatting for both Telegram (Markdown with escaping) and CLI (ANSI colors)
4. **Mock before integrate**: Keep mock implementations until Ollama integration is ready
5. **Maintain session state**: CLI has session state, Telegram should track per-user state
6. **Always escape Markdown**: Use `escapeMarkdown()` helper for all Telegram responses

### Common Patterns

- Use `handleCommand()` for slash commands
- Use `detectInstruction()` for natural language instructions
- Use `processUserMessage()` as the universal entry point
- Format responses based on `source` parameter
- Return `CommandResult` from command handlers with appropriate `action` values
- Always escape special characters for Telegram: `_ * [ ] ( ) ~ ` > # + - = | { } . !`

### Adding a New Command

1. Add command handler in `src/agent/commands.ts`:
```typescript
case '/mycommand':
  return handleMyCommand(context);
```

2. Implement handler function:
```typescript
function handleMyCommand(context: CommandContext): CommandResult {
  const message = context.source === 'telegram'
    ? `*Telegram formatted response*`
    : `CLI formatted response`;
  
  return {
    response: message,
    action: 'none',
    handled: true,
  };
}
```

3. Update command list in `getAvailableCommands()` if needed.

### Adding a New Instruction Type

1. Add type to `Instruction` interface in `src/types.ts`:
```typescript
export interface Instruction {
  type: 'read_file' | 'write_file' | 'my_new_type' | ...;
  params: string;
}
```

2. Add detection pattern in `src/sub-instructions/detect-instruction.ts`:
```typescript
if (lower.includes('my_trigger')) {
  return { type: 'my_new_type', params: extractedParams };
}
```

3. Add handler in `src/agent/processor.ts`:
```typescript
case 'my_new_type':
  return mockMyNewType(instruction.params);
```

4. Implement handler function with proper escaping:
```typescript
function mockMyNewType(params: string): string {
  const escapedParams = escapeMarkdown(params);
  return `Response for ${escapedParams}`;
}
```

### Markdown Escaping for Telegram

**Critical**: Always escape special Markdown characters in Telegram responses.

**Characters to escape**: `_ * [ ] ( ) ~ ` > # + - = | { } . !`

**Helper function**:
```typescript
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
```

**When to use**:
- User-provided input (filenames, queries, commands)
- Dynamic content (file paths, error messages)
- Any text that might contain special characters

## Ollama Integration Plan

When integrating Ollama, replace mock implementations with real tool calls:

### 1. Create Ollama Client Wrapper

Create `src/agent/ollama.ts`:
```typescript
export class OllamaClient {
  async chat(messages: Message[], tools: Tool[]): Promise<Response> {
    // Implement Ollama API calls
  }
  
  async streamChat(messages: Message[], tools: Tool[]): AsyncGenerator<string> {
    // Implement streaming responses
  }
}
```

### 2. Define Tool Schemas

**Example Tool Schema**:
```typescript
const readFileTool = {
  name: 'read_file',
  description: 'Read contents of a file',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'File path to read' }
    },
    required: ['path']
  }
};
```

### 3. Replace Mock Implementations

- Replace `mockReadFile` with real file system calls
- Replace `mockWriteFile` with real file writing (with approval)
- Replace `mockExecuteCommand` with sandboxed command execution
- Replace `mockSearch` with grep/ripgrep integration

### 4. Add Conversation History

- Implement per-session message history
- Store context for follow-up questions
- CLI: single session in memory
- Telegram: per-user sessions (consider persistence)

### 5. Implement Streaming

- Add streaming responses for better UX
- Update CLI to show partial responses
- Update Telegram to use `editMessageText` for streaming

## Security Considerations

1. **Command Execution**: All command executions MUST require user approval
2. **File Operations**: Validate paths to prevent directory traversal attacks
3. **Token Management**: Never log or expose Telegram bot tokens
4. **Input Sanitization**: Validate and sanitize all user inputs
5. **Rate Limiting**: Implement rate limiting for Telegram bot to prevent abuse
6. **Sandboxing**: Execute commands in sandboxed environment when implemented

## Performance Notes

- CLI interface uses async processing with visual feedback
- Telegram bot currently uses polling (webhook mode recommended for production)
- Consider implementing message queuing for high-volume scenarios
- Response caching could improve repeated queries
- File operations should be async to prevent blocking

## Testing Strategy

### Current: Manual Testing

```bash
# Build project
pnpm build

# Test CLI
pnpm dev:cli

# Test Telegram
pnpm dev
```

### Future: Automated Testing

- [ ] Unit tests for command handlers
- [ ] Integration tests for message processing
- [ ] Mock Ollama responses for consistent testing
- [ ] Test Markdown escaping edge cases
- [ ] Test command approval workflows
- [ ] Test file operation security (path traversal, etc.)

## Dependencies

### Core Dependencies
- `readline` - CLI interface
- `node-telegram-bot-api` - Telegram integration
- `winston` - Structured logging
- `dotenv` - Environment configuration

### Development Dependencies
- `typescript` - Type safety
- `tsx` - Development server with watch mode
- `@types/*` - TypeScript definitions

## Roadmap

### Phase 1: Mock Implementation ✅
- [x] Dual interface (CLI + Telegram)
- [x] Command system
- [x] Instruction detection
- [x] Mock responses
- [x] Markdown escaping for Telegram

### Phase 2: Real File Operations 🚧
- [ ] Real file reading
- [ ] Real file writing with approval
- [ ] Real directory listing
- [ ] Path validation and security

### Phase 3: Ollama Integration
- [ ] Ollama client wrapper
- [ ] Tool schema definitions
- [ ] Conversation history
- [ ] Streaming responses
- [ ] Context management

### Phase 4: Advanced Features
- [ ] Command execution with sandboxing
- [ ] Real code search (grep/ripgrep)
- [ ] Multi-session support
- [ ] Approval workflow UI
- [ ] Docker orchestration interface

## Contributing

When modifying the agent system:

1. **Maintain interface consistency**: Ensure both CLI and Telegram interfaces work correctly
2. **Update documentation**: Keep this file and AGENTS.md synchronized
3. **Follow TypeScript patterns**: Use proper types and interfaces
4. **Test both interfaces**: Verify changes work in CLI and Telegram
5. **Handle errors gracefully**: Provide user-friendly error messages
6. **Escape Markdown**: Always use `escapeMarkdown()` for Telegram responses
7. **Security first**: Validate inputs and require approval for destructive operations

## Resources

- **Project Documentation**: See `AGENTS.md` for detailed architecture
- **Quick Start**: See `DEMO.md` for usage examples
- **Main README**: See `README.md` for project overview
- **Ollama**: https://ollama.ai/ for local LLM setup
- **Telegram Bot API**: https://core.telegram.org/bots/api

---

**Note for AI Assistants**: This document serves as the source of truth for the OpenCrawDI architecture. When making changes, ensure they align with the patterns and principles described here. Always prioritize security, user experience, and maintainability.
