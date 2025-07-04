import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Star, ShoppingCart, ExternalLink, Filter, SlidersHorizontal, Clock, TrendingUp, AlertCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import SearchFilters from "@/components/search-filters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { BrandLoader, BrandLoaderWithText } from "@/components/brand-loader";

export default function ProductSearchWorking() {
  // Stable state management
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMetrics, setSearchMetrics] = useState({ totalResults: 0, searchTime: 0 });
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [showFallbacks, setShowFallbacks] = useState(true);
  
  const [location, navigate] = useLocation();
  
  // Rotating messages for interactive loading experience
  const loadingMessages = [
    "Searching for products across multiple retailers...",
    "MyNeedfully connects supporters with families in need",
    "Over 450 needs lists have been created on our platform",
    "Every purchase makes a real difference in someone's life",
    "We partner with Amazon, Walmart, and Target for you",
    "Your support helps families recover from hardships"
  ];
  

  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const wishlistId = urlParams.get('wishlistId');
  const initialQuery = urlParams.get('q') || "";
  const initialCategory = urlParams.get('category') || "all";
  const initialMinPrice = urlParams.get('min_price') || "";
  const initialMaxPrice = urlParams.get('max_price') || "";

  // Initialize search from URL parameters
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setDebouncedQuery(initialQuery);
    }
    if (initialCategory && initialCategory !== "all") {
      setCategory(initialCategory);
    }
    if (initialMinPrice) {
      setMinPrice(initialMinPrice);
    }
    if (initialMaxPrice) {
      setMaxPrice(initialMaxPrice);
    }
  }, [initialQuery, initialCategory, initialMinPrice, initialMaxPrice]);

  // Fetch popular products from API
  const { data: popularProductsData } = useQuery({
    queryKey: ['/api/products/popular'],
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    queryFn: async () => {
      const response = await fetch('/api/products/popular');
      if (!response.ok) {
        throw new Error('Failed to fetch popular products');
      }
      return response.json();
    }
  });

  // Popular products for instant display
  const popularProducts = useMemo(() => {
    return popularProductsData?.search_results || [];
  }, [popularProductsData]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset page when query changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build search URL with proper dependency management
  const searchUrl = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) return null;
    
    const params = new URLSearchParams();
    params.append('query', debouncedQuery);
    if (category && category !== 'all') params.append('category', category);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);
    params.append('page', page.toString());
    params.append('limit', '20');
    
    return `/api/products/search/enhanced?${params.toString()}`;
  }, [debouncedQuery, category, minPrice, maxPrice, page]);

  // Fetch user's wishlists
  const { data: userWishlists } = useQuery({
    queryKey: ['/api/user/wishlists'],
    enabled: !!user?.id,
  });

  // Product search query with proper error handling
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['product-search', searchUrl],
    enabled: !!searchUrl,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      if (!searchUrl) return null;
      
      try {
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update metrics
        setSearchMetrics({
          totalResults: data.pagination?.total_results || data.search_results?.length || data.products?.length || 0,
          searchTime: data.request_info?.credits_used || 0
        });
        
        return data;
      } catch (error) {
        throw error;
      }
    }
  });

  // Rotate loading messages every 2 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, loadingMessages.length]);

  // Get display products with fallbacks
  const displayProducts = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      return showFallbacks ? popularProducts : [];
    }
    return searchResults?.search_results || searchResults?.products || [];
  }, [debouncedQuery, searchResults, showFallbacks, popularProducts]);

  // Stable event handlers
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Note: No toast here to avoid duplicate loading indicators
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    setPage(1);
  }, []);

  const handleFiltersChange = useCallback((filters: any) => {
    setCategory(filters.category || 'all');
    setMinPrice(filters.minPrice || '');
    setMaxPrice(filters.maxPrice || '');
    setPage(1);
  }, []);

  const loadMoreResults = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  // Format utilities
  const formatPrice = useCallback((price: any) => {
    if (!price) return 'Price not available';
    if (price.value !== undefined) return `$${price.value.toFixed(2)}`;
    if (price.raw !== undefined) return `$${price.raw.toFixed(2)}`;
    if (typeof price === 'string') return price;
    return 'Price not available';
  }, []);

  const formatRating = useCallback((rating: any) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating}</span>
      </div>
    );
  }, []);

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (product: any) => {
      // Check authentication first
      if (!user?.id) {
        throw new Error("AUTH_REQUIRED");
      }

      setAddingProductId(product.asin || product.id || Math.random().toString());
      
      // Debug userWishlists
      console.log("userWishlists:", userWishlists);
      console.log("wishlistId from URL:", wishlistId);
      
      let targetWishlistId = wishlistId;
      if (!targetWishlistId) {
        // Check if userWishlists is available and has items
        if (userWishlists && Array.isArray(userWishlists) && userWishlists.length > 0) {
          targetWishlistId = userWishlists[0].id.toString();
        } else if (userWishlists && userWishlists.wishlists && Array.isArray(userWishlists.wishlists) && userWishlists.wishlists.length > 0) {
          targetWishlistId = userWishlists.wishlists[0].id.toString();
        }
      }
      
      if (!targetWishlistId) {
        throw new Error("No needs list available. Please create a needs list first by going to your Dashboard.");
      }
      
      const itemData = {
        title: product.title,
        description: product.title,
        imageUrl: product.image || product.image_url || product.main_image?.link,
        price: (product.price?.value || product.price?.raw || product.price)?.toString(),
        currency: "USD",
        productUrl: product.link || product.url || "#",
        retailer: "Online Store",
        category: category === "all" ? "other" : (category || "other"),
        quantity: 1,
        priority: 3,
      };
      
      return await apiRequest("POST", `/api/wishlists/${targetWishlistId}/items`, itemData);
    },
    onSuccess: () => {
      setAddingProductId(null);
      toast({
        title: "Item Added!",
        description: "The item has been added to your needs list.",
      });
      const targetWishlistId = wishlistId || (userWishlists && userWishlists.length > 0 ? userWishlists[0].id.toString() : null);
      if (targetWishlistId) {
        queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${targetWishlistId}`] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/user/wishlists'] });
    },
    onError: (error) => {
      setAddingProductId(null);
      
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        toast({
          title: "Sign Up Required",
          description: (
            <div className="flex flex-col space-y-2">
              <p>Please sign up or log in to add items to your needs list.</p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.location.href = "/signup"}
                  className="bg-coral text-white px-3 py-1 rounded text-sm hover:bg-coral/90"
                >
                  Sign Up
                </button>
                <button 
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-navy text-white px-3 py-1 rounded text-sm hover:bg-navy/90"
                >
                  Log In
                </button>
              </div>
            </div>
          ),
          duration: 8000,
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to add item. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Search
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search for items to add to your needs lists. Find products that match your requirements and budget.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full lg:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
                <SelectItem value="toys">Toys & Games</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="health">Health & Beauty</SelectItem>
                <SelectItem value="automotive">Automotive</SelectItem>
                <SelectItem value="baby">Baby & Kids</SelectItem>
                <SelectItem value="food">Food & Grocery</SelectItem>
                <SelectItem value="household">Household</SelectItem>
                <SelectItem value="emergency">Emergency Supplies</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button type="submit" size="lg" disabled={isLoading} className="h-12">
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>

        {/* Advanced Filters */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent className="mb-8">
            <div className="p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <Input
                    type="number"
                    placeholder="$1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>



        {/* Popular Products (when no search) */}
        {(!debouncedQuery || debouncedQuery.length < 3) && showFallbacks && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-coral-500" />
                Popular Items
              </h2>
              <Badge variant="secondary">Commonly requested</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProducts.map((product, index) => (
                <Card key={`popular-${product.asin || product.title}-${index}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-contain hover:object-cover transition-all duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop';
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg line-clamp-2 flex-1 mr-2">
                        {product.title}
                      </CardTitle>
                      <div className="flex items-center">
                        <img 
                          src="/logos/amazon-logo.png" 
                          alt="Amazon" 
                          className="w-6 h-6 rounded-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-2xl font-bold text-coral-600">
                        {formatPrice(product.price)}
                      </div>
                      
                      {formatRating(product.rating)}
                      
                      {product.ratings_total && (
                        <p className="text-sm text-gray-500">
                          ({product.ratings_total.toLocaleString()} reviews)
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => addToWishlistMutation.mutate(product)}
                      disabled={addingProductId === product.asin}
                      className="w-full"
                      size="sm"
                    >
                      {addingProductId === product.asin ? (
                        <>
                          <BrandLoader size="sm" variant="coral" className="mr-1" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Needs List
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {debouncedQuery && debouncedQuery.length > 2 && (
          <>
            {isLoading && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <BrandLoader size="lg" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-800 mb-1">
                      {loadingMessages[loadingMessageIndex]}
                    </p>
                    <p className="text-sm text-gray-500">
                      This may take 5-10 seconds for real-time data
                    </p>
                  </div>
                </div>
              </div>
            )}

            {displayProducts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">
                    Search Results for "{debouncedQuery}"
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {searchMetrics.totalResults} results
                    </Badge>
                    <Badge variant="outline">
                      Showing {displayProducts.length} items
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayProducts.map((product: any, index: number) => (
                    <Card key={`search-${product.asin || product.id || product.title}-${index}`} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {((product.image && product.image.trim()) || (product.image_url && product.image_url.trim()) || product.main_image?.link) ? (
                            <img
                              src={(product.image && product.image.trim()) || (product.image_url && product.image_url.trim()) || product.main_image?.link}
                              alt={product.title}
                              className="w-full h-full object-contain hover:object-cover transition-all duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg line-clamp-2 flex-1 mr-2">
                            {product.title}
                          </CardTitle>
                          {product.retailer && (
                            <div className="flex items-center">
                              <img 
                                src={`/logos/${product.retailer}-logo.png`} 
                                alt={product.retailer} 
                                className="w-6 h-6 rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="text-2xl font-bold text-coral-600">
                            {formatPrice(product.price)}
                          </div>
                          
                          {formatRating(product.rating)}
                          
                          {product.ratings_total && (
                            <p className="text-sm text-gray-500">
                              ({product.ratings_total.toLocaleString()} reviews)
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => addToWishlistMutation.mutate(product)}
                            disabled={addingProductId === (product.asin || product.id || index.toString())}
                            className="flex-1"
                            size="sm"
                          >
                            {addingProductId === (product.asin || product.id || index.toString()) ? (
                              <>
                                <BrandLoader size="sm" variant="coral" className="mr-1" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-1" />
                                Add to List
                              </>
                            )}
                          </Button>
                          {(product.link || product.url) && (
                            <Button size="sm" variant="outline" asChild>
                              <a 
                                href={product.link || product.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More Button */}
                {searchResults?.pagination?.has_next_page && (
                  <div className="text-center mt-8">
                    <Button onClick={loadMoreResults} size="lg" variant="outline">
                      Show More Results
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {debouncedQuery.length > 2 && !isLoading && displayProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No products found for "{debouncedQuery}"</p>
                <p className="text-sm text-gray-500">Try searching with different keywords or adjust your filters.</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 mb-4">Search failed. Please try again.</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}