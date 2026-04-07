import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config.js';
import { handleMessage } from './handlers.js';

let bot: TelegramBot;

export function initBot(): TelegramBot {
  if (config.telegram.usePolling) {
    // Polling mode for development
    bot = new TelegramBot(config.telegram.botToken, { polling: true });
    console.log('🤖 Telegram bot started in polling mode');
  } else {
    // Webhook mode for production
    bot = new TelegramBot(config.telegram.botToken, { polling: false });
    console.log('🤖 Telegram bot initialized for webhook mode');
  }

  // Register handlers
  bot.on('message', handleMessage);

  // Error handling
  bot.on('polling_error', (error) => {
    console.error('Telegram polling error:', error);
  });

  return bot;
}

export function getBot(): TelegramBot {
  if (!bot) {
    throw new Error('Bot not initialized. Call initBot() first.');
  }
  return bot;
}

export async function setWebhook(url: string): Promise<void> {
  if (!bot) {
    throw new Error('Bot not initialized');
  }
  await bot.setWebHook(`${url}/webhook/telegram`);
  console.log(`✅ Webhook set to: ${url}/webhook/telegram`);
}

export async function deleteWebhook(): Promise<void> {
  if (!bot) {
    throw new Error('Bot not initialized');
  }
  await bot.deleteWebHook();
  console.log('✅ Webhook deleted');
}
