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
5. **Donation Process**: Donors fulfill items with confirmation tracking
6. **Notification System**: Real-time updates via WebSocket connections
7. **Thank You Flow**: Gratitude messaging between recipients and donors

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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```