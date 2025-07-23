import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Heart, MapPin, Calendar, User, MessageCircle, Gift, Mail } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { GIFT_CARDS } from '@/lib/constants';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: number;
    title: string;
    price?: string;
    image?: string;
    link?: string;
    quantity?: number;
  };
  wishlist: {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    shippingAddress: string;
    location: string;
  };
  user: {
    email: string;
  };
}

// Check if item is a gift card
const isGiftCard = (title: string): boolean => {
  return GIFT_CARDS.some(giftCard => 
    title.toLowerCase().includes(giftCard.name.toLowerCase()) ||
    title.toLowerCase().includes('gift card')
  );
};

export default function PurchaseConfirmationModal({
  isOpen,
  onClose,
  item,
  wishlist,
  user
}: PurchaseConfirmationModalProps) {
  const { toast } = useToast();
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fulfillMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/wishlist/${wishlist.id}/items/${item.id}/fulfill`, {
        supporterMessage: thankYouMessage,
        retailerUrl: item.link,
        purchasePrice: item.price
      });
    },
    onSuccess: () => {
      toast({
        title: "Purchase Confirmed!",
        description: "The item has been marked as purchased. The recipient will be notified.",
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error fulfilling item:', error);
      toast({
        title: "Error",
        description: "Failed to confirm purchase. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleConfirmPurchase = () => {
    setIsSubmitting(true);
    fulfillMutation.mutate();
  };

  const copyAddressToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(wishlist.shippingAddress);
      toast({
        title: "Address copied to clipboard!",
        description: "Use this address for shipping during checkout.",
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = wishlist.shippingAddress;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Address copied to clipboard!",
          description: "Use this address for shipping during checkout.",
        });
      } catch (fallbackErr) {
        console.error('Fallback: Copying text command was unsuccessful', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(user.email);
      toast({
        title: "Email copied to clipboard!",
        description: "Use it for gift card delivery during checkout.",
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = user.email;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Email copied to clipboard!",
          description: "Use it for gift card delivery during checkout.",
        });
      } catch (fallbackErr) {
        console.error('Fallback: Copying text command was unsuccessful', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const giftCardMode = isGiftCard(item.title);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Purchase Confirmation</DialogTitle>
          <DialogDescription className="sr-only">
            Confirm your purchase and copy the necessary information for checkout
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Preview */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Gift className="h-8 w-8 text-coral mr-2" />
              <h3 className="text-lg font-semibold text-navy">Ready to Purchase</h3>
            </div>
            
            {item.image && (
              <img 
                src={item.image} 
                alt={item.title}
                className="w-20 h-20 object-contain mx-auto mb-3 rounded"
              />
            )}
            
            <h4 className="font-medium text-navy mb-1 line-clamp-2">
              {item.title}
            </h4>
            
            {item.price && (
              <p className="text-lg font-bold text-coral mb-2">
                {item.price}
              </p>
            )}
            
            <p className="text-sm text-gray-600">
              For: {wishlist.firstName} {wishlist.lastName}
            </p>
          </div>

          {/* Address/Email Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {giftCardMode ? (
                  <Mail className="h-4 w-4 text-gray-600 mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 text-gray-600 mr-2" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {giftCardMode ? 'Email for Gift Card Delivery:' : 'Shipping Address:'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={giftCardMode ? copyEmailToClipboard : copyAddressToClipboard}
                className="text-xs"
              >
                Copy
              </Button>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {giftCardMode ? user.email : wishlist.shippingAddress}
            </p>
          </div>

          {/* Thank You Message */}
          <div className="space-y-2">
            <Label htmlFor="thankYouMessage" className="flex items-center">
              <Heart className="h-4 w-4 text-coral mr-2" />
              Optional Message to Recipient
            </Label>
            <Textarea
              id="thankYouMessage"
              placeholder="Write a kind message to let them know you're thinking of them..."
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPurchase}
              className="flex-1 bg-coral hover:bg-coral-dark text-white"
              disabled={isSubmitting || fulfillMutation.isPending}
            >
              {isSubmitting || fulfillMutation.isPending ? 'Confirming...' : 'Confirm Purchase'}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>1. Click "Confirm Purchase" to mark this item as bought</p>
            <p>2. {giftCardMode ? 'Use the copied email' : 'Use the copied address'} when checking out at the retailer</p>
            <p>3. The recipient will be notified of your generous support</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}