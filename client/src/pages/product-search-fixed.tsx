import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Star, ShoppingCart, ExternalLink, Filter, SlidersHorizontal, Clock, TrendingUp, AlertCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import SearchFilters from "@/components/search-filters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

export default function ProductSearchFixed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [searchMetrics, setSearchMetrics] = useState({ totalResults: 0, searchTime: 0 });
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get wishlistId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const wishlistId = urlParams.get('wishlistId');

  // Popular product cache for instant results
  const popularProducts = useMemo(() => ({
    "household": [
      {
        asin: "B073V1T37H",
        title: "Tide PODS Laundry Detergent Soap Pods, Spring Meadow, 112 Count",
        image: "https://m.media-amazon.com/images/I/81PnTlkKSBL._SL1500_.jpg",
        price: { value: 24.99, currency: "USD" },
        rating: 4.4,
        ratings_total: 45236,
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
    "baby": [
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
    "food": [
      {
        asin: "B08KS3QWT4",
        title: "Emergency Food Kit - 72 Hour Family Pack",
        image: "https://m.media-amazon.com/images/I/81GbDXYf+8L._SL1500_.jpg",
        price: { value: 49.99, currency: "USD" },
        rating: 4.6,
        ratings_total: 2156,
        link: "https://www.amazon.com/dp/B08KS3QWT4?tag=needfully-20"
      }
    ]
  }), []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build search URL
  const searchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.append('query', debouncedQuery);
    if (category && category !== 'all') params.append('category', category);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);
    if (page && page !== 1) params.append('page', page.toString());
    params.append('limit', '10'); // Performance optimization
    return `/api/products/search?${params.toString()}`;
  }, [debouncedQuery, category, minPrice, maxPrice, page]);

  // Fetch user's wishlists
  const { data: userWishlists } = useQuery({
    queryKey: ['/api/users', user?.id, 'wishlists'],
    enabled: !wishlistId && !!user?.id,
  });

  // Product search query
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['product-search', searchUrl],
    enabled: !!debouncedQuery && debouncedQuery.length > 2,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setTotalResults(data.total || 0);
      setHasMoreResults(data.hasMore || false);
      return data;
    },
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchQuery.trim().length > 2) {
      setPage(1);
      toast({
        title: "Searching products...",
        description: "This may take 5-10 seconds due to real-time product data retrieval.",
      });
    }
  }, [searchQuery, toast]);

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

  const products = useMemo(() => {
    return searchResults?.products || [];
  }, [searchResults]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Search
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search for products to add to your needs lists. We find real-time pricing and availability from Amazon.
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
        {showFilters && (
          <div className="mb-8 p-4 bg-white rounded-lg border">
            <SearchFilters
              filters={{
                category,
                urgencyLevel: '',
                location: '',
                status: '',
              }}
              onFiltersChange={handleFiltersChange}
            />
            <div className="grid grid-cols-2 gap-4 mt-4">
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
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-coral-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for products...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 5-10 seconds for real-time data</p>
          </div>
        )}

        {/* Search Results */}
        {products.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                Search Results
              </h2>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {totalResults} total results
                </Badge>
                <Badge variant="outline">
                  Showing {products.length} items
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any, index: number) => (
                <Card key={product.asin || index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-48 object-contain rounded-lg bg-gray-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {product.title}
                    </CardTitle>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-2xl font-bold text-coral-600">
                        {formatPrice(product.price)}
                      </div>
                      
                      {product.rating && formatRating(product.rating)}
                      
                      {product.ratings_total && (
                        <p className="text-sm text-gray-500">
                          ({product.ratings_total.toLocaleString()} reviews)
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to List
                      </Button>
                      {product.link && (
                        <Button size="sm" variant="outline" asChild>
                          <a 
                            href={product.link} 
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
            {hasMoreResults && (
              <div className="text-center mt-8">
                <Button onClick={loadMoreResults} size="lg" variant="outline">
                  Show More Results
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {debouncedQuery.length > 2 && !isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products found for "{debouncedQuery}"</p>
            <p className="text-sm text-gray-500">Try searching with different keywords or adjust your filters.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Search failed. Please try again.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}