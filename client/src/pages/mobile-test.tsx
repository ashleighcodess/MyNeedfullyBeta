import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Smartphone, Monitor, Tablet } from "lucide-react";
import { useState } from "react";
import { ShareModal } from "@/components/share-modal";
import PurchaseConfirmationModal from "@/components/purchase-confirmation-modal";
import amazonLogo from "@assets/amazon_1751644244382.png";

export default function MobileTest() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Sample wishlist for share modal
  const sampleWishlist = {
    id: 1,
    title: "Mobile Test Needs List",
    description: "Testing mobile responsiveness",
    location: "Test Location",
    shippingAddress: {
      name: "Test User",
      addressLine1: "123 Test St",
      city: "Mobile",
      state: "TS",
      zipCode: "12345"
    }
  };

  // Sample product for purchase modal
  const sampleProduct = {
    title: "Test Product for Mobile",
    price: "$29.99",
    link: "https://amazon.com/test",
    retailer: "amazon" as const,
    image: amazonLogo,
    itemId: 1
  };

  // Update viewport size on resize
  window.addEventListener('resize', () => {
    setViewportSize({ width: window.innerWidth, height: window.innerHeight });
  });

  const getDeviceType = () => {
    if (viewportSize.width < 640) return { name: "Mobile", icon: Smartphone };
    if (viewportSize.width < 1024) return { name: "Tablet", icon: Tablet };
    return { name: "Desktop", icon: Monitor };
  };

  const device = getDeviceType();
  const DeviceIcon = device.icon;

  const improvements = [
    {
      title: "Modal Centering Fixed",
      description: "Share and Purchase modals now properly center on mobile devices using viewport calculations",
      status: "completed"
    },
    {
      title: "Wishlist Detail Mobile Layout",
      description: "Complete responsive redesign with mobile-first approach and proper element stacking",
      status: "completed"
    },
    {
      title: "Touch-Friendly Interactions",
      description: "Larger tap targets and improved spacing for mobile interactions",
      status: "completed"
    },
    {
      title: "Image Loading Optimization",
      description: "Mobile-optimized image loading with fallback support",
      status: "completed"
    },
    {
      title: "Responsive Grids",
      description: "Dynamic grid layouts that adapt from 1 to 3 columns based on screen size",
      status: "completed"
    }
  ];

  return (
    <div className="min-h-screen bg-warm-bg p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mobile Responsiveness Test Page</span>
              <Badge className="flex items-center gap-2">
                <DeviceIcon className="h-4 w-4" />
                {device.name}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Current viewport: {viewportSize.width}px × {viewportSize.height}px
            </div>
          </CardContent>
        </Card>

        {/* Improvements List */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile Improvements Implemented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {improvements.map((improvement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base">{improvement.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{improvement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Test Mobile Modals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                onClick={() => setShowShareModal(true)}
                className="w-full bg-coral hover:bg-coral/90"
              >
                Test Share Modal
              </Button>
              <Button 
                onClick={() => setShowPurchaseModal(true)}
                className="w-full bg-navy hover:bg-navy/90"
              >
                Test Purchase Modal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Grid Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Grid Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white p-4 rounded-lg border">
                  <div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                    <span className="text-gray-400">Item {item}</span>
                  </div>
                  <h3 className="font-semibold mb-1">Product Title</h3>
                  <p className="text-sm text-gray-600">This adapts to screen size</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile-First Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile-First Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Responsive Heading</h1>
              <p className="text-sm text-gray-600">text-2xl on mobile → text-3xl on tablet → text-4xl on desktop</p>
            </div>
            <div>
              <p className="text-sm sm:text-base lg:text-lg">
                This paragraph text scales appropriately for each device size, ensuring readability across all platforms.
              </p>
              <p className="text-xs text-gray-600">text-sm on mobile → text-base on tablet → text-lg on desktop</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        title={sampleWishlist.title}
        description={sampleWishlist.description}
        url={`https://myneedfully.app/wishlist/${sampleWishlist.id}`}
      />

      <PurchaseConfirmationModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        product={sampleProduct}
        recipientEmail="test@example.com"
        onConfirmPurchase={async () => {
          console.log("Purchase confirmed");
          setShowPurchaseModal(false);
        }}
      />
    </div>
  );
}