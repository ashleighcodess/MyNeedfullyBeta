import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, MapPin, ExternalLink, Check, Copy, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Check if this product is a gift card
  const isGiftCard = GIFT_CARDS.find(gc => {
    const productTitle = product.title?.toLowerCase() || '';
    const retailerName = gc.retailer.toLowerCase();
    
    return (productTitle.includes(retailerName) && productTitle.includes('gift card')) ||
           productTitle === gc.name.toLowerCase();
  });

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
    const email = wishlistOwner.email || 'No email provided';
    try {
      await navigator.clipboard.writeText(email);
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
      textArea.value = email;
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

  // Debug logging
  console.log('PurchaseConfirmationModal render:', { 
    isOpen, 
    product: product?.title,
    isPurchased,
    isGiftCard: !!isGiftCard,
    wishlistOwner: {
      firstName: wishlistOwner?.firstName,
      email: wishlistOwner?.email,
      hasShippingAddress: !!wishlistOwner?.shippingAddress
    }
  });
  console.log('Portal target (document.body):', document.body);
  console.log('Portal target children count:', document.body.children.length);

  if (!isOpen || !product) {
    console.log('Modal early return:', { isOpen, hasProduct: !!product });
    return null;
  }

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'block',
        pointerEvents: 'auto'
      }}
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1
        }}
      />
      
      {/* Mobile Bottom Drawer */}
      <div 
        className="sm:hidden"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
          zIndex: 2,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Mobile Drawer Handle */}
        <div style={{
          width: '3rem',
          height: '0.25rem',
          backgroundColor: '#d1d5db',
          borderRadius: '9999px',
          margin: '0.5rem auto 1rem auto'
        }} />
        
        {/* Mobile Content */}
        <div style={{ padding: '1rem' }}>
          {/* Close Button for Mobile */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '1rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.7,
              zIndex: 10
            }}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 600, 
              color: '#374151',
              margin: 0,
              padding: '0 0.5rem'
            }}>
              {isPurchased ? "Thank you for your support!" : `You're headed to ${getRetailerName()}...`}
            </h2>
          </div>

          {!isPurchased ? (
            <>
              {/* Purchase Instructions */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  margin: '0 auto 0.75rem auto',
                  backgroundColor: '#fef2f2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package className="h-6 w-6 text-coral-600" />
                </div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  lineHeight: 1.5,
                  margin: 0,
                  padding: '0 0.5rem'
                }}>
                  After purchase, return to MyNeedfully and click{' '}
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>I've Purchased This</span>
                </p>
              </div>

              {/* Address Display */}
              {(wishlistOwner.shippingAddress || isGiftCard) && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    {isGiftCard ? 'Email Address' : 'Shipping Address'}
                  </h3>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}>
                    {isGiftCard ? wishlistOwner.email : formatShippingAddress(wishlistOwner.shippingAddress)}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={handleProceedToPurchase}
                  style={{
                    width: '100%',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  {isGiftCard ? `Buy ${getRetailerName()} Gift Card` : `Go to ${getRetailerName()}`}
                </button>
                
                <button
                  onClick={handleMarkPurchased}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Check className="h-4 w-4" />
                  I've Purchased This
                </button>
              </div>
            </>
          ) : (
            /* Purchase Confirmation */
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto 1rem auto',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 600, 
                color: '#166534',
                marginBottom: '0.5rem'
              }}>
                Item Marked as Purchased!
              </h3>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280',
                lineHeight: 1.5,
                margin: 0
              }}>
                Thank you for supporting {wishlistOwner.firstName}. This item will be marked as fulfilled.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Modal */}
      <div 
        className="hidden sm:flex"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}
      >
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '28rem',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Close Button for Desktop */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '1rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.7,
              zIndex: 10
            }}
          >
            <X className="h-4 w-4" />
          </button>

          <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                color: '#374151',
                margin: 0,
                padding: '0 0.5rem'
              }}>
                {isPurchased ? "Thank you for your support!" : `You're headed to ${getRetailerName()}...`}
              </h2>
            </div>

            {!isPurchased ? (
              <>
                {/* Content Section - Desktop Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {/* Purchase Instructions */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '4rem',
                      height: '4rem',
                      margin: '0 auto 0.75rem auto',
                      backgroundColor: '#fef2f2',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package className="h-8 w-8 text-coral-600" />
                    </div>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: '#6b7280',
                      lineHeight: 1.5,
                      margin: 0,
                      padding: '0 0.5rem'
                    }}>
                      After purchase, return to MyNeedfully and click{' '}
                      <span style={{ fontWeight: 600, color: '#dc2626' }}>I've Purchased This</span>
                    </p>
                  </div>

                  {/* Address Display */}
                  {(wishlistOwner.shippingAddress || isGiftCard) && (
                    <div>
                      <h3 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        {isGiftCard ? 'Email Address' : 'Shipping Address'}
                      </h3>
                      <div style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#374151'
                      }}>
                        {isGiftCard ? wishlistOwner.email : formatShippingAddress(wishlistOwner.shippingAddress)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={handleProceedToPurchase}
                    style={{
                      width: '100%',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isGiftCard ? `Buy ${getRetailerName()} Gift Card` : `Go to ${getRetailerName()}`}
                  </button>
                  
                  <button
                    onClick={handleMarkPurchased}
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      color: '#dc2626',
                      border: '1px solid #dc2626',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Check className="h-4 w-4" />
                    I've Purchased This
                  </button>
                </div>

                {/* Footer */}
                <div style={{ 
                  marginTop: '1.5rem', 
                  textAlign: 'center',
                  padding: '0 0.5rem'
                }}>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#9ca3af',
                    margin: '0 0 0.5rem 0'
                  }}>
                    MyNeedfully may earn a commission on purchases
                  </p>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#d1d5db',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Privacy Policy</a> and{' '}
                    <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms of Service</a> apply.
                  </p>
                </div>
              </>
            ) : (
              /* Purchase Confirmation for Desktop */
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{
                  width: '5rem',
                  height: '5rem',
                  margin: '0 auto 1rem auto',
                  backgroundColor: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 600, 
                  color: '#166534',
                  marginBottom: '0.5rem'
                }}>
                  Item Marked as Purchased!
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  color: '#6b7280',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  Thank you for supporting {wishlistOwner.firstName}. This item will be marked as fulfilled.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
        {/* Desktop Modal */}
        <div className="
          sm:relative sm:bg-white sm:rounded-2xl sm:shadow-xl 
          sm:w-full sm:max-w-md sm:max-h-[80vh] sm:overflow-y-auto
          max-sm:w-full
        ">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none z-10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* Mobile Drawer Handle */}
          <div className="sm:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 mt-2" />

          <div className="relative p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 px-2">
                {isPurchased ? "Thank you for your support!" : `You're headed to ${getRetailerName()}...`}
              </h2>
            </div>

            {!isPurchased ? (
              <>
                {/* Content Section - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Purchase Instructions */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-coral-50 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-coral-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-2">
                    After purchase, return to MyNeedfully and click{' '}
                    <span className="font-semibold text-coral-600">I've Purchased This</span>
                  </p>
                </div>

                {/* Shipping Address or Email */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-blue-50 rounded-full flex items-center justify-center">
                    {isGiftCard ? (
                      <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    ) : (
                      <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    )}
                  </div>
                  <button
                    onClick={() => setShowShippingAddress(!showShippingAddress)}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors px-2"
                  >
                    {isGiftCard 
                      ? `Need ${wishlistOwner.firstName}'s email address?`
                      : `Need ${wishlistOwner.firstName}'s shipping address?`
                    }
                  </button>
                </div>
              </div>

              {/* Shipping Address or Email Display */}
              {showShippingAddress && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm sm:text-base">
                      {isGiftCard ? 'Email Address:' : 'Shipping Address:'}
                    </h4>
                    <Button
                      onClick={isGiftCard ? copyEmailToClipboard : copyAddressToClipboard}
                      variant="outline"
                      size="sm"
                      className="h-7 sm:h-8 px-2 sm:px-3 text-xs bg-white hover:bg-coral-50 border-coral-300 text-coral-600 hover:text-coral-700"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Copied!</span>
                          <span className="sm:hidden">✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Copy</span>
                          <span className="sm:hidden">📋</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 whitespace-pre-line font-mono bg-white p-2 sm:p-3 rounded border">
                    {isGiftCard 
                      ? (wishlistOwner.email || 'No email provided')
                      : formatShippingAddress(wishlistOwner.shippingAddress)
                    }
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {copiedAddress 
                      ? (isGiftCard 
                          ? "Email copied to clipboard! Use this email address when purchasing the gift card."
                          : "Address copied to clipboard! Paste it during checkout on the retailer's website."
                        )
                      : (isGiftCard
                          ? "Click 'Copy' above to copy this email address for the gift card purchase."
                          : "Click 'Copy' above to copy this address for checkout on the retailer's website."
                        )
                    }
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={handleContinueToRetailer}
                  className="w-full bg-coral-600 hover:bg-coral-700 text-white py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue to {getRetailerName()}
                </Button>

                <Button
                  onClick={handlePurchaseConfirmation}
                  variant="outline"
                  className="w-full border-coral-600 text-coral-600 hover:bg-coral-50 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
                >
                  <Check className="h-4 w-4 mr-2" />
                  I've Purchased This
                </Button>
              </div>

              {/* Footer */}
              <div className="mt-4 sm:mt-6 text-center space-y-1 sm:space-y-2 px-2">
                <p className="text-xs text-gray-500">
                  MyNeedfully may earn a commission on purchases
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  This site is protected by reCAPTCHA and the Google{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> apply.
                </p>
              </div>
            </>
          ) : (
            /* Purchase Confirmation */
            <div className="text-center py-6 sm:py-8 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                Item Marked as Purchased!
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Thank you for supporting {wishlistOwner.firstName}. This item will be marked as fulfilled.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}