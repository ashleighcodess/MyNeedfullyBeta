import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupMultiAuth, isAuthenticated } from "./auth/multiAuth";
import { z } from "zod";
import { getSerpAPIService, SerpProduct } from "./serpapi-service";
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
      return `Fulfilled an item request`;
    case 'donation_made':
      return `Made a donation`;
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
    case 'user_registered':
      return 'user-plus';
    default:
      return 'activity';
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
      
      // Record activity event
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
    } catch (error) {
      console.error("Error adding wishlist item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item" });
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
            image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop",
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
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
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
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
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
            image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop",
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
            image: "https://images.unsplash.com/photo-1481887328591-3e277f9473dc?w=400&h=400&fit=crop",
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
            image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop",
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
              image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
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
              image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop",
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
              image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=300&fit=crop",
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
              image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
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
              image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=300&h=300&fit=crop",
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
              image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
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
              image: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=300&h=300&fit=crop",
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
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop",
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
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop",
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

  // Enhanced search endpoint that combines RainforestAPI (Amazon) with SerpAPI (Walmart & Target)
  app.get('/api/products/search/enhanced', async (req, res) => {
    try {
      const { query, limit = 20, page = 1 } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const serpService = getSerpAPIService();
      const results: any[] = [];

      // Get Amazon results from RainforestAPI (existing implementation)
      if (RAINFOREST_API_KEY && RAINFOREST_API_KEY !== 'your_api_key_here') {
        try {
          const params = new URLSearchParams({
            api_key: RAINFOREST_API_KEY,
            type: "search",
            amazon_domain: "amazon.com",
            search_term: query as string,
          });

          const response = await fetch(`${RAINFOREST_API_URL}?${params.toString()}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.search_results) {
              // Transform Amazon results to include retailer info
              const amazonResults = data.search_results.slice(0, Math.floor(Number(limit) / 3)).map((product: any) => ({
                ...product,
                retailer: 'amazon',
                retailer_logo: '/logos/amazon-logo.png'
              }));
              results.push(...amazonResults);
            }
          }
        } catch (error) {
          console.error('Amazon search error:', error);
        }
      }

      // Get Walmart and Target results from SerpAPI
      if (serpService) {
        try {
          const serpResults = await serpService.searchBothStores(query as string, '60602', Math.floor(Number(limit) / 3));
          
          // Transform SerpAPI results to match RainforestAPI format
          const transformedResults = serpResults.map((product: SerpProduct) => {
            let priceValue = 0;
            try {
              // Handle different price formats
              if (typeof product.price === 'number') {
                priceValue = product.price;
              } else if (typeof product.price === 'string') {
                priceValue = parseFloat(product.price.replace(/[^0-9.]/g, '') || '0');
              } else if (product.price && typeof product.price === 'object') {
                // Handle price objects like { value: 10.99, currency: 'USD' }
                const priceObj = product.price as any;
                priceValue = parseFloat(String(priceObj.value || priceObj.amount || '0').replace(/[^0-9.]/g, '') || '0');
              }
            } catch (err) {
              console.error('Price parsing error:', err, 'for product:', product.title);
              priceValue = 0;
            }

            return {
              title: product.title,
              price: {
                value: priceValue,
                currency: 'USD',
                raw: product.price
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
      const resultsPerPage = parseInt(limit as string) || 10;
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
