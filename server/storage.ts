import {
  users,
  wishlists,
  wishlistItems,
  donations,
  thankYouNotes,
  notifications,
  priceTracking,
  analyticsEvents,
  type User,
  type UpsertUser,
  type Wishlist,
  type InsertWishlist,
  type WishlistItem,
  type InsertWishlistItem,
  type Donation,
  type InsertDonation,
  type ThankYouNote,
  type InsertThankYouNote,
  type Notification,
  type InsertNotification,
  type PriceTracking,
  type InsertPriceTracking,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Wishlist operations
  createWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  getWishlist(id: number): Promise<Wishlist | undefined>;
  getWishlistWithItems(id: number): Promise<any>;
  getUserWishlists(userId: string): Promise<Wishlist[]>;
  searchWishlists(params: {
    query?: string;
    category?: string;
    urgencyLevel?: string;
    location?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ wishlists: Wishlist[]; total: number }>;
  updateWishlist(id: number, updates: Partial<Wishlist>): Promise<Wishlist>;
  deleteWishlist(id: number): Promise<void>;
  incrementWishlistViews(id: number): Promise<void>;

  // Wishlist Item operations
  addWishlistItem(item: InsertWishlistItem): Promise<WishlistItem>;
  getWishlistItems(wishlistId: number): Promise<WishlistItem[]>;
  updateWishlistItem(id: number, updates: Partial<WishlistItem>): Promise<WishlistItem>;
  fulfillWishlistItem(id: number, fulfilledBy: string): Promise<WishlistItem>;
  deleteWishlistItem(id: number): Promise<void>;

  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonation(id: number): Promise<Donation | undefined>;
  getUserDonations(userId: string): Promise<Donation[]>;
  updateDonation(id: number, updates: Partial<Donation>): Promise<Donation>;

  // Thank You Note operations
  createThankYouNote(note: InsertThankYouNote): Promise<ThankYouNote>;
  getUserThankYouNotes(userId: string): Promise<ThankYouNote[]>;
  markThankYouNoteAsRead(id: number): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Price Tracking operations
  createPriceTracking(tracking: InsertPriceTracking): Promise<PriceTracking>;
  updatePriceTracking(itemId: number, updates: Partial<PriceTracking>): Promise<void>;
  getPriceTrackingByItem(itemId: number): Promise<PriceTracking | undefined>;

  // Analytics operations
  recordEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalytics(params: {
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
  }): Promise<any>;

  // Admin operations
  getAdminStats(): Promise<any>;
  getFeaturedWishlists(): Promise<Wishlist[]>;
  getRecentActivity(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Wishlist operations
  async createWishlist(wishlistData: InsertWishlist): Promise<Wishlist> {
    const [wishlist] = await db.insert(wishlists).values(wishlistData).returning();
    return wishlist;
  }

  async getWishlist(id: number): Promise<Wishlist | undefined> {
    const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.id, id));
    return wishlist;
  }

  async getWishlistWithItems(id: number): Promise<any> {
    const wishlist = await db.query.wishlists.findFirst({
      where: eq(wishlists.id, id),
      with: {
        user: true,
        items: true,
      },
    });
    return wishlist;
  }

  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    return await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));
  }

  async searchWishlists(params: {
    query?: string;
    category?: string;
    urgencyLevel?: string;
    location?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ wishlists: Wishlist[]; total: number }> {
    const conditions = [eq(wishlists.isPublic, true)];
    
    if (params.query) {
      conditions.push(
        or(
          like(wishlists.title, `%${params.query}%`),
          like(wishlists.description, `%${params.query}%`)
        )!
      );
    }
    
    if (params.category) {
      conditions.push(eq(wishlists.category, params.category as any));
    }
    
    if (params.urgencyLevel) {
      conditions.push(eq(wishlists.urgencyLevel, params.urgencyLevel as any));
    }
    
    if (params.location) {
      conditions.push(like(wishlists.location, `%${params.location}%`));
    }
    
    if (params.status) {
      conditions.push(eq(wishlists.status, params.status as any));
    }

    const whereClause = and(...conditions);
    
    const [wishlistsResult, totalResult] = await Promise.all([
      db
        .select()
        .from(wishlists)
        .where(whereClause)
        .orderBy(desc(wishlists.createdAt))
        .limit(params.limit || 20)
        .offset(params.offset || 0),
      db
        .select({ count: count() })
        .from(wishlists)
        .where(whereClause)
    ]);

    return {
      wishlists: wishlistsResult,
      total: totalResult[0].count,
    };
  }

  async updateWishlist(id: number, updates: Partial<Wishlist>): Promise<Wishlist> {
    const [wishlist] = await db
      .update(wishlists)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(wishlists.id, id))
      .returning();
    return wishlist;
  }

  async deleteWishlist(id: number): Promise<void> {
    await db.delete(wishlists).where(eq(wishlists.id, id));
  }

  async incrementWishlistViews(id: number): Promise<void> {
    await db
      .update(wishlists)
      .set({ viewCount: sql`${wishlists.viewCount} + 1` })
      .where(eq(wishlists.id, id));
  }

  // Wishlist Item operations
  async addWishlistItem(itemData: InsertWishlistItem): Promise<WishlistItem> {
    const [item] = await db.insert(wishlistItems).values(itemData).returning();
    
    // Update wishlist total items count
    await db
      .update(wishlists)
      .set({ totalItems: sql`${wishlists.totalItems} + 1` })
      .where(eq(wishlists.id, itemData.wishlistId));
    
    return item;
  }

  async getWishlistItems(wishlistId: number): Promise<WishlistItem[]> {
    return await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.wishlistId, wishlistId))
      .orderBy(asc(wishlistItems.priority), desc(wishlistItems.createdAt));
  }

  async updateWishlistItem(id: number, updates: Partial<WishlistItem>): Promise<WishlistItem> {
    const [item] = await db
      .update(wishlistItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(wishlistItems.id, id))
      .returning();
    return item;
  }

  async fulfillWishlistItem(id: number, fulfilledBy: string): Promise<WishlistItem> {
    const [item] = await db
      .update(wishlistItems)
      .set({
        isFulfilled: true,
        fulfilledBy,
        fulfilledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(wishlistItems.id, id))
      .returning();

    // Update wishlist fulfilled items count
    const wishlistId = item.wishlistId;
    await db
      .update(wishlists)
      .set({ fulfilledItems: sql`${wishlists.fulfilledItems} + 1` })
      .where(eq(wishlists.id, wishlistId));

    return item;
  }

  async deleteWishlistItem(id: number): Promise<void> {
    const item = await db.select().from(wishlistItems).where(eq(wishlistItems.id, id));
    if (item[0]) {
      await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
      
      // Update wishlist total items count
      await db
        .update(wishlists)
        .set({ totalItems: sql`${wishlists.totalItems} - 1` })
        .where(eq(wishlists.id, item[0].wishlistId));
    }
  }

  // Donation operations
  async createDonation(donationData: InsertDonation): Promise<Donation> {
    const [donation] = await db.insert(donations).values(donationData).returning();
    return donation;
  }

  async getDonation(id: number): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id));
    return donation;
  }

  async getUserDonations(userId: string): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.donorId, userId))
      .orderBy(desc(donations.createdAt));
  }

  async updateDonation(id: number, updates: Partial<Donation>): Promise<Donation> {
    const [donation] = await db
      .update(donations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(donations.id, id))
      .returning();
    return donation;
  }

  // Thank You Note operations
  async createThankYouNote(noteData: InsertThankYouNote): Promise<ThankYouNote> {
    const [note] = await db.insert(thankYouNotes).values(noteData).returning();
    return note;
  }

  async getUserThankYouNotes(userId: string): Promise<ThankYouNote[]> {
    return await db
      .select()
      .from(thankYouNotes)
      .where(eq(thankYouNotes.toUserId, userId))
      .orderBy(desc(thankYouNotes.createdAt));
  }

  async markThankYouNoteAsRead(id: number): Promise<void> {
    await db
      .update(thankYouNotes)
      .set({ isRead: true })
      .where(eq(thankYouNotes.id, id));
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Price Tracking operations
  async createPriceTracking(trackingData: InsertPriceTracking): Promise<PriceTracking> {
    const [tracking] = await db.insert(priceTracking).values(trackingData).returning();
    return tracking;
  }

  async updatePriceTracking(itemId: number, updates: Partial<PriceTracking>): Promise<void> {
    await db
      .update(priceTracking)
      .set(updates)
      .where(eq(priceTracking.itemId, itemId));
  }

  async getPriceTrackingByItem(itemId: number): Promise<PriceTracking | undefined> {
    const [tracking] = await db
      .select()
      .from(priceTracking)
      .where(eq(priceTracking.itemId, itemId));
    return tracking;
  }

  // Analytics operations
  async recordEvent(eventData: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [event] = await db.insert(analyticsEvents).values(eventData).returning();
    return event;
  }

  async getAnalytics(params: {
    startDate?: Date;
    endDate?: Date;
    eventType?: string;
  }): Promise<any> {
    const conditions = [];
    
    if (params.startDate) {
      conditions.push(sql`${analyticsEvents.createdAt} >= ${params.startDate}`);
    }
    
    if (params.endDate) {
      conditions.push(sql`${analyticsEvents.createdAt} <= ${params.endDate}`);
    }
    
    if (params.eventType) {
      conditions.push(eq(analyticsEvents.eventType, params.eventType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count(),
        date: sql`DATE(${analyticsEvents.createdAt})`.as('date'),
      })
      .from(analyticsEvents)
      .where(whereClause)
      .groupBy(analyticsEvents.eventType, sql`DATE(${analyticsEvents.createdAt})`)
      .orderBy(sql`DATE(${analyticsEvents.createdAt})`);
  }

  // Admin operations
  async getAdminStats(): Promise<any> {
    const [userStats] = await db.select({ count: count() }).from(users);
    const [wishlistStats] = await db.select({ count: count() }).from(wishlists);
    const [donationStats] = await db
      .select({ 
        count: count(),
        total: sum(donations.amount)
      })
      .from(donations);
    
    return {
      totalUsers: userStats.count,
      totalWishlists: wishlistStats.count,
      totalDonations: donationStats.count,
      totalDonationAmount: donationStats.total || 0,
    };
  }

  async getFeaturedWishlists(): Promise<Wishlist[]> {
    return await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.isPublic, true),
          sql`${wishlists.featuredUntil} > NOW()`
        )
      )
      .orderBy(desc(wishlists.featuredUntil))
      .limit(6);
  }

  async getRecentActivity(): Promise<any[]> {
    return await db.query.donations.findMany({
      limit: 10,
      orderBy: desc(donations.createdAt),
      with: {
        donor: {
          columns: { firstName: true, lastName: true }
        },
        wishlist: {
          columns: { title: true }
        },
        item: {
          columns: { title: true }
        }
      }
    });
  }
}

export const storage = new DatabaseStorage();
