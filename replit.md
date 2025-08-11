# MyNeedfully - Wishlist-Based Donation Platform

## Overview
MyNeedfully is a full-stack web application connecting individuals in need with donors through wishlists. It supports families after disasters, nonprofits, and individuals in crisis by providing an intuitive, transparent donation system. The platform aims to be a leading solution for connecting needs with generosity, offering a vital service for community support and disaster relief.

## User Preferences
### Development Guidelines
- **CRITICAL**: When fixing issues, never modify working functionality
- **Data Integrity**: Never substitute user content with other users' data
- **Surgical Changes**: Only modify the specific problem components
- **Preserve Functionality**: All existing working features must remain intact
- **Test Impact**: Verify changes don't break unrelated functionality

Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend Architecture
- **Framework**: React with TypeScript (Vite)
- **UI Library**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS (custom design tokens for coral/warm colors)
- **State Management**: TanStack Query (server state), React hooks (local state)
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **UI/UX**: Focus on intuitive design, consistent branding (MyNeedfully logo with red icon, blue text), professional typography (JUST Sans), and engaging micro-interactions (animations, hover effects). Responsive design is prioritized for mobile-first experience across all components.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Replit Auth (OIDC, session management)
- **Real-time**: WebSocket connections (live notifications)
- **APIs**: RainforestAPI (product search)
- **Security**: Role-based access control (user/admin), HTTP-only secure cookies, JWT tokens, comprehensive rate limiting, and audit logging.

### Core Features
- **Authentication**: Replit Auth with Google OAuth integration, secure session management, and email verification.
- **Wishlist Management**: Creation of categorized wishlists with urgency, status tracking, item fulfillment, and image carousels.
- **Product Integration**: Search and display products from Amazon, Walmart, and Target with real-time pricing and affiliate linking.
- **Donation System**: Transparent process for fulfilling wishlist items with confirmation tracking.
- **Notification System**: Real-time alerts via WebSockets for donations and fulfillments.
- **Thank You Notes**: Gratitude messaging between recipients and supporters.
- **User Dashboard**: Gamified profile completion, personal needs list management, purchase history, and email preferences.
- **Admin Dashboard**: Comprehensive platform monitoring, user management, and featured needs list control.
- **Support Resources**: Curated collection of crisis support resources across various categories.
- **Legal**: Comprehensive Terms & Conditions, Privacy Policy, and Cookies Policy with affiliate marketing disclosure.

## External Dependencies
- **Neon Database**: PostgreSQL cloud hosting.
- **Replit Auth**: Authentication and user management.
- **RainforestAPI**: Product data and search for Amazon.
- **SerpAPI**: Product data and search for Walmart and Target.
- **SendGrid**: Email notification services (welcome emails, password resets, purchase confirmations, thank you notes).
- **Radix UI**: UI component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.