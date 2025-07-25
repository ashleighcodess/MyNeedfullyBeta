import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { startFileIntegrityMonitoring } from "./file-integrity-check";
import path from "path";

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false, limit: '25mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Serve static files from public directory with optimized image caching
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), {
  maxAge: '1y', // Cache images for 1 year
  etag: true,
  immutable: true,
  index: false, // Don't serve directory listings
  setHeaders: (res, filePath) => {
    // Add aggressive caching for images
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Vary', 'Accept-Encoding');
    }
  }
}));

// Serve other static files normally
app.use(express.static(path.join(process.cwd(), 'public')));

(async () => {
  const server = await registerRoutes(app);

  // CRITICAL: Start file integrity monitoring to prevent data loss
  startFileIntegrityMonitoring();

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("🔥 CRITICAL ERROR:", {
      url: req.url,
      method: req.method,
      error: err.message,
      stack: err.stack,
      user: (req as any).user?.claims?.sub
    });
    
    if (!res.headersSent) {
      res.status(status).json({ 
        message,
        error: err.message,
        url: req.url,
        timestamp: new Date().toISOString()
      });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
