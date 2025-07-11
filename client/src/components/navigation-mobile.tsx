import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
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
import { Bell, Menu, User, Users, Settings, LogOut, Heart, Plus, Search, Zap, BarChart3, List, Home } from "lucide-react";
import logoPath from "@assets/Logo_5_1751660244282.png";
import NotificationCenter from "./notification-center";

export default function MobileNavigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  const { data: notifications } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { href: "/", label: "Home", icon: Home, dataTip: null },
    { href: "/browse", label: "Find Needs Lists", icon: Search, dataTip: "browse-needs" },
    { href: "/create", label: "Create Needs List", icon: Plus, dataTip: "create-needs-list", requiresAuth: true },
    { href: "/products", label: "Find Products", icon: Heart, dataTip: "product-search" },
    { href: "/about-us", label: "About Us", icon: Users, dataTip: null },
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
            <Link href="/">
              <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                <img src={logoPath} alt="MyNeedfully Logo" className="h-6 sm:h-8 w-auto" />
              </div>
            </Link>
            
            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-1 sm:space-x-2">
              {/* Mobile Notifications */}
              {user && (
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative p-2 h-9 w-9"
                    onClick={() => setNotificationCenterOpen(true)}
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
                        <img 
                          src="/attached_assets/Logo_6_1752017502495.png" 
                          alt="Profile" 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard">
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
                    {navigationItems.filter(item => !item.requiresAuth || user).map((item) => (
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
              {navigationItems.filter(item => !item.requiresAuth || user).map((item) => (
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
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard">
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
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={notificationCenterOpen} 
        onClose={() => setNotificationCenterOpen(false)} 
      />
    </>
  );
}