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
import FAQ from "@/pages/faq";
import FireDisasterRelief from "@/pages/fire-disaster-relief";
import MedicalNecessity from "@/pages/medical-necessity";
import EmergencyFloodRelief from "@/pages/emergency-flood-relief";
import EssentialItems from "@/pages/essential-items";
import GroceriesFood from "@/pages/groceries-food";
import BabyItems from "@/pages/baby-items";
import SchoolSupplies from "@/pages/school-supplies";
import Clothing from "@/pages/clothing";
import CommunityHelp from "@/pages/community-help";
import CrisisReliefSupport from "@/pages/crisis-relief-support";
import PersonalCareSupplies from "@/pages/personal-care-supplies";
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
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-black">MyNeedfully Test</h1>
      <p className="text-gray-600 mt-4">Application is loading...</p>
      <div className="mt-8">
        <Switch>
          <Route path="/emergency-flood-relief" component={EmergencyFloodRelief} />
          <Route path="/essential-items" component={EssentialItems} />
          <Route path="/groceries-food" component={GroceriesFood} />
          <Route path="/" component={Landing} />
        </Switch>
      </div>
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
