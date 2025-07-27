import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Gift, Mail, Check, Copy } from "lucide-react";

interface GiftCardPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftCard: {
    name: string;
    retailer: string;
    url: string;
    image?: string;
  };
  wishlistOwner: {
    firstName: string;
    lastName?: string;
    email?: string;
  };
  onPurchaseConfirm: () => void;
  itemId: number;
}

export default function GiftCardPurchaseModal({
  isOpen,
  onClose,
  giftCard,
  wishlistOwner,
  onPurchaseConfirm,
  itemId
}: GiftCardPurchaseModalProps) {
  const [showEmailAddress, setShowEmailAddress] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const { toast } = useToast();

  const handleContinueToRetailer = () => {
    console.log('Opening gift card URL:', giftCard.url);
    console.log('Gift card data:', giftCard);
    
    // Ensure we have a valid URL
    if (!giftCard.url || giftCard.url === '#') {
      console.error('Invalid gift card URL:', giftCard.url);
      return;
    }
    
    window.open(giftCard.url, '_blank');
  };

  const handlePurchaseConfirmation = () => {
    setIsPurchased(true);
    onPurchaseConfirm();
    setTimeout(() => {
      onClose();
      setIsPurchased(false);
    }, 2000);
  };

  const copyEmailToClipboard = async () => {
    const emailText = wishlistOwner.email || 'No email address provided';
    try {
      await navigator.clipboard.writeText(emailText);
      setCopiedEmail(true);
      toast({
        title: "Email Copied!",
        description: "Email address has been copied to your clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = emailText;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedEmail(true);
        toast({
          title: "Email Copied!",
          description: "Email address has been copied to your clipboard",
          duration: 2000,
        });
        setTimeout(() => setCopiedEmail(false), 2000);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg w-full mx-2 sm:mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-coral" />
            Gift Card Purchase
          </DialogTitle>
          <DialogDescription>
            Your gift card purchase is ready to be completed
          </DialogDescription>
        </DialogHeader>
        
        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold leading-none tracking-tight mb-2">
              {isPurchased ? "Thank you for your support!" : `You're headed to ${giftCard.retailer}...`}
            </h2>
            <p className="text-sm text-gray-600">
              {isPurchased 
                ? "Your gift card purchase will help someone in need" 
                : "Complete your gift card purchase and return here to confirm"
              }
            </p>
          </div>
        
        <div className="py-4">
          {!isPurchased ? (
            <>
              {/* Content Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {/* Purchase Instructions */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-coral-50 rounded-full flex items-center justify-center">
                    <Gift className="h-8 w-8 text-coral-600" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    After purchase, return to MyNeedfully and click{' '}
                    <span className="font-semibold text-coral-600">I've Purchased This</span>
                  </p>
                </div>

                {/* Email Address */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-50 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Send the gift card to the email below
                  </p>
                </div>
              </div>

              {/* Email Address */}
              <div className="mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Email Information</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEmailAddress(!showEmailAddress)}
                      className="text-coral-600 hover:text-coral-700"
                    >
                      {showEmailAddress ? 'Hide Email' : 'Show Email'}
                    </Button>
                  </div>
                  
                  {showEmailAddress && (
                    <div className="mt-3">
                      <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                        {wishlistOwner.email || 'No email address provided'}
                      </div>
                      <div className="mt-3 flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyEmailToClipboard}
                          className="text-xs"
                        >
                          {copiedEmail ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Email
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
                  Buy {giftCard.retailer} Gift Card
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
                Gift Card Marked as Purchased!
              </h3>
              <p className="text-gray-600">
                Thank you for supporting {wishlistOwner.firstName}. This gift card will be marked as fulfilled.
              </p>
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}