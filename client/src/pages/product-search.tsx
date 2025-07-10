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

import { PRODUCT_CATEGORIES } from "@/lib/constants";
import myneedfullyLogo from "@assets/Logo_6_1751682106924.png";
import amazonLogo from "@assets/amazon_1751644244382.png";
import walmartLogo from "@assets/walmart_1751644244383.png";
import targetLogo from "@assets/target_1751644244383.png";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

// Simplified cached products - using URLs instead of imports for faster loading
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
  const [cachedPage, setCachedPage] = useState(1);
  const itemsPerPage = 20;

  const [searchCache, setSearchCache] = useState(new Map());
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // SEO Configuration - Dynamic based on search
  useSEO({
    title: generatePageTitle(searchQuery ? `${searchQuery} Products` : "Product Search - Find Items for Your Needs List"),
    description: generatePageDescription(searchQuery 
      ? `Find ${searchQuery} products from Amazon, Walmart, and Target. Add items to your needs list and get support from the community.`
      : "Search for products across Amazon, Walmart, and Target. Find exactly what you need and add items to your needs list for community support."),
    keywords: generateKeywords([
      searchQuery,
      "product search",
      "multi-retailer search",
      "amazon walmart target",
      "add to needs list",
      "find products online"
    ].filter(Boolean)),
    canonical: generateCanonicalUrl(`/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Product Search",
      "description": "Search for products across multiple retailers to add to your needs list",
      "url": `https://myneedfully.app/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`,
      "isPartOf": {
        "@type": "WebSite",
        "name": "MyNeedfully",
        "url": "https://myneedfully.app"
      }
    }
  });
  
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
    return initialQuery || "";
  });

  // Initialize search from URL parameters
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setDebouncedQuery(initialQuery);
      setActiveSearch(initialQuery);
    } else {
      // Show Basic Essentials by default on page load
      setActiveSearch("Basic Essentials");
      setCachedPage(1); // Reset pagination
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

  // Mixed instant results with real images for fast loading
  const cachedProducts = useMemo(() => ({
    "Basic Essentials": [
      {
        asin: "B08TMLHWTD",
        title: "Pampers Sensitive Water Based Baby Wipes, 12 Pop-Top Packs",
        image: "https://m.media-amazon.com/images/I/71oOkIoaqXL._AC_SL1500_.jpg",
        price: { value: 18.97, currency: "USD" },
        rating: 4.7,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B073V1T37H", 
        title: "Charmin Ultra Soft Toilet Paper, 18 Family Mega Rolls",
        image: "https://m.media-amazon.com/images/I/81Ml0P+qqnL._AC_.jpg",
        price: { value: 23.94, currency: "USD" },
        rating: 4.6,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B07MJBT4T1",
        title: "Tide Liquid Laundry Detergent, Original Scent, 64 Loads",
        image: "https://m.media-amazon.com/images/I/81+BZP2zUHL._AC_.jpg",
        price: { value: 12.97, currency: "USD" },
        rating: 4.8,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B004CG0URC",
        title: "Bounty Select-a-Size Paper Towels, 8 Triple Rolls",
        image: "https://m.media-amazon.com/images/I/81fKH2-uPkL._AC_SL1500_.jpg",
        price: { value: 24.99, currency: "USD" },
        rating: 4.5,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B08F2X7JRD",
        title: "Clorox Disinfecting Wipes, 5 Pack (425 Wipes Total)",
        image: "https://m.media-amazon.com/images/I/81gJNa9XRRL._AC_SL1500_.jpg",
        price: { value: 19.97, currency: "USD" },
        rating: 4.7,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B07BYB4Q6Z",
        title: "Kleenex Ultra Soft Facial Tissues, 12 Boxes",
        image: "https://m.media-amazon.com/images/I/81VgRo8R-8L._AC_SL1500_.jpg",
        price: { value: 16.99, currency: "USD" },
        rating: 4.4,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B075RDQFMZ",
        title: "Dawn Ultra Dishwashing Liquid Dish Soap, Original Scent, 7 oz, 8 count",
        image: "https://m.media-amazon.com/images/I/81K7OfGqPYL._AC_SL1500_.jpg",
        price: { value: 15.48, currency: "USD" },
        rating: 4.8,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B0779VKDVN",
        title: "Lysol Disinfectant Spray, Crisp Linen, 12.5oz (Pack of 6)",
        image: "https://m.media-amazon.com/images/I/71V3H0VwZ6L._AC_SL1500_.jpg",
        price: { value: 24.99, currency: "USD" },
        rating: 4.6,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B072KBQX8X",
        title: "Ziploc Storage Bags Gallon, 120 Count",
        image: "https://m.media-amazon.com/images/I/81VK5O+QBCL._AC_SL1500_.jpg",
        price: { value: 17.99, currency: "USD" },
        rating: 4.7,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B00QFUDDAE",
        title: "Hefty Strong Large Trash Bags, 30 Gallon, 56 Count",
        image: "https://m.media-amazon.com/images/I/81h2z4oqF-L._AC_SL1500_.jpg",
        price: { value: 18.99, currency: "USD" },
        rating: 4.5,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B08G4H3LQB",
        title: "Reynolds Wrap Aluminum Foil, 200 Square Feet",
        image: "https://m.media-amazon.com/images/I/71lGaVb8tpL._AC_SL1500_.jpg",
        price: { value: 11.99, currency: "USD" },
        rating: 4.6,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B073WGG2XD",
        title: "Glad Press'n Seal Plastic Food Wrap, 140 sq ft",
        image: "https://m.media-amazon.com/images/I/81kHUXM7J8L._AC_SL1500_.jpg",
        price: { value: 13.99, currency: "USD" },
        rating: 4.4,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B07FQHTPVQ",
        title: "Scott Comfort Plus Toilet Paper, 36 Double Rolls",
        image: "https://m.media-amazon.com/images/I/81yZ9VKJ-nL._AC_SL1500_.jpg",
        price: { value: 29.99, currency: "USD" },
        rating: 4.3,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B089Q7T6HS",
        title: "Arm & Hammer Clean Burst Laundry Detergent, 150 oz",
        image: "https://m.media-amazon.com/images/I/61nL4QwKVJL._AC_SL1000_.jpg",
        price: { value: 14.97, currency: "USD" },
        rating: 4.7,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B07H2NVQXZ",
        title: "Downy Unstopables In-Wash Scent Booster Beads, Fresh Scent, 26.5 oz",
        image: "https://m.media-amazon.com/images/I/61K6eZ+nJOL._AC_SL1000_.jpg",
        price: { value: 12.99, currency: "USD" },
        rating: 4.5,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B0842D8SFG",
        title: "Pine-Sol All-Purpose Cleaner, Original Pine, 100 oz",
        image: "https://m.media-amazon.com/images/I/61UxRdPNLBL._AC_SL1200_.jpg",
        price: { value: 8.99, currency: "USD" },
        rating: 4.6,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B0779G4CJM",
        title: "Seventh Generation Free & Clear Laundry Detergent, 112 oz",
        image: "https://m.media-amazon.com/images/I/71eJJ4gXKjL._AC_SL1500_.jpg",
        price: { value: 16.99, currency: "USD" },
        rating: 4.4,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B08GLXMWMQ",
        title: "Mrs. Meyer's Clean Day Multi-Surface Cleaner, Lavender, 16 oz, 3 pk",
        image: "https://m.media-amazon.com/images/I/71VB8mKsNhL._AC_SL1500_.jpg",
        price: { value: 19.99, currency: "USD" },
        rating: 4.7,
        retailer: "amazon",
        retailer_name: "Amazon"
      }
    ],
    "Electronics": [
      {
        asin: "B08C1W5N87",
        title: "Echo Dot (4th Gen) | Smart speaker with Alexa",
        image: "https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg",
        price: { value: 49.99, currency: "USD" },
        rating: 4.7,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B08N5WRWNW",
        title: "Apple AirPods (3rd Generation)",
        image: "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg", 
        price: { value: 179.00, currency: "USD" },
        rating: 4.5,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B07YLZQQ7L",
        title: "Instant Vortex Plus 4-Quart Air Fryer",
        image: "https://m.media-amazon.com/images/I/71jblfczoKL._AC_SL1500_.jpg",
        price: { value: 79.99, currency: "USD" },
        rating: 4.6,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B08KRV7S9Q",
        title: "Fire TV Stick 4K Max streaming device",
        image: "https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg",
        price: { value: 54.99, currency: "USD" },
        rating: 4.4,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B0C1SLD1PZ",
        title: "Apple iPhone 15 (128 GB) - Blue",
        image: "https://m.media-amazon.com/images/I/71xb2xkN5qL._AC_SL1500_.jpg",
        price: { value: 799.00, currency: "USD" },
        rating: 4.3,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B09JQSYCDS",
        title: "Sony WH-CH720N Noise Canceling Wireless Headphones",
        image: "https://m.media-amazon.com/images/I/61Oqm-ZG3bL._AC_SL1500_.jpg",
        price: { value: 149.99, currency: "USD" },
        rating: 4.5,
        retailer: "amazon",
        retailer_name: "Amazon"
      }
    ],
    "Household": [
      {
        asin: "B07VPN4QMW",
        title: "Shark Navigator Lift-Away Professional NV356E",
        image: "https://m.media-amazon.com/images/I/71Y+8Et7PIL._AC_SL1500_.jpg",
        price: { value: 179.99, currency: "USD" },
        rating: 4.4,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B07VVK39F7",
        title: "LEVOIT Air Purifier for Home Large Room",
        image: "https://m.media-amazon.com/images/I/61lmTBNpRwL._AC_SL1500_.jpg",
        price: { value: 149.99, currency: "USD" },
        rating: 4.6,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B08F2Q83QZ",
        title: "Bissell CrossWave Pet Pro All in One Wet Dry Vacuum",
        image: "https://m.media-amazon.com/images/I/71apmYzKNNL._AC_SL1500_.jpg",
        price: { value: 229.99, currency: "USD" },
        rating: 4.3,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B089CY3DM6",
        title: "iRobot Roomba 694 Robot Vacuum",
        image: "https://m.media-amazon.com/images/I/71e+jrzN9AL._AC_SL1500_.jpg",
        price: { value: 274.99, currency: "USD" },
        rating: 4.2,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B0CR6GXKPV",
        title: "Ninja Foodi Personal Blender with Cups",
        image: "https://m.media-amazon.com/images/I/81hXJJ-RKZL._AC_SL1500_.jpg",
        price: { value: 79.99, currency: "USD" },
        rating: 4.5,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B074WMJ1D2",
        title: "BLACK+DECKER Dustbuster Handheld Vacuum",
        image: "https://m.media-amazon.com/images/I/71cqP2W3bKL._AC_SL1500_.jpg",
        price: { value: 59.99, currency: "USD" },
        rating: 4.1,
        retailer: "amazon",
        retailer_name: "Amazon"
      }
    ],
    "Baby & Kids": [
      {
        asin: "B075M7FHM7",
        title: "VTech DM221 Audio Baby Monitor",
        image: "https://m.media-amazon.com/images/I/61aJCWjjG5L._AC_SL1500_.jpg",
        price: { value: 39.95, currency: "USD" },
        rating: 4.3,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B07HBQZPX1",
        title: "Graco 4Ever DLX 4 in 1 Car Seat",
        image: "https://m.media-amazon.com/images/I/81ScU+A7tDL._AC_SL1500_.jpg",
        price: { value: 299.99, currency: "USD" },
        rating: 4.6,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B01LXJK9YZ",
        title: "Fisher-Price Baby Learning Toy Laugh & Learn Smart Stages Chair",
        image: "https://m.media-amazon.com/images/I/91YY8wZdR0L._AC_SL1500_.jpg",
        price: { value: 49.99, currency: "USD" },
        rating: 4.7,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B0822DQBWV",
        title: "Huggies Little Snugglers Baby Diapers, Size 1",
        image: "https://m.media-amazon.com/images/I/81aF6H9QKQL._AC_SL1500_.jpg",
        price: { value: 47.94, currency: "USD" },
        rating: 4.8,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B08GLBSR2L",
        title: "Baby Einstein Take Along Tunes Musical Toy",
        image: "https://m.media-amazon.com/images/I/81Hk9I3GYZL._AC_SL1500_.jpg",
        price: { value: 12.99, currency: "USD" },
        rating: 4.5,
        retailer: "amazon",
        retailer_name: "Amazon"
      },
      {
        asin: "B078K1W9B3",
        title: "Chicco Bravo LE Trio Travel System",
        image: "https://m.media-amazon.com/images/I/71rIo9w2ndL._AC_SL1500_.jpg",
        price: { value: 299.99, currency: "USD" },
        rating: 4.4,
        retailer: "amazon",
        retailer_name: "Amazon"
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

  // Build query URL with parameters - Smart routing for speed
  const buildSearchUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.append('query', debouncedQuery);
    if (category && category !== 'all') params.append('category', category);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);
    if (page && page !== 1) params.append('page', page.toString());
    
    // Smart decision: Use multi-retailer search only for user-typed queries
    // Category clicks get fast Amazon-only search for instant results
    const isUserTypedQuery = searchQuery.length > 0 && debouncedQuery === searchQuery;
    if (isUserTypedQuery) {
      params.append('multi_retailer', 'true');
    }
    
    return `/api/search?${params.toString()}`;
  }, [debouncedQuery, category, minPrice, maxPrice, page, searchQuery]);

  // Fetch user's wishlists when no wishlistId is provided
  const { data: userWishlists } = useQuery({
    queryKey: [`/api/users/${user?.id}/wishlists`],
    enabled: !wishlistId && !!user?.id, // Only fetch if no specific wishlist is provided and user is authenticated
  });



  // Smart search with optimized loading
  const searchUrl = useMemo(() => buildSearchUrl(), [buildSearchUrl]);
  
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: [searchUrl],
    enabled: !!debouncedQuery && debouncedQuery.length > 2,
    staleTime: 60000, // 1 minute cache for better performance
    queryFn: async () => {
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

  // Get display products with pagination for cached results
  const displayProducts = useMemo(() => {
    // Priority 1: If we have search results from live API, use them
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
    
    // Priority 2: Show instant category results with pagination
    if (activeSearch && cachedProducts[activeSearch as keyof typeof cachedProducts]) {
      const allProducts = cachedProducts[activeSearch as keyof typeof cachedProducts];
      const startIndex = (cachedPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = allProducts.slice(startIndex, endIndex);
      console.log(`Instant category results for ${activeSearch}: page ${cachedPage}, showing ${paginatedProducts.length} of ${allProducts.length} products`);
      return paginatedProducts;
    }
    
    // Priority 3: Show basic essentials by default when page loads
    if (!debouncedQuery || debouncedQuery.length < 3) {
      const allProducts = cachedProducts["Basic Essentials"] || [];
      const startIndex = (cachedPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return allProducts.slice(startIndex, endIndex);
    }
    
    return [];
  }, [debouncedQuery, searchResults, activeSearch, cachedProducts, cachedPage, itemsPerPage]);

  // Get total count for pagination
  const totalCount = useMemo(() => {
    if (activeSearch && cachedProducts[activeSearch as keyof typeof cachedProducts]) {
      return cachedProducts[activeSearch as keyof typeof cachedProducts].length;
    }
    return cachedProducts["Basic Essentials"]?.length || 0;
  }, [activeSearch, cachedProducts]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
      const targetWishlistId = wishlistId || (userWishlists && (userWishlists as any[])?.length > 0 ? (userWishlists as any[])[0].id.toString() : null);
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
                              {PRODUCT_CATEGORIES.map((cat) => (
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
            {PRODUCT_CATEGORIES.slice(0, 6).map((category) => (
              <div
                key={category.value}
                className="p-2 md:p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer text-center bg-white hover:bg-gray-50 active:scale-95"
                onClick={() => {
                  console.log('Category clicked:', category.label);
                  setSearchQuery(""); // Clear search input
                  setDebouncedQuery(""); // Don't trigger API search
                  setActiveSearch(category.label); // Show instant results
                  setCategory(category.value);
                  setPage(1);
                  setCachedPage(1); // Reset pagination for cached results
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
                            {activeSearch || "Basic Essentials"} Products
                          </h3>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {displayProducts.map((product: any, index: number) => (
                    <Card key={`${product.retailer}-${product.asin || product.product_id || index}-${Date.now()}-${Math.random()}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        {(product.image || product.image_url) ? (
                          <img 
                            src={product.image || product.image_url}
                            alt={product.title}
                            className="w-full h-40 sm:h-48 object-contain bg-gray-50"
                            onError={(e) => {
                              // Show retailer-specific fallback when image fails to load
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent && !target.dataset.fallbackApplied) {
                                target.dataset.fallbackApplied = 'true';
                                // Safely create fallback content using DOM methods
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.className = 'w-full h-40 sm:h-48 flex flex-col items-center justify-center bg-gray-50 text-gray-500';
                                
                                const logoImg = document.createElement('img');
                                logoImg.src = getRetailerLogo(product.retailer);
                                logoImg.alt = product.retailer;
                                logoImg.className = 'w-10 h-10 sm:w-12 sm:h-12 mb-2 opacity-50';
                                
                                const textSpan = document.createElement('span');
                                textSpan.className = 'text-xs sm:text-sm font-medium';
                                textSpan.textContent = 'Image not available';
                                
                                fallbackDiv.appendChild(logoImg);
                                fallbackDiv.appendChild(textSpan);
                                parent.replaceChild(fallbackDiv, target);
                              }
                            }}
                          />
                        ) : (
                          // Show retailer logo directly when no image is available
                          <div className="w-full h-40 sm:h-48 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                            <img 
                              src={getRetailerLogo(product.retailer)} 
                              alt={product.retailer} 
                              className="w-10 h-10 sm:w-12 sm:h-12 mb-2 opacity-50" 
                            />
                            <span className="text-xs sm:text-sm font-medium">Image not available</span>
                          </div>
                        )}
                        {product.is_prime && (
                          <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs">
                            Prime
                          </Badge>
                        )}
                        {/* Retailer Logo */}
                        <div className="absolute top-2 right-2 bg-white rounded p-1 shadow-sm">
                          <img 
                            src={getRetailerLogo(product.retailer || 'amazon')} 
                            alt={product.retailer_name || 'Amazon'} 
                            className="h-3 w-3 sm:h-4 sm:w-4 object-contain"
                          />
                        </div>
                      </div>
                      
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-semibold text-navy mb-2 line-clamp-2 text-xs sm:text-sm">
                          {product.title}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-2">
                          {product.price && (
                            <div className="font-bold text-base sm:text-lg text-coral">
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
                            className="w-full bg-coral hover:bg-coral/90 text-xs sm:text-sm py-2"
                            onClick={() => handleAddToNeedsList(product)}
                            disabled={addingProductId === (product.asin || product.product_id)}
                          >
                            <Heart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            {addingProductId === (product.asin || product.product_id) ? "Adding..." : "Add to Needs List"}
                          </Button>
                        </div>


                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls for Cached Products */}
                {totalPages > 1 && !debouncedQuery && (
                  <div className="flex justify-center items-center space-x-4 mt-8">
                    <Button
                      variant="outline"
                      disabled={cachedPage === 1}
                      onClick={() => setCachedPage(prev => Math.max(1, prev - 1))}
                      className="px-4 py-2"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex space-x-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, cachedPage - 2)) + i;
                        if (pageNum > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === cachedPage ? "default" : "outline"}
                            onClick={() => setCachedPage(pageNum)}
                            className="w-10 h-10 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={cachedPage === totalPages}
                      onClick={() => setCachedPage(prev => Math.min(totalPages, prev + 1))}
                      className="px-4 py-2"
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Results Info */}
                {totalCount > 0 && !debouncedQuery && (
                  <div className="text-center mt-4 text-sm text-gray-600">
                    Showing {((cachedPage - 1) * itemsPerPage) + 1}-{Math.min(cachedPage * itemsPerPage, totalCount)} of {totalCount} products
                  </div>
                )}

                {/* Smart Pagination - Show More Results for API */}
                {hasMoreResults && debouncedQuery && debouncedQuery.length >= 3 && (
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
