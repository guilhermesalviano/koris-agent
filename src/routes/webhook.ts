import { Router, type Request, type Response } from 'express';
import { getBot } from '../telegram/bot';

export const webhookRouter: Router = Router();

// Telegram webhook endpoint
webhookRouter.post('/telegram', async (req: Request, res: Response) => {
  try {
    const bot = getBot();
    
    // Process the update
    await bot.processUpdate(req.body);
    
    // Telegram expects a 200 OK response
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Health check for webhook
webhookRouter.get('/telegram/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
