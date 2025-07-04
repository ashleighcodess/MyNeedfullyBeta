# MyNeedfully - Wishlist-Based Donation Platform

## Overview

MyNeedfully is a full-stack web application that enables people in need to create wishlists for specific items they require, while allowing donors to browse and fulfill these needs. The platform serves families after disasters, nonprofits, and individuals in crisis by connecting them with generous donors through an intuitive, transparent donation system.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for brand colors (coral, warm backgrounds)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OIDC integration and session management
- **Real-time**: WebSocket connections for live notifications
- **External APIs**: RainforestAPI for product search functionality

### Build and Development
- **Build Tool**: Vite for frontend, esbuild for backend bundling
- **Development**: Hot module replacement for frontend, tsx for backend development
- **TypeScript**: Strict configuration with path mapping for clean imports

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple
- **Authorization**: Role-based access control (user/admin)
- **Security**: HTTP-only secure cookies, JWT tokens

### Database Schema
- **Users**: Profile management with verification status
- **Wishlists**: Core entity with categorization, urgency levels, and status tracking
- **Wishlist Items**: Individual items with fulfillment tracking
- **Donations**: Transaction records linking donors to fulfilled items
- **Notifications**: Real-time alert system
- **Thank You Notes**: Gratitude messaging between users
- **Analytics**: Event tracking for platform insights

### Real-time Features
- **WebSocket Integration**: Live notifications for donations and fulfillments
- **Notification Center**: Centralized alert management
- **Connection Management**: Automatic reconnection with user identification

### Product Integration
- **Search API**: RainforestAPI integration for product discovery
- **Affiliate Links**: Product URL management for donor purchases
- **Price Tracking**: Monitor product availability and pricing

## Data Flow

1. **User Registration**: Replit Auth handles authentication and creates user profiles
2. **Wishlist Creation**: Users create categorized wishlists with detailed stories and shipping information
3. **Product Search**: Integration with external APIs for finding specific items
4. **Browse and Discovery**: Public wishlist browsing with advanced filtering
5. **Donation Process**: Supporters fulfill items with confirmation tracking
6. **Notification System**: Real-time updates via WebSocket connections
7. **Thank You Flow**: Gratitude messaging between recipients and supporters

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL hosting with serverless scaling
- **Replit Auth**: Authentication and user management
- **RainforestAPI**: Product search and data aggregation

### Development Tools
- **Replit**: Development environment with integrated deployment
- **Vite**: Frontend build tooling with HMR
- **Drizzle Kit**: Database migrations and schema management

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server for frontend, tsx for backend
- **Database**: Neon development instance with environment variables
- **Authentication**: Replit Auth development configuration

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild bundling for Node.js deployment
- **Environment**: Production database and authentication endpoints
- **Static Assets**: Served from dist/public directory

### Configuration Management
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, API keys
- **Build Scripts**: Separate development and production workflows
- **Database Migrations**: Drizzle push for schema updates

## Changelog

```
Changelog:
- July 04, 2025: Initial setup and development
- July 04, 2025: Fixed React import errors and SelectItem value prop issues
- July 04, 2025: Completed full platform with working authentication, product search, and performance optimization
- July 04, 2025: App successfully deployed and functional at production URL
- July 04, 2025: Implemented Amazon affiliate link system with tracking ID 'needfully-20' for commission earning
- July 04, 2025: Enhanced profile dashboard with dynamic completion progress, sidebar navigation, and profile stats matching design requirements
- July 04, 2025: Enhanced About Us page with community images and decorative backgrounds for better visual appeal
- July 04, 2025: Added comprehensive footer component with navigation links, branding, and legal pages throughout the website
- July 04, 2025: Implemented multi-provider OAuth authentication system (Replit, Google, Facebook) with professional signup flow and updated messaging
- July 04, 2025: Added comprehensive edit functionality for needs lists including image management, address autocomplete, and owner-only access controls
- July 04, 2025: Fixed critical edit functionality authorization bug - corrected API endpoint from `/api/wishlists` to `/api/wishlists/${id}` for proper data fetching
- July 04, 2025: Resolved FormData upload issue in edit mutation with proper fetch implementation for file uploads
- July 04, 2025: Successfully completed comprehensive terminology update throughout entire application - replaced all instances of "Donor" with "Supporter" for more inclusive and positive language, including database schema updates, API endpoints, frontend text, and notification messages
- July 04, 2025: Fixed critical profile picture upload bug by correcting apiRequest parameter order in edit-profile.tsx and privacy-settings.tsx
- July 04, 2025: Enhanced profile picture upload system with image compression, improved error handling, and increased server payload limits to 10MB - CONFIRMED WORKING
- July 04, 2025: Successfully completed all major functionality fixes - application is fully operational with working authentication, profile management, wishlist creation/editing, product search, and supporter terminology throughout
- July 04, 2025: Implemented comprehensive SendGrid email notification system with automated purchase confirmations and thank you note delivery - includes professional HTML templates with brand colors, purchase confirmation emails for supporters, and thank you note notification emails with full integration into purchase and messaging workflows
- July 04, 2025: Improved navigation clarity by changing "Profile" page title to "Dashboard" and "Dashboard" navigation link to "Quick Actions" for better user experience
- July 04, 2025: Updated terminology from "Browse Wishlists" to "Browse Needs Lists" and "View Wishlist" to "View Needs List" throughout the application for consistent language
- July 04, 2025: Implemented featured image functionality with image carousel for needs lists - added clickable story images with hover effects and full-screen modal carousel with navigation controls and thumbnail strip
- July 04, 2025: Implemented comprehensive RainforestAPI performance optimizations including search debouncing (500ms), intelligent caching system (5-minute cache with 50-entry limit), enhanced loading states with progress indicators, and user feedback for 5-10 second search times - improving user experience during real-time product data retrieval
- July 04, 2025: Successfully implemented Quick Tips onboarding system with 5 contextual hints for first-time users, including affiliate link disclosure for legal compliance, authentication-based visibility, CSS-based animations, and smart positioning - CONFIRMED WORKING
- July 04, 2025: Removed Community Impact from main navigation menu for cleaner interface, added Community Impact link to footer for easy access, and connected backend API with real database queries for live community statistics when platform goes live
- July 04, 2025: Fixed critical category validation error preventing items from being added to needs lists by handling "all" category conversion to "other", enhanced product image styling with object-contain fitting and hover effects, resolved React key duplication warnings - ADD TO NEEDS LIST FUNCTIONALITY NOW FULLY OPERATIONAL
- July 04, 2025: Added "Manage my Needs Lists" option to home page Getting Started section with Settings icon linking to profile dashboard
- July 04, 2025: Completely redesigned Items Needed container layout to match user specifications with compact horizontal product cards, truncated titles (showing only text before first comma), visible buying options panel with Amazon/Target/Walmart retailers, proper brand color indicators, and improved spacing (112px height, generous padding) for enhanced readability
- July 04, 2025: Successfully implemented complete multi-retailer search integration with SerpAPI - replaced colored dots with authentic Amazon, Walmart, and Target SVG logos throughout interface, created enhanced search endpoint combining RainforestAPI (Amazon) with SerpAPI (Walmart/Target), updated product search pages to display real retailer information, and confirmed live functionality with actual product data from all three retailers - MULTI-RETAILER SEARCH FULLY OPERATIONAL
- July 04, 2025: Upgraded retailer logos from SVG to high-quality PNG images provided by user - updated all logo references in product search pages and needs list detail pages, fixed missing retailer icons in buying options panels, added proper logo display with rounded styling throughout the interface - RETAILER LOGO UPGRADE COMPLETED
- July 04, 2025: Fixed critical database connection failure by migrating from Neon WebSocket connection to HTTP connection - resolved serverless compatibility issues causing app startup crashes, updated database configuration in server/db.ts to use drizzle-orm/neon-http adapter instead of neon-serverless Pool - APPLICATION NOW FULLY OPERATIONAL
- July 04, 2025: Resolved missing needs lists in user dashboard profile - fixed API endpoint references from user ID-based URLs to authenticated endpoints, updated profile.tsx to use /api/user/wishlists and /api/user/donations, added missing user donations endpoint in routes.ts - USER DASHBOARD LISTS NOW DISPLAY CORRECTLY
- July 04, 2025: Fixed critical purchase confirmation system bugs - corrected shipping address display by passing wishlist.shippingAddress instead of user.shippingAddress, fixed API fulfillment error by correcting apiRequest parameter order from (url, method) to (method, url), enhanced address formatting to handle both object and string formats with proper error handling - PURCHASE WORKFLOW NOW FULLY FUNCTIONAL AND TESTED
- July 04, 2025: Fixed SendGrid email configuration to use verified domain data@myneedfully.app instead of incorrect domain - both purchase confirmation and thank you note emails now working with proper sender authentication
- July 04, 2025: Enhanced Recent Activity tracking system to properly capture purchase events ("Purchased [item] for someone in need") and thank you note events ("Sent a thank you note to [supporter]") with analytics recording for complete activity timeline visibility
- July 04, 2025: CHECKPOINT - Fixed Recent Activity display system to properly show real-time activity updates - corrected database query to fetch from analytics_events instead of donations table, added proper cache invalidation for both purchase fulfillment and thank you note mutations, confirmed API endpoint returns authentic purchase data with proper formatting and timestamps - RECENT ACTIVITY SYSTEM NOW FULLY OPERATIONAL
- July 04, 2025: Implemented product title truncation on Needs List page to display only text before first comma for cleaner, more readable item titles - enhanced user interface with compact buying options panel featuring reduced spacing and smaller fonts for improved layout efficiency
- July 04, 2025: RESOLVED CRITICAL PRICING API ISSUES - fixed 404 errors by implementing proper getWishlistItem database method, updated pricing endpoint to use direct item retrieval instead of inefficient scanning, confirmed real-time pricing system now fully operational with successful data from Amazon/Walmart/Target APIs - PRICING SYSTEM FULLY FUNCTIONAL
- July 04, 2025: Implemented comprehensive authentication email system with automated welcome emails, password reset functionality, and email verification flows - added passwordResetTokens and emailVerificationTokens database tables, enhanced storage layer with token management methods, integrated welcome email automation for new user signups, and created API endpoints for /api/auth/forgot-password, /api/auth/reset-password, /api/auth/verify-email, and /api/auth/confirm-email - AUTHENTICATION EMAIL SYSTEM FULLY OPERATIONAL
- July 04, 2025: Updated landing page hero section with new messaging "A Registry For Recovery, Relief and Hardships" replacing previous "Connect Hearts, Fulfill Needs" and added smooth gradient overlay transition from hero section to white space below for improved visual flow
- July 04, 2025: Implemented interactive scroll-triggered journey map animations with progressive line expansion from step 1 to step 4, featuring smooth transitions, staggered timing delays, and responsive design for both desktop horizontal and mobile vertical layouts - lines animate at optimized scroll thresholds (10%, 20%, 30%) for enhanced user engagement
- July 04, 2025: Enhanced About Us section with animated ticker stats and heart tree image - added professional ticker cards showing community impact statistics (Needs List Fulfilled, Created, Smiles Spread, Products Delivered) with coral and white alternating design, integrated heart tree illustration with rounded corners and shadow effects for improved visual appeal
- July 04, 2025: Implemented real animated ticker counters with scroll-triggered animations - created custom useAnimatedCounter hook with smooth easing animation, added scroll detection for About Us section, connected animated values to display real-time counting from 0 to target numbers (127, 453, 2.8k, 1.2k), added hover effects on ticker cards and custom Person-Carry-Box SVG icon for "Needs List Fulfilled" card
- July 04, 2025: Created comprehensive "Out of the Box Needs" section with brand-consistent emergency product categories - implemented search and filter functionality linking to real product search system, added four clickable category cards (Emergency Food Kit, Emergency Kit, Baby Essentials, Hygiene Kit) with coral/navy brand colors, each linking to product searches with specific queries for emergency supplies, baby items, food kits, and personal care products from Amazon/Walmart/Target retailers
- July 04, 2025: Fixed critical Target product pricing and image display issues - resolved frontend formatPrice function bug that was calling .toFixed() on string prices instead of numbers, enhanced Target image fallback system with category-based placeholder images from Unsplash for better user experience when SerpAPI doesn't return individual product images from Target category pages
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```