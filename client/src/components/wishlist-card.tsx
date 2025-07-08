import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Eye, Heart, Edit, Share2 } from "lucide-react";
import { ShareModal } from "@/components/share-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WishlistCardProps {
  wishlist: {
    id: number;
    title: string;
    description: string;
    location?: string;
    urgencyLevel: string;
    totalItems: number;
    fulfilledItems: number;
    viewCount?: number;
    createdAt: string;
    storyImages?: string[];
    user?: {
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
  };
  showActions?: boolean;
  isOwner?: boolean;
}

export default function WishlistCard({ wishlist, showActions = true, isOwner = false }: WishlistCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = async () => {
    // Increment share count in the database
    try {
      await apiRequest('POST', `/api/wishlists/${wishlist.id}/share`);
      // Invalidate wishlist cache to refresh the share count
      queryClient.invalidateQueries({ queryKey: [`/api/wishlists/${wishlist.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/wishlists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wishlists/featured'] });
    } catch (error) {
      console.error('Failed to increment share count:', error);
    }
  };
  const completionPercentage = wishlist.totalItems > 0 
    ? Math.round((wishlist.fulfilledItems / wishlist.totalItems) * 100) 
    : 0;

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Featured Image */}
      {(wishlist as any).storyImages && (wishlist as any).storyImages.length > 0 && (
        <div className="h-48 overflow-hidden">
          <img 
            src={(wishlist as any).storyImages[0]}
            alt={wishlist.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={getUrgencyColor(wishlist.urgencyLevel)}>
            {wishlist.urgencyLevel.charAt(0).toUpperCase() + wishlist.urgencyLevel.slice(1)}
          </Badge>
          <span className="text-sm text-gray-500">{completionPercentage}% Complete</span>
        </div>
        
        {/* Title and Description */}
        <h3 className="text-xl font-semibold text-navy mb-2 line-clamp-2">
          {wishlist.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
          {wishlist.description}
        </p>
        
        {/* Meta Information */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {wishlist.location && (
              <div className="flex items-center">
                <MapPin className="mr-1 h-3 w-3" />
                {wishlist.location}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {formatTimeAgo(wishlist.createdAt)}
            </div>
          </div>
          
          {wishlist.viewCount !== undefined && (
            <div className="flex items-center">
              <Eye className="mr-1 h-3 w-3" />
              {wishlist.viewCount}
            </div>
          )}
        </div>

        {/* Creator Info */}
        {wishlist.user && (
          <div className="flex items-center space-x-2 mb-4">
            {wishlist.user.profileImageUrl ? (
              <img 
                src={wishlist.user.profileImageUrl}
                alt="Creator"
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <img 
                src="/attached_assets/Logo_6_1752017502495.png" 
                alt="Creator" 
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-gray-600">
              by {wishlist.user.firstName} {wishlist.user.lastName}
            </span>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{wishlist.fulfilledItems} fulfilled</span>
            <span>{wishlist.totalItems} total items</span>
          </div>
        </div>
        
        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            <Link href={`/wishlist/${wishlist.id}`} className="flex-1">
              <Button className="w-full bg-coral text-white hover:bg-coral/90">
                View Needs List
              </Button>
            </Link>
            {isOwner && (
              <Link href={`/edit-wishlist/${wishlist.id}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-coral text-coral hover:bg-coral/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="border-coral text-coral hover:bg-coral/10"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Share Modal */}
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        title={wishlist.title}
        description={wishlist.description}
        url={`${window.location.origin}/wishlist/${wishlist.id}`}
        onShare={handleShare}
      />
    </Card>
  );
}
