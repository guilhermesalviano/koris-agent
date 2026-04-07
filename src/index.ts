import express from 'express';
import { config } from './config';
import { initBot, setWebhook } from './telegram/bot';
import { webhookRouter } from './routes/webhook';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'OpenCrawdi API is running!',
    timestamp: new Date().toISOString(),
  });
});

app.use('/webhook', webhookRouter);

// Initialize Telegram bot
const bot = initBot();

// Start server
app.listen(config.port, async () => {
  console.log(`🚀 Server is running on http://localhost:${config.port}`);
  
  // Set webhook if not in polling mode
  if (!config.telegram.usePolling && config.telegram.webhookUrl) {
    try {
      await setWebhook(config.telegram.webhookUrl);
    } catch (error) {
      console.error('Failed to set webhook:', error);
    }
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});