import rateLimit from 'express-rate-limit';

// General API rate limiter: 120 requests per 15 minutes per IP
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again in a few minutes.',
    },
  },
});

// AI rate limiter: 40 requests per 15 minutes per IP
export const aiApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI request limit reached for this session. Please wait a moment before sending more requests.',
    },
  },
});
