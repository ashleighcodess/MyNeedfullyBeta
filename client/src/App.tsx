import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, Suspense, lazy } from "react";

// Lazy load pages to prevent import errors from breaking the app
const Landing = lazy(() => import("@/pages/landing"));
const Home = lazy(() => import("@/pages/home"));
const BrowseWishlists = lazy(() => import("@/pages/browse-wishlists"));
const MyNeedsLists = lazy(() => import("@/pages/my-needs-lists"));
const CreateNeedsList = lazy(() => import("@/pages/create-wishlist"));
const EditWishlist = lazy(() => import("@/pages/edit-wishlist"));
const WishlistDetail = lazy(() => import("@/pages/wishlist-detail"));
const ProductSearch = lazy(() => import("@/pages/product-search"));
const Profile = lazy(() => import("@/pages/profile"));
const EditProfile = lazy(() => import("@/pages/edit-profile"));
const PrivacySettings = lazy(() => import("@/pages/privacy-settings"));
const Settings = lazy(() => import("@/pages/settings"));
const AdminDashboard = lazy(() => import("@/pages/admin"));
const AboutUs = lazy(() => import("@/pages/about-us"));
const Resources = lazy(() => import("@/pages/resources"));
const Signup = lazy(() => import("@/pages/signup"));
const AuthPage = lazy(() => import("@/pages/auth"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CommunityImpact = lazy(() => import("@/pages/community-impact"));
const FAQ = lazy(() => import("@/pages/faq"));
const FireDisasterRelief = lazy(() => import("@/pages/fire-disaster-relief"));
const MedicalNecessity = lazy(() => import("@/pages/medical-necessity"));
const EmergencyFloodRelief = lazy(() => import("@/pages/emergency-flood-relief"));
const EssentialItems = lazy(() => import("@/pages/essential-items"));
const GroceriesFood = lazy(() => import("@/pages/groceries-food"));
const BabyItems = lazy(() => import("@/pages/baby-items"));
const SchoolSupplies = lazy(() => import("@/pages/school-supplies"));
const Clothing = lazy(() => import("@/pages/clothing"));
const CommunityHelp = lazy(() => import("@/pages/community-help"));
const CrisisReliefSupport = lazy(() => import("@/pages/crisis-relief-support"));
const PersonalCareSupplies = lazy(() => import("@/pages/personal-care-supplies"));
const Footer = lazy(() => import("@/components/footer"));
const QuickTips = lazy(() => import("@/components/quick-tips"));
const Navigation = lazy(() => import("@/components/navigation"));

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <NotificationHandler />
      
      <Suspense fallback={
        <div className="min-h-screen bg-warm-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
        </div>
      }>
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
                <Route path="/faq" component={FAQ} />
                <Route path="/fire-disaster-relief" component={FireDisasterRelief} />
                <Route path="/medical-necessity" component={MedicalNecessity} />
                <Route path="/emergency-flood-relief" component={EmergencyFloodRelief} />
                <Route path="/essential-items" component={EssentialItems} />
                <Route path="/groceries-food" component={GroceriesFood} />
                <Route path="/baby-items" component={BabyItems} />
                <Route path="/school-supplies" component={SchoolSupplies} />
                <Route path="/clothing" component={Clothing} />
                <Route path="/community-help" component={CommunityHelp} />
                <Route path="/crisis-relief-support" component={CrisisReliefSupport} />
                <Route path="/personal-care-supplies" component={PersonalCareSupplies} />
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
                
                {/* Home route - show Landing for unauthenticated, Home for authenticated */}
                <Route path="/" component={isAuthenticated ? Home : Landing} />
                
                {/* Dashboard route for authenticated users */}
                <Route path="/dashboard" component={isAuthenticated ? Profile : Landing} />
                
                <Route component={NotFound} />
              </Switch>
            </div>
            <Footer />
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
}

function App() {
  // Handle unhandled promise rejections to prevent blank page
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection (handled):', event.reason);
      event.preventDefault(); // Prevent the unhandled rejection from causing issues
    };

    const handleError = (event: ErrorEvent) => {
      console.warn('Error caught:', event.error);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <QuickTips />
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('App component error:', error);
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-coral mb-4">MyNeedfully</h1>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }
}

export default App;