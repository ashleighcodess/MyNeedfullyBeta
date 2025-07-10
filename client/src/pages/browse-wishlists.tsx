import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import WishlistCard from "@/components/wishlist-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

export default function BrowseWishlists() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  console.log('🔍 BrowseWishlists auth state:', { user: !!user, isAuthenticated, authLoading });
  
  // Optimized React Query approach with caching
  const { data: wishlistsData, isLoading, error } = useQuery({
    queryKey: ['/api/wishlists'],
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });



  // SEO Configuration
  useSEO({
    title: generatePageTitle("Browse Needs Lists - Find Families to Support"),
    description: generatePageDescription("Browse active needs lists from families in crisis. Find disaster relief, medical emergency, and hardship support opportunities in your area. Every donation makes a difference."),
    keywords: generateKeywords([
      "browse needs lists",
      "find families to support",
      "disaster relief opportunities",
      "medical emergency support",
      "crisis assistance near me"
    ]),
    canonical: generateCanonicalUrl("/browse"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Browse Needs Lists",
      "description": "Find and support families in crisis through verified needs lists",
      "url": "https://myneedfully.app/browse",
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": wishlistsData?.wishlists?.length || 0,
        "itemListElement": wishlistsData?.wishlists?.slice(0, 5)?.map((wishlist: any, index: number) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": wishlist.title,
          "description": wishlist.description,
          "url": `https://myneedfully.app/wishlist/${wishlist.id}`
        })) || []
      }
    }
  });



  return (
    <>
      <div className="min-h-screen bg-warm-bg">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Browse Needs Lists</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Find families and organizations who need your support
          </p>
        </div>

        {/* Results */}
        <div className="w-full">
            {/* Results Header */}
            <div className="mb-4 sm:mb-6">
              <div className="text-sm sm:text-base text-gray-600">
                {wishlistsData ? (
                  <>
                    Showing {wishlistsData.wishlists.length} needs lists
                  </>
                ) : (
                  'Loading...'
                )}
              </div>
            </div>

            {/* Wishlist Grid */}
            {isLoading ? (
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
            ) : error ? (
              <Card className="p-6 sm:p-12 text-center">
                <div className="text-red-500 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Error loading needs lists</h3>
                  <p className="text-sm sm:text-base">{error}</p>
                </div>
              </Card>
            ) : !wishlistsData?.wishlists || wishlistsData?.wishlists.length === 0 ? (
              <Card className="p-6 sm:p-12 text-center">
                <div className="text-gray-500 mb-4">
                  <Search className="mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-4 text-gray-300" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No needs lists found</h3>
                  <p className="text-sm sm:text-base">Try adjusting your search criteria or filters</p>
                </div>
                <Button 
                  onClick={() => {
                    window.location.reload();
                  }}
                  variant="outline"
                  className="border-coral text-coral hover:bg-coral/10"
                >
                  Refresh Page
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {wishlistsData?.wishlists.map((wishlist: any) => (
                  <WishlistCard key={wishlist.id} wishlist={wishlist} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
