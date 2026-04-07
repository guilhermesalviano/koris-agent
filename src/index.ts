import { initBot } from './telegram/bot';
import { startCLI } from './cli/interface';
import { LoggerFactory } from './infrastructure/logger';

const logger = LoggerFactory.create();

logger.log("info", "🚀 Starting OpenCrawdi...\n");

const cliMode = process.argv.includes("--cli");

if (cliMode) {
  logger.log("info", "Mode: CLI\n");
  startCLI();
} else {
  logger.log("info", "Mode: Telegram Bot\n");
  const bot = initBot();
  logger.log("info", "✅ Bot is ready! Send a message to your bot on Telegram.\n");
  logger.log("info", "💡 Tip: Run with --cli flag to use CLI mode instead.\n");

  process.on("SIGINT", () => {
    logger.log("info", "\n👋 Shutting down gracefully...");
    bot.stopPolling();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    logger.log("info", "\n👋 Shutting down gracefully...");
    bot.stopPolling();
    process.exit(0);
  });
}