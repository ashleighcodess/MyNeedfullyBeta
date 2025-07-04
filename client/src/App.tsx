import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import BrowseWishlists from "@/pages/browse-wishlists";
import CreateNeedsList from "@/pages/create-wishlist";
import EditWishlist from "@/pages/edit-wishlist";
import WishlistDetail from "@/pages/wishlist-detail";
import ProductSearch from "@/pages/product-search";
import Profile from "@/pages/profile";
import EditProfile from "@/pages/edit-profile";
import PrivacySettings from "@/pages/privacy-settings";
import AdminDashboard from "@/pages/admin-dashboard";
import AboutUs from "@/pages/about-us";
import Resources from "@/pages/resources";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";
import Footer from "@/components/footer";

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
          
          {isLoading || !isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/home" component={Landing} />
              <Route path="/browse" component={BrowseWishlists} />
              <Route path="/find" component={BrowseWishlists} />
              <Route path="/create" component={CreateNeedsList} />
              <Route path="/edit-wishlist/:id" component={EditWishlist} />
              <Route path="/needslist/:id" component={WishlistDetail} />
              <Route path="/wishlist/:id" component={WishlistDetail} />
              <Route path="/products" component={ProductSearch} />
              <Route path="/search" component={ProductSearch} />
              <Route path="/profile" component={Profile} />
              <Route path="/profile/edit" component={EditProfile} />
              <Route path="/profile/privacy" component={PrivacySettings} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
