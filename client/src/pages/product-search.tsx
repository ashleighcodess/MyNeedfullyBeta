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
  Grid3X3
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
        link: "https://www.amazon.com/dp/B07H9T8VTQ?tag=needfully-20",
        retailer: "amazon"
      }
    ],
    // Enhanced cached categories for instant category button results
    "Baby & Kids": [
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
        title: "Gerber Baby Boys' 5-Pack Short-Sleeve Onesies",
        image: "https://i5.walmartimages.com/asr/b8c4a0a6-d2e3-4a2f-9e1b-4f5c8d7e9a0b.jpg",
        price: "$14.98",
        product_url: "https://www.walmart.com/ip/Gerber-Baby-Boys-5-Pack-Short-Sleeve-Onesies/578441046",
        product_id: "578441046",
        retailer: "walmart",
        retailer_name: "Walmart"
      }
    ],
    "Household": [
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
        asin: "B08BYND8YN",
        title: "Bounty Quick-Size Paper Towels, 8 Family Rolls",
        image: bountyPaperTowelsImage,
        price: { value: 19.49, currency: "USD" },
        rating: 4.6,
        ratings_total: 32156,
        link: "https://www.amazon.com/dp/B08BYND8YN?tag=needfully-20",
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
      }
    ],
    "Electronics": [
      {
        asin: "B08N5WRWNW",
        title: "Echo Dot (4th Gen) | Smart speaker with Alexa | Charcoal",
        image: "https://m.media-amazon.com/images/I/714Rq4k05UL._SL1000_.jpg",
        price: { value: 49.99, currency: "USD" },
        rating: 4.7,
        ratings_total: 544751,
        link: "https://www.amazon.com/dp/B08N5WRWNW?tag=needfully-20",
        retailer: "amazon"
      },
      {
        title: "onn. 32 Class HD (720P) Roku Smart TV",
        image: "https://i5.walmartimages.com/asr/c1b9ed09-84b5-4d5f-8b0a-8c5c9f1b1c4a.jpg",
        price: "$98.00",
        product_url: "https://www.walmart.com/ip/onn-32-Class-HD-720P-Roku-Smart-TV/230166926",
        product_id: "230166926",
        retailer: "walmart",
        retailer_name: "Walmart"
      }
    ],
    // Add missing categories with proper key mapping
    "Clothing": [
      {
        asin: "B07GJVQ3YY",
        title: "Hanes Men's 6-Pack FreshIQ Crew T-Shirts",
        image: "https://m.media-amazon.com/images/I/71GcCY5ybHL._SL1500_.jpg",
        price: { value: 19.50, currency: "USD" },
        rating: 4.4,
        ratings_total: 18265,
        link: "https://www.amazon.com/dp/B07GJVQ3YY?tag=needfully-20",
        retailer: "amazon"
      },
      {
        title: "Fruit of the Loom Women's Cotton Brief Underwear Multipack",
        image: "https://i5.walmartimages.com/asr/b8c4a0a6-d2e3-4a2f-9e1b-4f5c8d7e9a0b.jpg",
        price: "$12.84",
        product_url: "https://www.walmart.com/ip/Fruit-of-the-Loom-Women-Cotton-Brief-Underwear/44394858",
        product_id: "44394858",
        retailer: "walmart",
        retailer_name: "Walmart"
      }
    ],
    "Food & Grocery": [
      {
        asin: "B07PGL2W5Y",
        title: "Quaker Instant Oatmeal, Original, 18 Packets",
        image: "https://m.media-amazon.com/images/I/81qHbFZzOxL._SL1500_.jpg",
        price: { value: 4.98, currency: "USD" },
        rating: 4.6,
        ratings_total: 8245,
        link: "https://www.amazon.com/dp/B07PGL2W5Y?tag=needfully-20",
        retailer: "amazon"
      },
      {
        title: "Great Value Whole Wheat Bread, 20 oz",
        image: "https://i5.walmartimages.com/asr/5f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c.jpg",
        price: "$1.24",
        product_url: "https://www.walmart.com/ip/Great-Value-Whole-Wheat-Bread/10291621",
        product_id: "10291621",
        retailer: "walmart",
        retailer_name: "Walmart"
      }
    ],
    "Health & Beauty": [
      {
        asin: "B008TMLHWTD",
        title: "Oral-B Pro 1000 Power Rechargeable Electric Toothbrush",
        image: "https://m.media-amazon.com/images/I/61fL+2RaLrL._SL1000_.jpg",
        price: { value: 39.99, currency: "USD" },
        rating: 4.5,
        ratings_total: 52847,
        link: "https://www.amazon.com/dp/B008TMLHWTD?tag=needfully-20",
        retailer: "amazon"
      },
      {
        title: "Pantene Pro-V Daily Moisture Renewal Shampoo, 25.4 fl oz",
        image: "https://i5.walmartimages.com/asr/8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f.jpg",
        price: "$4.97",
        product_url: "https://www.walmart.com/ip/Pantene-Pro-V-Daily-Moisture-Renewal/10849071",
        product_id: "10849071",
        retailer: "walmart",
        retailer_name: "Walmart"
      }
    ],
    "Essential Clothing": [
      {
        asin: "B07GJVQ3YY",
        title: "Hanes Men's 6-Pack FreshIQ Crew T-Shirts",
        image: "https://m.media-amazon.com/images/I/71GcCY5ybHL._SL1500_.jpg",
        price: { value: 19.50, currency: "USD" },
        rating: 4.4,
        ratings_total: 18265,
        link: "https://www.amazon.com/dp/B07GJVQ3YY?tag=needfully-20",
        retailer: "amazon"
      },
      {
        title: "Fruit of the Loom Women's Cotton Brief Underwear Multipack",
        image: "https://i5.walmartimages.com/asr/b8c4a0a6-d2e3-4a2f-9e1b-4f5c8d7e9a0b.jpg",
        price: "$12.84",
        product_url: "https://www.walmart.com/ip/Fruit-of-the-Loom-Women-Cotton-Brief-Underwear/44394858",
        product_id: "44394858",
        retailer: "walmart",
        retailer_name: "Walmart"
      }
    ],
    "Sports & Outdoors": [
      {
        asin: "B08F3MGC9Q",
        title: "Coleman Brazos Cold Weather Sleeping Bag, 20°F Comfort Rating",
        image: "https://m.media-amazon.com/images/I/71xDqNzLfqL._SL1500_.jpg",
        price: { value: 34.99, currency: "USD" },
        rating: 4.3,
        ratings_total: 8945,
        link: "https://www.amazon.com/dp/B08F3MGC9Q?tag=needfully-20",
        retailer: "amazon"
      },
      {
        title: "Ozark Trail 10' x 10' Instant Straight Leg Canopy",
        image: "https://i5.walmartimages.com/asr/a4f7b8c9-5e2d-4f1a-8b3c-9d6e7f4a2b1c.jpg",
        price: "$79.00",
        product_url: "https://www.walmart.com/ip/Ozark-Trail-10-x-10-Instant-Straight-Leg-Canopy/54643002",
        product_id: "54643002",
        retailer: "walmart",
        retailer_name: "Walmart"
      }
    ],
    "Toys & Games": [
      {
        asin: "B08KRXXCZP",
        title: "LEGO Classic Creative Bricks 11005 Building Kit",
        image: "https://m.media-amazon.com/images/I/81+k3dSAb0L._SL1500_.jpg",
        price: { value: 19.99, currency: "USD" },
        rating: 4.8,
        ratings_total: 8634,
        link: "https://www.amazon.com/dp/B08KRXXCZP?tag=needfully-20",
        retailer: "amazon"
      },
      {
        title: "Play-Doh Modeling Compound 10-Pack Case of Colors",
        image: "https://i5.walmartimages.com/asr/e3f1a2b4-6c5d-4e7f-9a8b-1c2d3e4f5a6b.jpg",
        price: "$8.97",
        product_url: "https://www.walmart.com/ip/Play-Doh-Modeling-Compound-10-Pack/15066906",
        product_id: "15066906",
        retailer: "walmart",
        retailer_name: "Walmart"
      }
    ],
    "Automotive": [
      {
        asin: "B075JBQZPX",
        title: "Chemical Guys WAC_201_16 Butter Wet Wax (16 oz)",
        image: "https://m.media-amazon.com/images/I/71HAQ7VcvXL._SL1500_.jpg",
        price: { value: 13.99, currency: "USD" },
        rating: 4.4,
        ratings_total: 22456,
        link: "https://www.amazon.com/dp/B075JBQZPX?tag=needfully-20",
        retailer: "amazon"
      },
      {
        title: "Mobil 1 Advanced Fuel Economy Full Synthetic Motor Oil 0W-20, 5 qt",
        image: "https://i5.walmartimages.com/asr/d5e6f7a8-9b0c-4d1e-2f3a-4b5c6d7e8f9a.jpg",
        price: "$28.76",
        product_url: "https://www.walmart.com/ip/Mobil-1-Advanced-Fuel-Economy/15724913",
        product_id: "15724913",
        retailer: "walmart",
        retailer_name: "Walmart"
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
    queryKey: ['/api/search', debouncedQuery, category, page],
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
      console.log('✅ Search results received:', data);
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

  // Get display products - show cached products immediately, replace with live results when searching
  const displayProducts = useMemo(() => {
    console.log('🔍 DisplayProducts Debug:', {
      debouncedQuery,
      hasSearchResults: !!searchResults,
      searchResultsData: searchResults?.data?.length || 0,
      activeSearch,
    });
    
    // Priority 1: If we have search results from live API, use them (they have real images)
    if (debouncedQuery && debouncedQuery.length >= 3 && searchResults) {
      // Check the actual API response structure - it should be searchResults.data
      const results = searchResults?.data || [];
      if (results.length > 0) {
        const targetProducts = results.filter((p: any) => p.retailer === 'target');
        const walmartProducts = results.filter((p: any) => p.retailer === 'walmart');
        const amazonProducts = results.filter((p: any) => p.retailer === 'amazon');
        console.log(`✅ Using live results with ${results.length} products: Amazon: ${amazonProducts.length}, Walmart: ${walmartProducts.length}, Target: ${targetProducts.length}`);
        return results;
      }
    }
    
    // Priority 2: Check if we have cached products for the activeSearch category
    if (activeSearch && popularProducts[activeSearch]) {
      const cachedProducts = popularProducts[activeSearch] || [];
      console.log(`📦 Using cached products for category: ${activeSearch}`, cachedProducts.length, 'products found');
      // Only return cached products if we don't have a search query that would override them
      if (!debouncedQuery || debouncedQuery.length < 3) {
        return cachedProducts;
      }
    }
    
    // Priority 3: Show cached "Basic Essentials" when no search has been performed
    if (!debouncedQuery && (!activeSearch || activeSearch === "Basic Essentials")) {
      console.log('📦 Using cached Basic Essentials products');
      return popularProducts["Basic Essentials"] || [];
    }
    
    console.log('❌ No products to display');
    return [];
  }, [debouncedQuery, searchResults, popularProducts, activeSearch]);

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
    mutationFn: async (product: any) => {
      const productId = product.asin || product.product_id || product.id;
      setAddingProductId(productId);
      

      
      // If no wishlistId provided, use the first available wishlist
      let targetWishlistId = wishlistId;
      if (!targetWishlistId && userWishlists && Array.isArray(userWishlists) && userWishlists.length > 0) {
        targetWishlistId = userWishlists[0].id.toString();
      }
      
      if (!targetWishlistId) {
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
                  // Use cached products instead of triggering API search
                  setSearchQuery(""); // Clear search input to show we're using category
                  setDebouncedQuery(""); // Don't trigger API search
                  setActiveSearch(category.label); // Set activeSearch to show cached products
                  setCategory(category.value);
                  setPage(1);
                  setShowCategories(false); // Hide categories on mobile after selection
                  
                  // No API calls - using cached products only
                  console.log(`📦 Using cached products for category: ${category.label}`);
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
                  category.value === category ? 'border-coral bg-coral/10' : 'border-transparent'
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
      </div>


    </div>
  );
}
