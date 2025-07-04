import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import SearchFilters from "@/components/search-filters";
import WishlistCard from "@/components/wishlist-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";

export default function BrowseWishlists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    urgencyLevel: "",
    location: "",
    status: "active",
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

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
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Browse Wishlists</h1>
          <p className="text-gray-600">Find families and organizations who need your support</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by keywords, location, or needs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3"
                />
              </div>
              <Button type="submit" className="bg-coral hover:bg-coral/90 px-8">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="border-coral text-coral hover:bg-coral/10"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-8">
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
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                {wishlistsData ? (
                  <>
                    Showing {wishlistsData.wishlists.length} of {wishlistsData.total} results
                  </>
                ) : (
                  'Loading...'
                )}
              </div>
              
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-coral/50">
                <option value="newest">Newest First</option>
                <option value="urgent">Most Urgent</option>
                <option value="completion">Nearly Complete</option>
                <option value="location">By Location</option>
              </select>
            </div>

            {/* Wishlist Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-2 w-full mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : wishlistsData?.wishlists.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-gray-500 mb-4">
                  <Search className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No wishlists found</h3>
                  <p>Try adjusting your search criteria or filters</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {wishlistsData?.wishlists.map((wishlist: any) => (
                    <WishlistCard key={wishlist.id} wishlist={wishlist} />
                  ))}
                </div>

                {/* Load More */}
                {wishlistsData && wishlistsData.wishlists.length < wishlistsData.total && (
                  <div className="mt-8 text-center">
                    <Button 
                      onClick={loadMore}
                      variant="outline"
                      className="border-coral text-coral hover:bg-coral/10 px-8 py-3"
                    >
                      Load More Wishlists
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
