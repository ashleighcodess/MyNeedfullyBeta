import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password", { length: 255 }), // For email/password auth (bcrypt needs 60+ chars)
  authProvider: varchar("auth_provider").default("replit"), // 'replit', 'email', 'google', 'facebook'
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  location: varchar("location"),
  bio: text("bio"),
  userType: varchar("user_type").notNull().default("user"), // 'user', 'admin'
  userPreference: varchar("user_preference").default("supporter"), // 'supporter', 'creator', 'both'
  isVerified: boolean("is_verified").default(false),
  showNeedsListsLive: boolean("show_needs_lists_live").default(true),
  hideNeedsListsFromPublic: boolean("hide_needs_lists_from_public").default(false),
  showProfileInSearch: boolean("show_profile_in_search").default(true),
  allowDirectMessages: boolean("allow_direct_messages").default(true),
  showDonationHistory: boolean("show_donation_history").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  emailMarketing: boolean("email_marketing").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const wishlistStatusEnum = pgEnum("wishlist_status", ["active", "completed", "paused"]);
export const urgencyLevelEnum = pgEnum("urgency_level", ["low", "medium", "high", "urgent"]);
export const categoryEnum = pgEnum("category", [
  "disaster_recovery",
  "medical_emergency", 
  "family_crisis",
  "fire_flood_damage",
  "job_loss_financial",
  "domestic_violence",
  "homeless_housing",
  "elderly_care",
  "mental_health",
  "refugee_immigrant",
  "other"
]);

// Wishlists
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  story: text("story"), // Detailed story/background
  storyImages: text("story_images").array(), // Image paths for storytelling
  category: categoryEnum("category").notNull(),
  urgencyLevel: urgencyLevelEnum("urgency_level").default("medium"),
  status: wishlistStatusEnum("status").default("active"),
  location: varchar("location"), // City, State format
  shippingAddress: jsonb("shipping_address"), // Encrypted address object
  isPublic: boolean("is_public").default(true),
  isVerified: boolean("is_verified").default(false),
  totalItems: integer("total_items").default(0),
  fulfilledItems: integer("fulfilled_items").default(0),
  viewCount: integer("view_count").default(0),
  shareCount: integer("share_count").default(0),
  featuredUntil: timestamp("featured_until"),
  // Beneficiary fields
  isForSelf: boolean("is_for_self").default(true),
  beneficiaryName: varchar("beneficiary_name"),
  relationshipToBeneficiary: varchar("relationship_to_beneficiary"),
  beneficiaryContext: text("beneficiary_context"), // Brief explanation of situation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wishlist Items
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").references(() => wishlists.id).notNull(),
  productId: varchar("product_id"), // RainforestAPI product ID
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("USD"),
  productUrl: varchar("product_url"), // Affiliate link
  retailer: varchar("retailer"), // Amazon, Walmart, etc.
  category: categoryEnum("category").notNull(),
  quantity: integer("quantity").default(1),
  quantityFulfilled: integer("quantity_fulfilled").default(0),
  priority: integer("priority").default(1), // 1-5 scale
  isFulfilled: boolean("is_fulfilled").default(false),
  fulfilledBy: varchar("fulfilled_by").references(() => users.id),
  fulfilledAt: timestamp("fulfilled_at"),
  trackingInfo: jsonb("tracking_info"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Donations/Fulfillments
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  supporterId: varchar("supporter_id").references(() => users.id).notNull(),
  wishlistId: integer("wishlist_id").references(() => wishlists.id).notNull(),
  itemId: integer("item_id").references(() => wishlistItems.id),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("USD"),
  status: varchar("status").default("pending"), // pending, confirmed, shipped, delivered
  orderInfo: jsonb("order_info"), // Order details from retailer
  trackingNumber: varchar("tracking_number"),
  isAnonymous: boolean("is_anonymous").default(false),
  message: text("message"), // Message to recipient
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Thank You Notes
export const thankYouNotes = pgTable("thank_you_notes", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").references(() => users.id).notNull(),
  toUserId: varchar("to_user_id").references(() => users.id).notNull(),
  donationId: integer("donation_id").references(() => donations.id),
  subject: varchar("subject"),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // donation_received, item_fulfilled, thank_you, etc.
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional context data
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Price Tracking
export const priceTracking = pgTable("price_tracking", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => wishlistItems.id).notNull(),
  productId: varchar("product_id").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  lowestPrice: decimal("lowest_price", { precision: 10, scale: 2 }),
  highestPrice: decimal("highest_price", { precision: 10, scale: 2 }),
  priceHistory: jsonb("price_history"), // Array of price points with timestamps
  lastChecked: timestamp("last_checked").defaultNow(),
  alertThreshold: decimal("alert_threshold", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics Events
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type").notNull(), // page_view, search, donation, etc.
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  data: jsonb("data").notNull(), // Event-specific data
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email verification tokens
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  email: varchar("email").notNull(), // Store email in case user changes it before verification
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wishlists: many(wishlists),
  donations: many(donations),
  sentThankYouNotes: many(thankYouNotes, { relationName: "sender" }),
  receivedThankYouNotes: many(thankYouNotes, { relationName: "receiver" }),
  notifications: many(notifications),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  items: many(wishlistItems),
  donations: many(donations),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one, many }) => ({
  wishlist: one(wishlists, { fields: [wishlistItems.wishlistId], references: [wishlists.id] }),
  fulfilledByUser: one(users, { fields: [wishlistItems.fulfilledBy], references: [users.id] }),
  donations: many(donations),
  priceTracking: one(priceTracking),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  supporter: one(users, { fields: [donations.supporterId], references: [users.id] }),
  wishlist: one(wishlists, { fields: [donations.wishlistId], references: [wishlists.id] }),
  item: one(wishlistItems, { fields: [donations.itemId], references: [wishlistItems.id] }),
  thankYouNote: one(thankYouNotes),
}));

export const thankYouNotesRelations = relations(thankYouNotes, ({ one }) => ({
  from: one(users, { fields: [thankYouNotes.fromUserId], references: [users.id], relationName: "sender" }),
  to: one(users, { fields: [thankYouNotes.toUserId], references: [users.id], relationName: "receiver" }),
  donation: one(donations, { fields: [thankYouNotes.donationId], references: [donations.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const priceTrackingRelations = relations(priceTracking, ({ one }) => ({
  item: one(wishlistItems, { fields: [priceTracking.itemId], references: [wishlistItems.id] }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).partial();

export const insertWishlistSchema = createInsertSchema(wishlists).partial();

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).partial();

export const insertDonationSchema = createInsertSchema(donations).partial();

export const insertThankYouNoteSchema = createInsertSchema(thankYouNotes).partial();

export const insertNotificationSchema = createInsertSchema(notifications).partial();

export const insertPriceTrackingSchema = createInsertSchema(priceTracking).partial();

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).partial();

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).partial();

export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens).partial();

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertThankYouNote = z.infer<typeof insertThankYouNoteSchema>;
export type ThankYouNote = typeof thankYouNotes.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertPriceTracking = z.infer<typeof insertPriceTrackingSchema>;
export type PriceTracking = typeof priceTracking.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertEmailVerificationToken = z.infer<typeof insertEmailVerificationTokenSchema>;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
