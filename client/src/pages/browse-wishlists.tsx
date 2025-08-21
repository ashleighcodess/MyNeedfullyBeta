import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, useCallback } from "react";
import { trackCtaClick } from "@/analytics/ga4";
import WishlistCard from "@/components/wishlist-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

export default function BrowseWishlists() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Local state for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Get initial search query from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setSearchInput(initialQuery);
    }
  }, []);
  
  // Build API endpoint based on search query
  const apiEndpoint = useMemo(() => {
    if (searchQuery) {
      return `/api/wishlists?query=${encodeURIComponent(searchQuery)}`;
    }
    return '/api/wishlists';
  }, [searchQuery]);
  
  // React Query for data fetching
  const { data: wishlistsData, isLoading: queryLoading, error, refetch } = useQuery({
    queryKey: [apiEndpoint],
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000, // Updated from cacheTime to gcTime
  });
  
  // Combined loading state
  const isLoading = queryLoading || isSearching;
  
  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    
    // Track GA4 search event
    if (query.trim()) {
      trackCtaClick('browse_needs_lists');
    }
    
    setSearchQuery(query);
    
    // Update URL without navigation
    const newUrl = query ? 
      `${window.location.pathname}?q=${encodeURIComponent(query)}` : 
      window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    
    // Allow the loading state to show briefly
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  }, []);
  
  // Clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    window.history.replaceState({}, '', window.location.pathname);
  }, []);



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
        "numberOfItems": (wishlistsData as any)?.wishlists?.length || 0,
        "itemListElement": (wishlistsData as any)?.wishlists?.slice(0, 5)?.map((wishlist: any, index: number) => ({
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
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Needs Lists'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {searchQuery ? 
              `Showing needs lists matching "${searchQuery}"` : 
              'Find families and organizations who need your support'
            }
          </p>
          
          {/* Search Bar */}
          <div className="mt-4">
            <Card className="p-3 sm:p-4 shadow-sm w-full max-w-4xl">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const query = searchInput.trim();
                  handleSearch(query);
                }} 
                className="flex flex-col sm:flex-row gap-2 sm:gap-3"
              >
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input 
                    type="text"
                    placeholder="Search by name, zip code, location, or situation..."
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-0 focus:ring-1 focus:ring-coral/50 rounded bg-transparent placeholder:text-gray-400"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={isSearching}
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="bg-coral text-white hover:bg-coral/90 flex-1 sm:flex-none py-2.5 sm:py-3 text-sm sm:text-base"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                        Search
                      </>
                    )}
                  </Button>
                  {searchQuery && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearSearch}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 flex-1 sm:flex-none py-2.5 sm:py-3 text-sm sm:text-base"
                      disabled={isSearching}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </div>

        {/* Results */}
        <div className="w-full">
            {/* Results Header */}
            <div className="mb-4 sm:mb-6">
              <div className="text-sm sm:text-base text-gray-600">
                {wishlistsData ? (
                  <>
                    {searchQuery ? (
                      <>
                        Found {(wishlistsData as any).wishlists?.length || 0} needs lists matching "{searchQuery}"
                        {(wishlistsData as any).total && (wishlistsData as any).total > (wishlistsData as any).wishlists?.length && 
                          ` (showing first ${(wishlistsData as any).wishlists?.length} of ${(wishlistsData as any).total})`
                        }
                      </>
                    ) : (
                      <>
                        Showing {(wishlistsData as any).wishlists?.length || 0} needs lists
                        {(wishlistsData as any).total && (wishlistsData as any).total > (wishlistsData as any).wishlists?.length && 
                          ` of ${(wishlistsData as any).total} total`
                        }
                      </>
                    )}
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
                  <p className="text-sm sm:text-base">{error instanceof Error ? error.message : 'An error occurred while loading needs lists'}</p>
                </div>
              </Card>
            ) : !(wishlistsData as any)?.wishlists || (wishlistsData as any)?.wishlists.length === 0 ? (
              <Card className="p-6 sm:p-12 text-center">
                <div className="text-gray-500 mb-4">
                  <Search className="mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-4 text-gray-300" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {searchQuery ? `No results found for "${searchQuery}"` : 'No needs lists found'}
                  </h3>
                  <p className="text-sm sm:text-base">
                    {searchQuery ? 
                      'Try a different search term like a name, zip code, or location' : 
                      'Try adjusting your search criteria or filters'
                    }
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    if (searchQuery) {
                      handleClearSearch();
                    } else {
                      window.location.reload();
                    }
                  }}
                  variant="outline"
                  className="border-coral text-coral hover:bg-coral/10"
                >
                  {searchQuery ? 'View All Needs Lists' : 'Refresh Page'}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {(wishlistsData as any)?.wishlists?.map((wishlist: any) => (
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
