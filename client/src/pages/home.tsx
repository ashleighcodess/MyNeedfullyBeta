import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/lib/websocket";
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

export default function Home() {
  const { user } = useAuth();
  
  // Temporarily disable WebSocket to prevent DOMException
  // useWebSocket();
  
  // Check if user preference is supporter (default) or creator
  const isSupporter = user?.userPreference === 'supporter' || !user?.userPreference;
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-warm-bg relative overflow-hidden">
      {/* Background Logo with Opacity */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src={logoImage} 
          alt="MyNeedfully Logo Background" 
          className="opacity-10 w-80 h-80 object-contain"
          style={{ filter: 'brightness(0.7)' }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Welcome back, {user?.firstName || 'Friend'}!
          </h1>
          <p className="text-gray-600">Ready to make a difference today?</p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {isSupporter ? (
                <Link href="/browse">
                  <Button data-tip="browse-needs" className="w-full h-20 bg-coral hover:bg-coral/90 flex flex-col items-center justify-center space-y-2">
                    <Search className="h-6 w-6" />
                    <span>Find Needs Lists</span>
                  </Button>
                </Link>
              ) : (
                <Link href={isAuthenticated ? "/create" : "/signup"}>
                  <Button data-tip="create-list" className="w-full h-20 bg-coral hover:bg-coral/90 flex flex-col items-center justify-center space-y-2">
                    <Plus className="h-6 w-6" />
                    <span>Create Needs List</span>
                  </Button>
                </Link>
              )}
              
              <Link href={isSupporter ? (isAuthenticated ? "/create" : "/signup") : "/browse"}>
                <Button data-tip={isSupporter ? "create-list" : "browse-needs"} variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  {isSupporter ? <Plus className="h-6 w-6" /> : <Search className="h-6 w-6" />}
                  <span>{isSupporter ? "Create Needs List" : "Browse Needs Lists"}</span>
                </Button>
              </Link>
              
              <Link href="/products">
                <Button data-tip="product-search" variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Gift className="h-6 w-6" />
                  <span>Search Products</span>
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button data-tip="go-to-dashboard" variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <User className="h-6 w-6" />
                  <span>Go to my Dashboard</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started with MyNeedfully</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              <Link href={isAuthenticated ? "/create" : "/signup"}>
                <div className="flex items-start space-x-4 p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Plus className="h-8 w-8 text-coral mt-0.5 icon-wiggle" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-semibold text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>Create Your First Needs List</h3>
                    <p className="text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>Share what you need with our caring community</p>
                  </div>
                </div>
              </Link>
              
              {/* Animated Separator */}
              <div className="my-3 mx-8">
                <div className="h-0.5 bg-navy/50 separator-draw" style={{animationDelay: '0.2s'}}></div>
              </div>
              
              <Link href="/browse">
                <div className="flex items-start space-x-4 p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Heart className="h-8 w-8 text-coral mt-0.5 icon-wiggle-delayed-1" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-semibold text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>Browse and Help Others</h3>
                    <p className="text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>Find needs lists where you can make a difference</p>
                  </div>
                </div>
              </Link>
              
              {/* Animated Separator */}
              <div className="my-3 mx-8">
                <div className="h-0.5 bg-navy/50 separator-draw" style={{animationDelay: '0.4s'}}></div>
              </div>
              
              <Link href="/products">
                <div className="flex items-start space-x-4 p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Gift className="h-8 w-8 text-coral mt-0.5 icon-wiggle-delayed-2" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-semibold text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>Search for Specific Items</h3>
                    <p className="text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>Use our product search to find exactly what's needed</p>
                  </div>
                </div>
              </Link>
              
              {/* Animated Separator */}
              <div className="my-3 mx-8">
                <div className="h-0.5 bg-navy/50 separator-draw" style={{animationDelay: '0.6s'}}></div>
              </div>
              
              <Link href="/profile#my-lists">
                <div className="flex items-start space-x-4 p-5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Settings className="h-8 w-8 text-coral mt-0.5 icon-wiggle-delayed-3" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-semibold text-lg" style={{fontFamily: 'JUST Sans, sans-serif'}}>Manage my Needs Lists</h3>
                    <p className="text-gray-600" style={{fontFamily: 'JUST Sans, sans-serif'}}>Edit, update, and track your existing needs lists</p>
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