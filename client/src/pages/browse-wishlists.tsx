import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import SearchFilters from "@/components/search-filters";
import WishlistCard from "@/components/wishlist-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

export default function BrowseWishlists() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    urgencyLevel: "",
    location: "",
    status: "active",
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

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

  const { data: wishlistsData, isLoading } = useQuery({
    queryKey: ['/api/wishlists', { ...filters, query: searchQuery, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...filters,
        query: searchQuery,
        page: page.toString(),
        limit: "20",
      });
      
      // Remove empty params
      Object.keys(filters).forEach(key => {
        if (!params.get(key)) {
          params.delete(key);
        }
      });
      
      const response = await fetch(`/api/wishlists?${params}`);
      if (!response.ok) throw new Error('Failed to fetch wishlists');
      return response.json();
    },
    enabled: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-warm-bg">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Browse Needs Lists</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Find families and organizations who need your support
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  placeholder="Search by keywords, location, or needs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 py-2 sm:py-3 text-sm sm:text-base"
                />
              </div>
              <div className="flex gap-2 sm:gap-4">
                <Button type="submit" className="bg-coral hover:bg-coral/90 px-4 sm:px-8 flex-1 sm:flex-none">
                  <Search className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-sm sm:text-base">Search</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-coral text-coral hover:bg-coral/10 px-4 sm:px-6"
                >
                  <Filter className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-sm sm:text-base">Filters</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <SearchFilters 
              filters={filters} 
              onFiltersChange={handleFilterChange} 
            />
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="text-sm sm:text-base text-gray-600">
                {wishlistsData ? (
                  <>
                    Showing {wishlistsData.wishlists.length} of {wishlistsData.total} results
                  </>
                ) : (
                  'Loading...'
                )}
              </div>
              
              <select className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-coral/50">
                <option value="newest">Newest First</option>
                <option value="urgent">Most Urgent</option>
                <option value="completion">Nearly Complete</option>
                <option value="location">By Location</option>
              </select>
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
            ) : wishlistsData?.wishlists.length === 0 ? (
              <Card className="p-6 sm:p-12 text-center">
                <div className="text-gray-500 mb-4">
                  <Search className="mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-4 text-gray-300" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No needs lists found</h3>
                  <p className="text-sm sm:text-base">Try adjusting your search criteria or filters</p>
                </div>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      category: "",
                      urgencyLevel: "",
                      location: "",
                      status: "active",
                    });
                  }}
                  variant="outline"
                  className="border-coral text-coral hover:bg-coral/10"
                >
                  Clear All Filters
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {wishlistsData?.wishlists.map((wishlist: any) => (
                    <WishlistCard key={wishlist.id} wishlist={wishlist} />
                  ))}
                </div>

                {/* Load More */}
                {wishlistsData && wishlistsData.wishlists.length < wishlistsData.total && (
                  <div className="mt-6 sm:mt-8 text-center">
                    <Button 
                      onClick={loadMore}
                      variant="outline"
                      className="border-coral text-coral hover:bg-coral/10 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
                    >
                      Load More Needs Lists
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
