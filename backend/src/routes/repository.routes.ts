import { Router } from 'express';
import { RepositoryController } from '../controllers/repository.controller.js';
import { generalApiLimiter } from '../middleware/rateLimiter.js';

export const repositoryRouter = Router();

repositoryRouter.post('/analyze', generalApiLimiter, RepositoryController.analyze);
repositoryRouter.get('/issues', generalApiLimiter, RepositoryController.getIssues);
repositoryRouter.get('/issue', generalApiLimiter, RepositoryController.getIssue);
repositoryRouter.post('/tech-stack', generalApiLimiter, RepositoryController.getTechStack);
repositoryRouter.post('/installation-guide', generalApiLimiter, RepositoryController.getInstallationGuide);
