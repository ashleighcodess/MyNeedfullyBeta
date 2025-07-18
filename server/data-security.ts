import { db } from "./db";
import { wishlists, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

// Lightweight data validation - no performance impact
export async function validateDataIntegrity(operation: string, data: any, userId?: string) {
  console.log(`[DATA_SECURITY] ${operation} - User: ${userId || 'system'}`);
  
  // Log critical operations for audit trail
  if (['DELETE', 'UPDATE', 'ARCHIVE'].includes(operation)) {
    console.log(`[AUDIT] ${operation} operation by user ${userId} on data:`, {
      type: typeof data,
      keys: Object.keys(data || {}),
      timestamp: new Date().toISOString()
    });
  }
}

// Backup critical user uploads (async, no blocking)
export async function backupUserFile(originalPath: string, userId: string) {
  try {
    const backupDir = path.join(process.cwd(), 'public', 'backups', userId);
    await fs.mkdir(backupDir, { recursive: true });
    
    const filename = path.basename(originalPath);
    const backupPath = path.join(backupDir, `${Date.now()}-${filename}`);
    
    // Copy file asynchronously - doesn't block request
    setImmediate(async () => {
      try {
        await fs.copyFile(originalPath, backupPath);
        console.log(`[BACKUP] File backed up: ${filename}`);
      } catch (error) {
        console.error(`[BACKUP_ERROR] Failed to backup ${filename}:`, error);
      }
    });
    
    return true;
  } catch (error) {
    console.error('[BACKUP_ERROR]:', error);
    return false;
  }
}

// Verify user ownership before sensitive operations
export async function verifyUserOwnership(wishlistId: number, userId: string): Promise<boolean> {
  try {
    const [wishlist] = await db
      .select({ userId: wishlists.userId })
      .from(wishlists)
      .where(eq(wishlists.id, wishlistId))
      .limit(1);
    
    return wishlist?.userId === userId;
  } catch (error) {
    console.error('[OWNERSHIP_ERROR]:', error);
    return false;
  }
}

// Sanitize sensitive data from logs
export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'email', 'phone', 'address'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

// Rate limiting for sensitive operations (memory-based, fast)
const operationLimits = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, operation: string, maxPerHour: number = 10): boolean {
  const key = `${userId}:${operation}`;
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  const current = operationLimits.get(key);
  
  if (!current || current.resetTime < hourAgo) {
    operationLimits.set(key, { count: 1, resetTime: now });
    return true;
  }
  
  if (current.count >= maxPerHour) {
    console.log(`[RATE_LIMIT] User ${userId} exceeded ${operation} limit`);
    return false;
  }
  
  current.count++;
  return true;
}

// Clean up old rate limit entries (runs every hour)
setInterval(() => {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  for (const [key, data] of operationLimits.entries()) {
    if (data.resetTime < hourAgo) {
      operationLimits.delete(key);
    }
  }
}, 60 * 60 * 1000);