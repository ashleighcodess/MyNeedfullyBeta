import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Heart, 
  ExternalLink, 
  Check, 
  DollarSign,
  User,
  Calendar
} from "lucide-react";
import { trackOutboundPurchaseClick } from "@/analytics/ga4";

interface ProductCardProps {
  item: {
    id: number;
    title: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    currency?: string;
    productUrl?: string;
    retailer?: string;
    quantity: number;
    quantityFulfilled: number;
    priority: number;
    isFulfilled: boolean;
    fulfilledBy?: string;
    fulfilledAt?: string;
    notes?: string;
  };
  onFulfill?: () => void;
  canFulfill?: boolean;
  isLoading?: boolean;
  wishlistId?: number;
}

export default function ProductCard({ 
  item, 
  onFulfill, 
  canFulfill = false, 
  isLoading = false,
  wishlistId 
}: ProductCardProps) {
  const formatPrice = (price?: number, currency = 'USD') => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-100 text-red-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      default: return 'Normal';
    }
  };

  return (
    <Card className={`overflow-hidden transition-all ${item.isFulfilled ? 'opacity-75 bg-green-50' : 'hover:shadow-md'}`}>
      <div className="relative">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-40 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* Status Overlay */}
        {item.isFulfilled && (
          <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <Check className="mr-1 h-4 w-4" />
              Fulfilled
            </div>
          </div>
        )}

        {/* Priority Badge */}
        <Badge className={`absolute top-2 left-2 ${getPriorityColor(item.priority)}`}>
          {getPriorityLabel(item.priority)}
        </Badge>

        {/* Quantity Badge */}
        {item.quantity > 1 && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Qty: {item.quantityFulfilled}/{item.quantity}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Title and Description */}
        <h4 className="font-semibold text-navy mb-2 line-clamp-2">
          {item.title}
        </h4>
        
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Price and Retailer */}
        <div className="flex items-center justify-between mb-3">
          {item.price && (
            <div className="flex items-center text-coral font-semibold">
              <DollarSign className="h-4 w-4 mr-1" />
              {formatPrice(item.price, item.currency)}
            </div>
          )}
          {item.retailer && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {item.retailer}
            </span>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
            {item.notes}
          </div>
        )}

        {/* Fulfilled Info */}
        {item.isFulfilled && item.fulfilledAt && (
          <>
            <Separator className="my-3" />
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center">
                <User className="mr-1 h-3 w-3" />
                Fulfilled by: {item.fulfilledBy ? 'Anonymous Supporter' : 'Anonymous'}
              </div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(item.fulfilledAt).toLocaleDateString()}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        {!item.isFulfilled && (
          <div className="space-y-2 mt-4">
            {canFulfill && onFulfill && (
              <Button 
                onClick={onFulfill}
                disabled={isLoading}
                className="w-full bg-coral hover:bg-coral/90"
                size="sm"
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Fulfill This Need
                  </>
                )}
              </Button>
            )}

            {item.productUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-coral text-coral hover:bg-coral/10"
                onClick={() => {
                  trackOutboundPurchaseClick({
                    retailer: item.retailer || 'unknown',
                    list_id: wishlistId?.toString() || 'unknown'
                  });
                  window.open(item.productUrl, '_blank');
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Product
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
