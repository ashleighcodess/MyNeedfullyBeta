import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import WishlistCard from "@/components/wishlist-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

// Type definitions for the API response
interface WishlistData {
  wishlists: any[];
  total: number;
}

export default function BrowseWishlists() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchInput, setSearchInput] = useState('');
  
  // Debug component mount
  console.log('BrowseWishlists component mounted. Current location:', location);
  
  // Get URL parameters to check for search query - reactive to location changes
  const searchQuery = useMemo(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    return urlParams.get('q') || '';
  }, [location]);

  // Update input when URL changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Create a search function that can be called from multiple places
  const performSearch = (query: string) => {
    console.log('performSearch called with query:', query);
    if (query.trim()) {
      const newUrl = `/browse?q=${encodeURIComponent(query)}`;
      console.log('Setting new URL:', newUrl);
      setLocation(newUrl);
    } else {
      console.log('Clearing search - going to /browse');
      setLocation('/browse');
    }
  };
  
  // Debug logging
  console.log('Search query from URL:', searchQuery);
  const url = searchQuery ? `/api/wishlists?query=${encodeURIComponent(searchQuery)}` : '/api/wishlists';
  console.log('API URL:', url);

  // Optimized React Query approach with caching
  const { data: wishlistsData, isLoading, error } = useQuery<WishlistData>({
    queryKey: ['/api/wishlists', { query: searchQuery }], // Proper key structure for cache invalidation
    queryFn: async () => {
      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch wishlists');
      }
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    },
    enabled: true, // Always enabled
    staleTime: 0, // No cache - always fresh data for debugging
    gcTime: 0, // No cache retention for debugging
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
  
  // Debug logging for response
  console.log('Query response:', { data: wishlistsData, isLoading, error });



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
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input 
                    type="text"
                    placeholder="Search by name, zip code, location, or situation..."
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-0 focus:ring-1 focus:ring-coral/50 rounded bg-transparent placeholder:text-gray-400"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        performSearch(searchInput);
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Button 
                    type="button" 
                    size="sm" 
                    className="bg-coral text-white hover:bg-coral/90 active:bg-coral/80 transition-colors flex-1 sm:flex-none py-2.5 sm:py-3 text-sm sm:text-base"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('=== SEARCH BUTTON CLICKED ===');
                      console.log('Event target:', e.target);
                      console.log('Search input value:', searchInput);
                      console.log('Current location:', location);
                      
                      // Test basic functionality first
                      if (searchInput.trim()) {
                        console.log('Attempting search for:', searchInput.trim());
                        performSearch(searchInput.trim());
                      } else {
                        console.log('Empty search input - clearing search');
                        performSearch('');
                      }
                    }}
                  >
                    <Search className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Search
                  </Button>
                  {searchQuery && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => performSearch('')}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 flex-1 sm:flex-none py-2.5 sm:py-3 text-sm sm:text-base"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
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
                        Found {wishlistsData.wishlists.length} needs lists matching "{searchQuery}"
                        {wishlistsData.total && wishlistsData.total > wishlistsData.wishlists.length && 
                          ` (showing first ${wishlistsData.wishlists.length} of ${wishlistsData.total})`
                        }
                      </>
                    ) : (
                      <>
                        Showing {wishlistsData.wishlists.length} needs lists
                        {wishlistsData.total && wishlistsData.total > wishlistsData.wishlists.length && 
                          ` of ${wishlistsData.total} total`
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
            ) : !wishlistsData?.wishlists || wishlistsData?.wishlists.length === 0 ? (
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
                      setLocation('/browse');
                    } else {
                      window.location.reload();
                    }
                  }}
                  variant="outline"
                  className="border-coral text-coral hover:bg-coral/10"
                >
                  {searchQuery ? 'View All Needs Lists' : 'Refresh'}
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
