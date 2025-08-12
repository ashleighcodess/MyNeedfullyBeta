# MyNeedfully - Wishlist-Based Donation Platform

> **A Registry For Recovery, Relief and Hardships**

MyNeedfully is a comprehensive social impact platform that connects communities through intelligent product need matching, collaborative fulfillment, and engaging user experiences. The platform serves families after disasters, nonprofits, and individuals in crisis by connecting them with generous supporters through an intuitive, transparent donation system.

## 🌟 Features

### Core Functionality
- **Crisis-Focused Categories**: Disaster Recovery, Medical Emergency, Family Crisis, Fire/Flood Damage, Job Loss/Financial Crisis, Domestic Violence Support, Homeless/Housing Crisis, Elderly Care Crisis, Mental Health Crisis, Refugee/Immigrant Support
- **Multi-Retailer Product Search**: Integration with Amazon, Walmart, and Target APIs for comprehensive product discovery
- **Real-Time Activity Tracking**: Live community engagement metrics and recent activity feeds
- **Intelligent Needs Matching**: Advanced search and filtering for location-based assistance

### User Experience
- **Dual Authentication**: Both OAuth (Replit/Google/Facebook) and email/password options
- **Mobile-Optimized**: Responsive design with mobile-first navigation
- **Real-Time Notifications**: WebSocket-powered live updates for donations and thank you messages
- **Social Sharing**: Comprehensive sharing system across multiple platforms

### Administrative Tools
- **Admin Dashboard**: Complete platform oversight with user management and analytics
- **Featured Needs Lists**: Admin-controlled promotion system for urgent cases
- **Security**: Production-ready rate limiting for 10,000+ users

## 🚀 Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling and HMR
- **Tailwind CSS** with custom design tokens
- **shadcn/ui** components built on Radix UI
- **TanStack Query** for server state management
- **Wouter** for client-side routing

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations
- **WebSocket** connections for real-time features
- **Multi-provider OAuth** with session management

### External Integrations
- **RainforestAPI** for Amazon product data
- **SerpAPI** for Walmart and Target product search
- **SendGrid** for email notifications
- **Replit Auth** for authentication

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/myneedfully.git
   cd myneedfully
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   SENDGRID_API_KEY=your_sendgrid_api_key
   RAINFOREST_API_KEY=your_rainforest_api_key
   SERPAPI_API_KEY=your_serpapi_key
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared types and schemas
├── public/          # Static assets
└── uploads/         # User uploaded files
```


## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/user` - Get current user

### Wishlist Endpoints
- `GET /api/wishlists` - Search and browse needs lists
- `POST /api/wishlists` - Create new needs list
- `GET /api/wishlists/:id` - Get specific needs list
- `PUT /api/wishlists/:id` - Update needs list

### Product Search
- `GET /api/search` - Multi-retailer product search
- `GET /api/products/:id/pricing` - Real-time pricing data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  Recent Updates

- **July 2025**: Browse needs list search functionality fixed - location filtering now operational
- **July 2025**: Real-time activity system implemented with authentic user data
- **July 2025**: Crisis category system completed with humanitarian focus
- **July 2025**: Multi-retailer search optimization with parallel processing
- **July 2025**: Authentication system enhanced with email/password options

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with love for communities in need
- Powered by modern web technologies
- Designed for real-world humanitarian impact

---

**MyNeedfully** - Connecting hearts, fulfilling needs, building stronger communities.
