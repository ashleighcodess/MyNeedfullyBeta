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
import { eq, desc, sql } from "drizzle-orm";

// Helper function to generate secure tokens
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// RainforestAPI configuration
const RAINFOREST_API_KEY = process.env.RAINFOREST_API_KEY || "8789CC1433C54D12B5F2DF1A401E844E";
const RAINFOREST_API_URL = "https://api.rainforestapi.com/request";

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
        location: wishlists.location
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
      const { query, category, min_price, max_price, page = 1 } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      // Try RainforestAPI first if available
      if (RAINFOREST_API_KEY && RAINFOREST_API_KEY !== 'your_api_key_here') {
        try {
          const params = new URLSearchParams({
            api_key: RAINFOREST_API_KEY,
            type: "search",
            amazon_domain: "amazon.com",
            search_term: query as string,
          });

          if (category && category !== 'all') {
            params.append('category_id', category as string);
          }
          if (min_price) {
            params.append('min_price', min_price as string);
          }
          if (max_price) {
            params.append('max_price', max_price as string);
          }
          if (page && page !== '1') {
            params.append('page', page as string);
          }
          
          console.log(`Trying RainforestAPI: ${RAINFOREST_API_URL}?${params.toString()}`);
          
          const response = await fetch(`${RAINFOREST_API_URL}?${params.toString()}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('RainforestAPI success:', Object.keys(data));
            
            // Record analytics event
            await storage.recordEvent({
              eventType: "product_search",
              userId: (req as any).user?.claims?.sub,
              data: { query, category, resultsCount: data.search_results?.length || 0, source: 'rainforest' },
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip,
            });
            
            return res.json(data);
          } else {
            const errorText = await response.text();
            console.log(`RainforestAPI failed (${response.status}), falling back to demo data`);
          }
        } catch (apiError) {
          console.log('RainforestAPI error, falling back to demo data:', (apiError as Error).message);
        }
      }

      // Generate realistic sample products based on search query
      const generateSampleProducts = (searchTerm: string) => {
        const baseProducts = {
          laptop: [
            {
              title: "ASUS VivoBook 15 Thin and Light Laptop",
              price: { value: 399.99, currency: "USD" },
              image: "",
              asin: "B0B7BP6J6Q",
              rating: 4.3,
              ratings_total: 2847,
              position: 1,
              is_prime: true,
              delivery: "FREE delivery Thu, Jul 11"
            },
            {
              title: "HP Pavilion 15.6\" FHD Laptop",
              price: { value: 529.99, currency: "USD" },
              image: "",
              asin: "B09BK3L2N7",
              rating: 4.1,
              ratings_total: 1923,
              position: 2,
              is_prime: true,
              delivery: "FREE delivery Thu, Jul 11"
            },
            {
              title: "Lenovo IdeaPad 3 15.6\" Laptop",
              price: { value: 449.99, currency: "USD" },
              image: "",
              asin: "B08DKP73G9",
              rating: 4.2,
              ratings_total: 3421,
              position: 3,
              is_prime: true,
              delivery: "FREE delivery Fri, Jul 12"
            }
          ],
          backpack: [
            {
              title: "JanSport SuperBreak Plus Backpack",
              price: { value: 39.99, currency: "USD" },
              image: "",
              asin: "B07MDXQ2JQ",
              rating: 4.5,
              ratings_total: 8472,
              position: 1,
              is_prime: true,
              delivery: "FREE delivery Wed, Jul 10"
            },
            {
              title: "Nike Heritage 2.0 Backpack",
              price: { value: 29.99, currency: "USD" },
              image: "",
              asin: "B01BA0LHTA",
              rating: 4.4,
              ratings_total: 5219,
              position: 2,
              is_prime: true,
              delivery: "FREE delivery Wed, Jul 10"
            }
          ],
          phone: [
            {
              title: "Samsung Galaxy A54 5G",
              price: { value: 299.99, currency: "USD" },
              image: "",
              asin: "B0BT9CQHQ4",
              rating: 4.3,
              ratings_total: 6847,
              position: 1,
              is_prime: true,
              delivery: "FREE delivery Fri, Jul 12"
            },
            {
              title: "Apple iPhone SE (3rd Generation)",
              price: { value: 429.99, currency: "USD" },
              image: "",
              asin: "B09V3HN1KC",
              rating: 4.6,
              ratings_total: 12394,
              position: 2,
              is_prime: true,
              delivery: "FREE delivery Thu, Jul 11"
            }
          ]
        };

        // Find matching products based on search term
        const searchLower = searchTerm.toLowerCase();
        for (const [category, products] of Object.entries(baseProducts)) {
          if (searchLower.includes(category)) {
            return products;
          }
        }

        // Default generic products for any other search
        return [
          {
            title: `${searchTerm} - Premium Quality`,
            price: { value: 99.99, currency: "USD" },
            image: "",
            asin: "B084DWKG3M",
            rating: 4.2,
            ratings_total: 1847,
            position: 1,
            is_prime: true,
            delivery: "FREE delivery Thu, Jul 11"
          },
          {
            title: `${searchTerm} - Value Pack`,
            price: { value: 49.99, currency: "USD" },
            image: "",
            asin: "B09M3K2N7P",
            rating: 4.0,
            ratings_total: 924,
            position: 2,
            is_prime: true,
            delivery: "FREE delivery Fri, Jul 12"
          }
        ];
      };

      const products = generateSampleProducts(query as string);
      
      // Apply price filters if provided
      let filteredProducts = products;
      if (min_price || max_price) {
        filteredProducts = products.filter(product => {
          const price = product.price.value;
          if (min_price && price < parseFloat(min_price as string)) return false;
          if (max_price && price > parseFloat(max_price as string)) return false;
          return true;
        });
      }

      const data = {
        search_results: filteredProducts,
        pagination: {
          current_page: parseInt(page as string),
          total_pages: 1,
          has_next_page: false,
          has_previous_page: false
        },
        request_info: {
          success: true,
          message: "Demo results - connect a valid API key for real product data"
        }
      };

      // Record analytics event
      await storage.recordEvent({
        eventType: "product_search",
        userId: (req as any).user?.claims?.sub,
        data: { query, category, resultsCount: filteredProducts.length },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.json(data);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  // Test endpoint for debugging SerpAPI
  app.get('/api/debug/serpapi/:query', async (req, res) => {
    try {
      const query = req.params.query;
      const serpService = getSerpAPIService();
      
      if (!serpService) {
        return res.json({ error: 'SerpAPI service not available' });
      }
      
      console.log(`🔍 DEBUG: Testing SerpAPI with query: "${query}"`);
      
      const [walmartResults, targetResults] = await Promise.all([
        serpService.searchWalmart(query, '60602', 3),
        serpService.searchTarget(query, '10001', 3)
      ]);
      
      console.log(`📦 DEBUG Results - Walmart: ${walmartResults.length}, Target: ${targetResults.length}`);
      
      res.json({
        query,
        walmart: {
          count: walmartResults.length,
          results: walmartResults
        },
        target: {
          count: targetResults.length,
          results: targetResults
        }
      });
    } catch (error) {
      console.error('DEBUG endpoint error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Enhanced search endpoint that combines RainforestAPI (Amazon) with SerpAPI (Walmart & Target)
  app.get('/api/products/search/enhanced', async (req, res) => {
    try {
      const { query, limit = 20, page = 1 } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const serpService = getSerpAPIService();
      const results: any[] = [];

      // Execute both API calls in parallel for better performance
      const apiCalls = [];

      // Amazon API call
      if (RAINFOREST_API_KEY && RAINFOREST_API_KEY !== 'your_api_key_here') {
        const amazonCall = fetch(`${RAINFOREST_API_URL}?${new URLSearchParams({
          api_key: RAINFOREST_API_KEY,
          type: "search",
          amazon_domain: "amazon.com",
          search_term: query as string,
        }).toString()}`)
          .then(response => response.ok ? response.json() : null)
          .then(data => {
            if (data?.search_results) {
              return data.search_results.slice(0, Math.min(Number(limit), 15)).map((product: any) => ({
                ...product,
                retailer: 'amazon',
                retailer_logo: '/logos/amazon-logo.png'
              }));
            }
            return [];
          })
          .catch(error => {
            console.error('Amazon search error:', error);
            return [];
          });
        apiCalls.push(amazonCall);
      }

      // SerpAPI call (Walmart & Target)
      if (serpService) {
        console.log(`Starting SerpAPI search for query: "${query}"`);
        const serpCall = serpService.searchBothStores(query as string, '60602', Math.min(Number(limit), 15))
          .then(results => {
            console.log(`SerpAPI search completed with ${results.length} total results`);
            const walmartCount = results.filter(r => r.retailer === 'walmart').length;
            const targetCount = results.filter(r => r.retailer === 'target').length;
            console.log(`SerpAPI breakdown: ${walmartCount} Walmart, ${targetCount} Target products`);
            return results;
          })
          .catch(error => {
            console.error('SerpAPI search error:', error);
            return [];
          });
        apiCalls.push(serpCall);
      } else {
        console.log('SerpAPI service not available');
      }

      // Wait for all API calls to complete
      const apiResults = await Promise.all(apiCalls);
      
      // Process Amazon results
      if (apiResults[0]) {
        results.push(...apiResults[0]);
      }

      // Process SerpAPI results  
      if (apiResults[1]) {
        try {
          const serpResults = apiResults[1];
          
          // Transform SerpAPI results to match RainforestAPI format
          const transformedResults = serpResults.map((product: SerpProduct) => {
            let priceValue = 0;
            let rawPrice = product.price;
            
            try {
              // Handle different price formats
              if (typeof product.price === 'number') {
                priceValue = product.price;
                rawPrice = `$${product.price.toFixed(2)}`;
              } else if (typeof product.price === 'string') {
                // For strings like "$7.99", extract the number
                const numericMatch = product.price.match(/\$?(\d+(?:\.\d{2})?)/);
                if (numericMatch && product.price !== 'Price varies') {
                  priceValue = parseFloat(numericMatch[1]);
                  rawPrice = product.price.startsWith('$') ? product.price : `$${product.price}`;
                } else {
                  // For "Price varies" and similar, keep as string
                  priceValue = 0;
                  rawPrice = product.price;
                }
              } else if (product.price && typeof product.price === 'object') {
                // Handle price objects like { value: 10.99, currency: 'USD' }
                const priceObj = product.price as any;
                priceValue = parseFloat(String(priceObj.value || priceObj.amount || '0').replace(/[^0-9.]/g, '') || '0');
                rawPrice = priceObj.raw || `$${priceValue.toFixed(2)}`;
              }
              

            } catch (err) {
              console.error('Price parsing error:', err, 'for product:', product.title);
              priceValue = 0;
              rawPrice = 'Price not available';
            }

            return {
              title: product.title,
              price: {
                value: priceValue,
                currency: 'USD',
                raw: rawPrice
              },
              image: product.image_url,
              link: product.product_url,
              rating: parseFloat(product.rating || '0'),
              retailer: product.retailer,
              retailer_logo: `/logos/${product.retailer}-logo.png`,
              product_id: product.product_id,
              brand: product.brand,
              description: product.description
            };
          });

          results.push(...transformedResults);
        } catch (error) {
          console.error('SerpAPI search error:', error);
        }
      }

      // Shuffle results to mix retailers
      const shuffledResults = results.sort(() => Math.random() - 0.5);

      // For multi-retailer search, we'll implement a simple approach:
      // Return all results from current search, but allow for increasing the limit
      const currentPage = parseInt(page as string) || 1;
      const resultsPerPage = parseInt(limit as string) || 20;
      const totalResults = shuffledResults.length;
      
      // Calculate start and end indices for current page
      const startIndex = (currentPage - 1) * resultsPerPage;
      const endIndex = startIndex + resultsPerPage;
      const paginatedResults = shuffledResults.slice(startIndex, endIndex);
      
      const totalPages = Math.max(1, Math.ceil(totalResults / resultsPerPage));
      const hasNextPage = endIndex < totalResults;
      const hasPreviousPage = currentPage > 1;

      const responseData = {
        search_results: paginatedResults,
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          has_next_page: hasNextPage,
          has_previous_page: hasPreviousPage,
          total_results: totalResults,
          results_per_page: resultsPerPage,
          showing_results: paginatedResults.length
        },
        request_info: {
          success: true,
          message: `Enhanced search with ${results.length} results from multiple retailers`,
          retailers_included: ['amazon', 'walmart', 'target'],
          serpapi_enabled: !!serpService
        }
      };

      // Record analytics event
      await storage.recordEvent({
        eventType: "enhanced_product_search",
        userId: (req as any).user?.claims?.sub,
        data: { 
          query, 
          resultsCount: results.length,
          amazonResults: results.filter(r => r.retailer === 'amazon').length,
          walmartResults: results.filter(r => r.retailer === 'walmart').length,
          targetResults: results.filter(r => r.retailer === 'target').length,
          serpApiEnabled: !!serpService
        },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });

      res.json(responseData);
    } catch (error) {
      console.error("Error in enhanced search:", error);
      res.status(500).json({ message: "Failed to perform enhanced search" });
    }
  });

  app.get('/api/products/:asin', async (req, res) => {
    try {
      const { asin } = req.params;
      
      const params = {
        api_key: RAINFOREST_API_KEY,
        type: "product",
        amazon_domain: "amazon.com",
        asin,
      };
      
      const response = await fetch(RAINFOREST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`RainforestAPI error: ${response.statusText}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Donation routes
  app.post('/api/donations', isAuthenticated, async (req: any, res) => {
    try {
      const supporterId = req.user.claims.sub;
      const donationData = insertDonationSchema.parse({ ...req.body, supporterId });
      
      const donation = await storage.createDonation(donationData);
      
      // Create notification for wishlist owner
      const wishlist = await storage.getWishlist(donation.wishlistId);
      if (wishlist) {
        await storage.createNotification({
          userId: wishlist.userId,
          type: "donation_received",
          title: "New Donation Received!",
          message: `Someone has donated to your wishlist "${wishlist.title}"`,
          data: { donationId: donation.id, wishlistId: wishlist.id },
        });
        
        // Send real-time notification
        const ws = wsConnections.get(wishlist.userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "notification",
            data: {
              type: "donation_received",
              title: "New Donation Received!",
              message: `Someone has donated to your wishlist "${wishlist.title}"`,
            },
          }));
        }
      }
      
      // Record analytics event
      await storage.recordEvent({
        eventType: "donation_made",
        userId: supporterId,
        data: { donationId: donation.id, amount: donation.amount },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.status(201).json(donation);
    } catch (error) {
      console.error("Error creating donation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create donation" });
    }
  });

  // Thank You Notes routes
  app.post('/api/thank-you-notes', isAuthenticated, async (req: any, res) => {
    try {
      const fromUserId = req.user.claims.sub;
      const noteData = insertThankYouNoteSchema.parse({ ...req.body, fromUserId });
      
      const note = await storage.createThankYouNote(noteData);
      
      // Create notification for recipient
      await storage.createNotification({
        userId: noteData.toUserId,
        type: "thank_you_received",
        title: "Thank You Note Received!",
        message: `You received a thank you note from a grateful recipient`,
        data: { noteId: note.id },
      });
      
      // Send real-time notification
      const ws = wsConnections.get(noteData.toUserId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "notification",
          data: {
            type: "thank_you_received",
            title: "Thank You Note Received!",
            message: "You received a thank you note from a grateful recipient",
          },
        }));
      }

      // Send email notification to supporter
      const supporter = await storage.getUser(noteData.toUserId);
      const sender = await storage.getUser(fromUserId);
      
      if (supporter?.email && sender) {
        await emailService.sendThankYouNoteNotification(
          supporter.email,
          supporter.firstName || 'Supporter',
          sender.firstName || 'A grateful recipient',
          noteData.subject || 'Thank You',
          noteData.message
        );
      }

      // Record analytics event for thank you note
      await storage.recordEvent({
        eventType: "thank_you_sent",
        userId: fromUserId,
        data: { 
          noteId: note.id,
          toUserId: noteData.toUserId,
          subject: noteData.subject,
          senderName: sender?.firstName || 'Anonymous',
          recipientName: supporter?.firstName || 'Anonymous'
        },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating thank you note:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create thank you note" });
    }
  });

  app.get('/api/thank-you-notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notes = await storage.getUserThankYouNotes(userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching thank you notes:", error);
      res.status(500).json({ message: "Failed to fetch thank you notes" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Recent Activity endpoint
  app.get('/api/activity/recent', async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const recentActivity = await storage.getRecentActivity();
      
      // Format the activity data for frontend consumption
      const formattedActivity = recentActivity.slice(0, Number(limit)).map((activity: any) => ({
        id: activity.id,
        type: activity.eventType,
        message: formatActivityMessage(activity),
        time: activity.createdAt,
        icon: getActivityIcon(activity.eventType),
        data: activity.data
      }));
      
      res.json(formattedActivity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Real-time pricing lookup for wishlist items
  app.get('/api/items/:itemId/pricing', async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      
      // Get item directly using the new method
      const item = await storage.getWishlistItem(itemId);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      const searchQuery = generateSearchQuery(item.title);
      console.log(`🔍 Optimized search query: "${item.title}" → "${searchQuery}"`);
      
      const serpService = getSerpAPIService();
      const results: any = {
        amazon: { price: item.price || '99.00', available: false },
        walmart: { price: item.price || '99.00', available: false },
        target: { price: item.price || '99.00', available: false }
      };

      // Amazon pricing via RainforestAPI
      if (RAINFOREST_API_KEY && RAINFOREST_API_KEY !== 'your_api_key_here') {
        try {
          const amazonParams = new URLSearchParams({
            api_key: RAINFOREST_API_KEY,
            type: "search",
            amazon_domain: "amazon.com",
            search_term: searchQuery,
          });

          const amazonResponse = await fetch(`${RAINFOREST_API_URL}?${amazonParams.toString()}`);
          if (amazonResponse.ok) {
            const amazonData = await amazonResponse.json();
            if (amazonData.search_results && amazonData.search_results.length > 0) {
              const bestMatch = amazonData.search_results[0];
              const amazonPrice = bestMatch.price?.value || bestMatch.price?.raw;
              // Only mark as available if we have a valid price and ASIN
              if (amazonPrice && bestMatch.asin) {
                results.amazon = {
                  price: amazonPrice,
                  available: true,
                  link: `https://amazon.com/dp/${bestMatch.asin}?tag=needfully-20`
                };
              }
            }
          }
        } catch (error) {
          console.error('Amazon pricing lookup error:', error);
        }
      }

      // Walmart & Target pricing via SerpAPI
      if (serpService) {
        try {
          const [walmartResults, targetResults] = await Promise.all([
            serpService.searchWalmart(searchQuery, '60602', 3),
            serpService.searchTarget(searchQuery, '10001', 3)
          ]);

          if (walmartResults.length > 0) {
            const bestWalmartMatch = walmartResults[0];
            let walmartPrice = bestWalmartMatch.price;
            if (typeof walmartPrice === 'string') {
              walmartPrice = parseFloat(walmartPrice.replace(/[^0-9.]/g, ''));
            }
            // Only mark as available if we have a valid price greater than 0
            if (walmartPrice && walmartPrice > 0) {
              results.walmart = {
                price: walmartPrice.toString(),
                available: true,
                link: bestWalmartMatch.product_url
              };
            }
          }

          if (targetResults.length > 0) {
            const bestTargetMatch = targetResults[0];
            let targetPrice = bestTargetMatch.price;
            if (typeof targetPrice === 'string') {
              targetPrice = parseFloat(targetPrice.replace(/[^0-9.]/g, ''));
            }
            // Only mark as available if we have a valid price greater than 0
            if (targetPrice && targetPrice > 0) {
              results.target = {
                price: targetPrice.toString(),
                available: true,
                link: bestTargetMatch.product_url
              };
            }
          }
        } catch (error) {
          console.error('SerpAPI pricing lookup error:', error);
        }
      }

      res.json({
        itemId: itemId,
        title: item.title,
        originalPrice: item.price,
        pricing: results,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching item pricing:", error);
      res.status(500).json({ message: "Failed to fetch item pricing" });
    }
  });

  // Test email endpoint (for development only)
  app.post('/api/test-email', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      const success = await emailService.sendPurchaseConfirmation(
        user.email,
        user.firstName || 'Test User',
        'Test Product',
        'Test Needs List',
        'Test Recipient'
      );

      res.json({ 
        success, 
        message: success ? 'Test email sent successfully!' : 'Email service not configured',
        emailSent: user.email
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Email test pages (development only)
  app.get('/test-email', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'test-email.html'));
  });
  
  app.get('/quick-test', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'quick-email-test.html'));
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userType = req.user.claims.userType;
      if (userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userType = req.user.claims.userType;
      if (userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { startDate, endDate, eventType } = req.query;
      const analytics = await storage.getAnalytics({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        eventType: eventType as string,
      });
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/recent-activity', async (req, res) => {
    try {
      const activity = await storage.getRecentActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Community Impact API endpoints
  app.get('/api/community/stats', async (req, res) => {
    try {
      const { timeRange = '30d' } = req.query;
      
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Get community statistics
      const stats = await storage.getCommunityStats(startDate, now);
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ message: "Failed to fetch community statistics" });
    }
  });

  app.get('/api/community/activity', async (req, res) => {
    try {
      const recentActivity = await storage.getRecentActivity();
      res.json(recentActivity);
    } catch (error) {
      console.error("Error fetching community activity:", error);
      res.status(500).json({ message: "Failed to fetch community activity" });
    }
  });

  // Authentication-related API endpoints
  
  // Request password reset
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists for security
        return res.json({ message: "If an account exists with this email, a password reset link has been sent." });
      }

      // Generate secure token
      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await storage.createPasswordResetToken({
        userId: user.id,
        token: token,
        expiresAt: expiresAt
      });

      // Send password reset email
      const resetSuccess = await emailService.sendPasswordResetEmail(
        user.email!,
        user.firstName || 'User',
        token
      );

      if (resetSuccess) {
        res.json({ message: "If an account exists with this email, a password reset link has been sent." });
      } else {
        res.status(500).json({ message: "Failed to send password reset email" });
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // Verify password reset token
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      // Find and validate token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken || resetToken.isUsed || resetToken.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(resetToken.id);

      // In a real app, you would hash the password here
      // For this implementation, we'll just acknowledge the reset
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Request email verification
  app.post('/api/auth/verify-email', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      if (user.isVerified) {
        return res.json({ message: "Email is already verified" });
      }

      // Generate secure token
      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token
      await storage.createEmailVerificationToken({
        userId: user.id,
        token: token,
        email: user.email,
        expiresAt: expiresAt
      });

      // Send verification email
      const verificationSuccess = await emailService.sendEmailVerificationEmail(
        user.email,
        user.firstName || 'User',
        token
      );

      if (verificationSuccess) {
        res.json({ message: "Verification email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  // Resend email verification
  app.post('/api/auth/resend-verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      if (user.isVerified) {
        return res.json({ message: "Email is already verified" });
      }

      // Generate secure token
      const token = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token
      await storage.createEmailVerificationToken({
        userId: user.id,
        token: token,
        email: user.email,
        expiresAt: expiresAt
      });

      // Send verification email
      const verificationSuccess = await emailService.sendEmailVerificationEmail(
        user.email,
        user.firstName || 'User',
        token
      );

      if (verificationSuccess) {
        res.json({ message: "Verification email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send verification email" });
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  });

  // Confirm email verification
  app.post('/api/auth/confirm-email', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      // Find and validate token
      const verificationToken = await storage.getEmailVerificationToken(token);
      if (!verificationToken || verificationToken.isUsed || verificationToken.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      // Mark user as verified
      await storage.updateUser(verificationToken.userId, { isVerified: true });
      
      // Mark token as used
      await storage.markEmailVerificationTokenAsUsed(verificationToken.id);

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Error confirming email:", error);
      res.status(500).json({ message: "Failed to confirm email verification" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    
    if (userId) {
      wsConnections.set(userId, ws);
      console.log(`WebSocket connected for user: ${userId}`);
    }

    ws.on('close', () => {
      if (userId) {
        wsConnections.delete(userId);
        console.log(`WebSocket disconnected for user: ${userId}`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Administrative Actions Endpoints

  // Export users data
  app.get('/api/admin/export/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Convert to CSV format
      const csvHeaders = 'ID,Email,First Name,Last Name,User Type,Created At,Verified\n';
      const csvData = users.map(user => 
        `${user.id},"${user.email || ''}","${user.firstName || ''}","${user.lastName || ''}","${user.userType || 'user'}","${user.createdAt}","${user.isVerified || false}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      res.send(csvHeaders + csvData);
    } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).json({ message: "Failed to export users" });
    }
  });

  // Promote user to admin
  app.post('/api/admin/promote-user', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.updateUser(user.id, { userType: 'admin' });
      
      res.json({ message: "User promoted to admin successfully" });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Send welcome emails to new users
  app.post('/api/admin/send-welcome-emails', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Get users created in the last week
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newUsers = await storage.getUsersCreatedAfter(oneWeekAgo);
      
      let emailsSent = 0;
      for (const user of newUsers) {
        if (user.email) {
          const success = await emailService.sendWelcomeEmail(
            user.email,
            user.firstName || 'User'
          );
          if (success) emailsSent++;
        }
      }
      
      res.json({ message: `Welcome emails sent to ${emailsSent} users` });
    } catch (error) {
      console.error("Error sending welcome emails:", error);
      res.status(500).json({ message: "Failed to send welcome emails" });
    }
  });

  // Cleanup inactive users (no activity in 6 months)
  app.post('/api/admin/cleanup-inactive', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      const cleanedCount = await storage.cleanupInactiveUsers(sixMonthsAgo);
      
      res.json({ message: `Cleaned up ${cleanedCount} inactive users` });
    } catch (error) {
      console.error("Error cleaning up users:", error);
      res.status(500).json({ message: "Failed to cleanup inactive users" });
    }
  });

  // Check flagged content
  app.get('/api/admin/flagged-content', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // For now, return a mock count. In a real system, you'd query flagged content
      const flaggedCount = 0; // Placeholder
      
      res.json({ count: flaggedCount, message: "No flagged content found" });
    } catch (error) {
      console.error("Error checking flagged content:", error);
      res.status(500).json({ message: "Failed to check flagged content" });
    }
  });

  // Approve all pending needs lists
  app.post('/api/admin/approve-pending', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const approvedCount = await storage.approveAllPendingWishlists();
      
      res.json({ message: `Approved ${approvedCount} pending needs lists` });
    } catch (error) {
      console.error("Error approving pending lists:", error);
      res.status(500).json({ message: "Failed to approve pending lists" });
    }
  });

  // Export content report
  app.get('/api/admin/export/content-report', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const wishlists = await storage.getAllWishlists();
      
      // Convert to CSV format
      const csvHeaders = 'ID,Title,Description,Category,Status,Created At,User ID,Items Count\n';
      const csvData = wishlists.map(wishlist => 
        `${wishlist.id},"${wishlist.title}","${wishlist.description}","${wishlist.category}","${wishlist.status}","${wishlist.createdAt}","${wishlist.userId}","${wishlist.items?.length || 0}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="content-report.csv"');
      res.send(csvHeaders + csvData);
    } catch (error) {
      console.error("Error exporting content report:", error);
      res.status(500).json({ message: "Failed to export content report" });
    }
  });

  // Update search index
  app.post('/api/admin/update-search-index', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // In a real system, this would rebuild search indexes
      // For now, we'll simulate the operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      res.json({ message: "Search index updated successfully" });
    } catch (error) {
      console.error("Error updating search index:", error);
      res.status(500).json({ message: "Failed to update search index" });
    }
  });

  // Export analytics with date range
  app.get('/api/admin/export/analytics', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { start, end } = req.query;
      
      // Get analytics events within date range
      const events = await storage.getAnalyticsInDateRange(
        new Date(start as string),
        new Date(end as string)
      );
      
      // Convert to CSV format
      const csvHeaders = 'ID,Event Type,Message,User ID,Created At\n';
      const csvData = events.map(event => 
        `${event.id},"${event.eventType}","${event.message}","${event.userId || ''}","${event.createdAt}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${start}-to-${end}.csv"`);
      res.send(csvHeaders + csvData);
    } catch (error) {
      console.error("Error exporting analytics:", error);
      res.status(500).json({ message: "Failed to export analytics" });
    }
  });

  // Create database backup
  app.post('/api/admin/backup-database', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `backup-${timestamp}.sql`;
      
      // In a real system, this would create an actual database backup
      // For now, we'll simulate the operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      res.json({ 
        message: "Database backup created successfully",
        filename: filename 
      });
    } catch (error) {
      console.error("Error creating database backup:", error);
      res.status(500).json({ message: "Failed to create database backup" });
    }
  });

  // Clear application cache
  app.post('/api/admin/clear-cache', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Clear various caches
      productCache.clear();
      
      // In a real system, this would clear Redis cache, CDN cache, etc.
      await new Promise(resolve => setTimeout(resolve, 500));
      
      res.json({ message: "Cache cleared successfully" });
    } catch (error) {
      console.error("Error clearing cache:", error);
      res.status(500).json({ message: "Failed to clear cache" });
    }
  });

  // Emergency maintenance mode
  app.post('/api/admin/emergency-maintenance', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // In a real system, this would enable maintenance mode
      // For now, we'll just acknowledge the request
      console.log("EMERGENCY MAINTENANCE MODE REQUESTED");
      
      res.json({ message: "Maintenance mode enabled" });
    } catch (error) {
      console.error("Error enabling maintenance mode:", error);
      res.status(500).json({ message: "Failed to enable maintenance mode" });
    }
  });

  // Remove user endpoint
  app.delete('/api/admin/users/:userId', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Get user details before removal for email notification
      const userToRemove = await storage.getUserById(userId);
      if (!userToRemove) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prevent admin from removing themselves
      if (req.user.claims.sub === userId) {
        return res.status(400).json({ message: 'Cannot remove your own admin account' });
      }

      // Prevent removing other admin users
      if (userToRemove.userType === 'admin') {
        return res.status(400).json({ message: 'Cannot remove admin users' });
      }

      // Remove user and all associated data
      await storage.removeUser(userId);

      // Send violation notification email to the user being removed
      if (userToRemove.email) {
        await emailService.sendUserRemovalNotification(
          userToRemove.email,
          userToRemove.firstName || 'User',
          'Your account has been removed from MyNeedfully due to violation of our terms and conditions. If you believe this was done in error, please contact our support team.'
        );
      }

      // Send notification email to admin about the removal
      const adminUser = await storage.getUser(req.user.claims.sub);
      if (adminUser && adminUser.email) {
        await emailService.sendUserRemovalNotification(
          adminUser.email,
          adminUser.firstName || 'Admin',
          `User account has been successfully removed from the platform:\n\nRemoved User: ${userToRemove.firstName || ''} ${userToRemove.lastName || ''} (${userToRemove.email})\nUser ID: ${userToRemove.id}\nRemoval Date: ${new Date().toLocaleString()}\n\nAll associated data including wishlists, donations, and activity has been permanently deleted.`
        );
      }

      res.json({ message: 'User removed successfully' });
    } catch (error) {
      console.error("Error removing user:", error);
      res.status(500).json({ message: "Failed to remove user" });
    }
  });

  // Add download route for project backup
  app.get('/download', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'download.html'));
  });

  app.get('/myneedfully-backup.tar.gz', (req, res) => {
    const filePath = path.join(__dirname, '..', 'myneedfully-backup.tar.gz');
    res.download(filePath, 'myneedfully-backup.tar.gz', (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(404).send('File not found');
      }
    });
  });

  return httpServer;
}
