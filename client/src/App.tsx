import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import BrowseWishlists from "@/pages/browse-wishlists";
import MyNeedsLists from "@/pages/my-needs-lists";
import CreateNeedsList from "@/pages/create-wishlist";
import EditWishlist from "@/pages/edit-wishlist";
import WishlistDetail from "@/pages/wishlist-detail";
import ProductSearch from "@/pages/product-search";
import Profile from "@/pages/profile";
import EditProfile from "@/pages/edit-profile";
import PrivacySettings from "@/pages/privacy-settings";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin";
import AboutUs from "@/pages/about-us";
import Resources from "@/pages/resources";
import Signup from "@/pages/signup";
import AuthPage from "@/pages/auth";
import ResetPasswordPage from "@/pages/reset-password";
import VerifyEmail from "@/pages/verify-email";
import NotFound from "@/pages/not-found";
import CommunityImpact from "@/pages/community-impact";
import Footer from "@/components/footer";
import QuickTips from "@/components/quick-tips";
import Navigation from "@/components/navigation";

// Component to handle scroll-to-top on route changes
function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

// Component to handle WebSocket toast notifications
function NotificationHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      const { title, description, duration } = event.detail;
      toast({
        title,
        description,
        duration,
      });
    };

    window.addEventListener('showNotificationToast', handleToastEvent as EventListener);

    return () => {
      window.removeEventListener('showNotificationToast', handleToastEvent as EventListener);
    };
  }, [toast]);

  return null;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <NotificationHandler />
      
      <Switch>
        {/* Admin route with no header/footer */}
        <Route path="/admin">
          <AdminDashboard />
        </Route>
        
        {/* All other routes with header and footer */}
        <Route>
          <Navigation />
          <div className="flex-1">
            <Switch>
              {/* Public routes available to everyone */}
              <Route path="/about-us" component={AboutUs} />
              <Route path="/about" component={AboutUs} />
              <Route path="/resources" component={Resources} />
              <Route path="/signup" component={Signup} />
              <Route path="/sign-up" component={Signup} />
              <Route path="/login" component={AuthPage} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/reset-password" component={ResetPasswordPage} />
              <Route path="/verify-email" component={VerifyEmail} />
              <Route path="/browse" component={BrowseWishlists} />
              <Route path="/find" component={BrowseWishlists} />
              <Route path="/products" component={ProductSearch} />
              <Route path="/product-search" component={ProductSearch} />
              <Route path="/search" component={ProductSearch} />
              
              {/* Authenticated routes */}
              <Route path="/my-needs-lists" component={MyNeedsLists} />
              <Route path="/my-lists" component={MyNeedsLists} />
              <Route path="/create" component={CreateNeedsList} />
              <Route path="/edit-wishlist/:id" component={EditWishlist} />
              <Route path="/needslist/:id" component={WishlistDetail} />
              <Route path="/wishlist/:id" component={WishlistDetail} />
              <Route path="/wishlists/:id" component={WishlistDetail} />
              <Route path="/profile" component={Profile} />
              <Route path="/profile/edit" component={EditProfile} />
              <Route path="/profile/privacy" component={PrivacySettings} />
              <Route path="/settings" component={Settings} />
              <Route path="/community" component={CommunityImpact} />
              <Route path="/community-impact" component={CommunityImpact} />
              <Route path="/impact" component={CommunityImpact} />
              
              {/* Home route - landing for unauthenticated, dashboard for authenticated */}
              <Route path="/" component={isLoading ? () => <div className="min-h-screen bg-warm-bg flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div></div> : (isAuthenticated ? Home : Landing)} />
              
              {/* Dashboard route for authenticated users */}
              <Route path="/dashboard" component={Home} />
              
              <Route component={NotFound} />
            </Switch>
          </div>
          <Footer />
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <QuickTips />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
