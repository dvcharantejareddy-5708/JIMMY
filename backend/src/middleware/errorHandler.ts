import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ApiResponse } from '../types/index.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response<ApiResponse<never>>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  logger.error(`Unhandled error at ${req.method} ${req.path}:`, err);

  const statusCode = err.statusCode || (err.response?.status ? err.response.status : 500);
  const message = err.message || 'An unexpected server error occurred.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      // Do not expose stack trace to user in production
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
}
