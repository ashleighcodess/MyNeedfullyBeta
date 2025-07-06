import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Bell,
  Heart,
  List,
  Menu,
  Search,
  Settings,
  User,
  LogOut,
  Zap,
  ShieldCheck,
  Home,
  Package,
  Users,
  Gift,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import NotificationCenter from './notification-center';
import logoImage from '@assets/Logo_5_1751660244282.png';
import { safeProp, safeArray, safeUser } from '@/lib/api-helpers';

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user'],
    enabled: true,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const unreadCount = safeArray(notifications).filter((n: any) => !safeProp(n, 'read', true)).length;

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      queryClient.clear();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse Needs Lists', icon: List },
    { href: '/products', label: 'Search Products', icon: Search },
    { href: '/community-impact', label: 'Community Impact', icon: Heart },
  ];

  const userMenuItems = [
    { href: '/dashboard', label: 'Quick Actions', icon: Zap },
    { href: '/my-needs-lists', label: 'My Needs Lists', icon: Package },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  if (userLoading) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src={logoImage} alt="MyNeedfully" className="h-8 w-auto" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <img src={logoImage} alt="MyNeedfully" className="h-8 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={`flex items-center space-x-2 ${
                        isActive ? 'bg-coral text-white' : 'text-gray-700 hover:text-coral'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative"
                    onClick={() => setNotificationsOpen(true)}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        {safeProp(user, 'profileImageUrl', '') ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={safeProp(user, 'profileImageUrl', '')} alt="Profile" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8 bg-coral/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-coral" />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {safeProp(user, 'firstName', 'Menu')}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{safeProp(user, 'firstName', '')} {safeProp(user, 'lastName', '')}</p>
                        <p className="text-xs text-gray-500">{safeProp(user, 'email', '')}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Icon className="mr-2 h-4 w-4" />
                              {item.label}
                            </DropdownMenuItem>
                          </Link>
                        );
                      })}
                      <DropdownMenuSeparator />
                      {safeProp(safeUser(user), 'userType', '') === 'admin' && (
                        <Link href="/admin">
                          <DropdownMenuItem className="cursor-pointer">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </DropdownMenuItem>
                        </Link>
                      )}
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/signup">
                    <Button variant="outline">Sign Up</Button>
                  </Link>
                  <Link href="/auth">
                    <Button>Sign In</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="flex flex-col space-y-4 mt-4">
                      {user && (
                        <div className="flex items-center space-x-3 pb-4 border-b">
                          {safeProp(user, 'profileImageUrl', '') ? (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={safeProp(user, 'profileImageUrl', '')} alt="Profile" />
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-coral" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{safeProp(user, 'firstName', '')} {safeProp(user, 'lastName', '')}</p>
                            <p className="text-xs text-gray-500">{safeProp(user, 'email', '')}</p>
                          </div>
                        </div>
                      )}

                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href;
                        return (
                          <Link key={item.href} href={item.href}>
                            <Button
                              variant={isActive ? 'default' : 'ghost'}
                              className={`w-full justify-start ${
                                isActive ? 'bg-coral text-white' : 'text-gray-700'
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Icon className="mr-2 h-4 w-4" />
                              {item.label}
                            </Button>
                          </Link>
                        );
                      })}

                      {user && (
                        <>
                          <div className="border-t pt-4">
                            {userMenuItems.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link key={item.href} href={item.href}>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start mb-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                  </Button>
                                </Link>
                              );
                            })}
                          </div>

                          {safeProp(safeUser(user), 'userType', '') === 'admin' && (
                            <Link href="/admin">
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Admin Dashboard
                              </Button>
                            </Link>
                          )}

                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 mt-4"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleLogout();
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </Button>
                        </>
                      )}

                      {!user && (
                        <div className="flex flex-col space-y-2 mt-4">
                          <Link href="/signup">
                            <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                              Sign Up
                            </Button>
                          </Link>
                          <Link href="/auth">
                            <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                              Sign In
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <NotificationCenter
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        notifications={safeArray(notifications)}
      />
    </>
  );
}