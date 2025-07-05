import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  Heart,
  DollarSign,
  Package,
  ChevronLeft,
  X,
  ChevronDown,
  ChevronUp
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


  const [searchCache, setSearchCache] = useState(new Map());
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Get parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const wishlistId = urlParams.get('wishlistId');
  const initialQuery = urlParams.get('q') || "";
  const initialCategory = urlParams.get('category') || "";
  const initialMinPrice = urlParams.get('min_price') || "";
  const initialMaxPrice = urlParams.get('max_price') || "";

  // Synchronously initialize activeSearch to ensure immediate cached product display
  const [activeSearch, setActiveSearch] = useState(() => {
    // Initialize with cached products ready - this prevents any loading flash
    return initialQuery || "Basic Essentials";
  });

  // Initialize search from URL parameters or default to "Basic Essentials"
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setDebouncedQuery(initialQuery);
      // activeSearch already set in useState initializer
    } else {
      // Auto-load with pre-cached "Basic Essentials" results when no query parameter is provided
      // Keep search input empty for default state - don't set searchQuery
      // Don't set debouncedQuery - this prevents the automatic search trigger
      // activeSearch already set in useState initializer to "Basic Essentials"
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

  // Cached products - real product search will provide actual images from APIs
  const popularProducts = useMemo(() => ({
    "Basic Essentials": [
      // Amazon Products - placeholder images to be replaced with exact URLs
      {
        asin: "B08TMLHWTD",
        title: "Pampers Sensitive Water Based Baby Wipes, 12 Pop-Top Packs",
        image: "PLACEHOLDER_PAMPERS_WIPES_IMAGE",
        price: { value: 18.97, currency: "USD" },
        rating: 4.7,
        ratings_total: 29853,
        link: "https://www.amazon.com/dp/B08TMLHWTD?tag=needfully-20",
        retailer: "amazon"
      },
      {
        asin: "B073V1T37H", 
        title: "Charmin Ultra Soft Toilet Paper, 18 Family Mega Rolls",
        image: "PLACEHOLDER_CHARMIN_TOILET_PAPER_IMAGE",
        price: { value: 23.94, currency: "USD" },
        rating: 4.6,
        ratings_total: 47832,
        link: "https://www.amazon.com/dp/B073V1T37H?tag=needfully-20",
        retailer: "amazon"
      },
      {
        asin: "B0949V7VRH",
        title: "Pampers Baby Dry Diapers, Size 3, 172 Count", 
        image: "PLACEHOLDER_PAMPERS_DIAPERS_IMAGE",
        price: { value: 28.94, currency: "USD" },
        rating: 4.5,
        ratings_total: 15234,
        link: "https://www.amazon.com/dp/B0949V7VRH?tag=needfully-20",
        retailer: "amazon"
      },
      {
        asin: "B07MJBT4T1",
        title: "Tide Liquid Laundry Detergent, Original Scent, 64 Loads",
        image: "PLACEHOLDER_TIDE_DETERGENT_IMAGE",
        price: { value: 12.97, currency: "USD" },
        rating: 4.8,
        ratings_total: 18745,
        link: "https://www.amazon.com/dp/B07MJBT4T1?tag=needfully-20",
        retailer: "amazon"
      },
      {
        asin: "B08BYND8YN",
        title: "Bounty Quick-Size Paper Towels, 8 Family Rolls",
        image: "PLACEHOLDER_BOUNTY_PAPER_TOWELS_IMAGE",
        price: { value: 19.49, currency: "USD" },
        rating: 4.6,
        ratings_total: 32156,
        link: "https://www.amazon.com/dp/B08BYND8YN?tag=needfully-20",
        retailer: "amazon"
      },
      // Walmart Products - placeholder images to be replaced with exact URLs
      {
        title: "Great Value Ultra Strong Toilet Paper, 12 Mega Rolls",
        image: "PLACEHOLDER_WALMART_TOILET_PAPER_IMAGE",
        price: "$11.98",
        product_url: "https://www.walmart.com/ip/Great-Value-Ultra-Strong-Toilet-Paper/10315001",
        product_id: "10315001",
        retailer: "walmart",
        retailer_name: "Walmart"
      },
      {
        title: "Great Value Dish Soap, Original Scent, 75 fl oz",
        image: "PLACEHOLDER_WALMART_DISH_SOAP_IMAGE",
        price: "$2.97", 
        product_url: "https://www.walmart.com/ip/Great-Value-Dish-Soap/10315002",
        product_id: "10315002",
        retailer: "walmart",
        retailer_name: "Walmart"
      },
      {
        title: "Great Value All Purpose Cleaner, 32 fl oz",
        image: "PLACEHOLDER_WALMART_CLEANER_IMAGE",
        price: "$1.78",
        product_url: "https://www.walmart.com/ip/Great-Value-All-Purpose-Cleaner/10315003",
        product_id: "10315003",
        retailer: "walmart",
        retailer_name: "Walmart"
      },
      // Target Products - placeholder images to be replaced with exact URLs
      {
        title: "Up & Up Baby Wipes, Sensitive, 8 Packs",
        image: "PLACEHOLDER_TARGET_BABY_WIPES_IMAGE",
        price: "$12.99",
        product_url: "https://www.target.com/p/up-up-baby-wipes-sensitive/-/A-54191097",
        product_id: "54191097",
        retailer: "target",
        retailer_name: "Target"
      },
      {
        title: "Up & Up Hand Soap Refill, Fresh Scent, 56 fl oz", 
        image: "PLACEHOLDER_TARGET_HAND_SOAP_IMAGE",
        price: "$4.99",
        product_url: "https://www.target.com/p/up-up-hand-soap-refill/-/A-13217789",
        product_id: "13217789",
        retailer: "target",
        retailer_name: "Target"
      },
      {
        title: "Up & Up Fabric Softener Sheets, Fresh Scent, 240 Count",
        image: "PLACEHOLDER_TARGET_FABRIC_SOFTENER_IMAGE",
        price: "$3.79",
        product_url: "https://www.target.com/p/up-up-fabric-softener-sheets/-/A-14851456",
        product_id: "14851456",
        retailer: "target",
        retailer_name: "Target"
      }
    ],
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

  // Initialize search for "Basic Essentials" on page load to get real product images
  useEffect(() => {
    if (!debouncedQuery && !activeSearch) {
      setSearchQuery("Basic Essentials");
      setDebouncedQuery("Basic Essentials");
      setActiveSearch("Basic Essentials");
    }
  }, [debouncedQuery, activeSearch]);

  // Get display products - prioritize live API results with real images
  const displayProducts = useMemo(() => {
    // Priority 1: If we have search results from live API, use them (they have real images)
    if (debouncedQuery && debouncedQuery.length >= 3 && searchResults) {
      const results = searchResults?.search_results || searchResults?.data || [];
      if (results.length > 0) {
        const targetProducts = results.filter((p: any) => p.retailer === 'target');
        const walmartProducts = results.filter((p: any) => p.retailer === 'walmart');
        const amazonProducts = results.filter((p: any) => p.retailer === 'amazon');
        console.log(`Live API results: Amazon: ${amazonProducts.length}, Walmart: ${walmartProducts.length}, Target: ${targetProducts.length}`);
        return results;
      }
    }
    
    // Priority 2: Show cached products only as fallback when no live results
    if (!debouncedQuery && !activeSearch) {
      return [];
    }
    
    return [];
  }, [debouncedQuery, searchResults, activeSearch]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Mobile Compact Header */}
        <div className="mb-4 md:mb-8">
          {wishlistId && (
            <Button 
              variant="ghost" 
              className="mb-2 md:mb-4 text-coral hover:bg-coral/10 text-sm md:text-base"
              onClick={() => navigate(`/wishlist/${wishlistId}`)}
            >
              <ChevronLeft className="mr-1 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Needs List</span>
              <span className="sm:hidden">Back</span>
            </Button>
          )}
          <h1 className="text-xl md:text-3xl font-bold text-navy mb-1 md:mb-2">
            {wishlistId ? "Add Items" : "Product Search"}
          </h1>
          <p className="text-sm md:text-base text-gray-600 hidden md:block">
            {wishlistId 
              ? "Search for products to add to your needs list" 
              : "Find products from trusted retailers to add to your wishlist"
            }
          </p>
        </div>



        {/* Mobile-Optimized Sticky Search Bar */}
        <div className="sticky top-0 z-40 bg-warm-bg/95 backdrop-blur-sm border-b border-gray-200 mb-4 md:mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <form onSubmit={handleSearch} className="space-y-3 md:space-y-0">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 md:pl-10 py-2 md:py-3 text-sm md:text-base"
                />
              </div>
                
              {/* Compact Filter Button */}
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-4 border-gray-300 hover:bg-gray-50 text-sm"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                    {(category || minPrice || maxPrice) && (
                      <Badge variant="secondary" className="ml-1 bg-coral text-white text-xs">
                        {[category, minPrice, maxPrice].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Filter Products</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsFilterOpen(false)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Category</Label>
                          <Select value={category} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="mt-1">
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
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Min Price</Label>
                          <Input
                            placeholder="Min Price"
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Max Price</Label>
                          <Input
                            placeholder="Max Price"
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setCategory("");
                              setMinPrice("");
                              setMaxPrice("");
                              setPage(1);
                            }}
                            className="flex-1"
                          >
                            Clear Filters
                          </Button>
                          <Button 
                            type="button"
                            size="sm"
                            onClick={() => setIsFilterOpen(false)}
                            className="flex-1 bg-coral hover:bg-coral/90"
                          >
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
              </Popover>

              {/* Categories Toggle Button - Mobile Only */}
              <Button 
                variant="outline" 
                size="sm"
                className="md:hidden flex items-center gap-1 px-2 text-sm"
                onClick={() => setShowCategories(!showCategories)}
              >
                <span>Categories</span>
                {showCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>

        {/* Mobile Collapsible Categories + Desktop Always Visible */}
        <div className={`mb-4 md:mb-6 transition-all duration-300 ${showCategories || 'hidden md:block'}`}>
          <div className="mb-3 md:mb-4">
            <h3 className="text-sm md:text-lg font-semibold text-navy hidden md:block">Popular Categories</h3>
            <h3 className="text-sm font-medium text-navy md:hidden">Quick Search Categories</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
            {CATEGORIES.slice(0, 6).map((category) => (
              <div
                key={category.value}
                className="p-2 md:p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer text-center bg-white hover:bg-gray-50 active:scale-95"
                onClick={() => {
                  console.log('Category clicked:', category.label);
                  setSearchQuery(category.label);
                  setDebouncedQuery(category.label);
                  setActiveSearch(category.label);
                  setCategory(category.value);
                  setPage(1);
                  setShowCategories(false); // Hide categories on mobile after selection
                }}
              >
                <i className={`${category.icon} text-coral text-lg md:text-2xl mb-1 md:mb-2`}></i>
                <div className="text-xs md:text-sm font-medium">{category.label}</div>
              </div>
            ))}
          </div>
        </div>

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

            {/* Loading State - Only show if we don't have cached products to display */}
            {isLoading && displayProducts.length === 0 && (
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
                  {/* Dynamic Header - Different for cached vs search results */}
                  <div className="flex justify-between items-center">
                    <div>
                      {/* Show different headers for cached products vs search results */}
                      {!debouncedQuery || debouncedQuery === activeSearch && popularProducts[activeSearch as keyof typeof popularProducts] ? (
                        <div>
                          <h3 className="text-lg font-semibold text-navy">
                            Featured {activeSearch || "Basic Essentials"} Products
                          </h3>
                          <p className="text-sm text-gray-600">
                            Curated selection of essential items from trusted retailers
                          </p>
                          {displayProducts && displayProducts.length > 0 && (
                            <p className="text-xs text-gray-500">
                              Available from: Amazon ({displayProducts.filter((p: any) => p.retailer === 'amazon').length}), 
                              Walmart ({displayProducts.filter((p: any) => p.retailer === 'walmart').length}), 
                              Target ({displayProducts.filter((p: any) => p.retailer === 'target').length})
                            </p>
                          )}
                        </div>
                      ) : (
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
                      <div className="relative">
                        {(product.image || product.image_url) ? (
                          <img 
                            src={product.image || product.image_url}
                            alt={product.title}
                            className="w-full h-48 object-contain bg-gray-50"
                            onError={(e) => {
                              // Show retailer-specific fallback when image fails to load
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent && !target.dataset.fallbackApplied) {
                                target.dataset.fallbackApplied = 'true';
                                parent.innerHTML = `
                                  <div class="w-full h-48 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                                    <img src="${getRetailerLogo(product.retailer)}" alt="${product.retailer}" class="w-12 h-12 mb-2 opacity-50" />
                                    <span class="text-sm font-medium">Image not available</span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          // Show retailer logo directly when no image is available
                          <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                            <img 
                              src={getRetailerLogo(product.retailer)} 
                              alt={product.retailer} 
                              className="w-12 h-12 mb-2 opacity-50" 
                            />
                            <span className="text-sm font-medium">Image not available</span>
                          </div>
                        )}
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
