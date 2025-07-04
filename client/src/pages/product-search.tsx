import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES } from "@/lib/constants";
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  ExternalLink,
  Heart,
  DollarSign,
  Package,
  ChevronLeft
} from "lucide-react";

export default function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [activeSearch, setActiveSearch] = useState("");
  const [searchCache, setSearchCache] = useState(new Map());
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get wishlistId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const wishlistId = urlParams.get('wishlistId');

  // Debounce search input to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Generate cache key for search results
  const getCacheKey = useCallback((query: string, cat: string, page: number) => {
    return `${query}-${cat}-${page}`;
  }, []);

  // Check cache before making API call
  const getCachedResult = useCallback((key: string) => {
    const cached = searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return cached.data;
    }
    return null;
  }, [searchCache]);

  // Cache search result
  const setCacheResult = useCallback((key: string, data: any) => {
    setSearchCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, { data, timestamp: Date.now() });
      // Limit cache size to 50 entries
      if (newCache.size > 50) {
        const firstKey = newCache.keys().next().value;
        newCache.delete(firstKey);
      }
      return newCache;
    });
  }, []);

  // Build query URL with parameters
  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.append('query', debouncedQuery);
    if (category && category !== 'all') params.append('category', category);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);
    if (page && page !== 1) params.append('page', page.toString());
    
    return `/api/products/search?${params.toString()}`;
  };

  // Fetch user's wishlists when no wishlistId is provided
  const { data: userWishlists } = useQuery({
    queryKey: [`/api/users/${user?.id}/wishlists`],
    enabled: !wishlistId && !!user?.id, // Only fetch if no specific wishlist is provided and user is authenticated
  });

  // Custom query with caching logic
  const cacheKey = useMemo(() => getCacheKey(debouncedQuery, category, page), [debouncedQuery, category, page, getCacheKey]);
  
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: [buildSearchUrl()],
    enabled: !!debouncedQuery && debouncedQuery.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      // Check cache first
      const cached = getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Fetch from API if not cached
      const response = await fetch(buildSearchUrl());
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      
      // Cache the result
      setCacheResult(cacheKey, data);
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchQuery.trim().length > 2) {
      setPage(1);
      // The search will trigger automatically via debounced query
      toast({
        title: "Searching products...",
        description: "This may take 5-10 seconds due to real-time product data retrieval.",
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    if (activeSearch) {
      setPage(1);
    }
  };

  const formatPrice = (price: any) => {
    if (!price) return 'Price not available';
    
    // Handle RainforestAPI price format
    if (price.value !== undefined) {
      return `$${price.value.toFixed(2)}`;
    }
    
    // Handle demo data price format
    if (price.raw !== undefined) {
      return `$${price.raw.toFixed(2)}`;
    }
    
    // Handle string price format
    if (typeof price === 'string') {
      return price;
    }
    
    return 'Price not available';
  };

  const formatRating = (rating: any) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating}</span>
      </div>
    );
  };

  // Build Amazon affiliate link using ASIN
  const buildAmazonAffiliateLink = (asin: string, tag: string = 'needfully-20') => {
    if (!asin || asin === '#') return '#';
    // Clean ASIN in case it has extra characters
    const cleanAsin = asin.trim();
    return `https://www.amazon.com/dp/${cleanAsin}?tag=${tag}`;
  };

  // Mutation for adding products to wishlist
  const addToWishlistMutation = useMutation({
    mutationFn: async (product: any) => {
      setAddingProductId(product.asin);
      

      
      // If no wishlistId provided, use the first available wishlist
      let targetWishlistId = wishlistId;
      if (!targetWishlistId && userWishlists && Array.isArray(userWishlists) && userWishlists.length > 0) {
        targetWishlistId = userWishlists[0].id.toString();
      }
      
      if (!targetWishlistId) {
        throw new Error("No needs list available. Please create a needs list first.");
      }
      
      const itemData = {
        title: product.title,
        description: product.title,
        imageUrl: product.image,
        price: (product.price?.value || product.price?.raw)?.toString(), // Convert to string for decimal field
        currency: "USD",
        productUrl: buildAmazonAffiliateLink(product.asin),
        retailer: "Amazon",
        category: category || "other", // Use selected category or default to "other"
        quantity: 1,
        priority: 3, // medium priority
      };
      
      return await apiRequest("POST", `/api/wishlists/${targetWishlistId}/items`, itemData);
    },
    onSuccess: () => {
      setAddingProductId(null);
      toast({
        title: "Item Added!",
        description: "The item has been added to your needs list.",
      });
      // Invalidate cache for the target wishlist
      const targetWishlistId = wishlistId || (userWishlists && userWishlists.length > 0 ? userWishlists[0].id.toString() : null);
      if (targetWishlistId) {
        queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${targetWishlistId}`] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/user/wishlists'] });
    },
    onError: (error) => {
      setAddingProductId(null);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add item to your needs list.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {wishlistId && (
            <Button 
              variant="ghost" 
              className="mb-4 text-coral hover:bg-coral/10"
              onClick={() => navigate(`/wishlist/${wishlistId}`)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Needs List
            </Button>
          )}
          <h1 className="text-3xl font-bold text-navy mb-2">
            {wishlistId ? "Add Items to Your Needs List" : "Product Search"}
          </h1>
          <p className="text-gray-600">
            {wishlistId 
              ? "Search for products to add to your needs list" 
              : "Find products from trusted retailers to add to your wishlist"
            }
          </p>
        </div>



        {/* Search Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5 text-coral" />
              Search Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search for products (e.g., baby formula, school supplies, groceries)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-3"
                  />
                </div>
                <Button type="submit" className="bg-coral hover:bg-coral/90 px-8 whitespace-nowrap">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center space-x-2">
                          <i className={`${cat.icon} text-coral`}></i>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Min Price"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />

                <Input
                  placeholder="Max Price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setCategory("");
                    setMinPrice("");
                    setMaxPrice("");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        {!activeSearch && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {CATEGORIES.slice(0, 6).map((category) => (
                  <div
                    key={category.value}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer text-center"
                    onClick={() => {
                      setSearchQuery(category.label);
                      setActiveSearch(category.label);
                      setCategory(category.value);
                    }}
                  >
                    <i className={`${category.icon} text-coral text-2xl mb-2`}></i>
                    <div className="text-sm font-medium">{category.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {activeSearch && (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                {isLoading ? (
                  'Searching...'
                ) : error ? (
                  'Search failed'
                ) : searchResults?.search_results ? (
                  `Found ${searchResults.search_results.length} results for "${activeSearch}"`
                ) : (
                  'No results found'
                )}
              </div>
              {searchResults?.pagination && (
                <div className="text-sm text-gray-500">
                  Page {page} of {Math.ceil((searchResults.pagination.total_results || 0) / 16)}
                </div>
              )}
            </div>

            {/* Loading State with Progress */}
            {isLoading && (
              <>
                <Card className="mb-6 p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 text-coral mr-2 animate-spin" />
                      <span className="text-lg font-medium text-gray-800">Searching</span>
                      <span className="ml-1 animate-pulse">...</span>
                    </div>
                    {searchCache.size > 0 && (
                      <p className="text-sm text-gray-500">
                        💾 {searchCache.size} searches cached for faster access
                      </p>
                    )}
                  </div>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-6 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Error State */}
            {error && (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search Error</h3>
                <p className="text-gray-600 mb-4">
                  There was an error searching for products. Please try again.
                </p>
                <Button onClick={() => setActiveSearch("")} variant="outline">
                  Clear Search
                </Button>
              </Card>
            )}

            {/* Results Grid */}
            {searchResults?.search_results && searchResults.search_results.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.search_results.map((product: any, index: number) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {product.image && (
                        <div className="relative">
                          <img 
                            src={product.image}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.png';
                            }}
                          />
                          {product.is_prime && (
                            <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                              Prime
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-navy mb-2 line-clamp-2 text-sm">
                          {product.title}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-2">
                          {product.price && (
                            <div className="font-bold text-lg text-coral">
                              {formatPrice(product.price)}
                            </div>
                          )}
                          {product.rating && formatRating(product.rating)}
                        </div>

                        {product.delivery && (
                          <p className="text-xs text-gray-600 mb-3">
                            {product.delivery}
                          </p>
                        )}

                        <div className="space-y-2">
                          <a 
                            href={buildAmazonAffiliateLink(product.asin)}
                            target="_blank"
                            rel="nofollow sponsored"
                            className="block"
                          >
                            <Button className="w-full bg-coral hover:bg-coral/90">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Buy on Amazon
                            </Button>
                          </a>
                          
                          <Button 
                            variant="outline" 
                            className="w-full border-coral text-coral hover:bg-coral/10"
                            onClick={() => addToWishlistMutation.mutate(product)}
                            disabled={addingProductId === product.asin}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            {addingProductId === product.asin ? "Adding..." : "Add to Needs List"}
                          </Button>
                        </div>

                        {/* Product details link */}
                        <div className="mt-2 text-center">
                          <a 
                            href={buildAmazonAffiliateLink(product.asin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-coral inline-flex items-center"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Details
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {searchResults.pagination && searchResults.pagination.total_results > 16 && (
                  <div className="mt-8 flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center px-4 py-2 text-sm text-gray-600">
                      Page {page}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={!searchResults.pagination.next_page}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {searchResults?.search_results && searchResults.search_results.length === 0 && (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveSearch("");
                    setCategory("");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
