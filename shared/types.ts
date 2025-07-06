// Type definitions for API responses and shared data structures
import { users, wishlists, wishlistItems, donations, notifications, thankYouNotes, analyticsEvents } from "./schema";

// Database table types
export type User = typeof users.$inferSelect;
export type Wishlist = typeof wishlists.$inferSelect;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ThankYouNote = typeof thankYouNotes.$inferSelect;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// API Response types
export interface UserResponse {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  userType: string;
  userPreference: string | null;
  isVerified: boolean | null;
  createdAt: Date | null;
  [key: string]: any;
}

export interface WishlistResponse {
  id: number;
  title: string;
  description: string | null;
  story: string | null;
  location: string | null;
  urgencyLevel: string | null;
  category: string;
  status: string | null;
  createdAt: Date | null;
  totalItems: number | null;
  fulfilledItems: number | null;
  viewCount: number | null;
  shareCount: number | null;
  userId: string;
  shippingAddress: any;
  user?: UserResponse;
  items?: WishlistItemResponse[];
  [key: string]: any;
}

export interface WishlistItemResponse {
  id: number;
  wishlistId: number;
  title: string;
  description: string | null;
  quantity: number;
  fulfilled: boolean | null;
  fulfilledBy: string | null;
  fulfilledAt: Date | null;
  productUrl: string | null;
  imageUrl: string | null;
  estimatedPrice: number | null;
  actualPrice: number | null;
  [key: string]: any;
}

export interface NotificationResponse {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean | null;
  createdAt: Date | null;
  [key: string]: any;
}

export interface AdminStatsResponse {
  totalUsers: number;
  newUsersThisMonth: number;
  activeWishlists: number;
  wishlistsThisWeek: number;
  totalDonations: number;
  donationsThisMonth: number;
  totalValue: number;
  responseTime: number;
  [key: string]: any;
}

export interface ActivityResponse {
  id: string;
  supporter: string;
  action: string;
  item: string;
  location: string;
  timestamp: string;
  [key: string]: any;
}

export interface ProductSearchResponse {
  search_results: ProductResult[];
  data?: ProductResult[]; // For backwards compatibility
}

export interface ProductResult {
  id?: string;
  asin?: string;
  title: string;
  image?: string;
  image_url?: string;
  price: any;
  rating?: number;
  ratings_total?: number;
  link?: string;
  product_url?: string;
  retailer?: string;
  retailer_name?: string;
  [key: string]: any;
}

// Helper type for API error responses
export interface ApiError {
  message: string;
  status?: number;
}

// Generic API response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

// Purchase confirmation data
export interface PurchaseConfirmationData {
  item: WishlistItemResponse;
  wishlist: WishlistResponse;
  retailerUrl: string;
  supporter: UserResponse;
}