import { Router } from 'express';
import { AiController } from '../controllers/ai.controller.js';
import { aiApiLimiter } from '../middleware/rateLimiter.js';

export const aiRouter = Router();

aiRouter.post('/explain-repository', aiApiLimiter, AiController.explainRepository);
aiRouter.post('/evaluate-issue', aiApiLimiter, AiController.evaluateIssue);
aiRouter.post('/explain-issue', aiApiLimiter, AiController.explainIssue);
aiRouter.post('/contribution-plan', aiApiLimiter, AiController.contributionPlan);
aiRouter.post('/generate-comment', aiApiLimiter, AiController.generateComment);
aiRouter.post('/chat', aiApiLimiter, AiController.chat);
aiRouter.post('/explain-relationship', aiApiLimiter, AiController.explainRelationship);
