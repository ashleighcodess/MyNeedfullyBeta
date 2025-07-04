import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import BrowseWishlists from "@/pages/browse-wishlists";
import MyNeedsLists from "@/pages/my-needs-lists";
import CreateNeedsList from "@/pages/create-wishlist";
import EditWishlist from "@/pages/edit-wishlist";
import WishlistDetail from "@/pages/wishlist-detail";
import ProductSearchWorking from "@/pages/product-search-working";
import Profile from "@/pages/profile";
import EditProfile from "@/pages/edit-profile";
import PrivacySettings from "@/pages/privacy-settings";
import AdminDashboard from "@/pages/admin";
import AboutUs from "@/pages/about-us";
import Resources from "@/pages/resources";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";
import CommunityImpact from "@/pages/community-impact";
import Footer from "@/components/footer";
import QuickTips from "@/components/quick-tips";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Switch>
          {/* Public routes available to everyone */}
          <Route path="/about-us" component={AboutUs} />
          <Route path="/about" component={AboutUs} />
          <Route path="/resources" component={Resources} />
          <Route path="/signup" component={Signup} />
          <Route path="/sign-up" component={Signup} />
          <Route path="/browse" component={BrowseWishlists} />
          <Route path="/find" component={BrowseWishlists} />
          <Route path="/products" component={ProductSearchWorking} />
          <Route path="/product-search" component={ProductSearchWorking} />
          <Route path="/search" component={ProductSearchWorking} />
          
          {isLoading ? (
            <Route path="/">
              {() => (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                  </div>
                </div>
              )}
            </Route>
          ) : !isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/home" component={Landing} />
              <Route path="/my-needs-lists" component={MyNeedsLists} />
              <Route path="/my-lists" component={MyNeedsLists} />
              <Route path="/create" component={CreateNeedsList} />
              <Route path="/edit-wishlist/:id" component={EditWishlist} />
              <Route path="/needslist/:id" component={WishlistDetail} />
              <Route path="/wishlist/:id" component={WishlistDetail} />
              <Route path="/profile" component={Profile} />
              <Route path="/profile/edit" component={EditProfile} />
              <Route path="/profile/privacy" component={PrivacySettings} />
              <Route path="/community" component={CommunityImpact} />
              <Route path="/community-impact" component={CommunityImpact} />
              <Route path="/impact" component={CommunityImpact} />
              <Route path="/admin" component={AdminDashboard} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
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
