import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRouter } from "wouter";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { PRODUCT_CATEGORIES, GIFT_CARDS } from "@/lib/constants";
import myneedfullyLogo from "@assets/Logo_6_1751682106924.png";
import amazonLogo from "@assets/amazon_1751644244382.png";
import walmartLogo from "@assets/walmart_1751644244383.png";
import targetLogo from "@assets/target_1751644244383.png";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";
import { WishlistWithItemCount } from "@shared/schema";

// Product images
import pampersWipesImage from "@assets/71oOkIoaqXL._AC__1751759839615.jpg";
import charminToiletPaperImage from "@assets/81Ml0P+qqnL._AC__1751759916227.jpg";
import pampersDiapersImage from "@assets/large_cdd37285-c5b5-436c-8986-7a87080f54a5_1751760001330.webp";
import tideDetergentImage from "@assets/tide_1751760058768.webp";
import bountyPaperTowelsImage from "@assets/81+BZP2zUHL._AC__1751760103041.jpg";
import walmartToiletPaperImage from "@assets/fa5133ba-1af5-48a1-a1b9-d0c9d1669f06.5b943bfbf480e3c3845678199cfe8d11_1751760136372.jpeg";
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
  ChevronUp,
  Baby,
  Home,
  Smartphone,
  ShirtIcon,
  Bike,
  Gamepad2,
  Car,
  BookOpen,
  Grid3X3,
  Gift
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

// Dynamic icon component for category buttons
const CategoryIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    Baby,
    Home,
    Smartphone,
    ShirtIcon,
    ShoppingCart,
    Heart,
    Bike,
    Gamepad2,
    Car,
    BookOpen,
    Grid3X3,
    Gift,
  };
  
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : <Package className={className} />;
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

  // Basic SEO without heavy processing
  useSEO({
    title: "Product Search - MyNeedfully",
    description: "Search for products across Amazon, Walmart, and Target to add to your needs list.",
    keywords: "product search, amazon, walmart, target, needs list",
    canonical: "/products"
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

  // State for needs list selection modal
  const [showNeedsListModal, setShowNeedsListModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // State for gift cards
  const [showGiftCards, setShowGiftCards] = useState(false);

  // Handle adding to needs list with authentication check
  const handleAddToNeedsList = (product: any) => {
    if (!isAuthenticated) {
      // Redirect to signup page if not authenticated
      navigate('/signup');
      return;
    }
    
    // If user has multiple needs lists, show selection modal
    if (userWishlists && Array.isArray(userWishlists) && userWishlists.length > 1) {
      setSelectedProduct(product);
      setShowNeedsListModal(true);
      return;
    }
    
    // If authenticated and has one or zero needs lists, proceed directly
    addToWishlistMutation.mutate({ product });
  };

  // Cached products - real product search will provide actual images from APIs
  const popularProducts = useMemo(() => ({
    "Basic Essentials": [
      // Amazon Products - placeholder images to be replaced with exact URLs
      {
        asin: "B08TMLHWTD",
        title: "Pampers Sensitive Water Based Baby Wipes, 12 Pop-Top Packs",
        image: pampersWipesImage,
        price: { value: 18.97, currency: "USD" },
        rating: 4.7,
        ratings_total: 29853,
        link: "https://www.amazon.com/dp/B08TMLHWTD?tag=needfully-20",
        retailer: "amazon"
      },
      {
        asin: "B073V1T37H", 
        title: "Charmin Ultra Soft Toilet Paper, 18 Family Mega Rolls",
        image: charminToiletPaperImage,
        price: { value: 23.94, currency: "USD" },
        rating: 4.6,
        ratings_total: 47832,
        link: "https://www.amazon.com/dp/B073V1T37H?tag=needfully-20",
        retailer: "amazon"
      },
      {
        asin: "B0949V7VRH",
        title: "Pampers Baby Dry Diapers, Size 3, 172 Count", 
        image: pampersDiapersImage,
        price: { value: 28.94, currency: "USD" },
        rating: 4.5,
        ratings_total: 15234,
        link: "https://www.amazon.com/dp/B0949V7VRH?tag=needfully-20",
        retailer: "amazon"
      },
      {
        asin: "B07MJBT4T1",
        title: "Tide Liquid Laundry Detergent, Original Scent, 64 Loads",
        image: tideDetergentImage,
        price: { value: 12.97, currency: "USD" },
        rating: 4.8,
        ratings_total: 18745,
        link: "https://www.amazon.com/dp/B07MJBT4T1?tag=needfully-20",
        retailer: "amazon"
      },
      {
        asin: "B08BYND8YN",
        title: "Bounty Quick-Size Paper Towels, 8 Family Rolls",
        image: bountyPaperTowelsImage,
        price: { value: 19.49, currency: "USD" },
        rating: 4.6,
        ratings_total: 32156,
        link: "https://www.amazon.com/dp/B08BYND8YN?tag=needfully-20",
        retailer: "amazon"
      },
      // Walmart Products - placeholder images to be replaced with exact URLs
      {
        title: "Great Value Ultra Strong Toilet Paper, 12 Mega Rolls",
        image: walmartToiletPaperImage,
        price: "$11.98",
        product_url: "https://www.walmart.com/ip/Great-Value-Ultra-Strong-Toilet-Paper/10315001",
        product_id: "10315001",
        retailer: "walmart",
        retailer_name: "Walmart"
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

  // Get cached products helper function
  const getCachedProducts = useCallback((query: string) => {
    // Return cached products for specific queries
    if (query === "Basic Essentials" || !query) {
      return { data: popularProducts["Basic Essentials"] || [] };
    }
    
    // Check if we have cached products for this query
    const lowercaseQuery = query.toLowerCase();
    for (const [key, products] of Object.entries(popularProducts)) {
      if (lowercaseQuery.includes(key.toLowerCase())) {
        return { data: products };
      }
    }
    
    return null;
  }, [popularProducts]);

  // Fetch user's wishlists for authenticated users
  const { data: userWishlists } = useQuery<WishlistWithItemCount[]>({
    queryKey: ['/api/user/wishlists'],
    enabled: !!isAuthenticated, // Only fetch when user is authenticated
  });



  // Simple search query without heavy caching
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/search', debouncedQuery, category, page],
    enabled: !!debouncedQuery && debouncedQuery.length > 2,
    staleTime: 300000, // 5 minutes cache
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('query', debouncedQuery);
      if (category && category !== 'all') params.append('category', category);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (page && page !== 1) params.append('page', page.toString());
      
      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      return await response.json();
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

  // Display products - show cached products immediately, replace with live results when searching
  const displayProducts = useMemo(() => {
    // Priority 1: If we have search results from live API, use them
    if (searchResults?.data && searchResults.data.length > 0) {
      return searchResults.data;
    }
    
    // Priority 2: Show cached products for immediate display
    const cached = getCachedProducts(debouncedQuery || "Basic Essentials");
    if (cached?.data && cached.data.length > 0) {
      return cached.data;
    }
    
    return [];
  }, [debouncedQuery, searchResults, getCachedProducts]);

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

  // Map product search categories to valid database categories
  const mapProductCategoryToDbCategory = (productCategory: string): string => {
    const categoryMapping: { [key: string]: string } = {
      'baby_kids': 'family_crisis',
      'household': 'disaster_recovery',
      'electronics': 'family_crisis',
      'clothing': 'disaster_recovery',
      'food_grocery': 'family_crisis',
      'health_beauty': 'medical_emergency',
      'sports_outdoors': 'family_crisis',
      'toys_games': 'family_crisis',
      'automotive': 'family_crisis',
      'books': 'family_crisis',
      'all': 'other'
    };
    
    return categoryMapping[productCategory] || 'other';
  };

  // Mutation for adding products to wishlist
  const addToWishlistMutation = useMutation({
    mutationFn: async ({ product, targetWishlistId }: { product: any; targetWishlistId?: string }) => {
      const productId = product.asin || product.product_id || product.id;
      setAddingProductId(productId);
      

      
      // Use provided targetWishlistId, or fall back to URL wishlistId, or first available wishlist
      let finalWishlistId = targetWishlistId || wishlistId;
      if (!finalWishlistId && userWishlists && Array.isArray(userWishlists) && userWishlists.length > 0) {
        finalWishlistId = userWishlists[0].id.toString();
      }
      
      if (!finalWishlistId) {
        throw new Error("No needs list available. Please create a needs list first.");
      }
      
      // Determine retailer and build appropriate product URL
      const retailer = product.retailer || 'amazon';
      let productUrl = product.link || product.product_url || '#';
      
      // For Amazon products, ensure affiliate link
      if (retailer.toLowerCase() === 'amazon' && product.asin) {
        productUrl = buildAmazonAffiliateLink(product.asin);
      }
      
      const itemData = {
        title: product.title,
        description: product.title,
        imageUrl: product.image || product.image_url,
        price: (product.price?.value || product.price?.raw)?.toString(), // Convert to string for decimal field
        currency: "USD",
        productUrl: productUrl,
        retailer: retailer.charAt(0).toUpperCase() + retailer.slice(1), // Capitalize retailer name
        category: mapProductCategoryToDbCategory(category || "other"), // Map to valid database category
        quantity: 1,
        priority: 3, // medium priority
      };
      
      return await apiRequest("POST", `/api/wishlists/${finalWishlistId}/items`, itemData);
    },
    onSuccess: () => {
      setAddingProductId(null);
      
      // Get the target wishlist info for the success message
      const targetWishlistId = wishlistId || (userWishlists && (userWishlists as any[])?.length > 0 ? (userWishlists as any[])[0].id.toString() : null);
      const targetWishlist = userWishlists?.find((list: any) => list.id.toString() === targetWishlistId);
      
      if (targetWishlist) {
        toast({
          title: "Item Added!",
          description: (
            <div className="space-y-2">
              <p>The item has been added to your needs list.</p>
              <button
                onClick={() => {
                  navigate(`/wishlists/${targetWishlistId}`);
                }}
                className="text-coral hover:text-coral-dark underline font-medium"
              >
                View "{targetWishlist.title}" →
              </button>
            </div>
          ),
        });
      } else {
        toast({
          title: "Item Added!",
          description: "The item has been added to your needs list.",
        });
      }
      
      // Invalidate cache for the target wishlist
      if (targetWishlistId) {
        queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${targetWishlistId}`] });
      }
      // Close modal if it was open
      setShowNeedsListModal(false);
      setSelectedProduct(null);
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
          <div className="mb-2 md:mb-3">
            <h3 className="text-sm md:text-lg font-semibold text-navy hidden md:block">Popular Categories</h3>
            <h3 className="text-sm font-medium text-navy md:hidden">Quick Search Categories</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
            {PRODUCT_CATEGORIES.slice(0, 6).map((category, index) => (
              <div
                key={category.value}
                className="group relative p-3 md:p-4 border-2 border-gray-200 rounded-xl hover:border-coral/60 hover:shadow-lg transition-all duration-300 cursor-pointer text-center bg-white hover:bg-coral/5 active:scale-95 transform hover:scale-105 flex flex-col items-center justify-center min-h-[80px] md:min-h-[100px]"
                style={{
                  animation: `category-bounce 0.6s ease-out ${index * 0.1}s both`
                }}
                onClick={() => {
                  console.log('Category clicked:', category.label);
                  
                  // Handle Gift Cards category specially
                  if (category.value === 'gift_cards') {
                    setShowGiftCards(true);
                    setActiveSearch(''); // Clear regular search results
                    setCategory(category.value);
                    setShowCategories(false);
                    return;
                  }
                  
                  // Regular category handling
                  setShowGiftCards(false);
                  setSearchQuery(category.label);
                  setDebouncedQuery(category.label);
                  setActiveSearch(category.label);
                  setCategory(category.value);
                  setPage(1);
                  setShowCategories(false); // Hide categories on mobile after selection
                  
                  // Force query invalidation to trigger immediate search
                  queryClient.invalidateQueries({ queryKey: ['/api/search'] });
                }}
              >
                {/* Icon with pulse animation on hover */}
                <div className="relative mb-1.5 md:mb-2 flex items-center justify-center">
                  <div className="absolute inset-0 bg-coral/20 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  <CategoryIcon 
                    iconName={category.icon}
                    className="relative z-10 h-6 w-6 md:h-8 md:w-8 text-coral group-hover:text-coral/80 transition-all duration-300 group-hover:scale-110 category-icon-wiggle"
                  />
                </div>
                
                {/* Label with subtle animation */}
                <div className="text-xs md:text-sm font-semibold text-navy group-hover:text-coral transition-colors duration-300">
                  {category.label}
                </div>
                
                {/* Subtle selection indicator */}
                <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-300 ${
                  category.value === category.value ? 'border-coral bg-coral/10' : 'border-transparent'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {(activeSearch || (debouncedQuery && debouncedQuery.length >= 3)) && (
          <div>


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
                      <div>
                        <h3 className="text-lg font-semibold text-navy">
                          Products
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

        {/* Gift Cards Section */}
        {showGiftCards && (
          <div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-navy">Gift Cards</h3>
                  <p className="text-sm text-gray-600">Select a gift card to purchase for your needs list</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {GIFT_CARDS.map((giftCard, index) => (
                  <Card key={giftCard.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="w-full h-40 sm:h-48 flex items-center justify-center bg-gradient-to-br from-coral/10 to-navy/10 p-4">
                        {giftCard.image ? (
                          <img 
                            src={giftCard.image} 
                            alt={`${giftCard.retailer} logo`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Gift className="h-12 w-12 text-coral mb-2" />
                            <span className="text-lg font-bold text-navy">{giftCard.retailer}</span>
                            <span className="text-sm text-gray-600">Gift Card</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold text-navy mb-2 text-xs sm:text-sm">
                        {giftCard.name}
                      </h3>
                      
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {giftCard.description}
                      </p>

                      <Button
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate('/signup');
                            return;
                          }
                          
                          // Convert gift card to product format
                          const giftCardProduct = {
                            title: giftCard.name,
                            description: giftCard.description,
                            retailer: giftCard.retailer,
                            asin: giftCard.id,
                            id: giftCard.id,
                            link: giftCard.url,
                            image: giftCard.image
                          };
                          
                          // If user has multiple needs lists, show selection modal
                          if (userWishlists && Array.isArray(userWishlists) && userWishlists.length > 1) {
                            setSelectedProduct(giftCardProduct);
                            setShowNeedsListModal(true);
                            return;
                          }
                          
                          // Otherwise add directly to first available wishlist
                          addToWishlistMutation.mutate({ product: giftCardProduct });
                        }}
                        className="w-full bg-coral text-white hover:bg-coral/90 text-xs sm:text-sm"
                        disabled={addingProductId === giftCard.id}
                      >
                        {addingProductId === giftCard.id ? (
                          <>
                            <Package className="mr-2 h-3 w-3 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add to Needs List"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Needs List Selection Modal */}
      <Dialog open={showNeedsListModal} onOpenChange={setShowNeedsListModal}>
        <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-navy">Choose Needs List</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Select which needs list to add this item to:
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {userWishlists && Array.isArray(userWishlists) && userWishlists.map((needsList: WishlistWithItemCount) => (
              <div
                key={needsList.id}
                onClick={() => {
                  addToWishlistMutation.mutate({ 
                    product: selectedProduct, 
                    targetWishlistId: needsList.id.toString() 
                  });
                }}
                className={`
                  w-full p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm
                  ${addingProductId === (selectedProduct?.asin || selectedProduct?.product_id) 
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                    : 'border-gray-200 hover:border-coral bg-white hover:bg-coral/5'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-3 w-3 text-coral flex-shrink-0" />
                      <div className="font-semibold text-navy text-sm truncate">{needsList.title}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {needsList.description}
                    </div>

                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <ChevronDown className="h-4 w-4 text-gray-400 transform rotate-[-90deg]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-3 border-t flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNeedsListModal(false);
                setSelectedProduct(null);
              }}
              className="px-4 text-sm"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
