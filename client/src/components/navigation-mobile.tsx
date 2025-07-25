import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bell, Menu, User, Users, Settings, LogOut, Heart, Plus, Search, Zap, BarChart3, List, Home, Check, Gift, X } from "lucide-react";
import logoPath from "@assets/Logo_5_1751660244282.png";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MobileNavigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const { toast } = useToast();

  const { data: notifications } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
    refetchInterval: 60000, // Refresh every 60 seconds instead of aggressive polling
    retry: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest('POST', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'item_fulfilled':
        return <Gift className="h-4 w-4 text-green-600" />;
      case 'purchase_confirmed':
        return <Check className="h-4 w-4 text-blue-600" />;
      case 'thank_you_received':
        return <Heart className="h-4 w-4 text-coral" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { href: "/", label: "Home", icon: Home, dataTip: null },
    { href: "/my-needs-lists", label: "My Needs Lists", icon: List, dataTip: "my-needs-lists", requiresAuth: true },
    { href: "/browse", label: "Find Needs Lists", icon: Search, dataTip: "browse-needs" },
    { href: "/create", label: "Create Needs List", icon: Plus, dataTip: "create-needs-list", requiresAuth: true },
    { href: "/products", label: "Find Products", icon: Heart, dataTip: "product-search", requiresAuth: true },
    { href: "/about-us", label: "About Us", icon: Users, dataTip: null, hideWhenAuthenticated: true },
  ];

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => window.location.href = "/"}>
              <img src={logoPath} alt="MyNeedfully Logo" className="h-6 sm:h-8 w-auto" />
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-1 sm:space-x-2">
              {/* Mobile Notifications */}
              {user && (
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative p-2 h-9 w-9 bg-red-500 hover:bg-red-600"
                    onClick={() => {
                      alert("Notification bell clicked! Opening panel...");
                      setNotificationCenterOpen(true);
                    }}
                    style={{ zIndex: 9999 }}
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              )}

              {/* Mobile User Avatar */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-1.5 h-9 w-9">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-br from-coral to-coral/70 rounded-full flex items-center justify-center ring-1 ring-coral/20 ring-offset-1">
                          <span className="text-white text-xs font-semibold">
                            {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/quick-actions">
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
                          <BarChart3 className="mr-2 h-4 w-4" />
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
              )}

              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 h-9 w-9">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 sm:w-96">
                  <div className="flex flex-col space-y-1 mt-6">
                    <div className="pb-4 mb-4 border-b">
                      <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                    </div>
                    {navigationItems.filter(item => (!item.requiresAuth || user) && (!item.hideWhenAuthenticated || !user)).map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button 
                          variant="ghost" 
                          className={`w-full justify-start text-base py-4 h-auto ${
                            isActiveLink(item.href) ? 'text-coral bg-coral/10' : 'text-gray-700'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                    
                    {!user && (
                      <div className="border-t pt-4 mt-4">
                        <Button 
                          className="w-full bg-coral text-white hover:bg-coral/90 py-3 text-base"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            window.location.href = "/api/login";
                          }}
                        >
                          Sign In / Get Started
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navigationItems.filter(item => (!item.requiresAuth || user) && (!item.hideWhenAuthenticated || !user)).map((item) => (
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
            
            {/* Desktop User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications */}
              {user && (
                <div className="relative" data-tip="notifications">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative"
                    onClick={() => {
                      console.log("Second notification bell clicked!");
                      setNotificationCenterOpen(true);
                    }}
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

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2" data-tip="profile-dashboard">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-coral/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-coral" />
                        </div>
                      )}
                      <span className="hidden lg:block text-sm font-medium">
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
                    <Link href="/quick-actions">
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
                          <BarChart3 className="mr-2 h-4 w-4" />
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
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => window.location.href = "/api/login"} 
                    className="text-gray-700 hover:text-coral"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => window.location.href = "/api/login"} 
                    className="bg-coral text-white hover:bg-coral/90 rounded-full px-6"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Notification Panel */}
      <Sheet open={notificationCenterOpen} onOpenChange={setNotificationCenterOpen}>
        <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
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
          </div>
          
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
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex space-x-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
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
      

    </>
  );
}