import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

// Response compression middleware
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Good balance between compression and CPU usage
  threshold: 1024, // Only compress responses larger than 1KB
});

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ 
          error: 'Request timeout',
          message: 'The server took too long to respond'
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

// Response time tracking
export const responseTimeTracker = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time before headers are sent
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    const responseTime = Date.now() - startTime;
    
    // Add response time header before sending response
    if (!res.headersSent) {
      res.set('X-Response-Time', `${responseTime}ms`);
    }
    
    // Log slow requests
    if (responseTime > 2000) {
      console.warn(`[SLOW_REQUEST] ${req.method} ${req.path} - ${responseTime}ms`);
    }
    
    // Call original end method
    originalEnd.apply(this, args);
  };
  
  next();
};

// Memory usage monitoring
export const memoryMonitor = (req: Request, res: Response, next: NextFunction) => {
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  
  // Log if memory usage is high
  if (heapUsedMB > 500) { // 500MB threshold
    console.warn(`[HIGH_MEMORY] Heap usage: ${heapUsedMB}MB on ${req.method} ${req.path}`);
  }
  
  next();
};

// Database connection pooling optimization
export const dbConnectionOptimizer = (req: Request, res: Response, next: NextFunction) => {
  // Set longer timeout for database operations
  res.setTimeout(45000); // 45 seconds for DB operations
  
  next();
};

// Cache headers for static assets
export const staticCacheHeaders = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|woff|woff2|svg)$/)) {
    // Cache static assets for 1 year
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.path.startsWith('/api/')) {
    // API responses should not be cached by default
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  
  next();
};