import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { eq, desc, and, gte, count, sql } from 'drizzle-orm';
import {
  securityEvents,
  loginAttempts,
  suspiciousIps,
  activeSessions,
  securityAlerts,
  type InsertSecurityEvent,
  type InsertLoginAttempt,
  type InsertSuspiciousIp,
  type InsertActiveSession,
  type InsertSecurityAlert,
} from '@shared/security-schema';

export class SecurityMonitor {
  // Log security events
  static async logSecurityEvent(eventData: InsertSecurityEvent): Promise<void> {
    try {
      await db.insert(securityEvents).values({
        ...eventData,
        createdAt: new Date(),
      });

      // Check if this should trigger an alert
      await this.checkForSecurityAlerts(eventData);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Track login attempts
  static async trackLoginAttempt(email: string, ipAddress: string, userAgent: string, success: boolean): Promise<void> {
    try {
      if (!success) {
        // Check existing attempts from this IP
        const [existingAttempt] = await db
          .select()
          .from(loginAttempts)
          .where(and(
            eq(loginAttempts.ipAddress, ipAddress),
            gte(loginAttempts.lastAttemptAt, new Date(Date.now() - 15 * 60 * 1000)) // Last 15 minutes
          ))
          .limit(1);

        if (existingAttempt) {
          // Update existing attempt
          await db
            .update(loginAttempts)
            .set({
              attemptCount: existingAttempt.attemptCount + 1,
              lastAttemptAt: new Date(),
              isBlocked: existingAttempt.attemptCount + 1 >= 5, // Block after 5 attempts
              blockedUntil: existingAttempt.attemptCount + 1 >= 5 
                ? new Date(Date.now() + 60 * 60 * 1000) // Block for 1 hour
                : null,
            })
            .where(eq(loginAttempts.id, existingAttempt.id));

          // Log security event for repeated failures
          if (existingAttempt.attemptCount + 1 >= 3) {
            await this.logSecurityEvent({
              eventType: existingAttempt.attemptCount + 1 >= 5 ? 'brute_force_attack' : 'login_failure',
              threatLevel: existingAttempt.attemptCount + 1 >= 5 ? 'high' : 'medium',
              ipAddress,
              userAgent,
              attemptCount: existingAttempt.attemptCount + 1,
              metadata: { email, consecutiveFailures: true },
            });
          }
        } else {
          // Create new attempt record
          await db.insert(loginAttempts).values({
            email,
            ipAddress,
            userAgent,
            attemptCount: 1,
            lastAttemptAt: new Date(),
          });
        }
      } else {
        // Successful login - clear any existing failed attempts
        await db
          .delete(loginAttempts)
          .where(eq(loginAttempts.ipAddress, ipAddress));
      }
    } catch (error) {
      console.error('Failed to track login attempt:', error);
    }
  }

  // Check for suspicious activity patterns
  static async checkForSecurityAlerts(eventData: InsertSecurityEvent): Promise<void> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Check for rapid repeated failures from same IP
      if (eventData.eventType === 'login_failure' && eventData.ipAddress) {
        const recentFailures = await db
          .select({ count: count() })
          .from(securityEvents)
          .where(and(
            eq(securityEvents.eventType, 'login_failure'),
            eq(securityEvents.ipAddress, eventData.ipAddress),
            gte(securityEvents.createdAt, oneHourAgo)
          ));

        if (recentFailures[0]?.count >= 10) {
          await this.createSecurityAlert({
            title: 'Potential Brute Force Attack',
            description: `Multiple login failures detected from IP ${eventData.ipAddress}`,
            threatLevel: 'high',
            category: 'authentication',
            ipAddress: eventData.ipAddress,
            metadata: { failureCount: recentFailures[0].count },
          });

          // Add IP to suspicious list
          await this.markIpAsSuspicious(
            eventData.ipAddress,
            'high',
            `Brute force attack detected - ${recentFailures[0].count} failures in 1 hour`
          );
        }
      }

      // Check for suspicious admin actions
      if (eventData.eventType === 'admin_action' && eventData.threatLevel === 'high') {
        await this.createSecurityAlert({
          title: 'Critical Admin Action',
          description: `High-risk admin action performed: ${eventData.errorMessage || 'Unknown action'}`,
          threatLevel: 'critical',
          category: 'system',
          affectedUserId: eventData.userId,
          ipAddress: eventData.ipAddress,
          metadata: eventData.metadata,
        });
      }

      // Check for rate limit violations
      if (eventData.eventType === 'rate_limit_exceeded' && eventData.ipAddress) {
        const recentViolations = await db
          .select({ count: count() })
          .from(securityEvents)
          .where(and(
            eq(securityEvents.eventType, 'rate_limit_exceeded'),
            eq(securityEvents.ipAddress, eventData.ipAddress),
            gte(securityEvents.createdAt, oneHourAgo)
          ));

        if (recentViolations[0]?.count >= 5) {
          await this.markIpAsSuspicious(
            eventData.ipAddress,
            'medium',
            'Repeated rate limit violations'
          );
        }
      }
    } catch (error) {
      console.error('Failed to check for security alerts:', error);
    }
  }

  // Create security alert
  static async createSecurityAlert(alertData: InsertSecurityAlert): Promise<void> {
    try {
      await db.insert(securityAlerts).values({
        ...alertData,
        createdAt: new Date(),
      });
      console.log(`🚨 Security Alert: ${alertData.title} - ${alertData.threatLevel}`);
    } catch (error) {
      console.error('Failed to create security alert:', error);
    }
  }

  // Mark IP as suspicious
  static async markIpAsSuspicious(ipAddress: string, threatLevel: 'low' | 'medium' | 'high' | 'critical', reason: string): Promise<void> {
    try {
      const [existing] = await db
        .select()
        .from(suspiciousIps)
        .where(eq(suspiciousIps.ipAddress, ipAddress))
        .limit(1);

      if (existing) {
        // Update existing record
        await db
          .update(suspiciousIps)
          .set({
            threatLevel,
            reason,
            lastSeenAt: new Date(),
            eventCount: existing.eventCount + 1,
          })
          .where(eq(suspiciousIps.id, existing.id));
      } else {
        // Create new record
        await db.insert(suspiciousIps).values({
          ipAddress,
          threatLevel,
          reason,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
          eventCount: 1,
        });
      }
    } catch (error) {
      console.error('Failed to mark IP as suspicious:', error);
    }
  }

  // Track active sessions
  static async trackSession(userId: string, sessionId: string, ipAddress: string, userAgent: string): Promise<void> {
    try {
      // Check for existing session
      const [existing] = await db
        .select()
        .from(activeSessions)
        .where(eq(activeSessions.sessionId, sessionId))
        .limit(1);

      if (existing) {
        // Update last activity
        await db
          .update(activeSessions)
          .set({
            lastActivityAt: new Date(),
          })
          .where(eq(activeSessions.id, existing.id));
      } else {
        // Create new session record
        await db.insert(activeSessions).values({
          userId,
          sessionId,
          ipAddress,
          userAgent,
          loginAt: new Date(),
          lastActivityAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to track session:', error);
    }
  }

  // Get security dashboard data
  static async getSecurityDashboard() {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Recent security events
      const recentEvents = await db
        .select()
        .from(securityEvents)
        .where(gte(securityEvents.createdAt, last24Hours))
        .orderBy(desc(securityEvents.createdAt))
        .limit(50);

      // Active alerts
      const activeAlerts = await db
        .select()
        .from(securityAlerts)
        .where(eq(securityAlerts.isResolved, false))
        .orderBy(desc(securityAlerts.createdAt))
        .limit(20);

      // Suspicious IPs
      const suspiciousIpList = await db
        .select()
        .from(suspiciousIps)
        .where(eq(suspiciousIps.isBlocked, false))
        .orderBy(desc(suspiciousIps.lastSeenAt))
        .limit(20);

      // Active sessions
      const activeSessionsCount = await db
        .select({ count: count() })
        .from(activeSessions)
        .where(and(
          eq(activeSessions.isActive, true),
          gte(activeSessions.lastActivityAt, new Date(now.getTime() - 30 * 60 * 1000)) // Active in last 30 min
        ));

      // Security metrics
      const securityMetrics = {
        totalEvents24h: recentEvents.length,
        criticalAlerts: activeAlerts.filter(alert => alert.threatLevel === 'critical').length,
        highThreatAlerts: activeAlerts.filter(alert => alert.threatLevel === 'high').length,
        suspiciousIps: suspiciousIpList.length,
        activeSessions: activeSessionsCount[0]?.count || 0,
      };

      // Event type breakdown
      const eventTypeBreakdown = await db
        .select({
          eventType: securityEvents.eventType,
          count: count(),
        })
        .from(securityEvents)
        .where(gte(securityEvents.createdAt, last7Days))
        .groupBy(securityEvents.eventType);

      return {
        recentEvents,
        activeAlerts,
        suspiciousIps: suspiciousIpList,
        metrics: securityMetrics,
        eventTypeBreakdown,
      };
    } catch (error) {
      console.error('Failed to get security dashboard data:', error);
      return {
        recentEvents: [],
        activeAlerts: [],
        suspiciousIps: [],
        metrics: {
          totalEvents24h: 0,
          criticalAlerts: 0,
          highThreatAlerts: 0,
          suspiciousIps: 0,
          activeSessions: 0,
        },
        eventTypeBreakdown: [],
      };
    }
  }

  // Check if IP is blocked
  static async isIpBlocked(ipAddress: string): Promise<boolean> {
    try {
      const [blocked] = await db
        .select()
        .from(suspiciousIps)
        .where(and(
          eq(suspiciousIps.ipAddress, ipAddress),
          eq(suspiciousIps.isBlocked, true)
        ))
        .limit(1);

      return !!blocked;
    } catch (error) {
      console.error('Failed to check if IP is blocked:', error);
      return false;
    }
  }

  // Security middleware for monitoring requests
  static securityMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      // Check if IP is blocked
      const isBlocked = await SecurityMonitor.isIpBlocked(ipAddress);
      if (isBlocked) {
        await SecurityMonitor.logSecurityEvent({
          eventType: 'unauthorized_access',
          threatLevel: 'high',
          ipAddress,
          userAgent,
          endpoint: req.path,
          requestMethod: req.method,
          responseStatus: 403,
          errorMessage: 'Blocked IP attempted access',
        });
        return res.status(403).json({ message: 'Access denied' });
      }

      // Log suspicious patterns
      if (req.body && typeof req.body === 'string') {
        const suspiciousPatterns = [
          /script.*>/i,
          /javascript:/i,
          /union.*select/i,
          /drop.*table/i,
          /<.*onload.*>/i,
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(req.body)) {
            await SecurityMonitor.logSecurityEvent({
              eventType: req.body.toLowerCase().includes('union') ? 'sql_injection_attempt' : 'xss_attempt',
              threatLevel: 'high',
              ipAddress,
              userAgent,
              endpoint: req.path,
              requestMethod: req.method,
              errorMessage: 'Suspicious payload detected',
              metadata: { pattern: pattern.source },
            });
            break;
          }
        }
      }

      next();
    };
  }
}

export default SecurityMonitor;