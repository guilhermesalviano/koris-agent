import 'dotenv/config';

export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.1',
  },
} as const;

// Validate required configuration
if (!config.telegram.botToken) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}
