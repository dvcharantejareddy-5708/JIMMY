import { app } from './app.js';
import { config, validateEnvironment } from './config/env.js';
import { logger } from './utils/logger.js';

validateEnvironment();

const server = app.listen(config.port, () => {
  logger.info(`🚀 JIMMY Backend Server listening on http://localhost:${config.port}`);
  logger.info(`📡 Health Check available at: http://localhost:${config.port}/api/health`);
});

// Graceful Shutdown
function handleShutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down JIMMY gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
