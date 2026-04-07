import TelegramBot from 'node-telegram-bot-api';
import { getBot } from './bot';

export async function handleMessage(msg: TelegramBot.Message): Promise<void> {
  const bot = getBot();
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(`📨 Message from ${msg.from?.username || msg.from?.id}: ${text}`);

  // Handle commands
  if (text?.startsWith('/')) {
    await handleCommand(msg);
    return;
  }

  // Handle regular messages
  if (text) {
    await handleUserMessage(chatId, text);
  }
}

async function handleCommand(msg: TelegramBot.Message): Promise<void> {
  const bot = getBot();
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const command = text.split(' ')[0];

  switch (command) {
    case '/start':
      await bot.sendMessage(
        chatId,
        '👋 *Welcome to OpenCrawdi!*\n\n' +
          'I\'m an AI coding agent powered by Ollama. I can help you with:\n\n' +
          '• Reading and analyzing code\n' +
          '• Making file changes\n' +
          '• Running commands\n' +
          '• Answering coding questions\n\n' +
          'Just send me a message with what you need!',
        { parse_mode: 'Markdown' }
      );
      break;

    case '/help':
      await bot.sendMessage(
        chatId,
        '*Available Commands:*\n\n' +
          '/start - Welcome message\n' +
          '/help - Show this help\n' +
          '/status - Check bot status\n' +
          '/clear - Clear conversation history\n\n' +
          'Send me any message to interact with the AI agent!',
        { parse_mode: 'Markdown' }
      );
      break;

    case '/status':
      await bot.sendMessage(
        chatId,
        '✅ *Bot Status*\n\n' +
          '• Connection: Active\n' +
          '• Ollama: Connected\n' +
          '• Ready to assist!',
        { parse_mode: 'Markdown' }
      );
      break;

    case '/clear':
      // TODO: Clear conversation history for this chat
      await bot.sendMessage(chatId, '🗑️ Conversation history cleared!');
      break;

    default:
      await bot.sendMessage(
        chatId,
        '❓ Unknown command. Type /help to see available commands.'
      );
  }
}

async function handleUserMessage(chatId: number, text: string): Promise<void> {
  const bot = getBot();

  try {
    // Send typing indicator
    await bot.sendChatAction(chatId, 'typing');

    // TODO: Process message with Ollama AI
    // For now, send a simple echo response
    const response = `🤖 Received your message:\n\n"${text}"\n\n_AI processing will be implemented next!_`;

    await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error handling message:', error);
    await bot.sendMessage(
      chatId,
      '❌ Sorry, I encountered an error processing your message. Please try again.'
    );
  }
}

// Helper function to send a message with code formatting
export async function sendCode(
  chatId: number,
  code: string,
  language: string = ''
): Promise<void> {
  const bot = getBot();
  const formatted = `\`\`\`${language}\n${code}\n\`\`\``;
  await bot.sendMessage(chatId, formatted, { parse_mode: 'Markdown' });
}

// Helper function to send a message with approval buttons
export async function sendWithApproval(
  chatId: number,
  message: string,
  callbackData: string
): Promise<void> {
  const bot = getBot();
  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Approve', callback_data: `approve:${callbackData}` },
        { text: '❌ Reject', callback_data: `reject:${callbackData}` },
      ],
    ],
  };

  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: keyboard,
  });
}
