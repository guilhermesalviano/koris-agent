// import { ILogger } from '@/infrastructure/logger';
import { handleCommand as handleCentralizedCommand, isCommand } from './commands';
import { listDirectory } from '../sub-instructions/list-directory';
import { readFile } from '../sub-instructions/read-file';
import { detectInstruction } from '../sub-instructions/detect-instruction';
import { Instruction } from '../types';

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

/**
 * Handle detected instructions with mock implementations
 */
async function handleInstruction(instruction: Instruction, originalMessage: string): Promise<string> {
  switch (instruction.type) {
    case 'read_file':
      return readFile(instruction.params);

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
