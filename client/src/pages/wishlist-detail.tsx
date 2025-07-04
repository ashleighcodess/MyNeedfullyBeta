import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ProductCard from "@/components/product-card";
import ThankYouNote from "@/components/thank-you-note";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  MessageSquare,
  Plus,
  AlertCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

export default function WishlistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showThankYouNote, setShowThankYouNote] = useState(false);
  const [showImageCarousel, setShowImageCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Mock recent activity data - in real implementation this would come from API
  const recentActivities = [
    {
      id: 1,
      type: 'purchase',
      message: 'A supporter purchased an item off this list',
      timestamp: '5 minutes ago',
      animate: true
    },
    {
      id: 2,
      type: 'share',
      message: 'A supporter shared this list',
      timestamp: '10 minutes ago',
      animate: false
    },
    {
      id: 3,
      type: 'view',
      message: 'A supporter viewed this needs list',
      timestamp: '15 minutes ago',
      animate: false
    },
    {
      id: 4,
      type: 'purchase',
      message: 'A supporter purchased 2 items from this list',
      timestamp: '1 hour ago',
      animate: false
    },
    {
      id: 5,
      type: 'share',
      message: 'A supporter shared this list with friends',
      timestamp: '2 hours ago',
      animate: false
    },
    {
      id: 6,
      type: 'view',
      message: 'A supporter viewed this needs list',
      timestamp: '3 hours ago',
      animate: false
    },
    {
      id: 7,
      type: 'purchase',
      message: 'A supporter purchased a baby formula from this list',
      timestamp: '4 hours ago',
      animate: false
    },
    {
      id: 8,
      type: 'share',
      message: 'A supporter shared this list on social media',
      timestamp: '5 hours ago',
      animate: false
    }
  ];

  const { data: wishlist, isLoading } = useQuery({
    queryKey: [`/api/wishlists/${id}`],
    enabled: !!id,
  });

  const fulfillItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest("POST", `/api/donations`, {
        wishlistId: parseInt(id!),
        itemId,
        status: "confirmed",
        message: "Item fulfilled through MyNeedfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${id}`] });
      toast({
        title: "Thank You!",
        description: "Your donation has been recorded. The recipient will be notified.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Sign In",
          description: "You need to be signed in to make a donation.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
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

  const shareWishlist = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: wishlist?.title,
          text: wishlist?.description,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Wishlist link has been copied to your clipboard.",
        });
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Wishlist link has been copied to your clipboard.",
      });
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
        <Navigation />
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
        <Navigation />
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
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-navy mb-2">{wishlist.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {wishlist.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Created {new Date(wishlist.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" />
                  {wishlist.viewCount} views
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={getUrgencyColor(wishlist.urgencyLevel)}>
                {wishlist.urgencyLevel.charAt(0).toUpperCase() + wishlist.urgencyLevel.slice(1)}
              </Badge>
              {isOwner && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/edit-wishlist/${wishlist.id}`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={shareWishlist}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.items.map((item: any) => (
                      <ProductCard 
                        key={item.id}
                        item={item}
                        onFulfill={() => fulfillItemMutation.mutate(item.id)}
                        canFulfill={!isOwner && !item.isFulfilled}
                        isLoading={fulfillItemMutation.isPending}
                      />
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
                    <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-coral" />
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

            {/* Action Buttons */}
            {!isOwner && (
              <div className="space-y-3">
                <Button 
                  className="w-full bg-coral hover:bg-coral/90" 
                  size="lg"
                  onClick={() => window.open('/products', '_blank')}
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Find Items to Support
                </Button>
                
                <Dialog open={showThankYouNote} onOpenChange={setShowThankYouNote}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" size="lg">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Send Thank You Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Send a Thank You Note</DialogTitle>
                    </DialogHeader>
                    <ThankYouNote 
                      toUserId={wishlist.userId}
                      onSent={() => setShowThankYouNote(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}

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
                  {recentActivities.slice(0, 3).map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className={`flex items-start space-x-2 text-sm transition-all duration-300 ${
                        activity.animate ? 'animate-pulse' : ''
                      } hover:bg-gray-50 p-2 rounded-lg cursor-pointer`}
                    >
                      <Heart className="h-4 w-4 text-coral flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-600">{activity.message}</p>
                        <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
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
                      {recentActivities.map((activity, index) => (
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
                            <Heart className="h-4 w-4 text-coral" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">{activity.message}</p>
                            <p className="text-gray-500 text-sm mt-1">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
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
    </div>
  );
}
