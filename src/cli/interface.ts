import readline from 'readline';
import { processUserMessage } from '../agent/processor';

export function startCLI(): void {
  console.log('🖥️  CLI Mode started. Type your messages or commands:\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'You: ',
  });

  rl.prompt();

  rl.on('line', async (input: string) => {
    const trimmed = input.trim();

    if (!trimmed) {
      rl.prompt();
      return;
    }

    // Handle exit
    if (trimmed === '/exit' || trimmed === '/quit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      process.exit(0);
      return;
    }

    try {
      // Process the message
      const response = await processUserMessage(trimmed, 'cli');
      
      // Display response
      console.log(`\nAgent: ${response}\n`);
    } catch (error) {
      console.error('Error:', error);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n👋 CLI closed.');
    process.exit(0);
  });
}
