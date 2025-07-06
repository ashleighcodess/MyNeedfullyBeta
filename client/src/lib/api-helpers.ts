import { UserResponse, WishlistResponse, NotificationResponse, AdminStatsResponse } from "@/shared/types";

// Type guards for API responses
export function isUser(data: unknown): data is UserResponse {
  return data !== null && typeof data === 'object' && 'id' in data!;
}

export function isUserArray(data: unknown): data is UserResponse[] {
  return Array.isArray(data) && (data.length === 0 || isUser(data[0]));
}

export function isWishlist(data: unknown): data is WishlistResponse {
  return data !== null && typeof data === 'object' && 'id' in data! && 'title' in data!;
}

export function isWishlistArray(data: unknown): data is WishlistResponse[] {
  return Array.isArray(data) && (data.length === 0 || isWishlist(data[0]));
}

export function isNotificationArray(data: unknown): data is NotificationResponse[] {
  return Array.isArray(data) && (data.length === 0 || (data[0] && typeof data[0] === 'object' && 'id' in data[0]));
}

export function isAdminStats(data: unknown): data is AdminStatsResponse {
  return data !== null && typeof data === 'object' && 'totalUsers' in data!;
}

// Safe accessors with defaults
export function safeUser(data: unknown): UserResponse | null {
  return isUser(data) ? data : null;
}

export function safeUserArray(data: unknown): UserResponse[] {
  return isUserArray(data) ? data : [];
}

export function safeWishlistArray(data: unknown): WishlistResponse[] {
  return isWishlistArray(data) ? data : [];
}

export function safeNotificationArray(data: unknown): NotificationResponse[] {
  return isNotificationArray(data) ? data : [];
}

export function safeAdminStats(data: unknown): AdminStatsResponse | null {
  return isAdminStats(data) ? data : null;
}

// Helper for handling API response arrays
export function ensureArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? data : [];
}

// Helper for safe property access
export function safeProp<T>(obj: unknown, prop: string, defaultValue: T): T {
  if (obj && typeof obj === 'object' && prop in obj) {
    const value = (obj as any)[prop];
    return value !== undefined && value !== null ? value : defaultValue;
  }
  return defaultValue;
}