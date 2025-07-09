import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  serial,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Security event types
export const securityEventTypeEnum = pgEnum("security_event_type", [
  "login_success",
  "login_failure", 
  "password_reset_request",
  "password_change",
  "email_change",
  "suspicious_activity",
  "rate_limit_exceeded",
  "unauthorized_access",
  "admin_action",
  "data_export",
  "account_deletion",
  "privilege_escalation",
  "session_hijack_attempt",
  "brute_force_attack",
  "sql_injection_attempt",
  "xss_attempt",
  "file_upload_abuse",
  "suspicious_location"
]);

export const securityThreatLevelEnum = pgEnum("security_threat_level", [
  "low",
  "medium", 
  "high",
  "critical"
]);

// Security events logging
export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  eventType: securityEventTypeEnum("event_type").notNull(),
  threatLevel: securityThreatLevelEnum("threat_level").default("low"),
  userId: varchar("user_id"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  location: varchar("location"), // City, Country from IP
  endpoint: varchar("endpoint"), // API endpoint accessed
  requestMethod: varchar("request_method"), // GET, POST, etc.
  requestPayload: jsonb("request_payload"), // Sanitized request data
  responseStatus: integer("response_status"), // HTTP status code
  errorMessage: text("error_message"),
  sessionId: varchar("session_id"),
  attemptCount: integer("attempt_count").default(1),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
});

// Failed login attempts tracking
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  email: varchar("email"),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  attemptCount: integer("attempt_count").default(1),
  isBlocked: boolean("is_blocked").default(false),
  blockedUntil: timestamp("blocked_until"),
  lastAttemptAt: timestamp("last_attempt_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suspicious IP addresses
export const suspiciousIps = pgTable("suspicious_ips", {
  id: serial("id").primaryKey(),
  ipAddress: varchar("ip_address").notNull().unique(),
  threatLevel: securityThreatLevelEnum("threat_level").default("medium"),
  reason: text("reason").notNull(),
  firstSeenAt: timestamp("first_seen_at").defaultNow(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  eventCount: integer("event_count").default(1),
  isBlocked: boolean("is_blocked").default(false),
  blockedBy: varchar("blocked_by"),
  blockedAt: timestamp("blocked_at"),
  notes: text("notes"),
});

// Active user sessions tracking
export const activeSessions = pgTable("active_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  sessionId: varchar("session_id").notNull().unique(),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: text("user_agent"),
  location: varchar("location"),
  loginAt: timestamp("login_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  endedAt: timestamp("ended_at"),
  endReason: varchar("end_reason"), // logout, timeout, forced
});

// Security alerts for admin notification
export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  threatLevel: securityThreatLevelEnum("threat_level").default("medium"),
  category: varchar("category").notNull(), // authentication, suspicious_activity, system
  affectedUserId: varchar("affected_user_id"),
  ipAddress: varchar("ip_address"),
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types for security events
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = typeof securityEvents.$inferInsert;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type InsertLoginAttempt = typeof loginAttempts.$inferInsert;
export type SuspiciousIp = typeof suspiciousIps.$inferSelect;
export type InsertSuspiciousIp = typeof suspiciousIps.$inferInsert;
export type ActiveSession = typeof activeSessions.$inferSelect;
export type InsertActiveSession = typeof activeSessions.$inferInsert;
export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type InsertSecurityAlert = typeof securityAlerts.$inferInsert;

// Zod schemas
export const insertSecurityEventSchema = createInsertSchema(securityEvents);
export const insertLoginAttemptSchema = createInsertSchema(loginAttempts);
export const insertSuspiciousIpSchema = createInsertSchema(suspiciousIps);
export const insertActiveSessionSchema = createInsertSchema(activeSessions);
export const insertSecurityAlertSchema = createInsertSchema(securityAlerts);