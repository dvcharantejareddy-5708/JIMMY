import { Router, Request, Response } from 'express';
import { config } from '../config/env.js';
import { GemmaService } from '../services/gemma/gemma.service.js';
import { GraphifyService } from '../services/graphify/graphify.service.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req: Request, res: Response) => {
  const graphifyStatus = await GraphifyService.checkAvailability();

  res.status(200).json({
    status: 'healthy',
    product: 'JIMMY',
    category: 'Open Source Assistant',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      gemma4: {
        configured: GemmaService.isConfigured(),
        model: config.gemmaModel,
      },
      graphify: {
        available: graphifyStatus.available,
        version: graphifyStatus.version,
      },
      github: {
        tokenConfigured: Boolean(config.githubToken),
      },
    },
  });
});
