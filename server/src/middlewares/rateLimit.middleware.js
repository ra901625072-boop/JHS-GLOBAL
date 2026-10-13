import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/apiResponse.js';

const rateLimitHandler = (message = 'Too many requests, please try again later.') => {
  return (req, res, _next, options) => {
    return errorResponse(res, message, 429, 'RATE_LIMIT_EXCEEDED', {
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    });
  };
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many requests from this IP, please try again after 15 minutes.'),
});

export const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many RFQ submissions. Please wait 1 hour or contact us directly via WhatsApp.'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many login attempts. Account temporarily locked for 15 minutes.'),
});

export const aiChatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: process.env.NODE_ENV === 'test' ? 2000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('AI inquiry message limit reached for this session. Please request a formal quote.'),
});
