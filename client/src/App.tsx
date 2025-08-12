import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// import { useWebSocket } from "@/lib/websocket";
import { useEffect, Suspense, lazy } from "react";
import Navigation from "@/components/navigation";

// Preload critical pages immediately
const Landing = lazy(() => import("@/pages/landing"));
const Home = lazy(() => import("@/pages/home"));
const BrowseWishlists = lazy(() => import("@/pages/browse-wishlists"));

// Lazy load frequently used pages with preloading
const MyNeedsLists = lazy(() => import("@/pages/my-needs-lists"));
const CreateNeedsList = lazy(() => import("@/pages/create-wishlist"));
const WishlistDetail = lazy(() => import("@/pages/wishlist-detail"));
const ProductSearch = lazy(() => import("@/pages/product-search"));

// Lazy load profile and auth pages
const Profile = lazy(() => import("@/pages/profile"));
const EditProfile = lazy(() => import("@/pages/edit-profile"));
const AuthPage = lazy(() => import("@/pages/auth"));
const Signup = lazy(() => import("@/pages/signup"));

// Lazy load admin and settings
const AdminDashboard = lazy(() => import("@/pages/admin"));
const Settings = lazy(() => import("@/pages/settings"));
const PrivacySettings = lazy(() => import("@/pages/privacy-settings"));

// Lazy load informational pages (lowest priority)
const AboutUs = lazy(() => import("@/pages/about-us"));
const Resources = lazy(() => import("@/pages/resources"));
const FAQ = lazy(() => import("@/pages/faq"));
const ContactUs = lazy(() => import("@/pages/contact-us"));

// Lazy load category pages
const EssentialItems = lazy(() => import("@/pages/essential-items"));
const GroceriesFood = lazy(() => import("@/pages/groceries-food"));
const Clothing = lazy(() => import("@/pages/clothing"));
const BabyItems = lazy(() => import("@/pages/baby-items"));
const SchoolSupplies = lazy(() => import("@/pages/school-supplies"));
const PersonalCareSupplies = lazy(() => import("@/pages/personal-care-supplies"));

// Lazy load disaster relief pages
const FireDisasterRelief = lazy(() => import("@/pages/fire-disaster-relief"));
const EmergencyFloodRelief = lazy(() => import("@/pages/emergency-flood-relief"));
const CrisisReliefSupport = lazy(() => import("@/pages/crisis-relief-support"));
const MedicalNecessity = lazy(() => import("@/pages/medical-necessity"));
const CommunityHelp = lazy(() => import("@/pages/community-help"));
const SupportResources = lazy(() => import("@/pages/support-resources"));

// Lazy load utility pages
const EditWishlist = lazy(() => import("@/pages/edit-wishlist"));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CommunityImpact = lazy(() => import("@/pages/community-impact"));
const QuickActions = lazy(() => import("@/pages/quick-actions"));

// Lazy load legal pages
const TermsAndConditions = lazy(() => import("@/pages/terms-and-conditions"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const CookiesPolicy = lazy(() => import("@/pages/cookies-policy"));

// Load footer and components with error boundaries
const Footer = lazy(() => import("@/components/footer").catch(() => ({ default: () => <div></div> })));
const QuickTips = lazy(() => import("@/components/quick-tips").catch(() => ({ default: () => <div></div> })));

// Preload high-priority pages after initial render
const preloadHighPriorityPages = () => {
  // Preload commonly accessed pages
  import("@/pages/my-needs-lists");
  import("@/pages/create-wishlist");
  import("@/pages/browse-wishlists");
  import("@/pages/product-search");
};

// Component to handle scroll-to-top on route changes
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (error) {
      console.warn("Scroll to top failed:", error);
    }
  }, [location]);

  return null;
}

// Component to handle WebSocket toast notifications
function NotificationHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      try {
        const { title, description, duration } = event.detail;
        toast({
          title,
          description,
          duration,
        });
      } catch (error) {
        console.warn("Toast notification failed:", error);
      }
    };

    window.addEventListener('showNotificationToast', handleToastEvent as EventListener);

    return () => {
      window.removeEventListener('showNotificationToast', handleToastEvent as EventListener);
    };
  }, [toast]);

  return null;
}

// Component for home route logic - always show Landing page (public marketing page)
function HomeRoute() {
  // Always show the public landing page regardless of authentication status
  // This allows logged-in users to view the main marketing page when clicking logo
  return <Landing />;
}

// Component for dashboard route logic - show user dashboard for authenticated users
function DashboardRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
      </div>
    );
  }

  return isAuthenticated ? <Home /> : <Landing />;
}

function Router() {
  // WebSocket temporarily disabled for deployment stability
  // useWebSocket();

  // Don't block the entire app for auth loading - most features work without auth
  // Individual components can handle their own auth requirements

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <NotificationHandler />

      <Switch>
        {/* Admin route with no header/footer */}
        <Route path="/admin">
          <Suspense fallback={
            <div className="min-h-screen bg-warm-bg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
            </div>
          }>
            <AdminDashboard />
          </Suspense>
        </Route>

        {/* All other routes with header and footer */}
        <Route>
          <Navigation />
          <div className="flex-1">
            <Suspense fallback={
              <div className="min-h-screen bg-warm-bg flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mb-4"></div>
                  <p className="text-gray-600 text-sm">Loading...</p>
                </div>
              </div>
            }>
              <Switch>
                {/* Public routes available to everyone */}
                <Route path="/about-us" component={AboutUs} />
                <Route path="/about" component={AboutUs} />
                <Route path="/resources" component={Resources} />
                <Route path="/faq" component={FAQ} />
                <Route path="/terms-and-conditions" component={TermsAndConditions} />
                <Route path="/terms" component={TermsAndConditions} />
                <Route path="/privacy-policy" component={PrivacyPolicy} />
                <Route path="/privacy" component={PrivacyPolicy} />
                <Route path="/cookies-policy" component={CookiesPolicy} />
                <Route path="/cookies" component={CookiesPolicy} />
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
                <Route path="/support-resources" component={SupportResources} />
                <Route path="/contact-us" component={ContactUs} />
                <Route path="/contact" component={ContactUs} />
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
                <Route path="/" component={HomeRoute} />

                {/* Dashboard route for authenticated users */}
                <Route path="/dashboard" component={DashboardRoute} />
                <Route path="/quick-actions" component={QuickActions} />

                <Route component={NotFound} />
              </Switch>
            </Suspense>
            </div>
            <Footer />
          </Route>
        </Switch>
    </div>
  );
}

function App() {
  // Preload high-priority pages after initial render
  useEffect(() => {
    const timer = setTimeout(preloadHighPriorityPages, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle unhandled promise rejections to prevent blank page
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Silently handle specific error types
      if (event.reason?.name === 'DOMException' || 
          event.reason?.name === 'AbortError' ||
          event.reason?.message?.includes('WebSocket') ||
          event.reason?.message?.includes('fetch')) {
        // These are expected in our application, handle silently
        event.preventDefault();
        return;
      }

      console.warn('Unhandled promise rejection (handled):', event.reason);
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      // Silently handle specific error types
      if (event.error?.name === 'DOMException' || 
          event.error?.name === 'AbortError' ||
          event.error?.message?.includes('WebSocket')) {
        event.preventDefault();
        return;
      }

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
          <p className="text-gray-600">App Error: {error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}

export default App;