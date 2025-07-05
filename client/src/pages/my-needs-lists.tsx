import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import WishlistCard from "@/components/wishlist-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BarChart3, Heart, List } from "lucide-react";
import { Link } from "wouter";

export default function MyNeedsLists() {
  const { user } = useAuth();

  const { data: wishlists, isLoading } = useQuery({
    queryKey: ['/api/user/wishlists'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-navy mb-4">My Needs Lists</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your needs lists.</p>
            <Link href="/">
              <Button className="bg-coral hover:bg-coral/90">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">My Needs Lists</h1>
          <p className="text-gray-600">
            Manage and track your personal needs lists
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/create-wishlist">
                <Button className="bg-coral hover:bg-coral/90 w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Needs List
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-coral text-coral hover:bg-coral/10 w-full sm:w-auto">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Dashboard
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="border-navy text-navy hover:bg-navy/10 w-full sm:w-auto">
                  <Heart className="mr-2 h-4 w-4" />
                  Browse Others' Needs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Your Needs Lists */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : wishlists && wishlists.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wishlists.map((wishlist: any) => (
                <WishlistCard 
                  key={wishlist.id} 
                  wishlist={wishlist} 
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <List className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No needs lists yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first needs list to start receiving support from the community.
                </p>
                <Link href="/create-wishlist">
                  <Button className="bg-coral hover:bg-coral/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Needs List
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}