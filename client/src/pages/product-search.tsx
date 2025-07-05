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
import myneedfullyLogo from "@assets/Logo_6_1751682106924.png";
import amazonLogo from "@assets/amazon_1751644244382.png";
import walmartLogo from "@assets/walmart_1751644244383.png";
import targetLogo from "@assets/target_1751644244383.png";
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

// Helper function to get retailer logo
const getRetailerLogo = (retailer: string) => {
  switch (retailer?.toLowerCase()) {
    case 'amazon':
      return amazonLogo;
    case 'walmart':
      return walmartLogo;
    case 'target':
      return targetLogo;
    default:
      return amazonLogo; // Default to Amazon for backward compatibility
  }
};

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
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Get wishlistId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const wishlistId = urlParams.get('wishlistId');

  // Handle adding to needs list with authentication check
  const handleAddToNeedsList = (product: any) => {
    if (!isAuthenticated) {
      // Redirect to signup page if not authenticated
      navigate('/signup');
      return;
    }
    // If authenticated, proceed with adding to wishlist
    addToWishlistMutation.mutate(product);
  };

  // Popular cached products for instant loading
  const popularProducts = useMemo(() => ({
    "baby wipes": [
      {
        asin: "B08TMLHWTD",
        title: "Pampers Sensitive Water Based Baby Wipes, 12 Pop-Top Packs, 672 Total Wipes",
        image: "https://m.media-amazon.com/images/I/71xOPJ+KWRL._SL1500_.jpg",
        price: { value: 18.97, currency: "USD" },
        rating: 4.7,
        ratings_total: 29853,
        link: "https://www.amazon.com/dp/B08TMLHWTD?tag=needfully-20"
      },
      {
        asin: "B07GDQX4YS",
        title: "Huggies Natural Care Sensitive Baby Wipes, Unscented, 8 Flip-Top Packs (448 Wipes Total)",
        image: "https://m.media-amazon.com/images/I/81nqYmT7DgL._SL1500_.jpg",
        price: { value: 15.84, currency: "USD" },
        rating: 4.6,
        ratings_total: 18739,
        link: "https://www.amazon.com/dp/B07GDQX4YS?tag=needfully-20"
      }
    ],
    "toilet paper": [
      {
        asin: "B073V1T37H",
        title: "Charmin Ultra Soft Cushiony Touch Toilet Paper, 18 Family Mega Rolls = 90 Regular Rolls",
        image: "https://m.media-amazon.com/images/I/81ILKJw5e7L._SL1500_.jpg",
        price: { value: 23.94, currency: "USD" },
        rating: 4.6,
        ratings_total: 47832,
        link: "https://www.amazon.com/dp/B073V1T37H?tag=needfully-20"
      },
      {
        asin: "B071Z8XBHY",
        title: "Cottonelle Ultra ComfortCare Toilet Paper, 24 Family Mega Rolls = 108 Regular Rolls",
        image: "https://m.media-amazon.com/images/I/81fH4-yKUJL._SL1500_.jpg",
        price: { value: 21.48, currency: "USD" },
        rating: 4.5,
        ratings_total: 32156,
        link: "https://www.amazon.com/dp/B071Z8XBHY?tag=needfully-20"
      }
    ],
    "sleeping bag": [
      {
        asin: "B08F3MGC9Q",
        title: "Coleman Brazos Cold Weather Sleeping Bag, 20°F Comfort Rating",
        image: "https://m.media-amazon.com/images/I/71xDqNzLfqL._SL1500_.jpg",
        price: { value: 34.99, currency: "USD" },
        rating: 4.3,
        ratings_total: 8945,
        link: "https://www.amazon.com/dp/B08F3MGC9Q?tag=needfully-20"
      },
      {
        asin: "B00363RGHQ",
        title: "TETON Sports Celsius Regular Sleeping Bag; Great for Family Camping",
        image: "https://m.media-amazon.com/images/I/81rRVLPkL6L._SL1500_.jpg",
        price: { value: 45.99, currency: "USD" },
        rating: 4.4,
        ratings_total: 5672,
        link: "https://www.amazon.com/dp/B00363RGHQ?tag=needfully-20"
      }
    ],
    "diapers": [
      {
        asin: "B0949V7VRH",
        title: "Pampers Baby Dry Night Overnight Diapers, Size 3, 172 Count",
        image: "https://m.media-amazon.com/images/I/81nN8mQ5VGL._SL1500_.jpg",
        price: { value: 28.94, currency: "USD" },
        rating: 4.5,
        ratings_total: 15234,
        link: "https://www.amazon.com/dp/B0949V7VRH?tag=needfully-20"
      }
    ],
    "blanket": [
      {
        asin: "B07H9T8VTQ",
        title: "Utopia Bedding Fleece Blanket Queen Size Grey - Lightweight Bed Blanket",
        image: "https://m.media-amazon.com/images/I/71XGJfF6fDL._SL1500_.jpg",
        price: { value: 12.99, currency: "USD" },
        rating: 4.4,
        ratings_total: 89567,
        link: "https://www.amazon.com/dp/B07H9T8VTQ?tag=needfully-20"
      }
    ]
  }), []);



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

  // Simplified cache check - remove dependency
  const getCachedResult = useCallback((key: string) => {
    return null; // Disable caching temporarily to fix infinite loop
  }, []);

  // Simplified cache setter - remove dependency to prevent infinite loop
  const setCacheResult = useCallback((key: string, data: any) => {
    setSearchCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, { data, timestamp: Date.now() });
      // Limit cache size to 10 entries for simplicity
      if (newCache.size > 10) {
        const firstKey = newCache.keys().next().value;
        newCache.delete(firstKey);
      }
      return newCache;
    });
  }, []);

  // Get cached products helper
  const getCachedProducts = useCallback((query: string) => {
    const key = getCacheKey(query, category, 1);
    return getCachedResult(key);
  }, [category, getCacheKey, getCachedResult]);

  // Build query URL with parameters
  const buildSearchUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.append('query', debouncedQuery);
    if (category && category !== 'all') params.append('category', category);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);
    if (page && page !== 1) params.append('page', page.toString());
    
    return `/api/search?${params.toString()}`;
  }, [debouncedQuery, category, minPrice, maxPrice, page]);

  // Fetch user's wishlists when no wishlistId is provided
  const { data: userWishlists } = useQuery({
    queryKey: [`/api/users/${user?.id}/wishlists`],
    enabled: !wishlistId && !!user?.id, // Only fetch if no specific wishlist is provided and user is authenticated
  });



  // Custom query with smart caching and fallbacks
  const cacheKey = useMemo(() => getCacheKey(debouncedQuery, category, page), [debouncedQuery, category, page]);
  
  const searchUrl = useMemo(() => buildSearchUrl(), [buildSearchUrl]);
  
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: [searchUrl],
    enabled: !!debouncedQuery && debouncedQuery.length > 2,
    staleTime: 0, // No caching - always fresh data
    placeholderData: () => {
      // Return cached popular products instantly while fetching fresh data  
      const cached = getCachedProducts(debouncedQuery);
      if (cached) {
        return cached;
      }
      return undefined;
    },
    queryFn: async () => {
      // Simple, direct API call without caching overhead
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchQuery.trim().length > 2) {
      setPage(1);
      setActiveSearch(searchQuery.trim()); // Set activeSearch to trigger results display
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

  // Load more results for pagination
  const loadMoreResults = () => {
    setPage(prev => prev + 1);
  };

  // Get display products
  const displayProducts = useMemo(() => {
    // Only show results if we have a valid search query
    if (!debouncedQuery || debouncedQuery.length < 3) {
      return [];
    }
    
    // If we're loading or don't have results yet, return empty array
    if (isLoading || !searchResults) {
      return [];
    }
    
    // Handle different response formats
    const results = searchResults?.data || [];
    return results;
  }, [debouncedQuery, searchResults, isLoading]);

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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {CATEGORIES.slice(0, 6).map((category) => (
                <div
                  key={category.value}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer text-center bg-white hover:bg-gray-50"
                  onClick={() => {
                    console.log('Category clicked:', category.label);
                    setSearchQuery(category.label);
                    setDebouncedQuery(category.label); // Set debounced query immediately for categories
                    setActiveSearch(category.label);
                    setCategory(category.value);
                    setPage(1); // Reset to first page
                    // Show toast to indicate search is happening
                    toast({
                      title: "Searching products...",
                      description: `Looking for ${category.label} products`,
                    });
                  }}
                >
                  <i className={`${category.icon} text-coral text-2xl mb-2`}></i>
                  <div className="text-sm font-medium">{category.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {(activeSearch || (debouncedQuery && debouncedQuery.length >= 3)) && (
          <div>
            {/* Results Header - Only show when we have actual results */}
            {searchResults?.data && searchResults.data.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <div className="text-gray-600">
                  Found {searchResults.data.length} results for "{activeSearch || debouncedQuery}"
                </div>
                {searchResults?.pagination && (
                  <div className="text-sm text-gray-500">
                    Page {page} of {Math.ceil((searchResults.pagination.total_results || 0) / 16)}
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for products...</p>
              </div>
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



            {/* Search Results Grid */}
            {displayProducts && displayProducts.length > 0 && (
              <>
                <div className="space-y-4">
                  {/* Search Info */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-navy">
                        Search Results for "{debouncedQuery}"
                      </h3>
                      {totalResults > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Showing {displayProducts.length} of {totalResults} results
                          </p>
                          {displayProducts && displayProducts.length > 0 && (
                            <p className="text-xs text-gray-500">
                              Retailers: Amazon ({displayProducts.filter((p: any) => p.retailer === 'amazon').length}), 
                              Walmart ({displayProducts.filter((p: any) => p.retailer === 'walmart').length}), 
                              Target ({displayProducts.filter((p: any) => p.retailer === 'target').length})
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Show cached indicator */}
                    {getCachedProducts(debouncedQuery) && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Instant Results
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayProducts.map((product: any, index: number) => (
                    <Card key={`${product.retailer}-${product.asin || product.product_id || index}-${Date.now()}-${Math.random()}`} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                          {/* Retailer Logo */}
                          <div className="absolute top-2 right-2 bg-white rounded p-1 shadow-sm">
                            <img 
                              src={getRetailerLogo(product.retailer || 'amazon')} 
                              alt={product.retailer_name || 'Amazon'} 
                              className="h-4 w-4 object-contain"
                            />
                          </div>
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

                        <div>
                          <Button 
                            className="w-full bg-coral hover:bg-coral/90"
                            onClick={() => handleAddToNeedsList(product)}
                            disabled={addingProductId === (product.asin || product.product_id)}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            {addingProductId === (product.asin || product.product_id) ? "Adding..." : "Add to Needs List"}
                          </Button>
                        </div>

                        {/* Product details link */}
                        <div className="mt-2 text-center">
                          <a 
                            href={product.retailer === 'amazon' ? buildAmazonAffiliateLink(product.asin) : (product.link || product.product_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-coral inline-flex items-center"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View on {product.retailer_name || 'Amazon'}
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Smart Pagination - Show More Results */}
                {hasMoreResults && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={loadMoreResults}
                      disabled={isLoading}
                      variant="outline"
                      className="border-coral text-coral hover:bg-coral hover:text-white px-8 py-3"
                    >
                      {isLoading ? (
                        <>
                          <Package className="mr-2 h-4 w-4 animate-spin" />
                          Loading More Results...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Show More Results
                        </>
                      )}
                    </Button>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      Loading 10 more items at a time for better performance
                    </p>
                  </div>
                )}
                
                {/* Performance tip */}
                {displayProducts.length >= 10 && !hasMoreResults && totalResults > 10 && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">
                          <strong>Great!</strong> You've seen all available results for this search. Try refining your search terms for more options.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </>
            )}

            {/* No Results - Only show if we have completed a search and got empty results */}
            {!isLoading && searchResults && searchResults.data && searchResults.data.length === 0 && (activeSearch || (debouncedQuery && debouncedQuery.length >= 3)) && (
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
