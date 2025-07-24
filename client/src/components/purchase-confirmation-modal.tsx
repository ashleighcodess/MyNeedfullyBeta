import { createPortal } from 'react-dom';
import { X, ExternalLink, Check, Package } from 'lucide-react';

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
  
  const getRetailerName = () => {
    if (!product?.link) return 'Retailer';
    
    if (product.link.includes('amazon.com')) return 'Amazon';
    if (product.link.includes('walmart.com')) return 'Walmart';
    if (product.link.includes('target.com')) return 'Target';
    return 'Retailer';
  };

  const formatShippingAddress = (address: any) => {
    if (!address) return 'No address provided';
    
    if (typeof address === 'string') {
      return address;
    }
    
    try {
      const addr = typeof address === 'string' ? JSON.parse(address) : address;
      return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
    } catch (error) {
      console.error('Error formatting address:', error);
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
          position: 'fixed',
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
          position: 'fixed',
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
}