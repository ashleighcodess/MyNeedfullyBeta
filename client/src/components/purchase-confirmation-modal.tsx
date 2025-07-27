import { useState, useEffect } from 'react';
import { X, Package, MapPin, ExternalLink, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import MobileModal from '@/components/mobile-modal';

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
  const [isMobile, setIsMobile] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Mobile modal (below 640px)
  if (isMobile) {
    return (
      <MobileModal isOpen={isOpen} onClose={onClose}>
        <div className="relative p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {isPurchased ? "Thank you for your support!" : `You're headed to ${getRetailerName()}...`}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {isPurchased 
                ? "Your purchase will help someone in need" 
                : "Complete your purchase and return here to confirm"
              }
            </p>
          </div>

          {!isPurchased ? (
            <>
              {/* Content Section */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Left Side - Purchase Instructions */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-coral-50 rounded-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-coral-600" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    After purchase, return to MyNeedfully and click{' '}
                    <span className="font-semibold text-coral-600">I've Purchased This</span>
                  </p>
                </div>

                {/* Right Side - Shipping Address */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-50 rounded-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Ship to {wishlistOwner.firstName}'s address
                  </p>
                  <button
                    onClick={() => setShowShippingAddress(!showShippingAddress)}
                    className="text-blue-600 text-xs hover:underline mt-1"
                  >
                    {showShippingAddress ? 'Hide' : 'Show'} Address
                  </button>
                </div>
              </div>

              {/* Shipping Address Display */}
              {showShippingAddress && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-2">Shipping Address:</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {getShippingAddress()}
                      </p>
                    </div>
                    <button
                      onClick={copyAddressToClipboard}
                      className="ml-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy address to clipboard"
                    >
                      {copiedAddress ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  asChild 
                  className="w-full bg-coral-600 hover:bg-coral-700 text-white py-3 rounded-xl text-lg font-semibold"
                >
                  <a 
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Buy on {getRetailerName()}
                  </a>
                </Button>
                
                <Button 
                  onClick={handlePurchaseConfirmation}
                  variant="outline"
                  className="w-full border-2 border-coral-200 text-coral-700 hover:bg-coral-50 py-3 rounded-xl text-lg font-semibold"
                >
                  I've Purchased This
                </Button>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center space-y-2">
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
      </MobileModal>
    );
  }

  // Desktop modal (640px and above)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border-0 p-0 max-h-[90vh] overflow-y-auto sm:max-h-none">
        <div className="relative p-6">
          {/* Header */}
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              {isPurchased ? "Thank you for your support!" : `You're headed to ${getRetailerName()}...`}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-2">
              {isPurchased 
                ? "Your purchase will help someone in need" 
                : "Complete your purchase and return here to confirm"
              }
            </DialogDescription>
          </DialogHeader>

          {!isPurchased ? (
            <>
              {/* Content Section */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Left Side - Purchase Instructions */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-coral-50 rounded-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-coral-600" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    After purchase, return to MyNeedfully and click{' '}
                    <span className="font-semibold text-coral-600">I've Purchased This</span>
                  </p>
                </div>

                {/* Right Side - Shipping Address */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-50 rounded-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <button
                    onClick={() => setShowShippingAddress(!showShippingAddress)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Need {wishlistOwner.firstName}'s shipping address?
                  </button>
                </div>
              </div>

              {/* Shipping Address Display */}
              {showShippingAddress && wishlistOwner.shippingAddress && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">Shipping Address:</h4>
                    <Button
                      onClick={copyAddressToClipboard}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs bg-white hover:bg-coral-50 border-coral-300 text-coral-600 hover:text-coral-700"
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
                    {formatShippingAddress(wishlistOwner.shippingAddress)}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {copiedAddress 
                      ? "Address copied to clipboard! Paste it during checkout on the retailer's website."
                      : "Click 'Copy' above to copy this address for checkout on the retailer's website."
                    }
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleContinueToRetailer}
                  className="w-full bg-coral-600 hover:bg-coral-700 text-white py-3 rounded-lg font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue to {getRetailerName()}
                </Button>

                <Button
                  onClick={handlePurchaseConfirmation}
                  variant="outline"
                  className="w-full border-coral-600 text-coral-600 hover:bg-coral-50 py-3 rounded-lg font-medium"
                >
                  <Check className="h-4 w-4 mr-2" />
                  I've Purchased This
                </Button>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center space-y-2">
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
      </DialogContent>
    </Dialog>
  );
}