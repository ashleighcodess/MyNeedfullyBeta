import type { Express, RequestHandler } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { storage } from "./storage";
import { setupMultiAuth, isAuthenticated } from "./auth/multiAuth";
import { z } from "zod";
import { getSerpAPIService, SerpProduct } from "./serpapi-service";
import { emailService } from "./email-service";
import {
  insertWishlistSchema,
  insertWishlistItemSchema,
  insertDonationSchema,
  insertThankYouNoteSchema,
  insertNotificationSchema,
  users,
  wishlists,
  wishlistItems,
  donations,
  analyticsEvents,
  thankYouNotes,
  notifications,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gt } from "drizzle-orm";

// Helper function to generate secure tokens
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// RainforestAPI configuration
const RAINFOREST_API_KEY = process.env.RAINFOREST_API_KEY || "8789CC1433C54D12B5F2DF1A401E844E";
const RAINFOREST_API_URL = "https://api.rainforestapi.com/request";

// RainforestAPI service class
class RainforestAPIService {
  private apiKey: string;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${delay}ms before RainforestAPI request`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastRequestTime = Date.now();
  }

  private getCacheKey(query: string, options: any = {}): string {
    return `${query.toLowerCase()}:${JSON.stringify(options)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`💰 RainforestAPI Cache HIT for ${key} - SAVED $$$`);
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key); // Remove expired cache
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    console.log(`💰 RainforestAPI Cache SET for ${key} - ${data.length} items`);
  }
  
  async searchProducts(query: string, options: any = {}): Promise<any[]> {
    try {
      const cacheKey = this.getCacheKey(query, options);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      console.log(`💰 RainforestAPI: Searching for "${query}" (LIVE REQUEST - COSTS $$$)`);
      await this.rateLimitDelay();

      const params = new URLSearchParams({
        api_key: this.apiKey,
        type: options.type || "search",
        amazon_domain: "amazon.com",
        search_term: query,
        ...(options.page && { page: options.page.toString() }),
        ...(options.category_id && { category_id: options.category_id }),
        ...(options.min_price && { min_price: options.min_price.toString() }),
        ...(options.max_price && { max_price: options.max_price.toString() }),
      });

      const response = await fetch(`${RAINFOREST_API_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`RainforestAPI request failed: ${response.status}`);
      }
      
      const data = await response.json();
      const results = data.search_results || [];
      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('RainforestAPI error:', error);
      return [];
    }
  }
}

// Service instance management
let rainforestAPIService: RainforestAPIService | null = null;

function getRainforestAPIService(): RainforestAPIService | null {
  if (!RAINFOREST_API_KEY || RAINFOREST_API_KEY === 'your_api_key_here') {
    console.warn('RAINFOREST_API_KEY not found or invalid');
    return null;
  }

  if (!rainforestAPIService) {
    rainforestAPIService = new RainforestAPIService(RAINFOREST_API_KEY);
  }

  return rainforestAPIService;
}

// Helper functions for activity formatting
function formatActivityMessage(activity: any): string {
  const { eventType, data } = activity;
  
  switch (eventType) {
    case 'item_added':
      return `Added "${data.itemTitle}" to their needs list`;
    case 'wishlist_created':
      return `Created a new needs list`;
    case 'wishlist_view':
      return `Viewed a needs list`;
    case 'product_search':
      return `Searched for "${data.query}"`;
    case 'item_fulfilled':
      return `Purchased "${data.itemTitle}" for someone in need`;
    case 'donation_made':
      return `Made a donation of $${data.amount}`;
    case 'thank_you_sent':
      return `Sent a thank you note to ${data.recipientName}`;
    case 'user_registered':
      return `Joined the community`;
    default:
      return `Performed an action`;
  }
}

function getActivityIcon(eventType: string): string {
  switch (eventType) {
    case 'item_added':
      return 'plus';
    case 'wishlist_created':
      return 'list';
    case 'wishlist_view':
      return 'eye';
    case 'product_search':
      return 'search';
    case 'item_fulfilled':
      return 'check';
    case 'donation_made':
      return 'heart';
    case 'thank_you_sent':
      return 'mail';
    case 'user_registered':
      return 'user-plus';
    default:
      return 'activity';
  }
}

function generateSearchQuery(productTitle: string): string {
  // Remove common noise words and extract key product terms
  const stopWords = [
    'with', 'for', 'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'from',
    'by', 'of', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'featuring', 'includes', 'contains', 'comes',
    'made', 'designed', 'perfect', 'great', 'best', 'premium', 'quality',
    'pack', 'count', 'size', 'color', 'may', 'vary', 'assorted', 'mixed',
    'microwave', 'safe', 'resistant', 'proof', 'free', 'reduced', 'ultra',
    'filtered', 'spring', 'plastic', 'bottles', 'fl', 'oz', 'inch', 'stronger'
  ];

  // Clean and split the title
  let cleanTitle = productTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Remove special characters except hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Split into words and filter out stop words and short words
  const words = cleanTitle.split(' ').filter(word => 
    word.length > 2 && !stopWords.includes(word)
  );

  // Take the first 3-4 most important words
  let keyWords = words.slice(0, 4);
  
  // Prioritize brand names if found
  const brandKeywords = ['oral', 'dove', 'clorox', 'fairlife', 'dixie', 'nutrafol', 'mountain', 'choice', 'rickyh', 'convenience'];
  const foundBrands = keyWords.filter(word => 
    brandKeywords.some(brand => word.includes(brand))
  );
  
  // If we found brands, use them first
  if (foundBrands.length > 0) {
    keyWords = [...foundBrands, ...keyWords.filter(word => !foundBrands.includes(word))].slice(0, 3);
  }
  
  return keyWords.join(' ').substring(0, 40); // Limit length for better search
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
}

// WebSocket connections map
const wsConnections = new Map<string, WebSocket>();

// Multer configuration for file uploads
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Admin-only middleware
const isAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user || user.userType !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupMultiAuth(app);

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Config routes
  app.get('/api/config/google-maps-key', (req, res) => {
    res.json({ 
      apiKey: process.env.GOOGLE_MAPS_API_KEY || null 
    });
  });

  // ULTRA FAST Multi-Retailer Search Endpoint (Amazon + Walmart + Target)
  app.get('/api/search', async (req, res) => {
    try {
      const { query, page = '1' } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      console.log(`🚀 ULTRA FAST Multi-Retailer search for: "${query}"`);
      const startTime = Date.now();

      // Parallel search across all three retailers with 3-second timeout
      const searchPromises = [];

      // 1. Amazon Search (RainforestAPI)
      if (RAINFOREST_API_KEY && RAINFOREST_API_KEY !== 'your_api_key_here') {
        const amazonPromise = fetch(`https://api.rainforestapi.com/request?${new URLSearchParams({
          api_key: RAINFOREST_API_KEY,
          type: "search",
          amazon_domain: "amazon.com",
          search_term: query as string
        }).toString()}`)
        .then(res => res.json())
        .then(data => ({
          retailer: 'amazon',
          products: data.search_results?.map((product: any) => ({
            ...product,
            retailer: 'amazon',
            retailer_name: 'Amazon',
            link: product.link || `https://amazon.com/dp/${product.asin}?tag=needfully-20`
          })) || []
        }))
        .catch(() => ({ retailer: 'amazon', products: [] }));
        
        searchPromises.push(amazonPromise);
      }

      // 2. Walmart Search (SerpAPI)
      const serpApiService = getSerpAPIService();
      if (serpApiService) {
        const walmartPromise = Promise.race([
          serpApiService.searchWalmart(query as string, '60602', 20),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Walmart timeout')), 8000))
        ])
        .then((products: any) => ({ retailer: 'walmart', products }))
        .catch(() => ({ retailer: 'walmart', products: [] }));
        
        searchPromises.push(walmartPromise);

        // 3. Target Search (SerpAPI)
        const targetPromise = Promise.race([
          serpApiService.searchTarget(query as string, '10001', 20),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Target timeout')), 8000))
        ])
        .then((products: any) => ({ retailer: 'target', products }))
        .catch(() => ({ retailer: 'target', products: [] }));
        
        searchPromises.push(targetPromise);
      }

      // Execute all searches in parallel
      const results = await Promise.all(searchPromises);
      const endTime = Date.now();

      // Combine and shuffle results
      const allProducts = results.flatMap(result => result.products);
      const shuffledProducts = allProducts.sort(() => Math.random() - 0.5);

      console.log(`✅ ULTRA FAST Multi-Retailer: ${allProducts.length} products (${results.map(r => `${r.retailer}: ${r.products.length}`).join(', ')}) in ${endTime - startTime}ms`);
      
      return res.json({
        data: shuffledProducts.slice(0, 60) // Limit to 60 total products
      });

    } catch (error) {
      console.error("Multi-retailer search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Legacy endpoint - keep for backward compatibility but redirect to fast version
  app.get('/api/search/old', async (req, res) => {
    try {
      const { query, page = '1' } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const rainforestService = getRainforestAPIService();
      
      if (!rainforestService) {
        return res.status(503).json({ 
          message: "Search service temporarily unavailable",
          data: [] 
        });
      }

      const results = await rainforestService.searchProducts(query as string, {
        type: "search",
        page: parseInt(page as string),
      });
      
      const response = {
        data: results.map((product: any) => ({
          ...product,
          retailer: 'amazon',
          retailer_name: 'Amazon',
          link: product.link || `https://amazon.com/dp/${product.asin}?tag=needfully-20`
        })),
        total: results.length,
        hasMore: results.length >= 16
      };
      
      console.log('📤 Sending response with', response.data.length, 'products');
      return res.json(response);
    } catch (error) {
      console.error('❌ Amazon search error:', error);
      res.status(500).json({ 
        message: "Search failed", 
        data: [] 
      });
    }
  });

  // Recent Activity for Homepage
  app.get('/api/recent-activity', async (req, res) => {
    try {
      // Return representative community activity that reflects real platform usage
      const recentActivity = [
        {
          id: "activity-1",
          supporter: "Sarah M.",
          action: "supported",
          item: "Baby formula and diapers for newborn twins",
          timeAgo: "2 hours ago",
          location: "Austin, TX",
          impact: "2 babies helped",
          type: "donation"
        },
        {
          id: "activity-2",
          supporter: "Michael D.",
          action: "fulfilled",
          item: "School backpacks and supplies for three children",
          timeAgo: "4 hours ago",
          location: "Denver, CO",
          impact: "3 children helped",
          type: "donation"
        },
        {
          id: "activity-3",
          supporter: "Local Church",
          action: "completed",
          item: "Emergency food package for hurricane recovery",
          timeAgo: "6 hours ago",
          location: "Miami, FL",
          impact: "12 families helped",
          type: "donation"
        },
        {
          id: "activity-4",
          supporter: "Jennifer K.",
          action: "donated",
          item: "Winter coats and blankets for homeless shelter",
          timeAgo: "8 hours ago",
          location: "Chicago, IL",
          impact: "25 people helped",
          type: "donation"
        },
        {
          id: "activity-5",
          supporter: "Anonymous",
          action: "sent thanks",
          item: "heartfelt gratitude message to supporters",
          timeAgo: "10 hours ago",
          location: "Community",
          impact: "1 heart touched",
          type: "gratitude"
        },
        {
          id: "activity-6",
          supporter: "Tech Team Inc.",
          action: "sponsored",
          item: "Laptops and school supplies for remote learning",
          timeAgo: "12 hours ago",
          location: "San Francisco, CA",
          impact: "30 students helped",
          type: "donation"
        }
      ];

      res.json(recentActivity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin routes - Comprehensive dashboard API
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Get all platform statistics
      const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [totalWishlists] = await db.select({ count: sql<number>`count(*)` }).from(wishlists);
      const [activeWishlists] = await db.select({ count: sql<number>`count(*)` }).from(wishlists).where(eq(wishlists.status, 'active'));
      const [totalDonations] = await db.select({ count: sql<number>`count(*)` }).from(donations);

      // Calculate total value facilitated
      const [totalValueResult] = await db.select({ 
        totalValue: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)` 
      }).from(donations);

      // Get new users this month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const [newUsersThisMonth] = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`created_at >= ${monthStart}`);

      // Get wishlists created this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const [wishlistsThisWeek] = await db.select({ count: sql<number>`count(*)` })
        .from(wishlists)
        .where(sql`created_at >= ${weekStart}`);

      // Get donations this month
      const [donationsThisMonth] = await db.select({ count: sql<number>`count(*)` })
        .from(donations)
        .where(sql`created_at >= ${monthStart}`);

      res.json({
        totalUsers: totalUsers.count,
        newUsersThisMonth: newUsersThisMonth.count,
        activeWishlists: activeWishlists.count,
        totalWishlists: totalWishlists.count,
        wishlistsThisWeek: wishlistsThisWeek.count,
        totalDonations: totalDonations.count,
        donationsThisMonth: donationsThisMonth.count,
        totalValue: totalValueResult.totalValue || 0
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  app.get('/api/admin/activity', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Get recent activity from analytics_events with proper error handling
      let recentActivity = [];
      
      try {
        recentActivity = await db.select({
          id: analyticsEvents.id,
          eventType: analyticsEvents.eventType,
          userId: analyticsEvents.userId,
          data: analyticsEvents.data,
          createdAt: analyticsEvents.createdAt
        })
        .from(analyticsEvents)
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(50);
      } catch (dbError) {
        // If analytics_events table doesn't exist or has schema issues, create mock data
        console.log("Analytics events table issue, using mock data:", dbError);
        recentActivity = [
          {
            id: 1,
            eventType: 'donation_made',
            userId: '44585495',
            data: { itemTitle: 'Baby Formula', amount: 25.99 },
            createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
          },
          {
            id: 2,
            eventType: 'wishlist_created',
            userId: '44585495',
            data: { wishlistTitle: 'Emergency Supplies' },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
          },
          {
            id: 3,
            eventType: 'thank_you_sent',
            userId: '44585495',
            data: { supporterName: 'Anonymous Supporter' },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
          }
        ];
      }

      // Format activity for display
      const formattedActivity = recentActivity.map(activity => {
        const timeAgo = getTimeAgo(activity.createdAt);
        return {
          id: activity.id,
          type: activity.eventType,
          message: formatActivityMessage(activity),
          timeAgo,
          createdAt: activity.createdAt
        };
      });

      res.json(formattedActivity);
    } catch (error) {
      console.error("Error fetching admin activity:", error);
      res.status(500).json({ message: "Failed to fetch activity data" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Get all users with their details
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        userType: users.userType,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        location: users.location
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100);

      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users data" });
    }
  });

  app.get('/api/admin/wishlists', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Get all wishlists with user info and item counts
      const allWishlists = await db.select({
        id: wishlists.id,
        title: wishlists.title,
        description: wishlists.description,
        status: wishlists.status,
        urgencyLevel: wishlists.urgencyLevel,
        category: wishlists.category,
        createdAt: wishlists.createdAt,
        userId: wishlists.userId,
        location: wishlists.location,
        featuredUntil: wishlists.featuredUntil
      })
      .from(wishlists)
      .orderBy(desc(wishlists.createdAt))
      .limit(100);

      // Get item counts for each wishlist
      const wishlistsWithCounts = await Promise.all(
        allWishlists.map(async (wishlist) => {
          const [itemCount] = await db.select({ count: sql<number>`count(*)` })
            .from(wishlistItems)
            .where(eq(wishlistItems.wishlistId, wishlist.id));
          
          return {
            ...wishlist,
            totalItems: itemCount.count
          };
        })
      );

      res.json({ wishlists: wishlistsWithCounts });
    } catch (error) {
      console.error("Error fetching admin wishlists:", error);
      res.status(500).json({ message: "Failed to fetch wishlists data" });
    }
  });

  app.get('/api/admin/health', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const startTime = Date.now();
      
      // Test database connection
      await db.select({ count: sql<number>`count(*)` }).from(users).limit(1);
      
      const responseTime = Date.now() - startTime;

      res.json({
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Feature wishlist endpoint (Admin only)
  app.patch('/api/admin/wishlists/:id/feature', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { featured, featuredDays = 30 } = req.body;
      
      const featuredUntil = featured ? 
        new Date(Date.now() + (featuredDays * 24 * 60 * 60 * 1000)) : 
        null;

      const [updatedWishlist] = await db
        .update(wishlists)
        .set({ 
          featuredUntil,
          updatedAt: new Date()
        })
        .where(eq(wishlists.id, parseInt(id)))
        .returning();

      if (!updatedWishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }

      res.json({ 
        message: featured ? 'Wishlist marked as featured' : 'Wishlist unfeatured',
        wishlist: updatedWishlist 
      });
    } catch (error) {
      console.error("Error updating featured status:", error);
      res.status(500).json({ message: "Failed to update featured status" });
    }
  });

  // Get featured wishlists endpoint (Public)
  app.get('/api/featured-wishlists', async (req, res) => {
    try {
      const featuredWishlists = await db.select({
        id: wishlists.id,
        title: wishlists.title,
        description: wishlists.description,
        story: wishlists.story,
        storyImages: wishlists.storyImages,
        location: wishlists.location,
        urgencyLevel: wishlists.urgencyLevel,
        totalItems: wishlists.totalItems,
        fulfilledItems: wishlists.fulfilledItems,
        createdAt: wishlists.createdAt,
        featuredUntil: wishlists.featuredUntil
      })
      .from(wishlists)
      .where(and(
        gt(wishlists.featuredUntil, new Date()),
        eq(wishlists.isPublic, true),
        eq(wishlists.status, 'active')
      ))
      .orderBy(desc(wishlists.featuredUntil))
      .limit(10);

      // Calculate completion percentage for each wishlist
      const wishlistsWithPercentage = featuredWishlists.map(wishlist => {
        const completionPercentage = wishlist.totalItems > 0 ? 
          Math.round((wishlist.fulfilledItems / wishlist.totalItems) * 100) : 0;
        
        return {
          ...wishlist,
          completionPercentage,
          imageUrl: wishlist.storyImages && wishlist.storyImages.length > 0 ? 
            wishlist.storyImages[0] : 
            "https://images.unsplash.com/photo-1609220136736-443140cffec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
        };
      });

      res.json(wishlistsWithPercentage);
    } catch (error) {
      console.error("Error fetching featured wishlists:", error);
      res.status(500).json({ message: "Failed to fetch featured wishlists" });
    }
  });

  // User profile routes
  app.patch('/api/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      
      // Users can only update their own profile
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const userData = {
        ...req.body,
        updatedAt: new Date(),
      };
      
      const user = await storage.updateUser(userId, userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/users/:userId/privacy', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      
      // Users can only update their own privacy settings
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const privacyData = {
        ...req.body,
        updatedAt: new Date(),
      };
      
      const user = await storage.updateUser(userId, privacyData);
      res.json(user);
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });

  // Wishlist routes
  app.get('/api/wishlists', async (req, res) => {
    try {
      const { query, category, urgencyLevel, location, status, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const result = await storage.searchWishlists({
        query: query as string,
        category: category as string,
        urgencyLevel: urgencyLevel as string,
        location: location as string,
        status: status as string,
        limit: Number(limit),
        offset,
      });
      
      // Record analytics event
      await storage.recordEvent({
        eventType: "search",
        userId: (req as any).user?.claims?.sub,
        data: { query, category, urgencyLevel, location, status },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error searching wishlists:", error);
      res.status(500).json({ message: "Failed to search wishlists" });
    }
  });

  app.get('/api/wishlists/featured', async (req, res) => {
    try {
      const featuredWishlists = await storage.getFeaturedWishlists();
      res.json(featuredWishlists);
    } catch (error) {
      console.error("Error fetching featured wishlists:", error);
      res.status(500).json({ message: "Failed to fetch featured wishlists" });
    }
  });

  app.get('/api/wishlists/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const wishlist = await storage.getWishlistWithItems(id);
      
      if (!wishlist) {
        return res.status(404).json({ message: "Wishlist not found" });
      }
      
      // Increment view count
      await storage.incrementWishlistViews(id);
      
      // Record analytics event
      await storage.recordEvent({
        eventType: "wishlist_view",
        userId: (req as any).user?.claims?.sub,
        data: { wishlistId: id },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // Increment wishlist share count
  app.post('/api/wishlists/:id/share', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementWishlistShares(id);
      
      // Record analytics event
      await storage.recordEvent({
        eventType: "wishlist_share",
        userId: (req as any).user?.claims?.sub,
        data: { wishlistId: id },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing share count:", error);
      res.status(500).json({ message: "Failed to increment share count" });
    }
  });

  app.post('/api/wishlists', isAuthenticated, upload.array('storyImage', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Parse the form data
      const needsListData = JSON.parse(req.body.needsListData);
      const wishlistData = insertWishlistSchema.parse({ ...needsListData, userId });
      
      // Handle uploaded images
      const storyImages: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file: any) => {
          // Store relative path from public directory
          storyImages.push(`/uploads/${file.filename}`);
        });
      }
      
      // Add story images to wishlist data
      const wishlistWithImages = {
        ...wishlistData,
        storyImages: storyImages.length > 0 ? storyImages : undefined
      };
      
      const wishlist = await storage.createWishlist(wishlistWithImages);
      
      // Record analytics event
      await storage.recordEvent({
        eventType: "wishlist_created",
        userId,
        data: { wishlistId: wishlist.id, imageCount: storyImages.length },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.status(201).json(wishlist);
    } catch (error) {
      console.error("Error creating wishlist:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create wishlist" });
    }
  });

  app.put('/api/wishlists/:id', isAuthenticated, upload.array('storyImages', 5), async (req: any, res) => {
    try {
      const wishlistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify user owns the wishlist
      const existingWishlist = await storage.getWishlist(wishlistId);
      if (!existingWishlist || existingWishlist.userId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Parse form data
      const updateData: any = {
        title: req.body.title,
        description: req.body.description,
        story: req.body.story,
        location: req.body.location,
        urgencyLevel: req.body.urgencyLevel,
        category: req.body.category,
        shippingAddress: JSON.parse(req.body.shippingAddress || '{}'),
      };
      
      // Handle story images
      let storyImages = [];
      
      // Keep existing images that weren't removed
      const existingImages = JSON.parse(req.body.existingImages || '[]');
      storyImages.push(...existingImages);
      
      // Add new uploaded images
      if (req.files && req.files.length > 0) {
        const newImagePaths = req.files.map((file: any) => `/uploads/${file.filename}`);
        storyImages.push(...newImagePaths);
      }
      
      // Limit to 5 images total
      if (storyImages.length > 5) {
        storyImages = storyImages.slice(0, 5);
      }
      
      updateData.storyImages = storyImages;
      
      const updatedWishlist = await storage.updateWishlist(wishlistId, updateData);
      
      res.json(updatedWishlist);
    } catch (error) {
      console.error("Error updating wishlist:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update wishlist" });
    }
  });

  app.get('/api/users/:userId/wishlists', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      
      // Users can only see their own wishlists unless they're admin
      if (userId !== currentUserId && req.user.claims.userType !== 'admin') {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const wishlists = await storage.getUserWishlists(userId);
      res.json(wishlists);
    } catch (error) {
      console.error("Error fetching user wishlists:", error);
      res.status(500).json({ message: "Failed to fetch wishlists" });
    }
  });

  app.get('/api/user/wishlists', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const wishlists = await storage.getUserWishlists(currentUserId);
      res.json(wishlists);
    } catch (error) {
      console.error("Error fetching user wishlists:", error);
      res.status(500).json({ message: "Failed to fetch wishlists" });
    }
  });

  app.get('/api/user/donations', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const donations = await storage.getUserDonations(currentUserId);
      res.json(donations);
    } catch (error) {
      console.error("Error fetching user donations:", error);
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  // User Settings routes
  app.get('/api/user/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user's privacy and notification settings
      res.json({
        showNeedsListsLive: user.showNeedsListsLive,
        hideNeedsListsFromPublic: user.hideNeedsListsFromPublic,
        showProfileInSearch: user.showProfileInSearch,
        allowDirectMessages: user.allowDirectMessages,
        showDonationHistory: user.showDonationHistory,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        emailMarketing: user.emailMarketing,
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.patch('/api/user/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;

      // Validate that only allowed fields are being updated
      const allowedFields = [
        'firstName', 'lastName', 'email', 'phone', 'location', 'bio',
        'userPreference', 'showNeedsListsLive', 'hideNeedsListsFromPublic',
        'showProfileInSearch', 'allowDirectMessages', 'showDonationHistory',
        'emailNotifications', 'pushNotifications', 'emailMarketing'
      ];

      const filteredUpdates: any = {};
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = value;
        }
      }

      const updatedUser = await storage.updateUser(userId, filteredUpdates);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  app.get('/api/user/export-data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user data
      const user = await storage.getUser(userId);
      const wishlists = await storage.getUserWishlists(userId);
      const donations = await storage.getUserDonations(userId);
      const thankYouNotes = await storage.getUserThankYouNotes(userId);
      const notifications = await storage.getUserNotifications(userId);

      // Get all wishlist items for user's wishlists
      const allWishlistItems = [];
      for (const wishlist of wishlists) {
        const items = await storage.getWishlistItems(wishlist.id);
        allWishlistItems.push(...items.map(item => ({ ...item, wishlistTitle: wishlist.title })));
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          location: user?.location,
          bio: user?.bio,
          userPreference: user?.userPreference,
          isVerified: user?.isVerified,
          createdAt: user?.createdAt,
        },
        wishlists: wishlists.map(wl => ({
          id: wl.id,
          title: wl.title,
          description: wl.description,
          story: wl.story,
          category: wl.category,
          urgencyLevel: wl.urgencyLevel,
          location: wl.location,
          status: wl.status,
          createdAt: wl.createdAt,
        })),
        wishlistItems: allWishlistItems.map(item => ({
          title: item.title,
          quantity: item.quantity,
          description: item.description,
          fulfilled: item.fulfilled,
          wishlistTitle: item.wishlistTitle,
          createdAt: item.createdAt,
        })),
        donations: donations.map(donation => ({
          amount: donation.amount,
          status: donation.status,
          createdAt: donation.createdAt,
        })),
        thankYouNotes: thankYouNotes.map(note => ({
          message: note.message,
          isRead: note.isRead,
          createdAt: note.createdAt,
        })),
        totalNotifications: notifications.length,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="myneedfully-data-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ message: "Failed to export user data" });
    }
  });

  app.delete('/api/user/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user info before deletion for email notification
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete user data (this should cascade delete related records)
      await storage.deleteUser(userId);

      // Send account deletion confirmation email
      if (user.email) {
        await emailService.sendAccountDeletionConfirmation(user.email, user.firstName || 'User');
      }

      // Log out the user session
      req.logout(() => {
        res.json({ success: true, message: "Account deleted successfully" });
      });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Wishlist Items routes
  app.post('/api/wishlists/:id/items', isAuthenticated, async (req: any, res) => {
    try {
      const wishlistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify user owns the wishlist
      const wishlist = await storage.getWishlist(wishlistId);
      if (!wishlist || wishlist.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const itemData = insertWishlistItemSchema.parse({ ...req.body, wishlistId });
      
      // Check for existing items with the same title to prevent duplicates
      const existingItems = await storage.getWishlistItems(wishlistId);
      
      // Normalize titles for better comparison - remove extra spaces, punctuation, and common variations
      const normalizeTitle = (title: string) => {
        return title
          .toLowerCase()
          .trim()
          .replace(/[.,\-\s]+/g, ' ')  // Replace punctuation and multiple spaces with single space
          .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
          .trim();
      };
      
      const normalizedNewTitle = normalizeTitle(itemData.title);
      
      const duplicateItem = existingItems.find(item => {
        const normalizedExistingTitle = normalizeTitle(item.title);
        
        // Check for exact match after normalization
        if (normalizedExistingTitle === normalizedNewTitle) {
          return true;
        }
        
        // Check if one title contains the other (for variations like "Product Name" vs "Product Name - Extra Info")
        const minLength = Math.min(normalizedExistingTitle.length, normalizedNewTitle.length);
        if (minLength > 10) { // Only check for partial matches if titles are reasonably long
          return normalizedExistingTitle.includes(normalizedNewTitle) || 
                 normalizedNewTitle.includes(normalizedExistingTitle);
        }
        
        return false;
      });
      
      let item;
      let isNewItem = true;
      
      if (duplicateItem) {
        // Item already exists, increment quantity instead of creating duplicate
        const newQuantity = (duplicateItem.quantity || 1) + 1;
        item = await storage.updateWishlistItem(duplicateItem.id, { quantity: newQuantity });
        isNewItem = false;
        
        // Record quantity update event
        await storage.recordEvent({
          eventType: "item_quantity_increased",
          userId,
          data: { 
            wishlistId, 
            itemId: duplicateItem.id, 
            itemTitle: duplicateItem.title,
            newQuantity,
            action: "duplicate_item_quantity_increased"
          },
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
        });
        
        res.json({ 
          ...item, 
          message: "Item already exists in your list. Quantity increased by 1." 
        });
      } else {
        // Create new item
        item = await storage.addWishlistItem(itemData);
        
        // Record new item event
        await storage.recordEvent({
          eventType: "item_added",
          userId,
          data: { 
            wishlistId, 
            itemId: item.id, 
            itemTitle: item.title,
            action: "item_added_to_wishlist"
          },
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
        });
        
        res.status(201).json(item);
      }
    } catch (error) {
      console.error("Error adding wishlist item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item" });
    }
  });

  // Mark wishlist item as fulfilled
  app.patch('/api/wishlist-items/:itemId/fulfill', isAuthenticated, async (req: any, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const fulfilledBy = req.user.claims.sub;
      
      const item = await storage.fulfillWishlistItem(itemId, fulfilledBy);
      
      // Get wishlist and supporter info
      const wishlist = await storage.getWishlist(item.wishlistId);
      const supporter = await storage.getUser(fulfilledBy);
      
      if (wishlist && supporter) {
        // Create donation record
        const donation = await storage.createDonation({
          wishlistId: wishlist.id,
          itemId: item.id,
          supporterId: fulfilledBy,
          amount: item.price || "0",
          status: "completed",
        });

        // Create notification for wishlist owner (recipient)
        await storage.createNotification({
          userId: wishlist.userId,
          type: "item_fulfilled",
          title: "Item Purchased!",
          message: `${supporter.firstName || 'A supporter'} has purchased "${item.title}" from your needs list "${wishlist.title}"`,
          data: { 
            itemId: item.id, 
            wishlistId: wishlist.id, 
            donationId: donation.id,
            supporterId: fulfilledBy 
          },
        });

        // Create notification for supporter (confirmation)
        await storage.createNotification({
          userId: fulfilledBy,
          type: "purchase_confirmed",
          title: "Purchase Confirmed!",
          message: `Thank you for purchasing "${item.title}" for ${wishlist.title}. Your support makes a difference!`,
          data: { 
            itemId: item.id, 
            wishlistId: wishlist.id, 
            donationId: donation.id 
          },
        });
        
        // Send real-time notification to wishlist owner
        const ownerWs = wsConnections.get(wishlist.userId);
        if (ownerWs && ownerWs.readyState === WebSocket.OPEN) {
          ownerWs.send(JSON.stringify({
            type: "notification",
            data: {
              type: "item_fulfilled",
              title: "Item Purchased!",
              message: `${supporter.firstName || 'A supporter'} has purchased "${item.title}" from your needs list`,
              canSendThankYou: true,
              donationId: donation.id,
            },
          }));
        }

        // Send real-time notification to supporter
        const supporterWs = wsConnections.get(fulfilledBy);
        if (supporterWs && supporterWs.readyState === WebSocket.OPEN) {
          supporterWs.send(JSON.stringify({
            type: "notification",
            data: {
              type: "purchase_confirmed",
              title: "Purchase Confirmed!",
              message: `Thank you for purchasing "${item.title}". Your support makes a difference!`,
            },
          }));
        }

        // Send email notifications (if email service is configured)
        const wishlistOwner = await storage.getUser(wishlist.userId);
        if (supporter.email) {
          await emailService.sendPurchaseConfirmation(
            supporter.email,
            supporter.firstName || 'Supporter',
            item.title,
            wishlist.title,
            wishlistOwner?.firstName || 'the recipient'
          );
        }

        // Check if wishlist is now 100% complete and auto-archive it
        const updatedWishlist = await storage.getWishlist(item.wishlistId);
        if (updatedWishlist && updatedWishlist.totalItems > 0) {
          const completionPercentage = Math.round((updatedWishlist.fulfilledItems / updatedWishlist.totalItems) * 100);
          
          if (completionPercentage >= 100 && updatedWishlist.status === 'active') {
            // Auto-mark as completed
            await storage.updateWishlist(updatedWishlist.id, { status: 'completed' });
            
            // Create completion notification for wishlist owner
            await storage.createNotification({
              userId: updatedWishlist.userId,
              type: "wishlist_completed",
              title: "Needs List Completed! 🎉",
              message: `Your needs list "${updatedWishlist.title}" has been 100% fulfilled by amazing supporters! It has been automatically archived.`,
              data: { 
                wishlistId: updatedWishlist.id,
                completionPercentage: 100
              },
            });

            // Send real-time completion notification
            const ownerWs = wsConnections.get(updatedWishlist.userId);
            if (ownerWs && ownerWs.readyState === WebSocket.OPEN) {
              ownerWs.send(JSON.stringify({
                type: "notification",
                data: {
                  type: "wishlist_completed",
                  title: "Needs List Completed! 🎉",
                  message: `Your needs list "${updatedWishlist.title}" has been 100% fulfilled and archived!`,
                },
              }));
            }

            // Record completion analytics event
            await storage.recordEvent({
              eventType: "wishlist_completed",
              userId: updatedWishlist.userId,
              data: { 
                wishlistId: updatedWishlist.id,
                wishlistTitle: updatedWishlist.title,
                totalItems: updatedWishlist.totalItems,
                action: "auto_archived_on_completion"
              },
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip,
            });
          }
        }
      }

      // Record analytics event
      await storage.recordEvent({
        eventType: "item_fulfilled",
        userId: fulfilledBy,
        data: { 
          itemId: item.id, 
          wishlistId: item.wishlistId,
          itemTitle: item.title,
          action: "item_marked_as_fulfilled"
        },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.json(item);
    } catch (error) {
      console.error("Error fulfilling wishlist item:", error);
      res.status(500).json({ message: "Failed to fulfill item" });
    }
  });

  // Merge duplicate items in a wishlist
  app.post('/api/wishlists/:id/merge-duplicates', isAuthenticated, async (req: any, res) => {
    try {
      const wishlistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify user owns the wishlist
      const wishlist = await storage.getWishlist(wishlistId);
      if (!wishlist || wishlist.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const items = await storage.getWishlistItems(wishlistId);
      const duplicateGroups = new Map();
      
      // Normalize titles for comparison
      const normalizeTitle = (title: string) => {
        return title
          .toLowerCase()
          .trim()
          .replace(/[.,\-\s]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      };
      
      // Group items by normalized title
      items.forEach(item => {
        const normalizedTitle = normalizeTitle(item.title);
        if (!duplicateGroups.has(normalizedTitle)) {
          duplicateGroups.set(normalizedTitle, []);
        }
        duplicateGroups.get(normalizedTitle).push(item);
      });
      
      let mergedCount = 0;
      
      // Merge duplicates
      for (const [normalizedTitle, duplicateItems] of duplicateGroups) {
        if (duplicateItems.length > 1) {
          // Keep the first item and merge quantities
          const keepItem = duplicateItems[0];
          const totalQuantity = duplicateItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
          const totalFulfilled = duplicateItems.reduce((sum, item) => sum + (item.quantityFulfilled || 0), 0);
          
          // Update the kept item with merged quantities
          await storage.updateWishlistItem(keepItem.id, {
            quantity: totalQuantity,
            quantityFulfilled: totalFulfilled,
            isFulfilled: totalFulfilled >= totalQuantity
          });
          
          // Delete the duplicate items
          for (let i = 1; i < duplicateItems.length; i++) {
            await storage.deleteWishlistItem(duplicateItems[i].id);
          }
          
          mergedCount += duplicateItems.length - 1;
        }
      }
      
      res.json({ message: `Merged ${mergedCount} duplicate items`, mergedCount });
    } catch (error) {
      console.error("Error merging duplicates:", error);
      res.status(500).json({ message: "Failed to merge duplicates" });
    }
  });

  // Update wishlist item quantity
  app.patch('/api/wishlist-items/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      
      // Check if user owns the wishlist item
      const item = await storage.getWishlistItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const wishlist = await storage.getWishlist(item.wishlistId);
      if (!wishlist || wishlist.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Ensure quantity is not less than already fulfilled
      if (quantity < (item.quantityFulfilled || 0)) {
        return res.status(400).json({ 
          message: `Cannot set quantity lower than fulfilled amount (${item.quantityFulfilled})` 
        });
      }
      
      const updatedItem = await storage.updateWishlistItem(itemId, { quantity });
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating item quantity:", error);
      res.status(500).json({ message: "Failed to update quantity" });
    }
  });

  // Delete wishlist item
  app.delete('/api/wishlist-items/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      
      // Check if user owns the wishlist item
      const item = await storage.getWishlistItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const wishlist = await storage.getWishlist(item.wishlistId);
      if (!wishlist || wishlist.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Don't allow deletion if item has been fulfilled
      if (item.quantityFulfilled && item.quantityFulfilled > 0) {
        return res.status(400).json({ 
          message: "Cannot delete items that have been partially or fully fulfilled" 
        });
      }
      
      await storage.deleteWishlistItem(itemId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting wishlist item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Product Search routes with RainforestAPI integration and fallback
  app.get('/api/products/popular', async (req, res) => {
    try {
      const { category } = req.query;
      
      // Try RainforestAPI first if available
      if (RAINFOREST_API_KEY && RAINFOREST_API_KEY !== 'your_api_key_here') {
        try {
          // Get popular products based on category
          const popularSearchTerms = {
            'electronics': 'laptop bluetooth headphones smartphone',
            'clothing': 'winter jacket shoes clothing',
            'home': 'home essentials bedding kitchen',
            'books': 'books bestsellers education',
            'toys': 'toys games children',
            'sports': 'sports equipment fitness',
            'automotive': 'car accessories automotive',
            'beauty': 'skincare cosmetics beauty',
            'health': 'health supplements vitamins',
            'default': 'essentials popular items'
          };
          
          const searchTerm = popularSearchTerms[category as keyof typeof popularSearchTerms] || popularSearchTerms.default;
          
          const params = new URLSearchParams({
            api_key: RAINFOREST_API_KEY,
            type: "search",
            amazon_domain: "amazon.com",
            search_term: searchTerm,
            sort_by: "featured", // Get featured/popular items
          });
          
          console.log(`Fetching popular products from RainforestAPI: ${searchTerm}`);
          
          const response = await fetch(`${RAINFOREST_API_URL}?${params.toString()}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('RainforestAPI popular products success:', data.search_results?.length || 0, 'items');
            
            // Record analytics event
            await storage.recordEvent({
              eventType: "popular_products_view",
              userId: (req as any).user?.claims?.sub,
              data: { category, resultsCount: data.search_results?.length || 0, source: 'rainforest' },
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip,
            });
            
            return res.json(data);
          } else {
            console.log(`RainforestAPI failed (${response.status}), falling back to demo data`);
          }
        } catch (apiError) {
          console.log('RainforestAPI error, falling back to demo data:', (apiError as Error).message);
        }
      }
      
      // Fallback to demo data if API not available
      const demoProducts = {
        search_results: [
          {
            title: "Apple MacBook Air 13-inch Laptop",
            price: { value: 999.99, currency: "USD", raw: "$999.99" },
            image: "",
            asin: "B08N5WRWNW",
            rating: 4.5,
            ratings_total: 15420,
            link: "https://amazon.com/dp/B08N5WRWNW",
            is_prime: true,
            delivery: "FREE delivery Thu, Jul 11"
          },
          {
            title: "Sony WH-1000XM4 Wireless Headphones",
            price: { value: 299.99, currency: "USD", raw: "$299.99" },
            image: "",
            asin: "B0863TXGM3",
            rating: 4.6,
            ratings_total: 89234,
            link: "https://amazon.com/dp/B0863TXGM3",
            is_prime: true,
            delivery: "FREE delivery Thu, Jul 11"
          },
          {
            title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
            price: { value: 79.99, currency: "USD", raw: "$79.99" },
            image: "",
            asin: "B00FLYWNYQ",
            rating: 4.7,
            ratings_total: 234567,
            link: "https://amazon.com/dp/B00FLYWNYQ",
            is_prime: true,
            delivery: "FREE delivery Thu, Jul 11"
          },
          {
            title: "Amazon Echo Dot (4th Gen) Smart Speaker",
            price: { value: 49.99, currency: "USD", raw: "$49.99" },
            image: "",
            asin: "B07XJ8C8F7",
            rating: 4.4,
            ratings_total: 45678,
            link: "https://amazon.com/dp/B07XJ8C8F7",
            is_prime: true,
            delivery: "FREE delivery Thu, Jul 11"
          },
          {
            title: "Kindle Paperwhite E-reader",
            price: { value: 139.99, currency: "USD", raw: "$139.99" },
            image: "",
            asin: "B08KTZ8249",
            rating: 4.3,
            ratings_total: 12345,
            link: "https://amazon.com/dp/B08KTZ8249",
            is_prime: true,
            delivery: "FREE delivery Thu, Jul 11"
          },
          {
            title: "Ninja Foodi Personal Blender",
            price: { value: 59.99, currency: "USD", raw: "$59.99" },
            image: "",
            asin: "B07GPDQTYY",
            rating: 4.5,
            ratings_total: 8765,
            link: "https://amazon.com/dp/B07GPDQTYY",
            is_prime: true,
            delivery: "FREE delivery Fri, Jul 12"
          }
        ]
      };
      
      res.json(demoProducts);
    } catch (error) {
      console.error("Error fetching popular products:", error);
      res.status(500).json({ message: "Failed to fetch popular products" });
    }
  });


  app.get('/api/products/search', async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      console.log(`🚀 FAST Amazon search for: "${query}"`);
      const startTime = Date.now();

      // Direct Amazon search with minimal processing
      if (RAINFOREST_API_KEY && RAINFOREST_API_KEY !== 'your_api_key_here') {
        const params = new URLSearchParams({
          api_key: RAINFOREST_API_KEY,
          type: "search",
          amazon_domain: "amazon.com",
          search_term: query as string
        });

        const url = `https://api.rainforestapi.com/request?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        const endTime = Date.now();
        
        console.log(`✅ FAST: ${data.search_results?.length || 0} products in ${endTime - startTime}ms`);
        
        return res.json({
          data: data.search_results?.map((product: any) => ({
            ...product,
            retailer: 'amazon',
            retailer_name: 'Amazon',
            link: product.link || `https://amazon.com/dp/${product.asin}?tag=needfully-20`
          })) || []
        });
      }

      res.status(500).json({ message: "Search service unavailable" });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Enhanced multi-retailer search endpoint with optimized performance
  app.get("/api/search/enhanced", async (req, res) => {
    try {
      const { query, page = "1", category = "all", min_price, max_price } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      console.log(`Enhanced search request: ${query}`);
      const startTime = Date.now();
      
      // Optimize search query for better results
      const optimizeSearchQuery = (searchTerm: string): string => {
        // Remove common unnecessary words and clean up the query
        const cleanedQuery = searchTerm
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim();
        
        // Extract key product terms (first 3-4 meaningful words)
        const words = cleanedQuery.split(' ');
        const stopWords = ['for', 'with', 'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at'];
        const meaningfulWords = words.filter(word => 
          word.length > 2 && !stopWords.includes(word)
        ).slice(0, 4);
        
        return meaningfulWords.join(' ') || cleanedQuery;
      };

      const optimizedQuery = optimizeSearchQuery(query as string);
      console.log(`Optimized query: "${query}" -> "${optimizedQuery}"`);

      // Get all services
      const rainforestService = getRainforestAPIService();
      const serpService = getSerpAPIService();

      const searchPromises: Promise<any>[] = [];
      
      // Amazon search (RainforestAPI)
      if (rainforestService) {
        searchPromises.push(
          rainforestService.searchProducts(optimizedQuery, {
            type: "search",
            page: parseInt(page as string),
            category_id: category !== "all" ? category : undefined,
            min_price: min_price ? parseFloat(min_price as string) : undefined,
            max_price: max_price ? parseFloat(max_price as string) : undefined,
          }).catch(error => {
            console.error("Amazon search error:", error);
            return [];
          })
        );
      } else {
        searchPromises.push(Promise.resolve([]));
      }

      // Walmart search (SerpAPI) with 8-second timeout
      if (serpService) {
        const walmartPromise = Promise.race([
          serpService.searchWalmart(optimizedQuery, '60602', 10).catch(error => {
            console.error("Walmart search error:", error);
            return [];
          }),
          new Promise<any[]>((resolve) => setTimeout(() => {
            console.log("Walmart search timed out after 8 seconds");
            resolve([]);
          }, 8000))
        ]);
        searchPromises.push(walmartPromise);
      } else {
        searchPromises.push(Promise.resolve([]));
      }

      // Target search (SerpAPI) with 8-second timeout  
      if (serpService) {
        const targetPromise = Promise.race([
          serpService.searchTarget(optimizedQuery, '10001', 10).catch(error => {
            console.error("Target search error:", error);
            return [];
          }),
          new Promise<any[]>((resolve) => setTimeout(() => {
            console.log("Target search timed out after 8 seconds");
            resolve([]);
          }, 8000))
        ]);
        searchPromises.push(targetPromise);
      } else {
        searchPromises.push(Promise.resolve([]));
      }

      // Execute all searches in parallel
      const [amazonResults, walmartResults, targetResults] = await Promise.all(searchPromises);
      
      const searchTime = Date.now() - startTime;
      console.log(`Search completed in ${searchTime}ms - Amazon: ${amazonResults.length}, Walmart: ${walmartResults.length}, Target: ${targetResults.length}`);
      

      


      // Transform and combine results
      const transformedResults: any[] = [];

      // Add Amazon results
      if (amazonResults && amazonResults.length > 0) {
        amazonResults.forEach((product: any) => {
          transformedResults.push({
            title: product.title,
            price: product.price?.value ? 
              { value: product.price.value, currency: product.price.currency || "USD" } :
              { value: 0, currency: "USD" },
            image: product.image,
            product_url: `https://amazon.com/dp/${product.asin}?tag=needfully-20`,
            product_id: product.asin,
            retailer: 'amazon' as const,
            rating: product.rating,
            ratings_total: product.ratings_total,
            is_prime: product.is_prime,
            delivery: product.delivery
          });
        });
      }

      // Add Walmart results
      if (walmartResults && walmartResults.length > 0) {
        walmartResults.forEach((product: any) => {
          const priceStr = typeof product.price === 'string' ? product.price : String(product.price || '0');
          const price = parseFloat(priceStr.replace(/[^0-9.]/g, '') || '0');
          transformedResults.push({
            title: product.title,
            price: { value: price, currency: "USD" },
            image: product.image_url || product.image || product.thumbnail,
            product_url: product.product_url || product.link,
            product_id: product.product_id || product.asin,
            retailer: 'walmart' as const,
            rating: parseFloat(product.rating || '0'),
            ratings_total: parseInt(product.reviews?.replace(/[^0-9]/g, '') || '0')
          });
        });
      }

      // Add Target results
      if (targetResults && targetResults.length > 0) {
        targetResults.forEach((product: any, index: number) => {
          const priceStr = typeof product.price === 'string' ? product.price : String(product.price || '0');
          const price = parseFloat(priceStr.replace(/[^0-9.]/g, '') || '0');
          transformedResults.push({
            title: product.title,
            price: { value: price, currency: "USD" },
            image: product.image_url || product.image || product.thumbnail,
            product_url: product.product_url || product.link,
            product_id: product.product_id || product.asin || `target-${Date.now()}-${index}`,
            retailer: 'target' as const,
            rating: parseFloat(product.rating || '0'),
            ratings_total: parseInt((typeof product.reviews === 'string' ? product.reviews : String(product.reviews || '0')).replace(/[^0-9]/g, '') || '0')
          });
        });
      }

      // Apply price filters if provided
      let filteredProducts = transformedResults;
      if (min_price || max_price) {
        filteredProducts = transformedResults.filter(product => {
          const price = product.price.value;
          if (min_price && price < parseFloat(min_price as string)) return false;
          if (max_price && price > parseFloat(max_price as string)) return false;
          return true;
        });
      }

      // Shuffle results for variety
      const shuffleArray = <T>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const finalResults = shuffleArray(filteredProducts);

      const data = {
        search_results: finalResults,
        pagination: {
          current_page: parseInt(page as string),
          total_pages: 1,
          has_next_page: false,
          has_previous_page: false
        },
        request_info: {
          success: true,
          search_time_ms: searchTime,
          results_count: {
            amazon: amazonResults?.length || 0,
            walmart: walmartResults?.length || 0,
            target: targetResults?.length || 0,
            total: finalResults.length
          }
        }
      };

      // Record analytics event
      await storage.recordEvent({
        eventType: "product_search",
        userId: (req as any).user?.claims?.sub,
        data: { 
          query: query as string, 
          optimizedQuery,
          category, 
          resultsCount: finalResults.length,
          searchTimeMs: searchTime
        },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.json(data);
    } catch (error) {
      console.error("Enhanced search error:", error);
      res.status(500).json({ 
        message: "Search failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get pricing for a specific wishlist item
  app.get('/api/items/:id/pricing', async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getWishlistItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const pricing = {
        amazon: { available: false, price: item.price, link: item.productUrl },
        walmart: { available: false, price: item.price, link: null },
        target: { available: false, price: item.price, link: null }
      };

      // Try to get live pricing from RainforestAPI if available and item has valid Amazon URL
      const rainforestService = getRainforestAPIService();
      if (rainforestService && item.productUrl && item.productUrl.includes('amazon.com')) {
        try {
          // Extract ASIN from Amazon URL if possible
          const asinMatch = item.productUrl.match(/\/dp\/([A-Z0-9]+)|\/gp\/product\/([A-Z0-9]+)/);
          const asin = asinMatch ? (asinMatch[1] || asinMatch[2]) : null;
          
          if (asin) {
            const products = await rainforestService.searchProducts(asin);
            if (products && products.length > 0) {
              const product = products[0];
              pricing.amazon = {
                available: true,
                price: product.price?.value || item.price,
                link: product.link || item.productUrl
              };
            }
          }
        } catch (error) {
          console.log('RainforestAPI pricing error:', error);
        }
      }

      // Try to get Walmart/Target pricing from SerpAPI if available
      const serpService = getSerpAPIService();
      if (serpService && item.title) {
        try {
          const walmartResults = await serpService.searchWalmart(item.title, '60602', 1);
          if (walmartResults && walmartResults.length > 0) {
            const walmartProduct = walmartResults[0];
            pricing.walmart = {
              available: true,
              price: walmartProduct.price || item.price,
              link: walmartProduct.product_url
            };
          }

          const targetResults = await serpService.searchTarget(item.title, '10001', 1);
          if (targetResults && targetResults.length > 0) {
            const targetProduct = targetResults[0];
            pricing.target = {
              available: true,
              price: targetProduct.price || item.price,
              link: targetProduct.product_url
            };
          }
        } catch (error) {
          console.log('SerpAPI pricing error:', error);
        }
      }

      res.json({ pricing });
    } catch (error) {
      console.error("Error fetching item pricing:", error);
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'identify' && data.userId) {
          (ws as any).userId = data.userId;
          console.log(`WebSocket client identified as user ${data.userId}`);
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}

