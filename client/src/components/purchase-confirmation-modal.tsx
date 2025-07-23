import React, { useState } from 'react';
import { X, Package, MapPin, ExternalLink, Check, Copy, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { GIFT_CARDS } from '@/lib/constants';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    title: string;
    price: string;
    link: string;
    retailer: 'amazon' | 'walmart' | 'target';
    image?: string;
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
  
  // Mobile detection - moved to avoid conditional calls
  const isMobile = React.useMemo(() => {
    return typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  // Handle body scroll lock for mobile - always called
  React.useEffect(() => {
    if (!isOpen) return;
    
    // Save current scroll position
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;
    document.body.setAttribute('data-modal-open', 'true');
    
    // Force scroll to top for mobile
    if (isMobile) {
      window.scrollTo(0, 0);
    }

    return () => {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.removeAttribute('data-modal-open');
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    };
  }, [isOpen, isMobile]);

  // Check if this is a gift card
  const isGiftCard = () => {
    return GIFT_CARDS.some(giftCard => 
      product.title?.toLowerCase().includes(giftCard.name.toLowerCase()) ||
      product.title?.toLowerCase().includes('gift card')
    );
  };

  const getRetailerName = () => {
    switch (product.retailer) {
      case 'amazon': return 'Amazon';
      case 'walmart': return 'Walmart';
      case 'target': return 'Target';
      default: return 'the retailer';
    }
  };

  const handleContinueToRetailer = () => {
    console.log('Opening retailer URL:', product.link);
    console.log('Product data:', product);
    
    // Ensure we have a valid URL
    if (!product.link || product.link === '#') {
      console.error('Invalid product link:', product.link);
      return;
    }
    
    window.open(product.link, '_blank');
  };

  const handlePurchaseConfirmation = () => {
    setIsPurchased(true);
    onPurchaseConfirm();
    setTimeout(() => {
      onClose();
      setIsPurchased(false);
    }, 2000);
  };

  const formatShippingAddress = (address: string | object) => {
    // Handle undefined/null case
    if (!address) {
      return 'No shipping address provided';
    }

    // Handle both object and string formats
    if (typeof address === 'object' && address !== null) {
      const addr = address as any;
      const lines = [];
      if (addr.fullName) lines.push(addr.fullName);
      if (addr.addressLine1) lines.push(addr.addressLine1);
      if (addr.addressLine2) lines.push(addr.addressLine2);
      
      const cityStateZip = [addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ');
      if (cityStateZip) lines.push(cityStateZip);
      
      if (addr.country) lines.push(addr.country);
      
      return lines.length > 0 ? lines.join('\n') : 'Address information incomplete';
    }
    
    // Parse the shipping address if it's in JSON format
    try {
      const parsed = JSON.parse(address as string);
      const lines = [];
      if (parsed.fullName) lines.push(parsed.fullName);
      if (parsed.streetNumber || parsed.route) {
        lines.push(`${parsed.streetNumber || ''} ${parsed.route || ''}`.trim());
      }
      if (parsed.addressLine1) lines.push(parsed.addressLine1);
      if (parsed.addressLine2) lines.push(parsed.addressLine2);
      
      const cityStateZip = [parsed.city, parsed.state, parsed.zipCode].filter(Boolean).join(', ');
      if (cityStateZip) lines.push(cityStateZip);
      
      if (parsed.country) lines.push(parsed.country);
      
      return lines.length > 0 ? lines.join('\n') : 'Address information incomplete';
    } catch {
      return address as string || 'Address format error';
    }
  };

  const copyAddressToClipboard = async () => {
    const addressText = formatShippingAddress(wishlistOwner.shippingAddress);
    try {
      await navigator.clipboard.writeText(addressText);
      setCopiedAddress(true);
      toast({
        title: "Address Copied!",
        description: "Shipping address has been copied to your clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = addressText;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedAddress(true);
        toast({
          title: "Address Copied!",
          description: "Shipping address has been copied to your clipboard",
          duration: 2000,
        });
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (fallbackErr) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy address. Please copy manually.",
          variant: "destructive",
          duration: 3000,
        });
      }
      document.body.removeChild(textArea);
    }
  };

  const copyEmailToClipboard = async () => {
    const emailText = wishlistOwner.email || 'No email provided';
    
    try {
      await navigator.clipboard.writeText(emailText);
      setCopiedAddress(true);
      toast({
        title: "Email Copied!",
        description: "Email address has been copied to your clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = emailText;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedAddress(true);
        toast({
          title: "Email Copied!",
          description: "Email address has been copied to your clipboard",
          duration: 2000,
        });
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (fallbackErr) {
        toast({
          title: "Copy Failed",
          description: "Unable to copy email. Please copy manually.",
          variant: "destructive",
          duration: 3000,
        });
      }
      document.body.removeChild(textArea);
    }
  };

  // Always return the modal structure - don't use conditional returns with hooks
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent 
        className="fixed z-50 w-[95vw] max-w-[425px] gap-4 border bg-white p-0 shadow-lg rounded-2xl" 
        style={{
          left: '50%',
          top: isMobile ? '20px' : '50%',
          transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
          maxHeight: isMobile ? 'calc(100vh - 40px)' : '90vh',
          overflowY: 'auto'
        }}
      >
        <DialogTitle className="sr-only">Purchase Confirmation</DialogTitle>
        <DialogDescription className="sr-only">
          Complete your purchase of {product?.title || 'this item'}
        </DialogDescription>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  );

  function renderModalContent() {
    return (
      <div className="relative p-4 sm:p-6">
          {/* Header */}
          <DialogHeader className="text-center mb-3 sm:mb-6">
            <DialogTitle className="text-base sm:text-xl font-semibold text-gray-800">
              {isPurchased ? "Thank you for your support!" : `You're headed to ${getRetailerName()}...`}
            </DialogTitle>
          </DialogHeader>

          {!isPurchased ? (
            <>
              {/* Content Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
                {/* Top/Left Side - Purchase Instructions */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-coral-50 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-coral-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    After purchase, return to MyNeedfully and click{' '}
                    <span className="font-semibold text-coral-600">I've Purchased This</span>
                  </p>
                </div>

                {/* Bottom/Right Side - Shipping Address or Email */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-blue-50 rounded-full flex items-center justify-center">
                    {isGiftCard() ? (
                      <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    ) : (
                      <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    )}
                  </div>
                  <button
                    onClick={() => setShowShippingAddress(!showShippingAddress)}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors px-3 py-2 rounded-lg min-h-[44px] flex items-center justify-center"
                  >
                    {isGiftCard() 
                      ? `Need ${wishlistOwner.firstName}'s email address?`
                      : `Need ${wishlistOwner.firstName}'s shipping address?`
                    }
                  </button>
                </div>
              </div>

              {/* Address/Email Display */}
              {showShippingAddress && (isGiftCard() ? wishlistOwner.email : wishlistOwner.shippingAddress) && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">
                      {isGiftCard() ? 'Email Address:' : 'Shipping Address:'}
                    </h4>
                    <Button
                      onClick={isGiftCard() ? copyEmailToClipboard : copyAddressToClipboard}
                      variant="outline"
                      size="sm"
                      className="h-9 sm:h-8 px-3 text-xs bg-white hover:bg-coral-50 border-coral-300 text-coral-600 hover:text-coral-700 min-h-[36px]"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-line font-mono bg-white p-3 rounded border">
                    {isGiftCard() 
                      ? (wishlistOwner.email || 'No email provided')
                      : formatShippingAddress(wishlistOwner.shippingAddress)
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {isGiftCard() ? (
                      copiedAddress 
                        ? "Email copied to clipboard! Use it for gift card delivery during checkout."
                        : "Click 'Copy' above to copy this email for gift card delivery."
                    ) : (
                      copiedAddress 
                        ? "Address copied to clipboard! Paste it during checkout on the retailer's website."
                        : "Click 'Copy' above to copy this address for checkout on the retailer's website."
                    )}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={handleContinueToRetailer}
                  className="w-full bg-coral-600 hover:bg-coral-700 text-white py-3 sm:py-3 rounded-lg font-medium text-sm sm:text-base min-h-[48px] flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue to {getRetailerName()}
                </Button>

                <Button
                  onClick={handlePurchaseConfirmation}
                  variant="outline"
                  className="w-full border-coral-600 text-coral-600 hover:bg-coral-50 py-3 sm:py-3 rounded-lg font-medium text-sm sm:text-base min-h-[48px] flex items-center justify-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  I've Purchased This
                </Button>
              </div>

              {/* Footer */}
              <div className="mt-4 sm:mt-6 text-center space-y-1 sm:space-y-2">
                <p className="text-xs text-gray-500">
                  MyNeedfully may earn a commission on purchases
                </p>
                <p className="text-xs text-gray-400">
                  This site is protected by reCAPTCHA and the Google{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> apply.
                </p>
              </div>
            </>
          ) : (
            /* Purchase Confirmation */
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Item Marked as Purchased!
              </h3>
              <p className="text-gray-600">
                Thank you for supporting {wishlistOwner.firstName}. This item will be marked as fulfilled.
              </p>
            </div>
          )}
        </div>
    );
  }
}