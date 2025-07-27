import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ThankYouNote from "@/components/thank-you-note";
import { Gift, ShoppingCart, Calendar, MapPin, User, Heart } from "lucide-react";

interface PurchaseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PurchaseSelectionModal({ isOpen, onClose }: PurchaseSelectionModalProps) {
  const { user } = useAuth();
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [showThankYouForm, setShowThankYouForm] = useState(false);

  const { data: userDonations, isLoading } = useQuery({
    queryKey: ['/api/user/donations'],
    enabled: !!user && isOpen,
  });

  // Filter out donations where user has already sent thank you notes
  const availablePurchases = Array.isArray(userDonations) ? userDonations.filter((donation: any) => {
    // You could add logic here to check if a thank you note was already sent for this donation
    return donation.status === 'completed' || donation.status === 'fulfilled';
  }) : [];

  const handleSelectPurchase = (purchase: any) => {
    setSelectedPurchase(purchase);
    setShowThankYouForm(true);
  };

  const handleThankYouSent = () => {
    setShowThankYouForm(false);
    setSelectedPurchase(null);
    onClose();
  };

  if (showThankYouForm && selectedPurchase) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-coral" />
              Create Thank You Note
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Send a heartfelt message to show your appreciation
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Thanking recipient for:</div>
            <div className="font-medium text-navy">{selectedPurchase.itemTitle}</div>
            <div className="text-sm text-gray-600">
              For: {selectedPurchase.recipientFirstName} {selectedPurchase.recipientLastName}
            </div>
          </div>
          <ThankYouNote
            toUserId={selectedPurchase.wishlistUserId}
            donationId={selectedPurchase.id}
            onSent={handleThankYouSent}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-coral" />
            Select a Purchase to Thank
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Choose from your recent purchases to send a thank you note
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading your purchases...</div>
          </div>
        ) : availablePurchases.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-navy mb-2">Sorry! No Purchases Yet!</h3>
            <p className="text-gray-600 mb-6">
              You need to purchase items from needs lists before you can send thank you notes.
            </p>
            <p className="text-sm text-gray-500">
              Check back later after supporting someone's needs list.
            </p>
            <div className="mt-6">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Select a purchase to send a thank you note to the recipient:
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availablePurchases.map((purchase: any) => (
                <Card 
                  key={purchase.id} 
                  className="cursor-pointer hover:shadow-md transition-all border hover:border-coral/30"
                  onClick={() => handleSelectPurchase(purchase)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="h-4 w-4 text-coral" />
                          <h4 className="font-semibold text-navy line-clamp-1">
                            {purchase.itemTitle}
                          </h4>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>
                              For: {purchase.recipientFirstName} {purchase.recipientLastName}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{purchase.wishlistLocation}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 mb-2">
                          Purchased
                        </Badge>
                        {purchase.amount && (
                          <div className="text-sm font-semibold text-coral">
                            ${purchase.amount}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}