import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
// import { useWebSocket } from "@/lib/websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoImage from "@assets/Logo_7_1752018484130.png";
import { 
  Plus, 
  Heart, 
  Search, 
  Gift,
  Settings,
  User
} from "lucide-react";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

export default function Home() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Temporarily disable WebSocket to prevent DOMException
  // useWebSocket();
  
  // Check if user preference is supporter (default) or creator
  const isSupporter = user?.userPreference === 'supporter' || !user?.userPreference;
  const { isAuthenticated } = useAuth();

  // Removed debug logging for better performance

  // SEO Configuration
  useSEO({
    title: generatePageTitle("Dashboard - MyNeedfully Community Support"),
    description: generatePageDescription("Welcome to your MyNeedfully dashboard. Access quick actions to create needs lists, browse support opportunities, and manage your community involvement."),
    keywords: generateKeywords([
      "MyNeedfully dashboard",
      "crisis support dashboard",
      "community help center",
      "needs list management",
      "donation platform dashboard"
    ]),
    canonical: generateCanonicalUrl("/home"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "MyNeedfully Dashboard",
      "description": "Access your MyNeedfully dashboard for community support actions",
      "url": "https://myneedfully.app/home",
      "isPartOf": {
        "@type": "WebSite",
        "name": "MyNeedfully",
        "url": "https://myneedfully.app"
      }
    }
  });

  return (
    <div className="min-h-screen bg-warm-bg relative overflow-hidden">
      {/* Background Logo with Opacity */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src={logoImage} 
          alt="MyNeedfully Logo Background" 
          className="opacity-10 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain"
          style={{ filter: 'brightness(0.7)' }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">
            Welcome back, {user?.firstName || 'Friend'}!
          </h1>
          <p className="text-gray-600">Ready to make a difference today?</p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Getting Started with MyNeedfully</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Link href="/browse">
                <Button data-tip="browse-needs" className="w-full h-16 sm:h-20 bg-coral hover:bg-coral/90 flex flex-col items-center justify-center space-y-1 sm:space-y-2">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs sm:text-sm font-medium">Find Needs Lists</span>
                </Button>
              </Link>
              
              <Link href="/create">
                <Button data-tip="create-list" variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs sm:text-sm font-medium">Create Needs List</span>
                </Button>
              </Link>
              
              <Link href="/products">
                <Button data-tip="product-search" variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2">
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs sm:text-sm font-medium">Search Products</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              <Link href="/my-lists">
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-coral mt-0.5 icon-wiggle flex-shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>Manage my Needs Lists</h3>
                    <p className="text-sm sm:text-base text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>Edit, update, and track your existing needs lists</p>
                  </div>
                </div>
              </Link>
              
              {/* Animated Separator */}
              <div className="my-2 sm:my-3 mx-6 sm:mx-8">
                <div className="h-0.5 bg-navy/50 separator-draw" style={{animationDelay: '0.2s'}}></div>
              </div>
              
              <Link href="/profile">
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-coral mt-0.5 icon-wiggle-delayed-1 flex-shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>View My Dashboard</h3>
                    <p className="text-sm sm:text-base text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>Access your profile, donations, and thank you notes</p>
                  </div>
                </div>
              </Link>
              
              {/* Animated Separator */}
              <div className="my-2 sm:my-3 mx-6 sm:mx-8">
                <div className="h-0.5 bg-navy/50 separator-draw" style={{animationDelay: '0.4s'}}></div>
              </div>
              
              <Link href="/profile#thank-you-notes">
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-coral mt-0.5 icon-wiggle-delayed-2 flex-shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>View Thank You Notes</h3>
                    <p className="text-sm sm:text-base text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>See appreciation messages from the community</p>
                  </div>
                </div>
              </Link>
              
              {/* Animated Separator */}
              <div className="my-2 sm:my-3 mx-6 sm:mx-8">
                <div className="h-0.5 bg-navy/50 separator-draw" style={{animationDelay: '0.6s'}}></div>
              </div>
              
              <Link href="/settings">
                <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-coral mt-0.5 icon-wiggle-delayed-3 flex-shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>Account Settings</h3>
                    <p className="text-sm sm:text-base text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>Update your profile and email preferences</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}