import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
// import { useWebSocket } from "@/lib/websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import logoImage from "@assets/MyNeedfully_1754922279088.png";
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
          className="opacity-5 sm:opacity-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain"
          style={{ filter: 'brightness(0.7)' }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8 relative z-10">
        {/* Welcome Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-navy mb-2 px-2 sm:px-0">
            Welcome back, {user?.firstName || 'Friend'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">Ready to make a difference today?</p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-4 sm:mb-6 lg:mb-8 mx-2 sm:mx-0">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg lg:text-xl">Getting Started with MyNeedfully</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              <Link href="/browse">
                <Button data-tip="browse-needs" className="w-full h-14 sm:h-16 lg:h-20 bg-coral hover:bg-coral/90 flex flex-col items-center justify-center space-y-1 text-white">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <span className="text-xs sm:text-sm font-medium leading-tight text-center">Find Needs Lists</span>
                </Button>
              </Link>
              
              <Link href="/create">
                <Button data-tip="create-list" variant="outline" className="w-full h-14 sm:h-16 lg:h-20 flex flex-col items-center justify-center space-y-1">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <span className="text-xs sm:text-sm font-medium leading-tight text-center">Create Needs List</span>
                </Button>
              </Link>
              
              <Link href="/products">
                <Button data-tip="product-search" variant="outline" className="w-full h-14 sm:h-16 lg:h-20 flex flex-col items-center justify-center space-y-1 sm:col-span-2 lg:col-span-1">
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  <span className="text-xs sm:text-sm font-medium leading-tight text-center">Search Products</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card className="mx-2 sm:mx-0">
          <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
            <CardTitle className="text-base sm:text-lg lg:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-0">
              <Link href="/my-lists">
                <div className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 lg:p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-coral mt-0.5 icon-wiggle flex-shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>Manage my Needs Lists</h3>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5" style={{fontFamily: 'JUST Sans, sans-serif'}}>Edit, update, and track your existing needs lists</p>
                  </div>
                </div>
              </Link>
              
              {/* Animated Separator */}
              <div className="my-1 sm:my-2 lg:my-3 mx-4 sm:mx-6 lg:mx-8">
                <div className="h-0.5 bg-navy/50 separator-draw" style={{animationDelay: '0.2s'}}></div>
              </div>
              
              <Link href="/profile">
                <div className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 lg:p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-coral mt-0.5 icon-wiggle-delayed-1 flex-shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>View My Dashboard</h3>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5" style={{fontFamily: 'JUST Sans, sans-serif'}}>Access your profile, donations, and thank you notes</p>
                  </div>
                </div>
              </Link>
              
              {/* Animated Separator */}
              <div className="my-1 sm:my-2 lg:my-3 mx-4 sm:mx-6 lg:mx-8">
                <div className="h-0.5 bg-navy/50 separator-draw" style={{animationDelay: '0.4s'}}></div>
              </div>
              
              <Link href="/profile#thank-you-notes">
                <div className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 lg:p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-coral mt-0.5 icon-wiggle-delayed-2 flex-shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>View Thank You Notes</h3>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5" style={{fontFamily: 'JUST Sans, sans-serif'}}>See appreciation messages from the community</p>
                  </div>
                </div>
              </Link>
              
              {/* Animated Separator */}
              <div className="my-1 sm:my-2 lg:my-3 mx-4 sm:mx-6 lg:mx-8">
                <div className="h-0.5 bg-navy/50 separator-draw" style={{animationDelay: '0.6s'}}></div>
              </div>
              
              <Link href="/settings">
                <div className="flex items-start space-x-3 sm:space-x-4 p-2 sm:p-3 lg:p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-coral mt-0.5 icon-wiggle-delayed-3 flex-shrink-0" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>Account Settings</h3>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5" style={{fontFamily: 'JUST Sans, sans-serif'}}>Update your profile and email preferences</p>
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