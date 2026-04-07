import { initBot } from './telegram/bot';
import { startCLI } from './cli/interface';

console.log('🚀 Starting OpenCrawdi...\n');

// Check if running in CLI mode
const cliMode = process.argv.includes('--cli');

if (cliMode) {
  // CLI Mode
  console.log('Mode: CLI\n');
  startCLI();
} else {
  // Telegram Mode
  console.log('Mode: Telegram Bot\n');
  const bot = initBot();
  console.log('✅ Bot is ready! Send a message to your bot on Telegram.\n');
  console.log('💡 Tip: Run with --cli flag to use CLI mode instead.\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    bot.stopPolling();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    bot.stopPolling();
    process.exit(0);
  });
}