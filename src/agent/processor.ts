// import { ILogger } from '@/infrastructure/logger';
import { handleCommand as handleCentralizedCommand, isCommand } from './commands';
import { listDirectory } from '../sub-instructions/instruction';

/**
 * Process user messages and generate responses
 * This is a mock implementation that will be replaced with Ollama integration
 */
export async function processUserMessage(
  // logger: ILogger,
  message: string,
  source: 'telegram' | 'cli'
): Promise<string> {
  // Only log for telegram source to avoid breaking CLI interface
  if (source === 'telegram') {
    // logger.log("info", `📥 Processing message from ${source}: "${message}"`);
  }

  // Handle commands using centralized handler
  if (isCommand(message)) {
    const result = handleCentralizedCommand(message, { source });
    return result.response || '';
  }

  // Mock instruction handling
  const instruction = detectInstruction(message);
  if (instruction) {
    return handleInstruction(instruction, message);
  }

  // Default response
  return `I received your message: "${message}"\n\nI'm currently a mock agent. Ollama integration coming soon!`;
}

interface Instruction {
  type: 'read_file' | 'write_file' | 'list_dir' | 'execute_command' | 'search' | 'unknown';
  params: string;
}

/**
 * Detect instruction type from user message
 */
function detectInstruction(message: string): Instruction | null {
  const lower = message.toLowerCase();

  // Read file patterns
  if (lower.includes('read') || lower.includes('show me') || lower.includes('cat')) {
    const fileMatch = message.match(/(?:read|show|cat)\s+["']?([^\s"']+)["']?/i);
    if (fileMatch?.[1]) {
      return { type: 'read_file', params: fileMatch[1] };
    }
  }

  // Write file patterns
  if (lower.includes('write') || lower.includes('create file') || lower.includes('save')) {
    const fileMatch = message.match(/(?:write|create|save).*?["']?([^\s"']+)["']?/i);
    if (fileMatch?.[1]) {
      return { type: 'write_file', params: fileMatch[1] };
    }
  }

  // List directory patterns
  if (lower.includes('list') || lower.includes('ls') || lower.includes('show directory')) {
    const dirMatch = message.match(/(?:list|ls|directory)\s+["']?([^\s"']+)["']?/i);
    return { type: 'list_dir', params: dirMatch?.[1] || '.' };
  }

  // Execute command patterns
  if (lower.includes('run') || lower.includes('execute') || lower.includes('command')) {
    const cmdMatch = message.match(/(?:run|execute)(?:\s+command)?\s+["']?(.+?)["']?$/i);
    if (cmdMatch?.[1]) {
      return { type: 'execute_command', params: cmdMatch[1] };
    }
  }

  // Search patterns
  if (lower.includes('search') || lower.includes('find')) {
    const searchMatch = message.match(/(?:search|find)\s+(?:for\s+)?["']?(.+?)["']?$/i);
    if (searchMatch?.[1]) {
      return { type: 'search', params: searchMatch[1] };
    }
  }

  return null;
}

/**
 * Handle detected instructions with mock implementations
 */
async function handleInstruction(instruction: Instruction, originalMessage: string): Promise<string> {
  switch (instruction.type) {
    case 'read_file':
      return mockReadFile(instruction.params);

    case 'write_file':
      return mockWriteFile(instruction.params, originalMessage);

    case 'list_dir':
      return listDirectory(instruction.params);

    case 'execute_command':
      return mockExecuteCommand(instruction.params);

    case 'search':
      return mockSearch(instruction.params);

    default:
      return `Unknown instruction type`;
  }
}



// Mock tool implementations

function mockReadFile(filename: string): string {
  return `📄 *Reading file: ${filename}*

\`\`\`typescript
// Mock file content for ${filename}
export function example() {
  console.log('This is mock content');
  return 'placeholder';
}
\`\`\`

_This is a mock response. Real file reading will be implemented with actual file system access._`;
}

function mockWriteFile(filename: string, message: string): string {
  return `✍️ *Would create/update file: ${filename}*

Based on your message:
"${message}"

⚠️ This would normally require your approval before writing.

_This is a mock response. Real file operations will be implemented next._`;
}

function mockExecuteCommand(command: string): string {
  return `⚙️ *Would execute command:*

\`\`\`bash
${command}
\`\`\`

⚠️ This would normally require your approval before execution.

Expected output: [mock output]

_This is a mock response. Real command execution will be implemented with proper sandboxing._`;
}

function mockSearch(query: string): string {
  return `🔍 *Searching for: "${query}"*

Found 3 matches:

1. **src/config.ts:12**
   \`const config = { ${query}: value }\`

2. **src/telegram/bot.ts:25**
   \`// Relevant code containing ${query}\`

3. **README.md:34**
   \`Documentation about ${query}\`

_This is a mock response. Real search will use grep/ripgrep._`;
}
