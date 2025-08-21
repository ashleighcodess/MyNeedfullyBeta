import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { Bell, Menu, User, Users, Settings, LogOut, Heart, Plus, Search, Zap, BarChart3, List, Shield } from "lucide-react";
import logoPath from "@assets/MyNeedfully_1754922279088.png";
import NotificationCenter from "./notification-center";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [userKey, setUserKey] = useState(0); // Force re-render key
  const { toast } = useToast();

  const { data: notifications } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
    refetchInterval: 60000, // Refresh every 60 seconds instead of aggressive polling
    retry: false,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      apiRequest('POST', '/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "All notifications marked as read",
      });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () =>
      apiRequest('POST', '/api/notifications/clear-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "All notifications cleared",
        description: "Your notification history has been cleared",
      });
    },
  });

  // Listen for user data updates to force re-render
  useEffect(() => {
    const handleUserUpdate = () => {
      setUserKey(prev => prev + 1);
    };
    
    const handleUserLogout = () => {
      setUserKey(prev => prev + 1);
      // Force profile picture refresh on logout
    };
    
    window.addEventListener('userDataUpdated', handleUserUpdate);
    window.addEventListener('userLoggedOut', handleUserLogout);
    
    return () => {
      window.removeEventListener('userDataUpdated', handleUserUpdate);
      window.removeEventListener('userLoggedOut', handleUserLogout);
    };
  }, []);

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { href: "/about-us", label: "About Us", icon: User, dataTip: null, hideWhenAuthenticated: true },
    { href: "/browse", label: "Find Needs Lists", icon: Search, dataTip: "browse-needs" },
    { href: "/create", label: "Create Needs List", icon: Plus, dataTip: "create-needs-list", hideWhenAuthenticated: false },
    { href: "/my-needs-lists", label: "My Needs Lists", icon: List, dataTip: "my-needs-lists", requiresAuth: true },
    { href: "/products", label: "Find Products", icon: Heart, dataTip: "product-search", requiresAuth: true },
  ];

  const isActiveLink = (href: string) => {
    return location === href || location.startsWith(href + '/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <img src={logoPath} alt="MyNeedfully Logo" className="h-8 w-auto" />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.filter(item => 
              (!item.requiresAuth || user) && 
              (!item.hideWhenAuthenticated || !user)
            ).map((item) => (
              <Link key={item.href} href={item.href}>
                <div 
                  {...(item.dataTip && { 'data-tip': item.dataTip })}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActiveLink(item.href)
                      ? 'text-coral bg-coral/10' 
                      : 'text-gray-700 hover:text-coral hover:bg-coral/5'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Side - Mobile First Approach */}
          <div className="flex items-center space-x-2">
            {/* Mobile notifications and user menu - show on small screens when logged in */}
            {user && (
              <div className="flex items-center space-x-2 sm:hidden">
                {/* Mobile Notifications */}
                <div
                  className="relative p-3 h-12 w-12 rounded-md hover:bg-gray-100 touch-manipulation cursor-pointer flex items-center justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setNotificationCenterOpen(true);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setNotificationCenterOpen(true);
                  }}
                  style={{ 
                    WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    zIndex: 9999
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                
                {/* Mobile User Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1">
                      {user?.profileImageUrl ? (
                        <img 
                          key={`user-avatar-mobile-${userKey}`}
                          src={user.profileImageUrl} 
                          alt={`${user?.firstName || 'User'} profile`} 
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 bg-gradient-to-br from-coral to-coral/70 rounded-full flex items-center justify-center ring-2 ring-coral/20 ring-offset-1">
                          <span className="text-white text-xs font-semibold">
                            {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/quick-actions">
                      <DropdownMenuItem className="cursor-pointer">
                        <Zap className="mr-2 h-4 w-4" />
                        Quick Actions
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/my-needs-lists">
                      <DropdownMenuItem className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        My Needs Lists
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    {user?.userType === 'admin' && (
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {/* Always show hamburger menu on small screens */}
            <div className="block sm:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" className="bg-coral text-white border-2 border-coral hover:bg-coral/90 p-2">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 sm:w-80">
                  <SheetHeader>
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>
                      Access MyNeedfully features and account settings
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col space-y-3 mt-6">
                    {navigationItems.filter(item => !item.requiresAuth || user).map((item) => (
                      <Link key={item.href} href={item.href}>
                        <div 
                          className={`w-full flex items-center justify-start text-sm px-3 py-2 rounded-md transition-colors cursor-pointer ${
                            isActiveLink(item.href) ? 'text-coral bg-coral/10' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </div>
                      </Link>
                    ))}
                    
                    {user ? (
                      <div className="border-t pt-4">
                        <Link href="/profile">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/quick-actions">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Zap className="mr-2 h-4 w-4" />
                            Quick Actions
                          </Button>
                        </Link>

                        <Link href="/settings">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            Ready to connect hearts and fulfill needs?
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            Join thousands using MyNeedfully to help families recover from disasters, hardships, and life's unexpected challenges.
                          </p>
                        </div>
                        <Button 
                          className="w-full bg-coral text-white hover:bg-coral/90 py-3 text-base font-semibold mb-3"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            window.location.href = "/signup";
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Needs List
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full py-3 text-base font-semibold"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            window.location.href = "/signup";
                          }}
                        >
                          Get Started Today
                        </Button>
                        <div className="text-center mt-3">
                          <p className="text-xs text-gray-500">
                            Already have an account?{" "}
                            <button 
                              className="text-coral hover:text-coral/80 font-medium"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                window.location.href = "/api/login";
                              }}
                            >
                              Sign In
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop navigation items */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Desktop Notifications */}
              {user && (
                <div className="relative" data-tip="notifications">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative"
                    onClick={() => setNotificationCenterOpen(true)}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              )}

              {/* User Menu or Login Button */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2" data-tip="profile-dashboard">
                      {user?.profileImageUrl ? (
                        <img 
                          key={`user-avatar-desktop-${userKey}`}
                          src={user.profileImageUrl} 
                          alt={`${user?.firstName || 'User'} profile`} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-coral to-coral/70 rounded-full flex items-center justify-center ring-2 ring-coral/20 ring-offset-1">
                          <span className="text-white text-sm font-semibold">
                            {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {user?.firstName || 'Menu'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/quick-actions">
                      <DropdownMenuItem className="cursor-pointer">
                        <Zap className="mr-2 h-4 w-4" />
                        Quick Actions
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/my-needs-lists">
                      <DropdownMenuItem className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        My Needs Lists
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    {user?.userType === 'admin' && (
                      <Link href="/admin">
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/login"}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Center Sheet */}
      <Sheet open={notificationCenterOpen} onOpenChange={setNotificationCenterOpen}>
        <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              {notifications && notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAllAsReadMutation.mutate()}
                      disabled={markAllAsReadMutation.isPending}
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearAllMutation.mutate()}
                    disabled={clearAllMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </SheetTitle>
            <SheetDescription>
              View and manage your notifications
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4">
            {notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.isRead ? 'bg-gray-50' : 'bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <Bell className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
