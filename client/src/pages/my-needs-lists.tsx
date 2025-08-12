
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import WishlistCard from "@/components/wishlist-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, Heart, List, Search, Archive, Eye, EyeOff, Check, X, Pause } from "lucide-react";
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

  // Filter active and archived lists
  const activeWishlists = wishlists?.filter((w: any) => 
    w.status === 'active' && w.isPublic === true
  ) || [];

  const archivedWishlists = wishlists?.filter((w: any) => 
    w.status === 'completed' || 
    w.status === 'cancelled' || 
    w.status === 'paused' ||
    w.isPublic === false
  ) || [];

  return (
    <div className="min-h-screen bg-warm-bg">
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">My Needs Lists</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and track your personal needs lists
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 lg:gap-4">
              <Link href="/create-wishlist" className="w-full lg:w-auto">
                <Button className="bg-coral hover:bg-coral/90 w-full text-sm sm:text-base">
                  <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Create New Needs List</span>
                </Button>
              </Link>
              <Link href="/products" className="w-full lg:w-auto">
                <Button variant="outline" className="border-coral text-coral hover:bg-coral/10 w-full text-sm sm:text-base">
                  <Search className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Find Products
                </Button>
              </Link>
              <Link href="/profile" className="w-full lg:w-auto">
                <Button variant="outline" className="border-coral text-coral hover:bg-coral/10 w-full text-sm sm:text-base">
                  <BarChart3 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  View Dashboard
                </Button>
              </Link>
              <Link href="/browse" className="w-full lg:w-auto">
                <Button variant="outline" className="border-navy text-navy hover:bg-navy/10 w-full text-sm sm:text-base">
                  <Heart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">Browse Others' Needs</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Interface for Active vs Archived */}
        <Tabs defaultValue="active" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="active" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Active Lists</span>
              {activeWishlists.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                  {activeWishlists.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
              <Archive className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Archived Lists</span>
              {archivedWishlists.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                  {archivedWishlists.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Active Lists Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Active Needs Lists</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Your public needs lists that are currently accepting support from the community
              </p>
            </div>

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
            ) : activeWishlists.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeWishlists.map((wishlist: any) => (
                  <div key={wishlist.id} className="relative">
                    <WishlistCard wishlist={wishlist} />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white text-xs">
                        <Eye className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 sm:p-12 text-center">
                  <List className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    No active needs lists yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Create your first needs list to start receiving support from the community.
                  </p>
                  <Link href="/create-wishlist">
                    <Button className="bg-coral hover:bg-coral/90 text-sm sm:text-base">
                      <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Create Your First Needs List
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Archived Lists Tab */}
          <TabsContent value="archived" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Archived Lists</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Completed, cancelled, paused, or private needs lists
              </p>
            </div>

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
            ) : archivedWishlists.length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                {/* Archive Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="text-center p-3 sm:p-4">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">
                      {archivedWishlists.filter((w: any) => w.status === 'completed').length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                  </Card>
                  <Card className="text-center p-3 sm:p-4">
                    <div className="text-lg sm:text-2xl font-bold text-red-600">
                      {archivedWishlists.filter((w: any) => w.status === 'cancelled').length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Cancelled</div>
                  </Card>
                  <Card className="text-center p-3 sm:p-4">
                    <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                      {archivedWishlists.filter((w: any) => w.status === 'paused').length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Paused</div>
                  </Card>
                  <Card className="text-center p-3 sm:p-4">
                    <div className="text-lg sm:text-2xl font-bold text-gray-600">
                      {archivedWishlists.filter((w: any) => w.isPublic === false).length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Private</div>
                  </Card>
                </div>

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {archivedWishlists.map((wishlist: any) => (
                    <div key={wishlist.id} className="relative">
                      <WishlistCard wishlist={wishlist} isOwner={true} />
                      <div className="absolute top-2 right-2 z-10">
                        {wishlist.status === 'completed' && (
                          <Badge className="bg-green-500 text-white text-xs">
                            <Check className="mr-1 h-3 w-3" />
                            Complete
                          </Badge>
                        )}
                        {wishlist.status === 'cancelled' && (
                          <Badge className="bg-red-500 text-white text-xs">
                            <X className="mr-1 h-3 w-3" />
                            Cancelled
                          </Badge>
                        )}
                        {wishlist.status === 'paused' && (
                          <Badge className="bg-yellow-500 text-white text-xs">
                            <Pause className="mr-1 h-3 w-3" />
                            Paused
                          </Badge>
                        )}
                        {wishlist.isPublic === false && wishlist.status === 'active' && (
                          <Badge className="bg-gray-500 text-white text-xs">
                            <EyeOff className="mr-1 h-3 w-3" />
                            Private
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 sm:p-12 text-center">
                  <Archive className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    No archived needs lists
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    When you complete, cancel, pause, or make a needs list private, it will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
