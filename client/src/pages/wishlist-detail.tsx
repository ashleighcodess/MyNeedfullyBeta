import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import ProductCard from "@/components/product-card";

import PurchaseConfirmationModal from "@/components/purchase-confirmation-modal";
import { ShareModal } from "@/components/share-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  MapPin, 
  Calendar, 
  Share2, 
  Heart, 
  Gift,
  User, 
  Clock,
  Eye,
  Copy,
  Check,
  Plus,
  AlertCircle,
  List,
  Search,
  UserPlus,
  Activity,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
  GitMerge,
  Trash2,
  Minus,
  ShoppingBag,
  AlertTriangle,
  ImageOff
} from "lucide-react";
import { GIFT_CARDS } from "@/lib/constants";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl, generateWishlistStructuredData, generateOgImage } from "@/lib/seo";

// Retailer logos
import amazonLogo from "@assets/amazon_1751644244382.png";
import targetLogo from "@assets/target_1751644244383.png";
import walmartLogo from "@assets/walmart_1751644244383.png";

export default function WishlistDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  
  // Debug logging for mobile
  console.log('WishlistDetail component loaded:', { id, params, userAgent: navigator.userAgent });
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const [showImageCarousel, setShowImageCarousel] = useState(false);
  const [itemPricing, setItemPricing] = useState<Record<string, any>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  // Helper function to check if item is a gift card
  const isGiftCard = (item: any) => {
    return GIFT_CARDS.some(giftCard => 
      item.title?.toLowerCase().includes(giftCard.name.toLowerCase()) ||
      item.title?.toLowerCase().includes('gift card') ||
      item.description?.toLowerCase().includes('gift card')
    );
  };

  // Helper function to get gift card data
  const getGiftCardData = (item: any) => {
    return GIFT_CARDS.find(giftCard => 
      item.title?.toLowerCase().includes(giftCard.name.toLowerCase())
    );
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Unknown time';
    
    const now = new Date();
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date received:', dateString);
      return 'Invalid date';
    }
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 0) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Helper function to format price (avoid double dollar signs)
  const formatPrice = (price: string | number | undefined, isLoading = false) => {
    if (isLoading) return 'Loading Best Price';
    if (!price) return 'Price not available';
    const priceStr = String(price);
    // If price already has $, return as is, otherwise add $
    return priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
  };

  // Helper function to get the best available price for a retailer
  const getRetailerPrice = (itemId: number, retailer: 'amazon' | 'target' | 'walmart') => {
    const pricing = itemPricing[itemId]?.pricing;
    if (pricing && pricing[retailer] && pricing[retailer].available && pricing[retailer].price) {
      return pricing[retailer].price;
    }
    return null;
  };

  // Helper function to get the best available price from any retailer (for item display)
  const getBestAvailablePrice = (itemId: number) => {
    const pricing = itemPricing[itemId]?.pricing;
    if (!pricing) return null;
    
    // Try to get prices from all retailers, prioritize lowest price
    const prices = [];
    if (pricing.amazon?.available && pricing.amazon?.price) {
      prices.push(parseFloat(String(pricing.amazon.price).replace('$', '')));
    }
    if (pricing.walmart?.available && pricing.walmart?.price) {
      prices.push(parseFloat(String(pricing.walmart.price).replace('$', '')));
    }
    if (pricing.target?.available && pricing.target?.price) {
      prices.push(parseFloat(String(pricing.target.price).replace('$', '')));
    }
    
    if (prices.length > 0) {
      const bestPrice = Math.min(...prices);
      return `$${bestPrice.toFixed(2)}`;
    }
    
    return null;
  };

  // Helper function to get activity icon
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'plus': return <Plus className="h-4 w-4" />;
      case 'list': return <List className="h-4 w-4" />;
      case 'eye': return <Eye className="h-4 w-4" />;
      case 'search': return <Search className="h-4 w-4" />;
      case 'check': return <Check className="h-4 w-4" />;
      case 'heart': return <Heart className="h-4 w-4" />;
      case 'user-plus': return <UserPlus className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  // Function to fetch live pricing for an item
  const fetchItemPricing = async (itemId: number) => {
    try {
      const response = await fetch(`/api/items/${itemId}/pricing`);
      if (response.ok) {
        const pricingData = await response.json();
        setItemPricing(prev => ({
          ...prev,
          [itemId]: pricingData
        }));
      }
    } catch (error) {
      console.error('Error fetching pricing for item:', itemId, error);
    }
  };

  // Fetch real recent activity data from API with optimized polling
  const { data: recentActivitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/activity/recent'],
    refetchInterval: 180000, // Refresh every 3 minutes for better performance
    staleTime: 120000, // Consider data stale after 2 minutes
  });

  // Format activities data for display - API returns pre-formatted data
  const recentActivities = (recentActivitiesData || []).map((activity: any, index: number) => {
    // Create a readable message from the activity data
    const activityMessage = `${activity.supporter} ${activity.action} ${activity.item}`;
    
    return {
      id: activity.id,
      type: activity.type,
      message: activityMessage,
      timestamp: activity.timeAgo, // API returns pre-formatted time like "1h ago", "18h ago"
      animate: index === 0, // Only animate the first (newest) activity
      icon: activity.type === 'donation' ? 'gift' : activity.type === 'request' ? 'plus' : activity.type === 'thanks' ? 'heart' : 'activity'
    };
  });

  const { data: wishlist, isLoading } = useQuery({
    queryKey: [`/api/wishlists/${id}`],
    enabled: !!id,
  });

  // Fetch batch pricing data with progressive loading - Target/Walmart first, then Amazon
  useEffect(() => {
    if (wishlist?.items && Array.isArray(wishlist.items) && wishlist.items.length > 0 && id) {
      // Check if we already have pricing data to avoid refetching
      const hasAllPricing = wishlist.items.every((item: any) => itemPricing[item.id]?.pricing);
      if (hasAllPricing) {
        console.log('💰 Already have pricing data, skipping fetch');
        return;
      }
      
      const fetchProgressivePricing = async () => {
        try {
          console.log(`💰 Starting progressive pricing for ${wishlist.items.length} items`);
          
          // First, fetch Target and Walmart prices (fast - 3 second timeout each)
          console.log(`💰 Fetching fast retailers (Target/Walmart) first...`);
          const fastResponse = await fetch(`/api/wishlist/${id}/pricing?progressive=true`);
          
          if (fastResponse.ok) {
            const fastPricingData = await fastResponse.json();
            console.log(`💰 Fast retailers loaded for ${Object.keys(fastPricingData).length} items`);
            
            // Update pricing with Target/Walmart data immediately
            setItemPricing(prevPricing => {
              const updated = { ...prevPricing };
              Object.entries(fastPricingData).forEach(([itemId, data]: [string, any]) => {
                updated[itemId] = {
                  ...updated[itemId],
                  pricing: {
                    ...updated[itemId]?.pricing,
                    ...data.pricing
                  }
                };
              });
              return updated;
            });
          }
          
          // Then fetch Amazon prices separately (slower - 8 second timeout)
          console.log(`💰 Now fetching Amazon prices...`);
          const amazonResponse = await fetch(`/api/wishlist/${id}/amazon-pricing`);
          
          if (amazonResponse.ok) {
            const amazonPricingData = await amazonResponse.json();
            console.log(`💰 Amazon pricing loaded for ${Object.keys(amazonPricingData).length} items`);
            
            // Update pricing with Amazon data
            console.log('💰 Amazon data received:', amazonPricingData);
            setItemPricing(prevPricing => {
              const updated = { ...prevPricing };
              Object.entries(amazonPricingData).forEach(([itemId, data]: [string, any]) => {
                console.log(`💰 Merging Amazon data for item ${itemId}:`, data);
                updated[itemId] = {
                  ...updated[itemId],
                  pricing: {
                    ...updated[itemId]?.pricing,
                    ...data.pricing
                  }
                };
              });
              console.log('💰 Final updated pricing:', updated);
              return updated;
            });
          }
        } catch (error) {
          console.error('Error fetching progressive pricing:', error);
          // Fallback to individual pricing if batch fails
          wishlist.items.forEach((item: any) => {
            if (item.id && !itemPricing[item.id]) {
              fetchItemPricing(item.id);
            }
          });
        }
      };
      
      fetchProgressivePricing();
    }
  }, [wishlist?.items, id]); // Removed itemPricing from deps to allow progressive updates

  // SEO Configuration - Dynamic based on wishlist data
  useSEO({
    title: wishlist 
      ? generatePageTitle(`${wishlist.title} - ${wishlist.location}`)
      : generatePageTitle("Needs List Details"),
    description: wishlist 
      ? generatePageDescription(`Support ${wishlist.title} in ${wishlist.location}. ${wishlist.description}`)
      : generatePageDescription("View detailed information about this needs list and support a family in crisis."),
    keywords: generateKeywords([
      wishlist?.category,
      wishlist?.location,
      "individual needs list",
      "support family in crisis",
      "donate to family",
      "crisis support"
    ].filter(Boolean)),
    canonical: generateCanonicalUrl(`/wishlist/${id}`),
    ogImage: wishlist?.storyImages?.[0] ? generateOgImage(wishlist.storyImages[0]) : undefined,
    structuredData: wishlist ? generateWishlistStructuredData(wishlist) : undefined
  });

  // Quantity update mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({ id: itemId, quantity }: { id: number; quantity: number }) => 
      apiRequest('PATCH', `/api/wishlist-items/${itemId}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${id}`] });
      toast({
        title: "Quantity Updated",
        description: "Item quantity has been updated successfully.",
      });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => 
      apiRequest('DELETE', `/api/wishlist-items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${id}`] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from your needs list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Merge duplicates mutation
  const mergeDuplicatesMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', `/api/wishlists/${id}/merge-duplicates`),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${id}`] });
      if (data.mergedCount > 0) {
        toast({
          title: "Duplicates Merged",
          description: `Successfully merged ${data.mergedCount} duplicate item${data.mergedCount > 1 ? 's' : ''}.`,
        });
      } else {
        toast({
          title: "No Duplicates Found",
          description: "No duplicate items were found to merge.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Error merging duplicates:", error);
      toast({
        title: "Error",
        description: "Failed to merge duplicate items. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fulfillment mutation
  const fulfillItemMutation = useMutation({
    mutationFn: (itemId: number) => 
      apiRequest('PATCH', `/api/wishlist-items/${itemId}/fulfill`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/donations'] });
      toast({
        title: "Thank you!",
        description: "Item marked as purchased. The creator will be notified.",
      });
      setShowPurchaseModal(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      console.error("Error fulfilling item:", error);
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign up or log in to purchase items for others.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/signup"), 2000);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to mark item as purchased. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Archive wishlist mutation (sets status to 'cancelled')
  const deleteWishlistMutation = useMutation({
    mutationFn: () =>
      apiRequest('PATCH', `/api/wishlists/${id}`, { status: 'cancelled' }),
    onSuccess: () => {
      toast({
        title: "Needs List Archived",
        description: "Your needs list has been moved to the archive. You can find it in your profile's Archive section.",
      });
      navigate('/profile?tab=archive');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive needs list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyAddress = async () => {
    if (!wishlist?.shippingAddress) return;
    
    const address = wishlist.shippingAddress;
    const fullAddress = [
      address.fullName,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopiedAddress(true);
      toast({
        title: "Address Copied",
        description: "Shipping address has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy address. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const shareWishlist = () => {
    setShowShareModal(true);
  };

  const handleShare = async () => {
    // Increment share count in the database
    try {
      await apiRequest('POST', `/api/wishlists/${wishlist?.id}/share`);
      // Invalidate wishlist cache to refresh the share count
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${wishlist?.id}`] });
    } catch (error) {
      console.error('Failed to increment share count:', error);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const completionPercentage = wishlist?.totalItems > 0 
    ? Math.round((wishlist.fulfilledItems / wishlist.totalItems) * 100) 
    : 0;

  const isOwner = user?.id?.toString() === wishlist?.userId?.toString();

  // Image carousel functions
  const openCarousel = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageCarousel(true);
  };

  const getStoryImages = () => {
    const storyImages = (wishlist as any)?.storyImages;
    if (!storyImages) return [];
    
    // Ensure storyImages is an array and not a string
    if (Array.isArray(storyImages)) {
      return storyImages;
    }
    
    // Handle PostgreSQL array format: {"/uploads/file1.jpg","/uploads/file2.jpg"}
    if (typeof storyImages === 'string' && storyImages.startsWith('{') && storyImages.endsWith('}')) {
      const innerString = storyImages.slice(1, -1);
      return innerString ? innerString.split(',').map(img => img.trim().replace(/"/g, '')) : [];
    }
    
    return [];
  };

  // Preload story images for faster loading
  useEffect(() => {
    if (wishlist) {
      const storyImages = getStoryImages();
      
      // Add preload link tags to HTML head for priority loading
      storyImages.forEach((imagePath: string, index: number) => {
        // Create preload link for critical images
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = imagePath;
        link.as = 'image';
        if (index === 0) {
          link.setAttribute('fetchpriority', 'high'); // Highest priority for featured image
        }
        document.head.appendChild(link);
        
        // Also preload via Image constructor for browser cache
        const img = new Image();
        img.src = imagePath;
        if (index === 0) {
          (img as any).fetchpriority = 'high';
        }
      });
      
      // Cleanup function to remove preload links when component unmounts
      return () => {
        const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
        preloadLinks.forEach(link => {
          if (storyImages.some(img => img === link.getAttribute('href'))) {
            document.head.removeChild(link);
          }
        });
      };
    }
  }, [wishlist]);

  const nextImage = () => {
    const images = getStoryImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    const images = getStoryImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Needs List Not Found</h3>
            <p className="text-gray-600 mb-4">The needs list you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg" style={{ minHeight: '100vh', width: '100%' }}>
      {/* Mobile Debug Indicator */}
      <div className="block md:hidden p-2 bg-red-500 text-white text-xs">
        Mobile Debug: Page Loaded - ID: {id}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2 leading-tight pr-4">{wishlist.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{wishlist.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Created {new Date(wishlist.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span>{wishlist.viewCount} views</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Badge className={getUrgencyColor(wishlist.urgencyLevel)}>
                {wishlist.urgencyLevel.charAt(0).toUpperCase() + wishlist.urgencyLevel.slice(1)}
              </Badge>
              <div className="flex items-center space-x-2">
                {isOwner && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/edit-wishlist/${wishlist.id}`)}>
                      <Edit className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (confirm('Are you sure you want to archive this needs list? It will be moved to your Archive section and removed from public view.')) {
                          deleteWishlistMutation.mutate();
                        }
                      }}
                      disabled={deleteWishlistMutation.isPending}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="mr-1 sm:mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">
                        {deleteWishlistMutation.isPending ? 'Archiving...' : 'Archive'}
                      </span>
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={shareWishlist}>
                  <Share2 className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Featured Image */}
            {getStoryImages().length > 0 && (
              <div className="mb-8">
                <div className="relative h-80 w-full rounded-lg overflow-hidden">
                  {!imageErrors[0] ? (
                    <div 
                      className="cursor-pointer group h-full w-full"
                      onClick={() => openCarousel(0)}
                    >
                      <img
                        src={getStoryImages()[0]}
                        alt={wishlist.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="eager"
                        onError={() => setImageErrors(prev => ({...prev, 0: true}))}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-10 w-10" />
                      </div>
                      {getStoryImages().length > 1 && (
                        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                          +{getStoryImages().length - 1} more photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg">
                      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                      <h3 className="text-red-700 text-lg font-semibold mb-2">Story Image Missing</h3>
                      <p className="text-red-600 text-center px-4 mb-2">
                        The uploaded story image could not be loaded from the server.
                      </p>
                      <p className="text-red-500 text-sm text-center px-4">
                        File path: {getStoryImages()[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Story */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-coral" />
                  Our Story
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">{wishlist.description}</p>
                {wishlist.story && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-gray-700 leading-relaxed mb-4">{wishlist.story}</p>
                  </>
                )}
                
                {/* Story Images */}
                {getStoryImages().length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getStoryImages().map((imagePath: string, index: number) => (
                        <div 
                          key={index} 
                          className="relative rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                        >
                          {!imageErrors[index] ? (
                            <div 
                              className="group cursor-pointer"
                              onClick={() => openCarousel(index)}
                            >
                              <img
                                src={imagePath}
                                alt={`Story image ${index + 1}`}
                                className="w-full h-48 object-cover hover:shadow-md transition-all duration-300 transform hover:scale-105"
                                loading={index < 3 ? "eager" : "lazy"}
                                onError={() => setImageErrors(prev => ({...prev, [index]: true}))}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8" />
                              </div>
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                {index + 1} of {getStoryImages().length}
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-48 flex flex-col items-center justify-center bg-red-50 border-red-200">
                              <ImageOff className="h-8 w-8 text-red-500 mb-2" />
                              <p className="text-red-700 text-sm font-medium text-center px-2">
                                Image {index + 1} unavailable
                              </p>
                              <p className="text-red-600 text-xs text-center px-2 mt-1">
                                File missing from server
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            <div className="bg-white rounded-lg p-4 border mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-600">
                  {wishlist.fulfilledItems} of {wishlist.totalItems} items fulfilled
                </span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              <div className="text-center mt-2">
                <span className="text-lg font-bold text-coral">{completionPercentage}% Complete</span>
              </div>
            </div>

            {/* Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Gift className="mr-2 h-5 w-5 text-coral" />
                  Items Needed ({wishlist.items?.length || 0})
                </CardTitle>
                {isOwner && (
                  <Button 
                    size="sm" 
                    className="bg-coral hover:bg-coral/90"
                    onClick={() => navigate(`/products?wishlistId=${id}`)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Items
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {wishlist.items && wishlist.items.length > 0 ? (
                  <div className="space-y-4">
                    {/* Sort items: unfulfilled first, fulfilled last */}
                    {wishlist.items
                      .sort((a: any, b: any) => {
                        // Unfulfilled items first (false = 0), fulfilled items last (true = 1)
                        return (a.quantityFulfilled >= a.quantity ? 1 : 0) - (b.quantityFulfilled >= b.quantity ? 1 : 0);
                      })
                      .map((item: any) => (
                      <div key={item.id} className={`flex flex-col sm:flex-row bg-white rounded-lg border overflow-hidden ${
                        item.isFulfilled ? 'border-gray-300 opacity-60' : 'border-gray-200'
                      }`}>
                        {/* Product Image */}
                        <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 relative sm:m-4">
                          {(() => {
                            // Special handling for gift cards - use authentic gift card images
                            if (isGiftCard(item)) {
                              const giftCardData = getGiftCardData(item);
                              return giftCardData ? (
                                <img
                                  src={giftCardData.image}
                                  alt={giftCardData.name}
                                  className={`w-full h-full object-contain sm:rounded-lg ${
                                    item.isFulfilled ? 'grayscale' : ''
                                  }`}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 sm:rounded-lg">
                                  <Gift className="h-8 w-8 text-gray-400" />
                                </div>
                              );
                            }
                            
                            // Regular product image logic
                            const liveImage = itemPricing[item.id]?.pricing?.amazon?.image || 
                                            itemPricing[item.id]?.pricing?.walmart?.image || 
                                            itemPricing[item.id]?.pricing?.target?.image;
                            
                            // Use live image if available, otherwise fall back to database image (but not asset paths)
                            const finalImageUrl = liveImage || (item.imageUrl && !item.imageUrl.startsWith('/assets/') ? item.imageUrl : null);
                            
                            return finalImageUrl ? (
                              <img
                                src={finalImageUrl}
                                alt={item.title}
                                className={`w-full h-full object-cover sm:rounded-lg ${
                                  item.isFulfilled ? 'grayscale' : ''
                                }`}
                                loading="lazy"
                                onError={(e) => {
                                  console.error(`Failed to load image for ${item.title}:`, finalImageUrl);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 sm:rounded-lg">
                                <Skeleton className="w-full h-full sm:rounded-lg" />
                              </div>
                            );
                          })()}
                          {item.isFulfilled && (
                            <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center sm:rounded-lg">
                              <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                ✓ Fulfilled
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between p-4 sm:pr-6">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                              <div className="flex-1">
                                <h3 className={`font-semibold text-base sm:text-lg leading-snug mb-2 ${
                                  (item.quantityFulfilled >= item.quantity) ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                  {item.title.split(',')[0]}
                                </h3>
                                
                                {/* Quantity Display */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                  <div className={`text-sm font-medium ${
                                    (item.quantityFulfilled >= item.quantity) ? 'text-gray-400' : 'text-gray-700'
                                  }`}>
                                    Qty: {item.quantityFulfilled || 0} / {item.quantity || 1}
                                  </div>
                                  
                                  {isOwner && (item.quantityFulfilled < item.quantity) && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: Math.max(1, (item.quantity || 1) - 1) })}
                                        disabled={updateQuantityMutation.isPending || (item.quantity || 1) <= (item.quantityFulfilled || 0)}
                                        className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Decrease quantity by 1"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="text-sm font-medium w-8 text-center">{item.quantity || 1}</span>
                                      <button
                                        onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: (item.quantity || 1) + 1 })}
                                        disabled={updateQuantityMutation.isPending}
                                        className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                        title="Increase quantity by 1"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                
                                <p className={`text-sm mb-3 line-clamp-3 ${
                                  (item.quantityFulfilled >= item.quantity) ? 'text-gray-400' : 'text-gray-600'
                                }`}>{item.description || 'Essential item needed for daily living'}</p>
                                {/* Price display - different for gift cards */}
                                {!isGiftCard(item) ? (
                                  <div className={`text-xl sm:text-2xl font-bold ${
                                    (item.quantityFulfilled >= item.quantity) ? 'text-gray-400 line-through' : 'text-gray-900'
                                  }`}>
                                    {!itemPricing[item.id]?.pricing ? (
                                      <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                                    ) : (
                                      getBestAvailablePrice(item.id) || 'Price not available'
                                    )}
                                  </div>
                                ) : (
                                  <div className={`text-base font-medium ${
                                    (item.quantityFulfilled >= item.quantity) ? 'text-gray-400 line-through' : 'text-coral'
                                  }`}>
                                    Gift Card - Various Amounts Available
                                  </div>
                                )}
                              </div>
                              
                              {/* Trash icon for owner */}
                              {isOwner && (
                                <button 
                                  onClick={() => {
                                    // Show immediate feedback
                                    deleteItemMutation.mutate(item.id);
                                  }}
                                  disabled={deleteItemMutation.isPending}
                                  className={`p-2 sm:p-1 sm:ml-4 transition-colors self-start ${
                                    deleteItemMutation.isPending 
                                      ? 'text-red-400 opacity-50 cursor-not-allowed' 
                                      : 'text-gray-400 hover:text-red-600'
                                  }`}
                                  title="Remove item completely"
                                >
                                  <Trash2 className="w-6 h-6 sm:w-5 sm:h-5" />
                                </button>
                              )}
                            </div>
                          </div>



                          {item.isFulfilled && (
                            <div className="mt-4">
                              <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <Check className="w-4 h-4 mr-2" />
                                Item Fulfilled
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Buying Options - Mobile responsive */}
                        <div className={`px-4 py-3 flex flex-col justify-center w-full sm:w-[280px] sm:flex-shrink-0 ${
                          item.isFulfilled ? 'bg-gray-50' : 'bg-red-50'
                        }`}>
                          <h4 className={`font-medium text-sm mb-2 text-center ${
                            item.isFulfilled ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {item.isFulfilled ? 'Item Fulfilled' : 'Buying Options'}
                          </h4>
                          
                          {/* Show authentication message for non-authenticated users */}
                          {!user && !item.isFulfilled && (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-600 mb-3">Sign up to purchase items for others</p>
                              <Button 
                                onClick={() => navigate("/signup")}
                                className="w-full bg-coral hover:bg-coral/90 text-white text-sm py-2"
                              >
                                Sign Up to Help
                              </Button>
                            </div>
                          )}
                          
                          {/* Show retailer buttons only for authenticated users */}
                          {user && !item.isFulfilled && (
                            <>
                              {/* Gift Card Display - Single Buy Button */}
                              {isGiftCard(item) ? (
                                <div className="space-y-2">
                                  {(() => {
                                    const giftCardData = getGiftCardData(item);
                                    return giftCardData ? (
                                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                                        <div className="flex items-center space-x-2">
                                          <img src={giftCardData.image} alt={giftCardData.name} className="w-8 h-6 object-contain rounded" />
                                          <div>
                                            <div className="text-xs font-medium text-gray-900">{giftCardData.retailer}</div>
                                            <div className="text-xs text-gray-600">Multiple amounts available</div>
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => {
                                            setSelectedProduct({
                                              title: item.title,
                                              price: 'Various amounts',
                                              link: giftCardData.url,
                                              retailer: giftCardData.retailer.toLowerCase(),
                                              image: giftCardData.image,
                                              itemId: item.id,
                                              isGiftCard: true
                                            });
                                            setShowPurchaseModal(true);
                                          }}
                                          className="py-2 px-4 rounded text-sm font-medium transition-colors bg-coral text-white hover:bg-coral/90"
                                        >
                                          Buy
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="text-center py-2 text-sm text-gray-500">
                                        Gift card details not available
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : (
                                /* Regular Product Display - Multi-retailer */
                                <div className="space-y-2">
                                {/* Amazon - Only show when pricing is available */}
                                {itemPricing[item.id]?.pricing?.amazon?.available && (
                                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border animate-fadeIn">
                                    <div className="flex items-center space-x-2">
                                      <img src={amazonLogo} alt="Amazon" className="w-5 h-5 rounded-full" />
                                      <div>
                                        <div className="text-xs font-medium text-gray-900">Amazon</div>
                                        <div className="text-sm font-bold text-gray-900">
                                          {formatPrice(getRetailerPrice(item.id, 'amazon'))}
                                          <span className="ml-2 text-xs text-green-600">Live Price</span>
                                        </div>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setSelectedProduct({
                                          title: item.title,
                                          price: getRetailerPrice(item.id, 'amazon') || 'Price not available',
                                          link: itemPricing[item.id]?.pricing?.amazon?.link,
                                          retailer: 'amazon',
                                          image: itemPricing[item.id]?.pricing?.amazon?.image || item.imageUrl,
                                          itemId: item.id
                                        });
                                        setShowPurchaseModal(true);
                                      }}
                                      className="py-2 px-4 rounded text-sm font-medium transition-colors bg-coral text-white hover:bg-coral/90"
                                    >
                                      View
                                    </button>
                                  </div>
                                )}

                                {/* Target - Only show when pricing is available */}
                                {itemPricing[item.id]?.pricing?.target?.available && (
                                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border animate-fadeIn">
                                    <div className="flex items-center space-x-2">
                                      <img src={targetLogo} alt="Target" className="w-5 h-5 rounded-full" />
                                      <div>
                                        <div className="text-xs font-medium text-gray-900">Target</div>
                                        <div className="text-sm font-bold text-gray-900">
                                          {formatPrice(getRetailerPrice(item.id, 'target'))}
                                          <span className="ml-2 text-xs text-green-600">Live Price</span>
                                        </div>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setSelectedProduct({
                                          title: item.title,
                                          price: getRetailerPrice(item.id, 'target') || 'Price not available',
                                          link: itemPricing[item.id]?.pricing?.target?.link,
                                          retailer: 'target',
                                          image: itemPricing[item.id]?.pricing?.target?.image || item.imageUrl,
                                          itemId: item.id
                                        });
                                        setShowPurchaseModal(true);
                                      }}
                                      className="py-2 px-4 rounded text-sm font-medium transition-colors bg-coral text-white hover:bg-coral/90"
                                    >
                                      View
                                    </button>
                                  </div>
                                )}

                                {/* Walmart - Only show when pricing is available */}
                                {itemPricing[item.id]?.pricing?.walmart?.available && (
                                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border animate-fadeIn">
                                    <div className="flex items-center space-x-2">
                                      <img src={walmartLogo} alt="Walmart" className="w-5 h-5 rounded-full" />
                                      <div>
                                        <div className="text-xs font-medium text-gray-900">Walmart</div>
                                        <div className="text-sm font-bold text-gray-900">
                                          {formatPrice(getRetailerPrice(item.id, 'walmart'))}
                                          <span className="ml-2 text-xs text-green-600">Live Price</span>
                                        </div>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setSelectedProduct({
                                          title: item.title,
                                          price: getRetailerPrice(item.id, 'walmart') || 'Price not available',
                                          link: itemPricing[item.id]?.pricing?.walmart?.link,
                                          retailer: 'walmart',
                                          image: itemPricing[item.id]?.pricing?.walmart?.image || item.imageUrl,
                                          itemId: item.id
                                        });
                                        setShowPurchaseModal(true);
                                      }}
                                      className="py-2 px-4 rounded text-sm font-medium transition-colors bg-coral text-white hover:bg-coral/90"
                                    >
                                      View
                                    </button>
                                  </div>
                                )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">No items added yet</p>
                    {isOwner && (
                      <Button 
                        className="mt-4 bg-coral hover:bg-coral/90"
                        onClick={() => navigate(`/products?wishlistId=${id}`)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Item
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-coral" />
                  Created By
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  {wishlist.user?.profileImageUrl ? (
                    <img 
                      src={wishlist.user.profileImageUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-coral to-coral/70 rounded-full flex items-center justify-center ring-2 ring-coral/20 ring-offset-1">
                      <span className="text-white text-lg font-semibold">
                        {wishlist?.user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">
                      {wishlist.user?.firstName} {wishlist.user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {wishlist.user?.isVerified && (
                        <span className="text-green-600">✓ Verified</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {(isOwner || user) && wishlist.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-coral" />
                      Shipping Address
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-8 w-8 p-0"
                    >
                      {copiedAddress ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="font-medium">{wishlist.shippingAddress.fullName}</div>
                    <div>{wishlist.shippingAddress.addressLine1}</div>
                    {wishlist.shippingAddress.addressLine2 && (
                      <div>{wishlist.shippingAddress.addressLine2}</div>
                    )}
                    <div>
                      {wishlist.shippingAddress.city}, {wishlist.shippingAddress.state} {wishlist.shippingAddress.zipCode}
                    </div>
                    <div>{wishlist.shippingAddress.country}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons - Removed per user request */}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Items Fulfilled</span>
                    <span className="font-semibold">{wishlist.fulfilledItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Items</span>
                    <span className="font-semibold">{wishlist.totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completion</span>
                    <span className="font-semibold text-coral">{completionPercentage}%</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Views</span>
                    <span className="font-semibold">{wishlist.viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shares</span>
                    <span className="font-semibold">{wishlist.shareCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Heart className="mr-2 h-5 w-5 text-coral" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activitiesLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2">
                        <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : recentActivities.length > 0 ? (
                    recentActivities.slice(0, 3).map((activity: any, index: number) => (
                      <div 
                        key={activity.id} 
                        className={`flex items-start space-x-2 text-sm transition-all duration-300 ${
                          activity.animate ? 'animate-pulse-slow' : ''
                        } hover:bg-gray-50 p-2 rounded-lg cursor-pointer`}
                      >
                        <div className="text-coral flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.icon)}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-600">{activity.message}</p>
                          <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
                  )}
                </div>
                
                <Dialog open={showAllActivity} onOpenChange={setShowAllActivity}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-4 hover:bg-coral hover:text-white transition-colors duration-200">
                      See all
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <Heart className="mr-2 h-5 w-5 text-coral" />
                        All Recent Activity
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {activitiesLoading ? (
                        // Loading skeleton for modal
                        Array.from({ length: 8 }).map((_, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3">
                            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))
                      ) : recentActivities.length > 0 ? (
                        recentActivities.map((activity: any, index: number) => (
                          <div 
                            key={activity.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md hover:border-coral/30 ${
                              activity.animate ? 'bg-coral/5 border-coral/20' : 'bg-gray-50'
                            }`}
                            style={{ 
                              animationDelay: `${index * 100}ms`,
                              animation: 'fadeInUp 0.3s ease-out forwards'
                            }}
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-coral/10 rounded-full flex items-center justify-center">
                              <div className="text-coral">
                                {getActivityIcon(activity.icon)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 font-medium">{activity.message}</p>
                              <p className="text-gray-500 text-sm mt-1">{activity.timestamp}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">No recent activity</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>


      </div>

      {/* Image Carousel Modal */}
      {showImageCarousel && getStoryImages().length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => setShowImageCarousel(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous Button */}
          {getStoryImages().length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
              onClick={prevImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Next Button */}
          {getStoryImages().length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 z-10"
              onClick={nextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Main Image */}
          <div className="max-w-4xl max-h-[80vh] mx-auto px-4">
            <img
              src={getStoryImages()[currentImageIndex]}
              alt={`Story image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain rounded-lg"
            />
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full">
              {currentImageIndex + 1} of {getStoryImages().length}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {getStoryImages().length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 -translate-y-16 flex space-x-2 max-w-md overflow-x-auto">
              {getStoryImages().map((imagePath: string, index: number) => (
                <div
                  key={index}
                  className={`flex-shrink-0 cursor-pointer border-2 rounded ${
                    index === currentImageIndex ? 'border-coral' : 'border-transparent'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={imagePath}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmationModal
        isOpen={showPurchaseModal && selectedProduct !== null}
        onClose={() => {
          console.log('Modal closing'); // Debug log
          setShowPurchaseModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct || {
          title: '',
          price: '',
          link: '',
          retailer: 'amazon' as const,
          image: ''
        }}
        wishlistOwner={{
          firstName: wishlist?.user?.firstName || 'User',
          lastName: wishlist?.user?.lastName,
          shippingAddress: wishlist?.shippingAddress,
          email: wishlist?.user?.email
        }}
        onPurchaseConfirm={() => selectedProduct && fulfillItemMutation.mutate(selectedProduct.itemId)}
        itemId={selectedProduct?.itemId || 0}
      />

      {/* Share Modal */}
      {wishlist && (
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          title={wishlist.title}
          description={wishlist.description}
          url={window.location.href}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
