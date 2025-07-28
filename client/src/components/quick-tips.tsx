import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Lightbulb, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface Tip {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon?: string;
}

const tips: Tip[] = [
  {
    id: 'browse-needs',
    title: 'Browse Needs Lists',
    description: 'Discover people who need your help by browsing their needs lists.',
    target: '[data-tip="browse-needs"]',
    position: 'bottom',
    icon: '🔍'
  },
  {
    id: 'create-list',
    title: 'Create Needs List',
    description: 'Share what you need with our caring community by creating your own needs list.',
    target: '[data-tip="create-list"]',
    position: 'bottom',
    icon: '✏️'
  },
  {
    id: 'product-search',
    title: 'Search Products',
    description: 'Find specific items from Amazon, Walmart, and Target to add to your needs lists.',
    target: '[data-tip="product-search"]',
    position: 'bottom',
    icon: '🎁'
  },
  {
    id: 'notifications',
    title: 'Stay Updated',
    description: 'Get notified when someone supports your needs or when you help others.',
    target: '[data-tip="notifications"]',
    position: 'bottom',
    icon: '🔔'
  },
  {
    id: 'affiliate-disclosure',
    title: 'About Our Links',
    description: 'When you purchase items through our Amazon links, we may earn a small commission at no extra cost to you. This helps us maintain the platform to connect more people in need with supporters.',
    target: 'body',
    position: 'bottom',
    icon: '💰'
  }
];

interface QuickTipsProps {
  onComplete?: () => void;
}

export default function QuickTips({ onComplete }: QuickTipsProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [hasSeenTips, setHasSeenTips] = useState(false);
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    // Don't show tips on admin pages
    if (location.startsWith('/admin')) return;
    
    // Only show tips for authenticated users
    if (!isAuthenticated) return;
    
    // Check if user has seen tips before
    const seenTips = localStorage.getItem('MyNeedfully-tips-seen');
    if (!seenTips) {
      // Delay showing tips to let the page load
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenTips(true);
    }
  }, [isAuthenticated, location]);

  const currentTip = tips[currentTipIndex];

  const nextTip = () => {
    if (currentTipIndex < tips.length - 1) {
      setCurrentTipIndex(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevTip = () => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex(prev => prev - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem('MyNeedfully-tips-seen', 'true');
    if (onComplete) {
      onComplete();
    }
  };

  const showTipsAgain = () => {
    localStorage.removeItem('MyNeedfully-tips-seen');
    setCurrentTipIndex(0);
    setIsActive(true);
    setHasSeenTips(false);
  };

  const getTipPosition = () => {
    const targetElement = document.querySelector(currentTip.target);
    
    if (!targetElement || currentTip.target === 'body') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const cardWidth = 320; // 80 * 4 (w-80)
    const cardHeight = 200; // estimated height
    
    let top, left;
    
    switch (currentTip.position) {
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + (rect.width / 2) - (cardWidth / 2);
        break;
      case 'top':
        top = rect.top - cardHeight - 20;
        left = rect.left + (rect.width / 2) - (cardWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (cardHeight / 2);
        left = rect.left - cardWidth - 20;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (cardHeight / 2);
        left = rect.right + 20;
        break;
      default:
        top = rect.bottom + 20;
        left = rect.left;
    }

    // Keep within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 10) left = 10;
    if (left + cardWidth > viewportWidth - 10) left = viewportWidth - cardWidth - 10;
    if (top < 10) top = 10;
    if (top + cardHeight > viewportHeight - 10) top = viewportHeight - cardHeight - 10;

    return {
      top: `${top}px`,
      left: `${left}px`
    };
  };

  // Don't render anything if not authenticated or on admin pages
  if (!isAuthenticated || location.startsWith('/admin')) return null;

  return (
    <>
      {/* Show tips button - always show for easy testing */}
      {!isActive && (
        <Button
          onClick={showTipsAgain}
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-40 bg-white shadow-lg hover:bg-coral/10 border-coral/20"
          title="Start Quick Tour"
        >
          <Lightbulb className="h-5 w-5" />
        </Button>
      )}

      {/* Overlay and Tip Card */}
      {isActive && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={skipTour}
          />

          {/* Tip Card */}
          <div
            className="fixed z-50 w-80 transition-all duration-300"
            style={getTipPosition()}
          >
            <Card className="shadow-xl border-2 border-coral/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentTip.icon}</span>
                    <CardTitle className="text-lg text-coral">{currentTip.title}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTour}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {currentTipIndex + 1} of {tips.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {currentTip.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevTip}
                      disabled={currentTipIndex === 0}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    {currentTipIndex === tips.length - 1 ? (
                      <Button
                        onClick={completeTour}
                        className="bg-coral hover:bg-coral/90 text-white flex items-center gap-1"
                        size="sm"
                      >
                        <Check className="h-4 w-4" />
                        Got it!
                      </Button>
                    ) : (
                      <Button
                        onClick={nextTip}
                        className="bg-coral hover:bg-coral/90 text-white flex items-center gap-1"
                        size="sm"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipTour}
                      className="text-gray-500"
                    >
                      Skip tour
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Highlight target element */}
          {currentTip.target !== 'body' && (() => {
            const targetElement = document.querySelector(currentTip.target);
            if (!targetElement) return null;
            
            const rect = targetElement.getBoundingClientRect();
            const padding = 8;
            
            return (
              <>
                {/* Four overlay pieces to create cutout effect */}
                {/* Top */}
                <div
                  className="fixed z-30 pointer-events-none bg-black/70"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    height: rect.top - padding
                  }}
                />
                
                {/* Bottom */}
                <div
                  className="fixed z-30 pointer-events-none bg-black/70"
                  style={{
                    top: rect.bottom + padding,
                    left: 0,
                    right: 0,
                    bottom: 0
                  }}
                />
                
                {/* Left */}
                <div
                  className="fixed z-30 pointer-events-none bg-black/70"
                  style={{
                    top: rect.top - padding,
                    left: 0,
                    width: rect.left - padding,
                    height: rect.height + padding * 2
                  }}
                />
                
                {/* Right */}
                <div
                  className="fixed z-30 pointer-events-none bg-black/70"
                  style={{
                    top: rect.top - padding,
                    left: rect.right + padding,
                    right: 0,
                    height: rect.height + padding * 2
                  }}
                />
                
                {/* Highlight ring around target element */}
                <div
                  className="fixed z-40 pointer-events-none animate-pulse"
                  style={{
                    top: rect.top - padding,
                    left: rect.left - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2,
                    border: '3px solid #FF6B6B',
                    borderRadius: '8px',
                    boxShadow: '0 0 20px rgba(255, 107, 107, 0.5), inset 0 0 20px rgba(255, 107, 107, 0.3)'
                  }}
                />
              </>
            );
          })()}
        </>
      )}
    </>
  );
}