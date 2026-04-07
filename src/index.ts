import { initBot } from './telegram/bot.js';

console.log('🚀 Starting OpenCrawdi bot...\n');

// Initialize Telegram bot
const bot = initBot();

console.log('✅ Bot is ready! Send a message to your bot on Telegram.\n');

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