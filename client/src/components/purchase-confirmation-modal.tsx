import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Package, MapPin, Check, Copy } from "lucide-react";

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
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();

  // Background scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
        <div className="bg-white rounded-lg max-w-lg max-h-[90vh] overflow-y-auto w-full p-6 shadow-lg">
          <DialogHeader>
          <DialogTitle>
            {isPurchased ? "Thank you for your support!" : `You're headed to ${getRetailerName()}...`}
          </DialogTitle>
          <DialogDescription>
            {isPurchased 
              ? "Your purchase will help someone in need" 
              : "Complete your purchase and return here to confirm"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {!isPurchased ? (
            <>
              {/* Content Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {/* Purchase Instructions */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-coral-50 rounded-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-coral-600" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    After purchase, return to MyNeedfully and click{' '}
                    <span className="font-semibold text-coral-600">I've Purchased This</span>
                  </p>
                </div>

                {/* Shipping Address */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-50 rounded-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Ship the item to the address below
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Shipping Information</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowShippingAddress(!showShippingAddress)}
                      className="text-coral-600 hover:text-coral-700"
                    >
                      {showShippingAddress ? 'Hide Address' : 'Show Address'}
                    </Button>
                  </div>
                  
                  {showShippingAddress && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded border">
                        {formatShippingAddress(wishlistOwner.shippingAddress)}
                      </div>
                      <div className="mt-3 flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyAddressToClipboard}
                          className="text-xs"
                        >
                          {copiedAddress ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Address
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button
                  onClick={handleContinueToRetailer}
                  className="flex-1 bg-coral hover:bg-coral/90 text-white"
                >
                  Buy on {getRetailerName()}
                </Button>
                <Button
                  onClick={handlePurchaseConfirmation}
                  variant="outline"
                  className="flex-1 border-coral text-coral hover:bg-coral hover:text-white"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}