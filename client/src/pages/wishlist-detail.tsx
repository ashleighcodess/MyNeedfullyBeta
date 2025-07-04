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
  Edit
} from "lucide-react";

export default function WishlistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showThankYouNote, setShowThankYouNote] = useState(false);

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

          {/* Progress */}
          <div className="bg-white rounded-lg p-4 border">
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
                {(wishlist as any).storyImages && (wishlist as any).storyImages.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(wishlist as any).storyImages.map((imagePath: string, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={imagePath}
                            alt={`Story image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          />
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {index + 1} of {(wishlist as any).storyImages.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
                  Find Items to Donate
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
          </div>
        </div>
      </div>
    </div>
  );
}
