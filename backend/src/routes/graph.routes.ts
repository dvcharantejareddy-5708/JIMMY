import { Router } from 'express';
import { GraphController } from '../controllers/graph.controller.js';
import { generalApiLimiter } from '../middleware/rateLimiter.js';

export const graphRouter = Router();

graphRouter.post('/analyze', generalApiLimiter, GraphController.analyze);
graphRouter.get('/status', generalApiLimiter, GraphController.getStatus);
