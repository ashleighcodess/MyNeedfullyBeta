import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { Link } from "wouter";
import { 
  Plus, 
  Heart, 
  Search, 
  Gift
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  
  // Check if user preference is supporter (default) or creator
  const isSupporter = user?.userPreference === 'supporter' || !user?.userPreference;

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isSupporter ? (
                <Link href="/browse">
                  <Button className="w-full h-20 bg-coral hover:bg-coral/90 flex flex-col items-center justify-center space-y-2">
                    <Search className="h-6 w-6" />
                    <span>Find Needs Lists</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/create">
                  <Button className="w-full h-20 bg-coral hover:bg-coral/90 flex flex-col items-center justify-center space-y-2">
                    <Plus className="h-6 w-6" />
                    <span>Create Needs List</span>
                  </Button>
                </Link>
              )}
              
              <Link href={isSupporter ? "/create" : "/browse"}>
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  {isSupporter ? <Plus className="h-6 w-6" /> : <Search className="h-6 w-6" />}
                  <span>{isSupporter ? "Create Needs List" : "Browse Needs Lists"}</span>
                </Button>
              </Link>
              
              <Link href="/products">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Gift className="h-6 w-6" />
                  <span>Search Products</span>
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
            <div className="space-y-4">
              <Link href="/create">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Plus className="h-5 w-5 text-coral mt-1" />
                  <div>
                    <h3 className="font-semibold">Create Your First Needs List</h3>
                    <p className="text-gray-600">Share what you need with our caring community</p>
                  </div>
                </div>
              </Link>
              <Link href="/browse">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Heart className="h-5 w-5 text-coral mt-1" />
                  <div>
                    <h3 className="font-semibold">Browse and Help Others</h3>
                    <p className="text-gray-600">Find needs lists where you can make a difference</p>
                  </div>
                </div>
              </Link>
              <Link href="/search">
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <Gift className="h-5 w-5 text-coral mt-1" />
                  <div>
                    <h3 className="font-semibold">Search for Specific Items</h3>
                    <p className="text-gray-600">Use our product search to find exactly what's needed</p>
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