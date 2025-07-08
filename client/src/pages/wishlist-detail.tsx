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
  Minus
} from "lucide-react";

export default function WishlistDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
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

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Helper function to format price (avoid double dollar signs)
  const formatPrice = (price: string | number | undefined) => {
    if (!price) return '$99.00';
    const priceStr = String(price);
    // If price already has $, return as is, otherwise add $
    return priceStr.startsWith('$') ? priceStr : `$${priceStr}`;
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

  // Fetch real recent activity data from API
  const { data: recentActivitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/activity/recent'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time feel
  });

  // Format activities data for display with proper time formatting
  const recentActivities = (recentActivitiesData || []).map((activity: any, index: number) => ({
    id: activity.id,
    type: activity.type,
    message: activity.message,
    timestamp: formatRelativeTime(activity.time),
    animate: index === 0, // Only animate the first (newest) activity
    icon: activity.icon
  }));

  const { data: wishlist, isLoading } = useQuery({
    queryKey: [`/api/wishlists/${id}`],
    enabled: !!id,
  });

  // Fetch pricing data for each item when wishlist loads
  useEffect(() => {
    if (wishlist?.items && Array.isArray(wishlist.items)) {
      wishlist.items.forEach((item: any) => {
        if (item.id && !itemPricing[item.id]) {
          fetchItemPricing(item.id);
        }
      });
    }
  }, [wishlist?.items]);



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
    return (wishlist as any)?.storyImages || [];
  };

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
    <div className="min-h-screen bg-warm-bg">
      
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
                <div 
                  className="relative h-80 w-full rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => openCarousel(0)}
                >
                  <img
                    src={getStoryImages()[0]}
                    alt={wishlist.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                          className="relative group cursor-pointer"
                          onClick={() => openCarousel(index)}
                        >
                          <img
                            src={imagePath}
                            alt={`Story image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8" />
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {index + 1} of {getStoryImages().length}
                          </div>
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
                    {wishlist.items.map((item: any) => (
                      <div key={item.id} className={`flex flex-col sm:flex-row bg-white rounded-lg border overflow-hidden ${
                        item.isFulfilled ? 'border-gray-300 opacity-60' : 'border-gray-200'
                      }`}>
                        {/* Product Image */}
                        <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 relative sm:m-4">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=400&fit=crop'}
                            alt={item.title}
                            className={`w-full h-full object-cover sm:rounded-lg ${
                              item.isFulfilled ? 'grayscale' : ''
                            }`}
                          />
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
                                <div className={`text-xl sm:text-2xl font-bold ${
                                  (item.quantityFulfilled >= item.quantity) ? 'text-gray-400 line-through' : 'text-gray-900'
                                }`}>
                                  ${item.price || '99.00'}
                                </div>
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
                            <div className="space-y-2">
                            {/* Amazon */}
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                              <div className="flex items-center space-x-2">
                                <img src="/logos/amazon-logo.png" alt="Amazon" className="w-5 h-5 rounded-full" />
                                <div>
                                  <div className="text-xs font-medium text-gray-900">Amazon</div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {formatPrice(itemPricing[item.id]?.pricing?.amazon?.price || item.price)}
                                    {itemPricing[item.id]?.pricing?.amazon?.available && (
                                      <span className="ml-2 text-xs text-green-600">Live Price</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (!item.isFulfilled && (itemPricing[item.id]?.pricing?.amazon?.link || item.productUrl)) {
                                    setSelectedProduct({
                                      title: item.title,
                                      price: itemPricing[item.id]?.pricing?.amazon?.price || item.price || '$99.00',
                                      link: itemPricing[item.id]?.pricing?.amazon?.link || item.productUrl,
                                      retailer: 'amazon',
                                      image: item.imageUrl,
                                      itemId: item.id
                                    });
                                    setShowPurchaseModal(true);
                                  }
                                }}
                                disabled={item.isFulfilled || (!itemPricing[item.id]?.pricing?.amazon?.available && !item.productUrl)}
                                className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
                                  item.isFulfilled || (!itemPricing[item.id]?.pricing?.amazon?.available && !item.productUrl)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-coral text-white hover:bg-coral/90'
                                }`}
                              >
                                {item.isFulfilled ? 'Fulfilled' : 
                                 !itemPricing[item.id]?.pricing ? 'Loading...' :
                                 !itemPricing[item.id]?.pricing?.amazon?.available && !item.productUrl ? 'Unavailable' : 'View'}
                              </button>
                            </div>

                            {/* Target */}
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                              <div className="flex items-center space-x-2">
                                <img src="/logos/target-logo.png" alt="Target" className="w-5 h-5 rounded-full" />
                                <div>
                                  <div className="text-xs font-medium text-gray-900">Target</div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {formatPrice(itemPricing[item.id]?.pricing?.target?.price || item.price)}
                                    {itemPricing[item.id]?.pricing?.target?.available && (
                                      <span className="ml-2 text-xs text-green-600">Live Price</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (!item.isFulfilled && itemPricing[item.id]?.pricing?.target?.link) {
                                    setSelectedProduct({
                                      title: item.title,
                                      price: itemPricing[item.id]?.pricing?.target?.price || item.price || '$99.00',
                                      link: itemPricing[item.id]?.pricing?.target?.link,
                                      retailer: 'target',
                                      image: item.imageUrl,
                                      itemId: item.id
                                    });
                                    setShowPurchaseModal(true);
                                  }
                                }}
                                disabled={item.isFulfilled || !itemPricing[item.id]?.pricing?.target?.available}
                                className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
                                  item.isFulfilled || !itemPricing[item.id]?.pricing?.target?.available
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-coral text-white hover:bg-coral/90'
                                }`}
                              >
                                {item.isFulfilled ? 'Fulfilled' : 
                                 !itemPricing[item.id]?.pricing ? 'Loading...' :
                                 !itemPricing[item.id]?.pricing?.target?.available ? 'Unavailable' : 'View'}
                              </button>
                            </div>

                            {/* Walmart */}
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
                              <div className="flex items-center space-x-2">
                                <img src="/logos/walmart-logo.png" alt="Walmart" className="w-5 h-5 rounded-full" />
                                <div>
                                  <div className="text-xs font-medium text-gray-900">Walmart</div>
                                  <div className="text-sm font-bold text-gray-900">
                                    {formatPrice(itemPricing[item.id]?.pricing?.walmart?.price || item.price)}
                                    {itemPricing[item.id]?.pricing?.walmart?.available && (
                                      <span className="ml-2 text-xs text-green-600">Live Price</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (!item.isFulfilled && itemPricing[item.id]?.pricing?.walmart?.link) {
                                    setSelectedProduct({
                                      title: item.title,
                                      price: itemPricing[item.id]?.pricing?.walmart?.price || item.price || '$99.00',
                                      link: itemPricing[item.id]?.pricing?.walmart?.link,
                                      retailer: 'walmart',
                                      image: item.imageUrl,
                                      itemId: item.id
                                    });
                                    setShowPurchaseModal(true);
                                  }
                                }}
                                disabled={item.isFulfilled || !itemPricing[item.id]?.pricing?.walmart?.available}
                                className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
                                  item.isFulfilled || !itemPricing[item.id]?.pricing?.walmart?.available
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-coral text-white hover:bg-coral/90'
                                }`}
                              >
                                {item.isFulfilled ? 'Fulfilled' : 
                                 !itemPricing[item.id]?.pricing ? 'Loading...' :
                                 !itemPricing[item.id]?.pricing?.walmart?.available ? 'Unavailable' : 'View'}
                              </button>
                            </div>
                            </div>
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
                    <img 
                      src="/attached_assets/Logo_6_1752017502495.png" 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
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
      {selectedProduct && (
        <PurchaseConfirmationModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          wishlistOwner={{
            firstName: wishlist?.user?.firstName || 'User',
            lastName: wishlist?.user?.lastName,
            shippingAddress: wishlist?.shippingAddress
          }}
          onPurchaseConfirm={() => fulfillItemMutation.mutate(selectedProduct.itemId)}
          itemId={selectedProduct.itemId}
        />
      )}

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
