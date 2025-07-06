import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Helper function to skip rate limiting for development assets
const skipDevAssets = (req: Request) => {
  const url = req.url;
  // Skip rate limiting for Vite dev assets and static files
  if (url.includes('/@fs/') || 
      url.includes('/@vite/') || 
      url.includes('/node_modules/') ||
      url.includes('/src/') ||
      url.includes('/assets/') ||
      url.includes('.js') ||
      url.includes('.css') ||
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.jpeg') ||
      url.includes('.webp') ||
      url.includes('.svg') ||
      url.includes('.ico') ||
      url.includes('.woff') ||
      url.includes('.woff2') ||
      url.includes('.ttf') ||
      url.includes('.eot')) {
    return true;
  }
  return false;
};

// General API rate limiting (only for actual API endpoints)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDevAssets
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API search rate limiting to prevent abuse
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 searches per minute
  message: {
    error: 'Too many search requests, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// User creation rate limiting
export const createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 account creations per hour
  message: {
    error: 'Too many accounts created from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiting
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 uploads per 15 minutes
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});