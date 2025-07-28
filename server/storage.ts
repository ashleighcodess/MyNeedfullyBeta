import {
  users,
  wishlists,
  wishlistItems,
  donations,
  thankYouNotes,
  notifications,
  priceTracking,
  analyticsEvents,
  passwordResetTokens,
  emailVerificationTokens,
  type User,
  type UpsertUser,
  type Wishlist,
  type WishlistWithItemCount,
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
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type EmailVerificationToken,
  type InsertEmailVerificationToken,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, sql, count, sum, gte, lte, getTableColumns } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Admin emails that should automatically get admin privileges
const ADMIN_EMAILS = [
  'ashleigh@elitewebdesign.us',
  'info@myneedfully.com'
];

// Helper function to check if an email should be automatically granted admin privileges
function shouldBeAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email?.toLowerCase());
}

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Email/Password authentication
  createUser(userData: UpsertUser): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;

  // Authentication token operations
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(id: number): Promise<void>;
  createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<EmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined>;
  markEmailVerificationTokenAsUsed(id: number): Promise<void>;

  // Wishlist operations
  createWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  getWishlist(id: number): Promise<Wishlist | undefined>;
  getWishlistWithItems(id: number): Promise<any>;
  getUserWishlists(userId: string): Promise<WishlistWithItemCount[]>;
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
  incrementWishlistShares(id: number): Promise<void>;

  // Wishlist Item operations
  addWishlistItem(item: InsertWishlistItem): Promise<WishlistItem>;
  getWishlistItems(wishlistId: number): Promise<WishlistItem[]>;
  getWishlistItem(id: number): Promise<WishlistItem | undefined>;
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
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  removeUser(id: string): Promise<void>;
  getUsersCreatedAfter(date: Date): Promise<User[]>;
  cleanupInactiveUsers(date: Date): Promise<number>;
  approveAllPendingWishlists(): Promise<number>;
  getAllWishlists(): Promise<Wishlist[]>;
  getAnalyticsInDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]>;

  // Community Impact operations
  getCommunityStats(startDate: Date, endDate: Date): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUser(userData.id);
    const isNewUser = !existingUser;
    
    // Check if this email should be automatically granted admin privileges
    if (userData.email && shouldBeAdmin(userData.email)) {
      userData.userType = 'admin';
      console.log(`🔐 AUTO-ADMIN: Granting admin privileges to ${userData.email}`);
    }
    
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
    
    // Send welcome email for new users
    if (isNewUser && user.email && user.firstName) {
      console.log(`📧 Attempting to send welcome email to ${user.email} (OAuth user)`);
      const { emailService } = await import('./email-service');
      // Fire and forget - don't block user creation if email fails
      emailService.sendWelcomeEmail(user.email, user.firstName).catch(error => {
        console.error('❌ Failed to send welcome email to OAuth user:', error);
      });
    } else if (isNewUser) {
      console.log('⚠️ No welcome email sent - missing email or firstName for OAuth user');
    }
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      console.log('🔄 CRITICAL STORAGE updateUser called:', { id, updates });
      console.log('🔄 User ID type:', typeof id, 'length:', id?.length);
      console.log('🔄 Updates type:', typeof updates, 'keys:', Object.keys(updates));
      
      if (!id || typeof id !== 'string') {
        throw new Error(`Invalid user ID: ${id}`);
      }
      
      if (!updates || typeof updates !== 'object') {
        throw new Error(`Invalid updates object: ${updates}`);
      }
      
      const [user] = await db
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
        
      console.log('✅ CRITICAL Storage updateUser success:', { id: user?.id, email: user?.email });
      
      if (!user) {
        throw new Error(`No user found with ID: ${id}`);
      }
      
      return user;
    } catch (error) {
      console.error('❌ CRITICAL Storage updateUser ERROR:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error name:', error?.name);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error stack:', error?.stack);
      console.error('❌ Input ID:', id);
      console.error('❌ Input updates:', updates);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    // Delete user - related records should cascade delete based on foreign key constraints
    await db.delete(users).where(eq(users.id, id));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Email/Password authentication methods
  async createUser(userData: UpsertUser): Promise<User> {
    // Password should already be hashed by the caller
    // Do not hash again to avoid double hashing
    
    // Generate unique ID for email users
    if (!userData.id) {
      userData.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    // Set auth provider if not already set
    if (!userData.authProvider) {
      userData.authProvider = 'email';
    }
    
    // Check if this email should be automatically granted admin privileges
    if (userData.email && shouldBeAdmin(userData.email)) {
      userData.userType = 'admin';
      console.log(`🔐 AUTO-ADMIN: Granting admin privileges to ${userData.email} (email signup)`);
    }
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user || !user.password) {
      return null;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }
    
    return user;
  }

  // Authentication token operations
  async createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values(tokenData).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [tokenRecord] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return tokenRecord;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await db.update(passwordResetTokens)
      .set({ isUsed: true })
      .where(eq(passwordResetTokens.token, token));
  }

  async createEmailVerificationToken(tokenData: InsertEmailVerificationToken): Promise<EmailVerificationToken> {
    const [token] = await db.insert(emailVerificationTokens).values(tokenData).returning();
    return token;
  }

  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    const [tokenRecord] = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
    return tokenRecord;
  }

  async markEmailVerificationTokenAsUsed(id: number): Promise<void> {
    await db
      .update(emailVerificationTokens)
      .set({ isUsed: true })
      .where(eq(emailVerificationTokens.id, id));
  }

  async updateUserVerificationStatus(userId: string, isVerified: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isVerified, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Wishlist operations
  async createWishlist(wishlistData: InsertWishlist): Promise<Wishlist> {
    try {
      console.log('🔄 Storage createWishlist called:', wishlistData);
      const [wishlist] = await db.insert(wishlists).values(wishlistData).returning();
      console.log('✅ Storage createWishlist success:', { id: wishlist?.id, title: wishlist?.title });
      return wishlist;
    } catch (error) {
      console.error('❌ Storage createWishlist error:', error);
      throw error;
    }
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

  async getUserWishlists(userId: string): Promise<WishlistWithItemCount[]> {
    const results = await db
      .select({
        ...getTableColumns(wishlists),
        itemCount: sql<number>`(SELECT COUNT(*) FROM ${wishlistItems} WHERE ${wishlistItems.wishlistId} = ${wishlists.id})`
      })
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));
    
    return results as WishlistWithItemCount[];
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
    
    // CRITICAL FIX: Filter out archived (cancelled) wishlists by default
    // Only show cancelled wishlists if explicitly requested
    if (params.status && params.status === 'cancelled') {
      conditions.push(eq(wishlists.status, 'cancelled'));
    } else if (params.status) {
      conditions.push(eq(wishlists.status, params.status as any));
    } else {
      // DEFAULT: Only show active wishlists in public browse
      conditions.push(eq(wishlists.status, 'active'));
    }
    
    // Store base query conditions (status, category, etc.) separately from search conditions
    let searchConditions = [];
    
    if (params.query) {
      // Enhanced search to include user names, zip codes, states, and improved location matching
      const searchTerm = params.query.toLowerCase();
      
      // Check if query is a zip code (5 digits, optionally with -XXXX)
      const zipCodeRegex = /^\d{5}(-\d{4})?$/;
      const isZipCode = zipCodeRegex.test(searchTerm);
      
      // State mapping for enhanced state search
      const stateMap = {
        'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
        'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
        'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
        'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
        'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
        'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
        'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
        'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
        'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
        'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
      };
      
      // Check if query is a state (full name or abbreviation)
      const isFullStateName = stateMap[searchTerm] !== undefined;
      const stateAbbreviation = stateMap[searchTerm];
      const isStateAbbr = Object.values(stateMap).includes(searchTerm.toUpperCase());
      
      searchConditions = [
        // Search wishlist content
        like(wishlists.title, `%${params.query}%`),
        like(wishlists.description, `%${params.query}%`),
        like(wishlists.story, `%${params.query}%`),
        // Enhanced location search including states
        like(wishlists.location, `%${params.query}%`),
        // Search beneficiary names if applicable
        like(wishlists.beneficiaryName, `%${params.query}%`),
        // Search in shipping address JSON for cities, states, and zip codes
        sql`${wishlists.shippingAddress}::text ILIKE ${`%${params.query}%`}`
      ];
      
      // Add specific zip code searches if it's a zip code
      if (isZipCode) {
        searchConditions.push(
          sql`${wishlists.shippingAddress}->>'zipCode' ILIKE ${`%${searchTerm}%`}`,
          sql`${wishlists.shippingAddress}->>'zipCode' ILIKE ${`%${searchTerm.split('-')[0]}%`}`
        );
      }
      
      // Add enhanced state searches if it's a state name or abbreviation
      if (isFullStateName) {
        // Search for both full state name and abbreviation when user searches full name
        searchConditions.push(
          // Search for state abbreviation in shipping address
          sql`${wishlists.shippingAddress}->>'state' ILIKE ${`%${stateAbbreviation}%`}`,
          // Search for state abbreviation in location field (like "Austin, TX")
          like(wishlists.location, `%${stateAbbreviation}%`)
        );
      } else if (isStateAbbr) {
        // Search for state abbreviation in shipping address when user searches abbreviation
        searchConditions.push(
          sql`${wishlists.shippingAddress}->>'state' ILIKE ${`%${searchTerm.toUpperCase()}%`}`,
          // Also search in location field for the abbreviation
          like(wishlists.location, `%${searchTerm.toUpperCase()}%`)
        );
      }
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

    const whereClause = and(...conditions);
    
    // If there's a query, we need to join with users to search by names
    let wishlistsQuery, totalQuery;
    
    if (params.query && searchConditions.length > 0) {
      // Create enhanced search conditions that include user names
      const userSearchConditions = [
        // User name searches
        like(users.firstName, `%${params.query}%`),
        like(users.lastName, `%${params.query}%`),
        // Combined first and last name search
        sql`CONCAT(${users.firstName}, ' ', ${users.lastName}) ILIKE ${`%${params.query}%`}`,
        sql`CONCAT(${users.lastName}, ' ', ${users.firstName}) ILIKE ${`%${params.query}%`}`
      ];
      
      // Combine wishlist search conditions with user search conditions using OR
      const allSearchConditions = [
        ...searchConditions,
        ...userSearchConditions
      ];
      
      // Add the search condition to base conditions
      const allConditions = [
        ...conditions,
        or(...allSearchConditions)!
      ];
      
      const enhancedWhereClause = and(...allConditions);
      
      wishlistsQuery = db
        .select({
          id: wishlists.id,
          userId: wishlists.userId,
          title: wishlists.title,
          description: wishlists.description,
          story: wishlists.story,
          storyImages: wishlists.storyImages,
          category: wishlists.category,
          urgencyLevel: wishlists.urgencyLevel,
          status: wishlists.status,
          location: wishlists.location,
          shippingAddress: wishlists.shippingAddress,
          isPublic: wishlists.isPublic,
          isVerified: wishlists.isVerified,
          totalItems: wishlists.totalItems,
          fulfilledItems: wishlists.fulfilledItems,
          viewCount: wishlists.viewCount,
          shareCount: wishlists.shareCount,
          featuredUntil: wishlists.featuredUntil,
          isForSelf: wishlists.isForSelf,
          beneficiaryName: wishlists.beneficiaryName,
          relationshipToBeneficiary: wishlists.relationshipToBeneficiary,
          beneficiaryContext: wishlists.beneficiaryContext,
          createdAt: wishlists.createdAt,
          updatedAt: wishlists.updatedAt,
          // Include user info for display
          creatorFirstName: users.firstName,
          creatorLastName: users.lastName
        })
        .from(wishlists)
        .innerJoin(users, eq(wishlists.userId, users.id))
        .where(enhancedWhereClause)
        .orderBy(desc(wishlists.createdAt))
        .limit(params.limit || 20)
        .offset(params.offset || 0);
        
      totalQuery = db
        .select({ count: count() })
        .from(wishlists)
        .innerJoin(users, eq(wishlists.userId, users.id))
        .where(enhancedWhereClause);
    } else {
      // No query search, use original simple query
      wishlistsQuery = db
        .select()
        .from(wishlists)
        .where(whereClause)
        .orderBy(desc(wishlists.createdAt))
        .limit(params.limit || 20)
        .offset(params.offset || 0);
        
      totalQuery = db
        .select({ count: count() })
        .from(wishlists)
        .where(whereClause);
    }
    
    const [wishlistsResult, totalResult] = await Promise.all([
      wishlistsQuery,
      totalQuery
    ]);

    return {
      wishlists: wishlistsResult,
      total: totalResult[0].count,
    };
  }

  async updateWishlist(id: number, updates: Partial<Wishlist>): Promise<Wishlist> {
    console.log('💾 Storage updateWishlist called:', { id, updates });
    
    try {
      // Handle PostgreSQL array fields properly
      const updateData: any = { ...updates, updatedAt: new Date() };
      
      // Convert storyImages array to PostgreSQL array format if present
      if (updates.storyImages !== undefined) {
        if (Array.isArray(updates.storyImages)) {
          updateData.storyImages = updates.storyImages;
          console.log('📸 Story images array processed:', updateData.storyImages);
        } else {
          updateData.storyImages = [];
          console.log('📸 Story images set to empty array');
        }
      }
      
      const [wishlist] = await db
        .update(wishlists)
        .set(updateData)
        .where(eq(wishlists.id, id))
        .returning();
      
      if (!wishlist) {
        console.error('❌ No wishlist returned from update');
        throw new Error('Wishlist not found or update failed');
      }
      
      console.log('✅ Wishlist updated successfully:', { id: wishlist.id, title: wishlist.title });
      return wishlist;
    } catch (error) {
      console.error('❌ Storage updateWishlist error:', error);
      throw error;
    }
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

  async incrementWishlistShares(id: number): Promise<void> {
    await db
      .update(wishlists)
      .set({ shareCount: sql`${wishlists.shareCount} + 1` })
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

  async getWishlistItem(id: number): Promise<WishlistItem | undefined> {
    const [item] = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, id))
      .limit(1);
    return item;
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
    try {
      console.log('🔄 Storage fulfillWishlistItem called:', { id, fulfilledBy });
      
      // First get the current item to check quantity
      const [currentItem] = await db
        .select()
        .from(wishlistItems)
        .where(eq(wishlistItems.id, id));
      
      if (!currentItem) {
        console.error('❌ Item not found:', id);
        throw new Error('Item not found');
      }
      
      console.log('📦 Current item:', { 
        id: currentItem.id, 
        title: currentItem.title,
        quantity: currentItem.quantity,
        quantityFulfilled: currentItem.quantityFulfilled,
        isFulfilled: currentItem.isFulfilled
      });
      
      // Check if item can be fulfilled (not already fully fulfilled)
      const currentFulfilled = currentItem.quantityFulfilled || 0;
      const totalQuantity = currentItem.quantity || 1;
      
      if (currentFulfilled >= totalQuantity) {
        console.error('❌ Item already fully fulfilled:', { currentFulfilled, totalQuantity });
        throw new Error('Item is already fully fulfilled');
      }
      
      // Increment quantityFulfilled by 1
      const newQuantityFulfilled = currentFulfilled + 1;
      const isNowFullyFulfilled = newQuantityFulfilled >= totalQuantity;
      
      console.log('📈 Fulfillment update:', { 
        newQuantityFulfilled, 
        isNowFullyFulfilled,
        totalQuantity 
      });
      
      const [item] = await db
        .update(wishlistItems)
        .set({
          quantityFulfilled: newQuantityFulfilled,
          isFulfilled: isNowFullyFulfilled,
          fulfilledBy: isNowFullyFulfilled ? fulfilledBy : currentItem.fulfilledBy,
          fulfilledAt: isNowFullyFulfilled ? new Date() : currentItem.fulfilledAt,
          updatedAt: new Date(),
        })
        .where(eq(wishlistItems.id, id))
        .returning();

      // Only update wishlist fulfilled items count if item is now fully fulfilled
      if (isNowFullyFulfilled && !currentItem.isFulfilled) {
        const wishlistId = item.wishlistId;
        console.log('🎯 Updating wishlist fulfilled count for:', wishlistId);
        await db
          .update(wishlists)
          .set({ fulfilledItems: sql`${wishlists.fulfilledItems} + 1` })
          .where(eq(wishlists.id, wishlistId));
      }

      console.log('✅ Storage fulfillWishlistItem success:', { 
        id: item.id, 
        quantityFulfilled: item.quantityFulfilled,
        isFulfilled: item.isFulfilled 
      });
      return item;
    } catch (error) {
      console.error('❌ Storage fulfillWishlistItem error:', error);
      throw error;
    }
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

  async getUserDonations(userId: string): Promise<any[]> {
    return await db
      .select({
        id: donations.id,
        supporterId: donations.supporterId,
        wishlistId: donations.wishlistId,
        itemId: donations.itemId,
        amount: donations.amount,
        currency: donations.currency,
        status: donations.status,
        isAnonymous: donations.isAnonymous,
        message: donations.message,
        createdAt: donations.createdAt,
        updatedAt: donations.updatedAt,
        // Item details
        itemTitle: wishlistItems.title,
        itemPrice: wishlistItems.price,
        retailer: wishlistItems.retailer,
        quantity: wishlistItems.quantity,
        fulfilledAt: wishlistItems.fulfilledAt,
        // Wishlist details
        wishlistTitle: wishlists.title,
        wishlistLocation: wishlists.location,
        wishlistUserId: wishlists.userId,
        // Recipient details
        recipientFirstName: users.firstName,
        recipientLastName: users.lastName,
      })
      .from(donations)
      .leftJoin(wishlistItems, eq(donations.itemId, wishlistItems.id))
      .leftJoin(wishlists, eq(donations.wishlistId, wishlists.id))
      .leftJoin(users, eq(wishlists.userId, users.id))
      .where(eq(donations.supporterId, userId))
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

  async getUserThankYouNotes(userId: string): Promise<any[]> {
    // Get notes where user is either sender or receiver, with user names included
    const notes = await db
      .select({
        id: thankYouNotes.id,
        fromUserId: thankYouNotes.fromUserId,
        toUserId: thankYouNotes.toUserId,
        subject: thankYouNotes.subject,
        message: thankYouNotes.message,
        donationId: thankYouNotes.donationId,
        isRead: thankYouNotes.isRead,
        createdAt: thankYouNotes.createdAt,
        fromUserFirstName: sql<string>`from_user.first_name`,
        fromUserLastName: sql<string>`from_user.last_name`,
        toUserFirstName: sql<string>`to_user.first_name`,
        toUserLastName: sql<string>`to_user.last_name`,
      })
      .from(thankYouNotes)
      .leftJoin(sql`users as from_user`, sql`from_user.id = ${thankYouNotes.fromUserId}`)
      .leftJoin(sql`users as to_user`, sql`to_user.id = ${thankYouNotes.toUserId}`)
      .where(or(eq(thankYouNotes.toUserId, userId), eq(thankYouNotes.fromUserId, userId)))
      .orderBy(desc(thankYouNotes.createdAt));

    return notes;
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
    return await db.query.analyticsEvents.findMany({
      limit: 10,
      orderBy: desc(analyticsEvents.createdAt),
      where: or(
        eq(analyticsEvents.eventType, 'item_fulfilled'),
        eq(analyticsEvents.eventType, 'thank_you_sent')
      )
    });
  }

  async getCommunityStats(startDate: Date, endDate: Date): Promise<any> {
    // Count total support actions (donations + fulfillments)
    const [donationCount] = await db
      .select({ count: count() })
      .from(donations)
      .where(
        and(
          gte(donations.createdAt, startDate),
          lte(donations.createdAt, endDate)
        )
      );

    const [fulfillmentCount] = await db
      .select({ count: count() })
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.isFulfilled, true),
          gte(wishlistItems.fulfilledAt!, startDate),
          lte(wishlistItems.fulfilledAt!, endDate)
        )
      );

    // Count unique families helped (wishlists with fulfilled items)
    const [familyCount] = await db
      .selectDistinct({ userId: wishlists.userId })
      .from(wishlists)
      .innerJoin(wishlistItems, eq(wishlists.id, wishlistItems.wishlistId))
      .where(
        and(
          eq(wishlistItems.isFulfilled, true),
          gte(wishlistItems.fulfilledAt!, startDate),
          lte(wishlistItems.fulfilledAt!, endDate)
        )
      );

    // Calculate total donation value
    const [donationValue] = await db
      .select({ total: sum(donations.amount) })
      .from(donations)
      .where(
        and(
          gte(donations.createdAt, startDate),
          lte(donations.createdAt, endDate)
        )
      );

    return {
      totalSupport: donationCount.count + fulfillmentCount.count,
      itemsFulfilled: fulfillmentCount.count,
      familiesHelped: Array.isArray(familyCount) ? familyCount.length : 0,
      donationValue: donationValue.total || 0
    };
  }

  // Admin storage methods for administrative actions
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async removeUser(id: string): Promise<void> {
    try {
      // Delete user's wishlist items first
      await db.execute(sql`DELETE FROM wishlist_items WHERE wishlist_id IN (SELECT id FROM wishlists WHERE user_id = ${id})`);
      
      // Delete user's wishlists
      await db.execute(sql`DELETE FROM wishlists WHERE user_id = ${id}`);
      
      // Delete related data (safe to ignore if columns don't exist)
      try {
        await db.execute(sql`DELETE FROM analytics_events WHERE user_id = ${id}`);
      } catch (e) { /* ignore if table structure is different */ }
      
      try {
        await db.execute(sql`DELETE FROM notifications WHERE user_id = ${id}`);
      } catch (e) { /* ignore if table structure is different */ }
      
      try {
        await db.execute(sql`DELETE FROM thank_you_notes WHERE from_user_id = ${id} OR to_user_id = ${id}`);
      } catch (e) { /* ignore if table structure is different */ }
      
      try {
        await db.execute(sql`DELETE FROM donations WHERE supporter_id = ${id}`);
      } catch (e) { /* ignore if table structure is different */ }
      
      try {
        await db.execute(sql`DELETE FROM password_reset_tokens WHERE user_id = ${id}`);
      } catch (e) { /* ignore if table structure is different */ }
      
      try {
        await db.execute(sql`DELETE FROM email_verification_tokens WHERE user_id = ${id}`);
      } catch (e) { /* ignore if table structure is different */ }
      
      // Finally delete the user
      await db.execute(sql`DELETE FROM users WHERE id = ${id}`);
      
      console.log(`Successfully removed user ${id}`);
    } catch (error) {
      console.error('Error in removeUser:', error);
      throw error;
    }
  }

  async getUsersCreatedAfter(date: Date): Promise<User[]> {
    return db.select().from(users).where(gte(users.createdAt, date));
  }

  async cleanupInactiveUsers(sixMonthsAgo: Date): Promise<number> {
    // In a real system, this would identify and remove inactive users
    // For now, return 0 as we don't want to accidentally delete users
    return 0;
  }

  async approveAllPendingWishlists(): Promise<number> {
    const result = await db
      .update(wishlists)
      .set({ status: 'active' })
      .where(eq(wishlists.status, 'pending'))
      .returning();
    
    return result.length;
  }

  async getAllWishlists(): Promise<Wishlist[]> {
    return db.select().from(wishlists).orderBy(desc(wishlists.createdAt));
  }

  async getAnalyticsInDateRange(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    return db
      .select()
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.createdAt, startDate),
          lte(analyticsEvents.createdAt, endDate)
        )
      )
      .orderBy(desc(analyticsEvents.createdAt));
  }
}

export const storage = new DatabaseStorage();
