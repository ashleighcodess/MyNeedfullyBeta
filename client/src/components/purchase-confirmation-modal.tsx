import { useState } from 'react';
import { X, Package, MapPin, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
    shippingAddress?: string;
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

  const getRetailerName = () => {
    switch (product.retailer) {
      case 'amazon': return 'Amazon';
      case 'walmart': return 'Walmart';
      case 'target': return 'Target';
      default: return 'the retailer';
    }
  };

  const handleContinueToRetailer = () => {
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

  const formatShippingAddress = (address: string) => {
    // Parse the shipping address if it's in JSON format
    try {
      const parsed = JSON.parse(address);
      return `${parsed.streetNumber || ''} ${parsed.route || ''}\n${parsed.city || ''}, ${parsed.state || ''} ${parsed.zipCode || ''}\n${parsed.country || ''}`.trim();
    } catch {
      return address;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border-0 p-0">
        <div className="relative p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              {isPurchased ? "Thank you for your support!" : `You're headed to ${getRetailerName()}...`}
            </DialogTitle>
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
                  <h4 className="font-medium text-gray-800 mb-2">Shipping Address:</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-line font-mono bg-white p-3 rounded border">
                    {formatShippingAddress(wishlistOwner.shippingAddress)}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Copy and paste this address during checkout on the retailer's website
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