import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import {
  insertWishlistSchema,
  insertWishlistItemSchema,
  insertDonationSchema,
  insertThankYouNoteSchema,
  insertNotificationSchema,
} from "@shared/schema";

// RainforestAPI configuration
const RAINFOREST_API_KEY = process.env.RAINFOREST_API_KEY || "8789CC1433C54D12B5F2DF1A401E844E";
const RAINFOREST_API_URL = "https://api.rainforestapi.com/request";

// WebSocket connections map
const wsConnections = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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

  app.post('/api/wishlists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistData = insertWishlistSchema.parse({ ...req.body, userId });
      
      const wishlist = await storage.createWishlist(wishlistData);
      
      // Record analytics event
      await storage.recordEvent({
        eventType: "wishlist_created",
        userId,
        data: { wishlistId: wishlist.id },
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
      const item = await storage.addWishlistItem(itemData);
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error adding wishlist item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item" });
    }
  });

  // Product Search routes (RainforestAPI integration)
  app.get('/api/products/search', async (req, res) => {
    try {
      const { query, category, min_price, max_price, page = 1 } = req.query;
      
      const params = {
        api_key: RAINFOREST_API_KEY,
        type: "search",
        amazon_domain: "amazon.com",
        search_term: query,
        ...(category && { category_id: category }),
        ...(min_price && { min_price }),
        ...(max_price && { max_price }),
        page: Number(page),
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
      
      // Record analytics event
      await storage.recordEvent({
        eventType: "product_search",
        userId: (req as any).user?.claims?.sub,
        data: { query, category, resultsCount: data.search_results?.length || 0 },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });
      
      res.json(data);
    } catch (error) {
      console.error("Error searching products:", error);
      res.status(500).json({ message: "Failed to search products" });
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
      const donorId = req.user.claims.sub;
      const donationData = insertDonationSchema.parse({ ...req.body, donorId });
      
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
        userId: donorId,
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

  return httpServer;
}
