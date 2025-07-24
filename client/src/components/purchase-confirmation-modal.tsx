import { useEffect } from 'react';

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

  useEffect(() => {
    if (!isOpen || !product) return;

    // Create the simplest possible modal overlay
    const modalHTML = `
      <div id="simple-modal" style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0,0,0,0.8) !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: -apple-system, sans-serif !important;
      ">
        <div style="
          background: white !important;
          padding: 30px !important;
          border-radius: 10px !important;
          max-width: 500px !important;
          width: 90% !important;
          text-align: center !important;
          position: relative !important;
        ">
          <button onclick="document.getElementById('simple-modal').remove()" style="
            position: absolute !important;
            top: 10px !important;
            right: 15px !important;
            background: none !important;
            border: none !important;
            font-size: 24px !important;
            cursor: pointer !important;
            color: #666 !important;
          ">×</button>
          
          <h2 style="margin: 0 0 20px 0 !important; color: #333 !important;">Purchase This Item</h2>
          
          <p style="margin: 0 0 20px 0 !important; color: #666 !important;">
            Click the button below to purchase this item. After buying, return here and mark it as purchased.
          </p>
          
          <div style="margin: 20px 0 !important; padding: 15px !important; background: #f5f5f5 !important; border-radius: 5px !important;">
            <strong>Shipping Address:</strong><br>
            ${wishlistOwner?.shippingAddress ? 
              `${wishlistOwner.shippingAddress.addressLine1}, ${wishlistOwner.shippingAddress.city}, ${wishlistOwner.shippingAddress.state} ${wishlistOwner.shippingAddress.zipCode}` 
              : 'Address not available'}
          </div>
          
          <button onclick="
            window.purchaseCallback && window.purchaseCallback();
            document.getElementById('simple-modal').remove();
          " style="
            background: #f97316 !important;
            color: white !important;
            border: none !important;
            padding: 15px 30px !important;
            border-radius: 5px !important;
            font-size: 16px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            margin-right: 10px !important;
          ">Buy Now</button>
          
          <button onclick="document.getElementById('simple-modal').remove()" style="
            background: #6b7280 !important;
            color: white !important;
            border: none !important;
            padding: 15px 30px !important;
            border-radius: 5px !important;
            font-size: 16px !important;
            cursor: pointer !important;
          ">Cancel</button>
        </div>
      </div>
    `;

    // Set up the callback
    (window as any).purchaseCallback = () => {
      onProceedToPurchase();
      onClose();
    };

    // Add to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Cleanup function
    return () => {
      const modal = document.getElementById('simple-modal');
      if (modal) {
        modal.remove();
      }
      delete (window as any).purchaseCallback;
    };
  }, [isOpen, product, onClose, onProceedToPurchase, wishlistOwner]);

  return null;
}