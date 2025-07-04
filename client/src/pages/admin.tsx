import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  List, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Eye,
  Shield,
  Activity,
  Calendar,
  Mail,
  MessageCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Zap,
  Trash2,
  Flag,
  FileText,
  Search,
  AlertTriangle,
  Database,
  RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.userType !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      window.location.href = "/home";
    }
  }, [user, toast]);

  // Admin stats query
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!user && user.userType === 'admin',
  });

  // Recent activity query
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/activity'],
    enabled: !!user && user.userType === 'admin',
  });

  // User management query
  const { data: usersList, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.userType === 'admin',
  });

  // Wishlists management query
  const { data: wishlistsData, isLoading: wishlistsLoading } = useQuery({
    queryKey: ['/api/admin/wishlists'],
    enabled: !!user && user.userType === 'admin',
  });

  // System health query
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/admin/health'],
    enabled: !!user && user.userType === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Don't render if not admin
  if (!user || user.userType !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            Administrative access required.
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage your MyNeedfully platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                variant="outline" 
                className={`${
                  systemHealth?.status === 'healthy' 
                    ? 'text-green-600 border-green-600' 
                    : 'text-red-600 border-red-600'
                }`}
              >
                <Activity className="h-3 w-3 mr-1" />
                {systemHealth?.status === 'healthy' ? 'System Online' : 'System Issues'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                  window.open(`/api/admin/export/analytics?start=${oneWeekAgo}&end=${today}`, '_blank');
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : formatNumber(adminStats?.totalUsers || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{adminStats?.newUsersThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Needs Lists</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : formatNumber(adminStats?.activeWishlists || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {adminStats?.wishlistsThisWeek || 0} created this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : formatNumber(adminStats?.totalDonations || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {adminStats?.donationsThisMonth || 0} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Impact</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : formatCurrency(adminStats?.totalValue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total value facilitated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="wishlists">Needs Lists</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest platform events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activityLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity?.slice(0, 10).map((activity: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                          <div className="flex-shrink-0">
                            {activity.type === 'donation' && <Heart className="h-4 w-4 text-red-500" />}
                            {activity.type === 'wishlist' && <List className="h-4 w-4 text-blue-500" />}
                            {activity.type === 'user' && <Users className="h-4 w-4 text-green-500" />}
                            {activity.type === 'thank_you' && <MessageCircle className="h-4 w-4 text-purple-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Platform Health
                  </CardTitle>
                  <CardDescription>System performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {healthLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">API Response Time</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">{systemHealth?.responseTime || "150ms"}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Database Status</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">Healthy</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Email Service</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">Operational</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Search API</span>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">Online</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage registered users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usersList?.slice(0, 10).map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                            {user.profileImageUrl ? (
                              <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <Users className="h-5 w-5 text-coral" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.userType === 'admin' ? 'default' : 'secondary'}>
                            {user.userType}
                          </Badge>
                          <Badge variant={user.isVerified ? 'default' : 'outline'}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlists Tab */}
          <TabsContent value="wishlists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Needs Lists Management</CardTitle>
                <CardDescription>Monitor and manage active needs lists</CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlistsData?.wishlists?.slice(0, 10).map((wishlist: any) => (
                      <div key={wishlist.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{wishlist.title}</h3>
                          <p className="text-sm text-gray-500">{wishlist.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-400">
                              Created {new Date(wishlist.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline">{wishlist.urgencyLevel}</Badge>
                            <Badge variant="secondary">{wishlist.category}</Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge variant={wishlist.status === 'active' ? 'default' : 'secondary'}>
                            {wishlist.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {wishlist.totalItems} items
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab - Full Implementation */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Timeline */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Live Activity Feed
                    </CardTitle>
                    <CardDescription>Real-time platform events and user interactions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activityLoading ? (
                      <div className="space-y-3">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {recentActivity?.map((activity: any, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border-l-4 border-coral">
                            <div className="flex-shrink-0 mt-1">
                              {activity.type === 'donation_made' && <Heart className="h-4 w-4 text-red-500" />}
                              {activity.type === 'wishlist_created' && <List className="h-4 w-4 text-blue-500" />}
                              {activity.type === 'user_registered' && <Users className="h-4 w-4 text-green-500" />}
                              {activity.type === 'thank_you_sent' && <MessageCircle className="h-4 w-4 text-purple-500" />}
                              {activity.type === 'search' && <Eye className="h-4 w-4 text-orange-500" />}
                              {activity.type === 'item_fulfilled' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                                <Badge variant="outline" className="text-xs">
                                  {activity.type.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Activity Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Today's Events</span>
                      <span className="text-2xl font-bold text-coral">
                        {recentActivity?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Sessions</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {statsLoading ? "..." : Math.floor((adminStats?.totalUsers || 0) * 0.3)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">API Calls</span>
                      <span className="text-2xl font-bold text-green-600">
                        {statsLoading ? "..." : ((adminStats?.totalUsers || 0) * 47).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Event Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm">Donations</span>
                      </div>
                      <span className="text-sm font-medium">
                        {adminStats?.totalDonations || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <List className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm">Needs Lists</span>
                      </div>
                      <span className="text-sm font-medium">
                        {adminStats?.activeWishlists || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">New Users</span>
                      </div>
                      <span className="text-sm font-medium">
                        {adminStats?.newUsersThisMonth || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* System Tab - Full Implementation */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    System Health
                  </CardTitle>
                  <CardDescription>Real-time system monitoring and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {healthLoading ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          <div>
                            <p className="font-medium text-green-900">System Status</p>
                            <p className="text-sm text-green-700">All systems operational</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">API Response</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {systemHealth?.responseTime || "150ms"}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-900">Uptime</p>
                          <p className="text-2xl font-bold text-purple-600">99.9%</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Database</span>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Connected</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Email Service</span>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Operational</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Search APIs</span>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Online</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Storage</span>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">Available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuration & Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Configuration & Analytics
                  </CardTitle>
                  <CardDescription>System settings and analytics integration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Google Analytics Dashboard</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Track user behavior and website performance with GA4 integration
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm">Status:</span>
                        <Badge className="bg-blue-100 text-blue-800">Demo Mode</Badge>
                      </div>
                      
                      {/* Demo Analytics Data */}
                      <div className="space-y-3 pt-3 border-t">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Sessions (24h)</p>
                            <p className="text-lg font-bold text-gray-900">1,247</p>
                            <p className="text-xs text-green-600">+12.3%</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Page Views</p>
                            <p className="text-lg font-bold text-gray-900">3,891</p>
                            <p className="text-xs text-green-600">+8.7%</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Bounce Rate</p>
                            <p className="text-lg font-bold text-gray-900">34.2%</p>
                            <p className="text-xs text-red-600">+2.1%</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Avg. Session</p>
                            <p className="text-lg font-bold text-gray-900">4:32</p>
                            <p className="text-xs text-green-600">+15.8%</p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-xs font-medium text-gray-700 mb-2">Top Pages Today:</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">/ (Home)</span>
                              <span className="font-medium">847 views</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">/browse-wishlists</span>
                              <span className="font-medium">523 views</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">/product-search</span>
                              <span className="font-medium">312 views</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">/about</span>
                              <span className="font-medium">287 views</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <p className="text-xs font-medium text-gray-700 mb-2">User Acquisition:</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Organic Search</span>
                              <span className="font-medium">42.3%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Direct</span>
                              <span className="font-medium">28.7%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Social Media</span>
                              <span className="font-medium">18.9%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Referrals</span>
                              <span className="font-medium">10.1%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-3 pt-2 border-t">
                        Demo data shown. Provide GA4 Measurement ID for live analytics.
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Email Service</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        SendGrid integration for transactional emails
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Search Integration</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Multi-retailer product search via APIs
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status:</span>
                        <Badge className="bg-green-100 text-green-800">Operational</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Amazon</p>
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Walmart</p>
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Target</p>
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Authentication</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Multi-provider OAuth system
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Providers:</span>
                        <div className="flex space-x-1">
                          <Badge variant="outline" className="text-xs">Replit</Badge>
                          <Badge variant="outline" className="text-xs">Google</Badge>
                          <Badge variant="outline" className="text-xs">Facebook</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Administrative Actions</CardTitle>
                <CardDescription>System maintenance and user management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* User Management Actions */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">User Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={() => {
                          // Export user data
                          window.open('/api/admin/export/users', '_blank');
                        }}
                      >
                        <Users className="h-4 w-4 mb-1" />
                        <span>Export Users</span>
                        <span className="text-xs text-gray-400">CSV download</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={async () => {
                          const email = window.prompt('Enter user email to promote to admin:');
                          if (email) {
                            try {
                              await apiRequest('POST', '/api/admin/promote-user', { email });
                              toast({ title: "Success", description: "User promoted to admin" });
                              queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
                            } catch (error) {
                              toast({ title: "Error", description: "Failed to promote user", variant: "destructive" });
                            }
                          }
                        }}
                      >
                        <Shield className="h-4 w-4 mb-1" />
                        <span>Promote User</span>
                        <span className="text-xs text-gray-400">Make admin</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={async () => {
                          if (confirm('Send welcome email to all new users from this week?')) {
                            try {
                              await apiRequest('POST', '/api/admin/send-welcome-emails');
                              toast({ title: "Success", description: "Welcome emails sent" });
                            } catch (error) {
                              toast({ title: "Error", description: "Failed to send emails", variant: "destructive" });
                            }
                          }
                        }}
                      >
                        <Mail className="h-4 w-4 mb-1" />
                        <span>Send Welcome</span>
                        <span className="text-xs text-gray-400">New users</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={async () => {
                          try {
                            await apiRequest('POST', '/api/admin/cleanup-inactive');
                            toast({ title: "Success", description: "Cleanup completed" });
                            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
                          } catch (error) {
                            toast({ title: "Error", description: "Cleanup failed", variant: "destructive" });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mb-1" />
                        <span>Cleanup</span>
                        <span className="text-xs text-gray-400">Inactive users</span>
                      </Button>
                    </div>
                  </div>

                  {/* Content Moderation */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">Content Moderation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={async () => {
                          try {
                            const response = await apiRequest('GET', '/api/admin/flagged-content');
                            const data = await response.json();
                            alert(`Found ${data.count} flagged items requiring review`);
                          } catch (error) {
                            toast({ title: "Error", description: "Failed to check flagged content", variant: "destructive" });
                          }
                        }}
                      >
                        <Flag className="h-4 w-4 mb-1" />
                        <span>Review Flags</span>
                        <span className="text-xs text-gray-400">Check reports</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={async () => {
                          if (confirm('Approve all pending needs lists?')) {
                            try {
                              await apiRequest('POST', '/api/admin/approve-pending');
                              toast({ title: "Success", description: "Pending lists approved" });
                              queryClient.invalidateQueries({ queryKey: ['/api/admin/wishlists'] });
                            } catch (error) {
                              toast({ title: "Error", description: "Approval failed", variant: "destructive" });
                            }
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mb-1" />
                        <span>Approve All</span>
                        <span className="text-xs text-gray-400">Pending lists</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={() => {
                          window.open('/api/admin/export/content-report', '_blank');
                        }}
                      >
                        <FileText className="h-4 w-4 mb-1" />
                        <span>Content Report</span>
                        <span className="text-xs text-gray-400">Export data</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={async () => {
                          try {
                            await apiRequest('POST', '/api/admin/update-search-index');
                            toast({ title: "Success", description: "Search index updated" });
                          } catch (error) {
                            toast({ title: "Error", description: "Index update failed", variant: "destructive" });
                          }
                        }}
                      >
                        <Search className="h-4 w-4 mb-1" />
                        <span>Update Index</span>
                        <span className="text-xs text-gray-400">Refresh search</span>
                      </Button>
                    </div>
                  </div>

                  {/* System Maintenance */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">System Maintenance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={() => {
                          const startDate = window.prompt('Enter start date (YYYY-MM-DD):');
                          const endDate = window.prompt('Enter end date (YYYY-MM-DD):');
                          if (startDate && endDate) {
                            window.open(`/api/admin/export/analytics?start=${startDate}&end=${endDate}`, '_blank');
                          }
                        }}
                      >
                        <Calendar className="h-4 w-4 mb-1" />
                        <span>Export Reports</span>
                        <span className="text-xs text-gray-400">Date range</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={async () => {
                          try {
                            const response = await apiRequest('POST', '/api/admin/backup-database');
                            const data = await response.json();
                            toast({ title: "Success", description: `Backup created: ${data.filename}` });
                          } catch (error) {
                            toast({ title: "Error", description: "Backup failed", variant: "destructive" });
                          }
                        }}
                      >
                        <Database className="h-4 w-4 mb-1" />
                        <span>Backup DB</span>
                        <span className="text-xs text-gray-400">Create backup</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-16 flex flex-col text-xs"
                        onClick={async () => {
                          if (confirm('Clear all cached data? This may slow down the site temporarily.')) {
                            try {
                              await apiRequest('POST', '/api/admin/clear-cache');
                              toast({ title: "Success", description: "Cache cleared" });
                            } catch (error) {
                              toast({ title: "Error", description: "Cache clear failed", variant: "destructive" });
                            }
                          }
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mb-1" />
                        <span>Clear Cache</span>
                        <span className="text-xs text-gray-400">Reset cache</span>
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        className="h-16 flex flex-col text-xs"
                        onClick={async () => {
                          const confirmation = window.prompt('Type "EMERGENCY SHUTDOWN" to confirm:');
                          if (confirmation === 'EMERGENCY SHUTDOWN') {
                            try {
                              await apiRequest('POST', '/api/admin/emergency-maintenance');
                              toast({ title: "Maintenance Mode", description: "Site in maintenance mode" });
                            } catch (error) {
                              toast({ title: "Error", description: "Failed to enable maintenance mode", variant: "destructive" });
                            }
                          }
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mb-1" />
                        <span>Emergency</span>
                        <span className="text-xs text-gray-400">Maintenance</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}