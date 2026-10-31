import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { generalApiLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

authRouter.get('/github/url', generalApiLimiter, AuthController.getAuthUrl);
authRouter.get('/github/callback', AuthController.handleCallback);
authRouter.get('/github/status', generalApiLimiter, AuthController.getStatus);
authRouter.get('/github/repos', generalApiLimiter, AuthController.getAuthorizedRepos);
authRouter.post('/github/disconnect', generalApiLimiter, AuthController.disconnect);
