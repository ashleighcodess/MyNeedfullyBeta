import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
// import { useWebSocket } from "@/lib/websocket";
import { useEffect, Suspense, lazy, ErrorBoundary } from "react";

// Lazy load pages to prevent import errors from breaking the app
const Landing = lazy(() => import("@/pages/landing").catch(() => ({ default: () => <div>Error loading Landing page</div> })));
const Home = lazy(() => import("@/pages/home").catch(() => ({ default: () => <div>Error loading Home page</div> })));
const BrowseWishlists = lazy(() => import("@/pages/browse-wishlists").catch(() => ({ default: () => <div>Error loading Browse page</div> })));
const MyNeedsLists = lazy(() => import("@/pages/my-needs-lists").catch(() => ({ default: () => <div>Error loading My Lists page</div> })));
const CreateNeedsList = lazy(() => import("@/pages/create-wishlist").catch(() => ({ default: () => <div>Error loading Create page</div> })));
const EditWishlist = lazy(() => import("@/pages/edit-wishlist").catch(() => ({ default: () => <div>Error loading Edit page</div> })));
const WishlistDetail = lazy(() => import("@/pages/wishlist-detail-simple").catch(() => ({ default: () => <div>Error loading Detail page</div> })));
const ProductSearch = lazy(() => import("@/pages/product-search").catch(() => ({ default: () => <div>Error loading Product Search page</div> })));
const Profile = lazy(() => import("@/pages/profile").catch(() => ({ default: () => <div>Error loading Profile page</div> })));
const EditProfile = lazy(() => import("@/pages/edit-profile").catch(() => ({ default: () => <div>Error loading Edit Profile page</div> })));
const PrivacySettings = lazy(() => import("@/pages/privacy-settings").catch(() => ({ default: () => <div>Error loading Privacy page</div> })));
const Settings = lazy(() => import("@/pages/settings").catch(() => ({ default: () => <div>Error loading Settings page</div> })));
const AdminDashboard = lazy(() => import("@/pages/admin").catch(() => ({ default: () => <div>Error loading Admin page</div> })));
const AboutUs = lazy(() => import("@/pages/about-us").catch(() => ({ default: () => <div>Error loading About page</div> })));
const Resources = lazy(() => import("@/pages/resources").catch(() => ({ default: () => <div>Error loading Resources page</div> })));
const Signup = lazy(() => import("@/pages/signup").catch(() => ({ default: () => <div>Error loading Signup page</div> })));
const AuthPage = lazy(() => import("@/pages/auth").catch(() => ({ default: () => <div>Error loading Auth page</div> })));
const ResetPasswordPage = lazy(() => import("@/pages/reset-password").catch(() => ({ default: () => <div>Error loading Reset Password page</div> })));
const VerifyEmail = lazy(() => import("@/pages/verify-email").catch(() => ({ default: () => <div>Error loading Verify Email page</div> })));
const NotFound = lazy(() => import("@/pages/not-found").catch(() => ({ default: () => <div>404 - Page Not Found</div> })));
const CommunityImpact = lazy(() => import("@/pages/community-impact").catch(() => ({ default: () => <div>Error loading Community page</div> })));
const FAQ = lazy(() => import("@/pages/faq").catch(() => ({ default: () => <div>Error loading FAQ page</div> })));
const FireDisasterRelief = lazy(() => import("@/pages/fire-disaster-relief").catch(() => ({ default: () => <div>Error loading Fire Relief page</div> })));
const MedicalNecessity = lazy(() => import("@/pages/medical-necessity").catch(() => ({ default: () => <div>Error loading Medical page</div> })));
const EmergencyFloodRelief = lazy(() => import("@/pages/emergency-flood-relief").catch(() => ({ default: () => <div>Error loading Flood Relief page</div> })));
const EssentialItems = lazy(() => import("@/pages/essential-items").catch(() => ({ default: () => <div>Error loading Essential Items page</div> })));
const GroceriesFood = lazy(() => import("@/pages/groceries-food").catch(() => ({ default: () => <div>Error loading Groceries page</div> })));
const BabyItems = lazy(() => import("@/pages/baby-items").catch(() => ({ default: () => <div>Error loading Baby Items page</div> })));
const SchoolSupplies = lazy(() => import("@/pages/school-supplies").catch(() => ({ default: () => <div>Error loading School Supplies page</div> })));
const Clothing = lazy(() => import("@/pages/clothing").catch(() => ({ default: () => <div>Error loading Clothing page</div> })));
const CommunityHelp = lazy(() => import("@/pages/community-help").catch(() => ({ default: () => <div>Error loading Community Help page</div> })));
const CrisisReliefSupport = lazy(() => import("@/pages/crisis-relief-support").catch(() => ({ default: () => <div>Error loading Crisis Relief page</div> })));
const PersonalCareSupplies = lazy(() => import("@/pages/personal-care-supplies").catch(() => ({ default: () => <div>Error loading Personal Care page</div> })));
const Footer = lazy(() => import("@/components/footer").catch(() => ({ default: () => <div></div> })));
const QuickTips = lazy(() => import("@/components/quick-tips").catch(() => ({ default: () => <div></div> })));
const Navigation = lazy(() => import("@/components/navigation").catch(() => ({ default: () => <div></div> })));
const QuickActions = lazy(() => import("@/pages/quick-actions").catch(() => ({ default: () => <div>Error loading Quick Actions page</div> })));
const TermsAndConditions = lazy(() => import("@/pages/terms-and-conditions").catch(() => ({ default: () => <div>Error loading Terms page</div> })));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy").catch(() => ({ default: () => <div>Error loading Privacy page</div> })));
const CookiesPolicy = lazy(() => import("@/pages/cookies-policy").catch(() => ({ default: () => <div>Error loading Cookies page</div> })));

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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // WebSocket temporarily disabled for deployment stability
  // useWebSocket();

  // Skip loading check for browse page to prevent hanging
  if (isLoading && !location.includes('/browse')) {
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
                <Route path="/dashboard" component={isAuthenticated ? QuickActions : Landing} />
                
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
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }
}

export default App;