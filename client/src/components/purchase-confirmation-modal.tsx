import React, { useState } from 'react';
import { X, Package, MapPin, ExternalLink, Check, Copy, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GIFT_CARDS } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    title: string;
    price: string;
    link: string;
    retailer: 'amazon' | 'walmart' | 'target';
    image?: string;
    itemId: number;
  };
  wishlistOwner: {
    firstName: string;
    lastName?: string;
    shippingAddress?: string | object;
    email?: string;
  };
  onPurchaseConfirm: () => void;
  itemId: number;
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
  product,
  wishlistOwner,
  onPurchaseConfirm,
  itemId
}: PurchaseConfirmationModalProps) {
  const [showShippingAddress, setShowShippingAddress] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();

  if (!isOpen || !product) return null;

  const copyAddressToClipboard = async () => {
    const shippingAddress = wishlistOwner.shippingAddress;
    if (!shippingAddress) return;
    
    let addressText = '';
    if (typeof shippingAddress === 'object') {
      const addr = shippingAddress as any;
      addressText = [
        addr.fullName,
        addr.addressLine1,
        addr.addressLine2,
        `${addr.city}, ${addr.state} ${addr.zipCode}`,
        addr.country
      ].filter(Boolean).join('\n');
    } else {
      addressText = shippingAddress;
    }
    
    try {
      await navigator.clipboard.writeText(addressText);
      toast({
        title: "Address copied to clipboard!",
        description: "Use this address for shipping during checkout.",
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = addressText;
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
    const email = wishlistOwner.email;
    if (!email) return;
    
    try {
      await navigator.clipboard.writeText(email);
      toast({
        title: "Email copied to clipboard!",
        description: "Use it for gift card delivery during checkout.",
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = email;
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

  const giftCardMode = isGiftCard(product.title);

  const handleBuyClick = () => {
    // Open retailer URL in new tab
    window.open(product.link, '_blank');
    
    // Show address/email section after clicking buy
    setShowShippingAddress(true);
  };

  const handlePurchaseConfirm = () => {
    setIsPurchased(true);
    onPurchaseConfirm();
    
    toast({
      title: "Thank you for your generosity!",
      description: "The recipient has been notified of your purchase.",
    });
    
    // Close modal after short delay
    setTimeout(() => {
      onClose();
      setIsPurchased(false);
      setShowShippingAddress(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Item</DialogTitle>
          <DialogDescription className="sr-only">
            Purchase this item from the retailer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex items-start space-x-4">
            {product.image && (
              <img
                src={product.image}
                alt={product.title}
                className="w-16 h-16 object-contain rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-navy text-base line-clamp-2">
                {product.title}
              </h3>
              <p className="text-coral font-bold text-lg mt-1">{product.price}</p>
              <p className="text-sm text-gray-600 mt-1">
                For: {wishlistOwner.firstName} {wishlistOwner.lastName}
              </p>
            </div>
          </div>

          {/* Buy Button */}
          {!showShippingAddress && (
            <Button
              onClick={handleBuyClick}
              className="w-full bg-coral hover:bg-coral-dark text-white flex items-center justify-center gap-2"
              size="lg"
            >
              <ExternalLink className="h-4 w-4" />
              Buy at {product.retailer.charAt(0).toUpperCase() + product.retailer.slice(1)}
            </Button>
          )}

          {/* Address/Email Section - Show after Buy clicked */}
          {showShippingAddress && !isPurchased && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {giftCardMode ? (
                      <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    ) : (
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                    )}
                    <span className="font-medium text-blue-900">
                      {giftCardMode ? 'Email for Gift Card Delivery:' : 'Shipping Address:'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={giftCardMode ? copyEmailToClipboard : copyAddressToClipboard}
                    className={`text-xs ${copiedAddress ? 'bg-green-100 text-green-700' : ''}`}
                  >
                    {copiedAddress ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copiedAddress ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                
                <div className="text-sm text-gray-800 bg-white p-3 rounded border whitespace-pre-wrap">
                  {giftCardMode ? wishlistOwner.email : (
                    typeof wishlistOwner.shippingAddress === 'object' 
                      ? Object.values(wishlistOwner.shippingAddress).filter(Boolean).join('\n')
                      : wishlistOwner.shippingAddress
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  {giftCardMode 
                    ? 'Use the email above for gift card delivery during checkout'
                    : 'Use the address above for shipping during checkout'
                  }
                </p>
                
                <Button
                  onClick={handlePurchaseConfirm}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  <Package className="h-4 w-4 mr-2" />
                  I've Completed the Purchase
                </Button>
              </div>
            </>
          )}

          {/* Success State */}
          {isPurchased && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-700 mb-2">Purchase Confirmed!</h3>
              <p className="text-sm text-gray-600">
                The recipient will be notified of your generous support.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}