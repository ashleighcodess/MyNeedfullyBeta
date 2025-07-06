import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

// CORS configuration for production
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://myneedfully.app', 'https://www.myneedfully.app']
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://apis.google.com",
        "https://www.google.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "https://m.media-amazon.com",
        "https://i5.walmartimages.com",
        "https://target.scene7.com",
        "https://replit.com",
      ],
      connectSrc: [
        "'self'",
        "https://api.replit.com",
        "https://replit.com",
        "wss:",
        "https:",
      ],
      frameSrc: [
        "'self'",
        "https://www.google.com",
      ],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters and scripts
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

// Request logging middleware for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log suspicious activity
    if (res.statusCode >= 400 || duration > 5000) {
      console.log(`[SECURITY] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
    }
    
    // Log failed authentication attempts
    if (req.path.includes('/auth') && res.statusCode >= 400) {
      console.warn(`[AUTH_FAILURE] ${req.method} ${req.path} - ${res.statusCode} - IP: ${req.ip}`);
    }
  });
  
  next();
};

// File upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
      });
    }
    
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 10MB.' 
      });
    }
  }
  
  next();
};