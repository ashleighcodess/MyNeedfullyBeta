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

    // Use native browser alert - guaranteed to work everywhere
    const address = wishlistOwner?.shippingAddress 
      ? `${wishlistOwner.shippingAddress.addressLine1}, ${wishlistOwner.shippingAddress.city}, ${wishlistOwner.shippingAddress.state} ${wishlistOwner.shippingAddress.zipCode}`
      : 'Address not available';

    const message = `Purchase Confirmation\n\nShipping Address:\n${address}\n\nAfter purchase, return to MyNeedfully and click "I've Purchased This".\n\nClick OK to proceed to purchase, Cancel to close.`;
    
    const result = window.confirm(message);
    
    if (result) {
      onProceedToPurchase();
    }
    
    onClose();
  }, [isOpen, product, onClose, onProceedToPurchase, wishlistOwner]);

  return null;
}