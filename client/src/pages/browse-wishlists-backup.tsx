import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import WishlistCard from "@/components/wishlist-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export default function BrowseWishlists() {
  const { user } = useAuth();
  
  const [wishlistsData, setWishlistsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/wishlists');
        if (!response.ok) {
          throw new Error(`Failed to fetch wishlists: ${response.status}`);
        }
        
        const data = await response.json();
        setWishlistsData(data);
      } catch (err) {
        console.error('Error fetching wishlists:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlists();
  }, []);

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Browse Needs Lists</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Find families and organizations who need your support
          </p>
        </div>

        <div className="w-full">
          <div className="mb-4 sm:mb-6">
            <div className="text-sm sm:text-base text-gray-600">
              {wishlistsData ? (
                `Showing ${wishlistsData.wishlists.length} needs lists`
              ) : (
                'Loading...'
              )}
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 sm:h-48 w-full" />
                  <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mb-2" />
                    <Skeleton className="h-4 sm:h-6 w-full mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-3/4 mb-4" />
                    <Skeleton className="h-2 w-full mb-4" />
                    <Skeleton className="h-8 sm:h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="p-6 sm:p-12 text-center">
              <div className="text-red-500 mb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Error loading needs lists</h3>
                <p className="text-sm sm:text-base">{String(error)}</p>
              </div>
            </Card>
          )}

          {!isLoading && !error && (!wishlistsData?.wishlists || wishlistsData?.wishlists.length === 0) && (
            <Card className="p-6 sm:p-12 text-center">
              <div className="text-gray-500 mb-4">
                <Search className="mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-4 text-gray-300" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No needs lists found</h3>
                <p className="text-sm sm:text-base">Try adjusting your search criteria or filters</p>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-coral text-coral hover:bg-coral/10"
              >
                Refresh Page
              </Button>
            </Card>
          )}

          {!isLoading && !error && wishlistsData?.wishlists && wishlistsData.wishlists.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {wishlistsData.wishlists.map((wishlist: any) => (
                <WishlistCard key={wishlist.id} wishlist={wishlist} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}