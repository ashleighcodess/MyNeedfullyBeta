import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
// import { useAuth } from "@/hooks/useAuth"; // DISABLED - causes 401 polling spam
import { useLocation } from "wouter";
import WishlistCard from "@/components/wishlist-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, X, MapPin } from "lucide-react";
import { CATEGORIES, URGENCY_LEVELS, WISHLIST_STATUS } from "@/lib/constants";

export default function BrowseWishlists() {
  // Skip authentication for browse page to prevent loading issues
  // const { user } = useAuth();
  const user = null;
  const [location, setLocation] = useLocation();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    const cat = urlParams.get('category');
    const urgency = urlParams.get('urgency');
    const loc = urlParams.get('location');
    const stat = urlParams.get('status');
    
    if (q) setSearchQuery(q);
    if (cat) setCategory(cat);
    if (urgency) setUrgencyLevel(urgency);
    if (loc) setLocationFilter(loc);
    if (stat) setStatus(stat);
  }, []);

  // Build query parameters for API call
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('query', searchQuery);
    if (category && category !== 'all') params.append('category', category);
    if (urgencyLevel && urgencyLevel !== 'all') params.append('urgencyLevel', urgencyLevel);
    if (locationFilter) params.append('location', locationFilter);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', '20');
    return params.toString();
  };

  // Fetch wishlists using React Query
  const { data: wishlistsData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/wishlists', searchQuery, category, urgencyLevel, locationFilter, status, page],
    queryFn: async () => {
      const queryParams = buildQueryParams();
      const response = await fetch(`/api/wishlists?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wishlists: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse PostgreSQL array format for story images
      if (data.wishlists) {
        data.wishlists = data.wishlists.map((wishlist: any) => {
          if (wishlist.storyImages && typeof wishlist.storyImages === 'string') {
            try {
              // Handle PostgreSQL array format: {"/uploads/file1.jpg","/uploads/file2.jpg"}
              const arrayString = wishlist.storyImages;
              if (arrayString.startsWith('{') && arrayString.endsWith('}')) {
                const innerString = arrayString.slice(1, -1);
                wishlist.storyImages = innerString ? innerString.split(',').map((img: string) => img.trim().replace(/"/g, '')) : [];
              } else {
                wishlist.storyImages = [];
              }
            } catch (parseError) {
              console.error('Error parsing story images:', parseError);
              wishlist.storyImages = [];
            }
          }
          return wishlist;
        });
      }
      
      return data;
    },
    staleTime: 300000, // 5 minutes - much longer to prevent flashing
    refetchOnWindowFocus: false, // Prevent refetch on focus changes
    retry: 1, // Only retry once on failure
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    
    // Update URL with search parameters (this will trigger a natural refetch)
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (category && category !== 'all') params.append('category', category);
    if (urgencyLevel && urgencyLevel !== 'all') params.append('urgency', urgencyLevel);
    if (locationFilter) params.append('location', locationFilter);
    if (status) params.append('status', status);
    
    const newUrl = params.toString() ? `/browse?${params.toString()}` : '/browse';
    setLocation(newUrl);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setCategory("");
    setUrgencyLevel("");
    setLocationFilter("");
    setStatus("active");
    setPage(1);
    setLocation('/browse');
    // Don't call refetch() - let the state changes trigger natural refetch
  };

  const hasActiveFilters = searchQuery || category || urgencyLevel || locationFilter || status !== "active";

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

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search needs lists by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="bg-coral hover:bg-coral/90">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-coral text-coral hover:bg-coral/10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </form>

          {/* Expandable Filters */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Urgency Filter */}
                <div className="space-y-2">
                  <Label htmlFor="urgency" className="text-sm font-medium">Urgency</Label>
                  <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="All urgency levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All urgency levels</SelectItem>
                      {URGENCY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="City, State"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {WISHLIST_STATUS.map((stat) => (
                        <SelectItem key={stat.value} value={stat.value}>
                          {stat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">
                  {hasActiveFilters ? "Filters applied" : "No filters applied"}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSearch}
                    className="bg-coral hover:bg-coral/90"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6">
          <div className="text-sm sm:text-base text-gray-600">
            {isLoading ? (
              'Searching...'
            ) : error ? (
              'Error loading results'
            ) : wishlistsData ? (
              `Showing ${wishlistsData.wishlists?.length || 0} of ${wishlistsData.total || 0} needs lists`
            ) : (
              'No results'
            )}
          </div>
        </div>

        {/* Loading State */}
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

        {/* Error State */}
        {error && (
          <Card className="p-6 sm:p-12 text-center">
            <div className="text-red-500 mb-4">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Error loading needs lists</h3>
              <p className="text-sm sm:text-base">{String(error)}</p>
            </div>
            <Button 
              onClick={() => refetch()}
              className="bg-coral hover:bg-coral/90"
            >
              Try Again
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!wishlistsData?.wishlists || wishlistsData?.wishlists.length === 0) && (
          <Card className="p-6 sm:p-12 text-center">
            <div className="text-gray-500 mb-4">
              <Search className="mx-auto h-8 w-8 sm:h-12 sm:w-12 mb-4 text-gray-300" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No needs lists found</h3>
              <p className="text-sm sm:text-base">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or filters" 
                  : "Be the first to create a needs list for your community"
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {hasActiveFilters && (
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="border-coral text-coral hover:bg-coral/10"
                >
                  Clear Filters
                </Button>
              )}
              <Button 
                onClick={() => setLocation('/create')}
                className="bg-coral hover:bg-coral/90"
              >
                Create Needs List
              </Button>
            </div>
          </Card>
        )}

        {/* Results Grid */}
        {!isLoading && !error && wishlistsData?.wishlists && wishlistsData.wishlists.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {wishlistsData.wishlists.map((wishlist: any) => (
              <WishlistCard key={wishlist.id} wishlist={wishlist} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && !error && wishlistsData?.wishlists && wishlistsData.wishlists.length > 0 && wishlistsData.hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={() => {
                setPage(prev => prev + 1);
                refetch();
              }}
              variant="outline"
              className="border-coral text-coral hover:bg-coral/10"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
