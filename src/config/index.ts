import 'dotenv/config';

export const config = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENVIRONMENT: process.env.ENVIRONMENT || 'development',
  TELEGRAM: {
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  OLLAMA: {
    BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    MODEL: process.env.OLLAMA_MODEL || 'gemma4:e2b',
  },
} as const;

if (!config.TELEGRAM.BOT_TOKEN) {
  console.error('ERROR: TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}
