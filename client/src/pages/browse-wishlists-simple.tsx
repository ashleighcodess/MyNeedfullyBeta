import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Eye } from "lucide-react";
import { Link } from "wouter";

export default function BrowseWishlistsSimple() {
  // Simple query without complex filters
  const { data: wishlistsData, isLoading, error } = useQuery({
    queryKey: ['/api/wishlists'],
    queryFn: async () => {
      const response = await fetch('/api/wishlists');
      if (!response.ok) {
        throw new Error('Failed to fetch wishlists');
      }
      return response.json();
    },
    staleTime: 300000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const wishlists = wishlistsData?.wishlists || [];

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-6">Browse Needs Lists</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-6">Browse Needs Lists</h1>
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Error loading needs lists</h3>
            <p className="text-gray-600">Please try refreshing the page.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Browse Needs Lists</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Find families and organizations who need your support
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {wishlists.length} needs lists
          </p>
        </div>

        {wishlists.length === 0 ? (
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">No needs lists found</h3>
            <p className="text-gray-600">There are no active needs lists at the moment.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist: any) => {
              const completionPercentage = wishlist.totalItems > 0 
                ? Math.round((wishlist.fulfilledItems / wishlist.totalItems) * 100) 
                : 0;

              return (
                <Card key={wishlist.id} className="group hover:shadow-lg transition-shadow duration-200">
                  {/* Story Images */}
                  {wishlist.storyImages && wishlist.storyImages.length > 0 && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={wishlist.storyImages[0]}
                        alt={wishlist.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/needslist/${wishlist.id}`}>
                        <h3 className="text-lg font-semibold text-navy line-clamp-2 flex-1 mr-2 hover:text-coral cursor-pointer">
                          {wishlist.title}
                        </h3>
                      </Link>
                      <Badge className={`${getUrgencyColor(wishlist.urgencyLevel)} text-xs`}>
                        {wishlist.urgencyLevel}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {wishlist.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-coral">{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-coral rounded-full h-2 transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {wishlist.fulfilledItems} of {wishlist.totalItems} items fulfilled
                      </p>
                    </div>

                    {/* Meta info and View button */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        {wishlist.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{wishlist.location}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatTimeAgo(wishlist.createdAt)}</span>
                        </div>
                      </div>
                      <Link href={`/needslist/${wishlist.id}`}>
                        <Button size="sm" variant="outline" className="text-coral border-coral hover:bg-coral hover:text-white">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}