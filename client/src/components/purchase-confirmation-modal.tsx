import { createPortal } from 'react-dom';
import { X, ExternalLink, Check, Package, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  product: any;
  onClose: () => void;
  isPurchased: boolean;
  onProceedToPurchase: () => void;
  onMarkPurchased: () => void;
  wishlistOwner: any;
  isGiftCard?: boolean;
}

export default function PurchaseConfirmationModal({
  isOpen,
  product,
  onClose,
  isPurchased,
  onProceedToPurchase,
  onMarkPurchased,
  wishlistOwner,
  isGiftCard = false
}: PurchaseConfirmationModalProps) {
  const { toast } = useToast();
  
  const copyAddressToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
    } catch (err) {
      // Fallback for mobile or unsupported browsers
      toast({
        title: "📋 Copied!",
        description: "Address copied to clipboard",
      });
    }
  };


  
  const getRetailerName = () => {
    if (!product?.link) {
      console.log('No product link found for retailer detection');
      return 'Retailer';
    }
    
    console.log('Detecting retailer from link:', product.link);
    
    if (product.link.includes('amazon.com')) return 'Amazon';
    if (product.link.includes('walmart.com')) return 'Walmart';
    if (product.link.includes('target.com')) return 'Target';
    if (product.link.includes('uber')) return 'Uber Eats';
    if (product.link.includes('doordash')) return 'DoorDash';
    if (product.link.includes('instacart')) return 'Instacart';
    if (product.link.includes('goldbelly')) return 'Goldbelly';
    if (product.link.includes('homedepot')) return 'Home Depot';
    if (product.link.includes('lowes')) return 'Lowe\'s';
    
    // If no retailer detected, check if it's a gift card
    if (isGiftCard && product.title) {
      if (product.title.toLowerCase().includes('walmart')) return 'Walmart';
      if (product.title.toLowerCase().includes('amazon')) return 'Amazon';
      if (product.title.toLowerCase().includes('uber')) return 'Uber Eats';
      if (product.title.toLowerCase().includes('doordash')) return 'DoorDash';
      if (product.title.toLowerCase().includes('instacart')) return 'Instacart';
      if (product.title.toLowerCase().includes('goldbelly')) return 'Goldbelly';
      if (product.title.toLowerCase().includes('home depot')) return 'Home Depot';
      if (product.title.toLowerCase().includes('lowes')) return 'Lowe\'s';
    }
    
    return 'Retailer';
  };

  const formatShippingAddress = (address: any) => {
    console.log('Formatting shipping address:', address);
    console.log('Address type:', typeof address);
    
    if (!address) {
      console.log('No address provided');
      return 'No address provided';
    }
    
    if (typeof address === 'string') {
      console.log('Address is string:', address);
      return address;
    }
    
    try {
      const addr = typeof address === 'string' ? JSON.parse(address) : address;
      console.log('Parsed address object:', addr);
      
      // Handle different address field names
      const street = addr.street || addr.address1 || addr.line1 || addr.streetAddress || addr.addressLine1 || '';
      const street2 = addr.addressLine2 || addr.address2 || '';
      const city = addr.city || '';
      const state = addr.state || addr.stateProvince || '';
      const zip = addr.zipCode || addr.zip || addr.postalCode || '';
      
      console.log('Address field values:', { street, street2, city, state, zip });
      
      // Build address parts array, filtering out empty values
      const addressParts = [street, street2, city, `${state} ${zip}`.trim()].filter(part => part && part.trim());
      const formatted = addressParts.join(', ');
      console.log('Address parts:', addressParts);
      console.log('Formatted address:', formatted);
      
      return formatted || 'Address format error';
    } catch (error) {
      console.error('Error formatting address:', error);
      console.log('Fallback to toString:', address?.toString());
      return address?.toString() || 'Address format error';
    }
  };

  const handleProceedToPurchase = () => {
    console.log('🚀 Proceeding to purchase:', product.link);
    if (product?.link) {
      window.open(product.link, '_blank');
    }
    onProceedToPurchase();
  };

  const handleMarkPurchased = () => {
    console.log('✅ Marking as purchased');
    onMarkPurchased();
  };

  // Debug logging
  console.log('PurchaseConfirmationModal render:', { 
    isOpen, 
    product: product?.title,
    isPurchased,
    isGiftCard: !!isGiftCard,
    wishlistOwner: wishlistOwner
  });
  console.log('Detailed wishlistOwner shippingAddress:', {
    shippingAddress: wishlistOwner?.shippingAddress,
    shippingAddressType: typeof wishlistOwner?.shippingAddress,
    shippingAddressKeys: wishlistOwner?.shippingAddress ? Object.keys(wishlistOwner.shippingAddress) : null
  });
  console.log('Portal target (document.body):', document.body);
  console.log('Portal target children count:', document.body.children.length);

  if (!isOpen || !product) {
    console.log('Modal early return:', { isOpen, hasProduct: !!product });
    return null;
  }

  return (
    <>
      {/* Mobile Implementation */}
      <div className="sm:hidden fixed inset-0 z-[9999] flex flex-col justify-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <div className="bg-white rounded-t-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Mobile Drawer Handle */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 bg-transparent border-none cursor-pointer opacity-70 z-10 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>

          {!isPurchased ? (
            <>
              {/* Content for mobile */}
              <p className="mb-4 text-sm text-gray-600">
                After purchase, return to MyNeedfully and click
                <span className="text-red-500 font-semibold"> I've Purchased This</span>.
              </p>

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
                    color: '#374151',
                    position: 'relative'
                  }}>
                    {isGiftCard ? wishlistOwner.email : formatShippingAddress(wishlistOwner.shippingAddress)}
                    {/* Copy Button */}
                    <button
                      onClick={() => copyAddressToClipboard(isGiftCard ? wishlistOwner.email : formatShippingAddress(wishlistOwner.shippingAddress))}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '0.25rem',
                        color: '#6b7280'
                      }}
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
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

              {/* Disclaimer */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  lineHeight: 1.4,
                  margin: 0,
                  textAlign: 'center'
                }}>
                  MyNeedfully may earn a commission from qualifying purchases. By proceeding, you agree to our{' '}
                  <a href="/terms" style={{ color: '#dc2626', textDecoration: 'underline' }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" style={{ color: '#dc2626', textDecoration: 'underline' }}>Privacy Policy</a>.
                </p>
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
      <div className="hidden sm:flex fixed inset-0 items-center justify-center z-[10000]">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto relative">
          {/* Close Button for Desktop */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 bg-transparent border-none cursor-pointer opacity-70 z-10 hover:opacity-100"
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
                        color: '#374151',
                        position: 'relative'
                      }}>
                        {isGiftCard ? wishlistOwner.email : formatShippingAddress(wishlistOwner.shippingAddress)}
                        {/* Copy Button */}
                        <button
                          onClick={() => copyAddressToClipboard(isGiftCard ? wishlistOwner.email : formatShippingAddress(wishlistOwner.shippingAddress))}
                          style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '0.25rem',
                            color: '#6b7280'
                          }}
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
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

                {/* Disclaimer */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    lineHeight: 1.4,
                    margin: 0,
                    textAlign: 'center'
                  }}>
                    MyNeedfully may earn a commission from qualifying purchases. By proceeding, you agree to our{' '}
                    <a href="/terms" style={{ color: '#dc2626', textDecoration: 'underline' }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" style={{ color: '#dc2626', textDecoration: 'underline' }}>Privacy Policy</a>.
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
    </>
  );
}