import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import NotificationCenter from "@/components/notification-center";
import { useWebSocket } from "@/lib/websocket";
import { Link } from "wouter";
import { 
  Plus, 
  Heart, 
  Search, 
  Gift, 
  TrendingUp, 
  Users,
  Clock,
  MapPin 
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  useWebSocket(); // Enable real-time notifications

  const { data: userWishlists } = useQuery({
    queryKey: [`/api/users/${user?.id}/wishlists`],
    enabled: !!user?.id,
  });

  const { data: featuredWishlists } = useQuery({
    queryKey: ['/api/wishlists/featured'],
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['/api/recent-activity'],
  });

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">
            Welcome back, {user?.firstName || 'Friend'}! 👋
          </h1>
          <p className="text-gray-600">Ready to make a difference today?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-coral" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/create">
                    <Button className="w-full h-20 bg-coral hover:bg-coral/90 flex flex-col items-center justify-center space-y-2">
                      <Plus className="h-6 w-6" />
                      <span>Create Wishlist</span>
                    </Button>
                  </Link>
                  <Link href="/browse">
                    <Button variant="outline" className="w-full h-20 border-coral text-coral hover:bg-coral/10 flex flex-col items-center justify-center space-y-2">
                      <Search className="h-6 w-6" />
                      <span>Browse Needs</span>
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="w-full h-20 border-navy text-navy hover:bg-navy/10 flex flex-col items-center justify-center space-y-2">
                      <Gift className="h-6 w-6" />
                      <span>Find Products</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* My Wishlists */}
            {userWishlists && userWishlists.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-coral" />
                    My Wishlists
                  </CardTitle>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userWishlists.slice(0, 4).map((wishlist: any) => (
                      <Card key={wishlist.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getUrgencyColor(wishlist.urgencyLevel)}>
                            {wishlist.urgencyLevel}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {wishlist.fulfilledItems}/{wishlist.totalItems} fulfilled
                          </span>
                        </div>
                        <h3 className="font-semibold text-navy mb-1">{wishlist.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{wishlist.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="mr-1 h-3 w-3" />
                          {wishlist.location}
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Featured Wishlists */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-coral" />
                  Featured Needs
                </CardTitle>
                <Link href="/browse">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredWishlists?.slice(0, 4).map((wishlist: any) => (
                    <Link key={wishlist.id} href={`/wishlist/${wishlist.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getUrgencyColor(wishlist.urgencyLevel)}>
                              {wishlist.urgencyLevel}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {Math.round((wishlist.fulfilledItems / wishlist.totalItems) * 100)}% complete
                            </span>
                          </div>
                          <h3 className="font-semibold text-navy mb-2">{wishlist.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{wishlist.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {wishlist.location}
                            </div>
                            <span>{wishlist.totalItems} items</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-coral" />
                  Recent Acts of Kindness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-coral/10 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-coral" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">
                            {activity.donor?.firstName || 'Anonymous'}
                          </span>
                          {' '}donated to{' '}
                          <span className="font-semibold">{activity.wishlist?.title}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.item?.title} • {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <NotificationCenter />

            {/* Impact Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-coral">
                      {userWishlists?.reduce((sum: number, w: any) => sum + w.fulfilledItems, 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Items Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-navy">
                      {userWishlists?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Wishlists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userWishlists?.filter((w: any) => w.status === 'completed').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips for Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-coral rounded-full mt-2 flex-shrink-0"></div>
                    <p>Add detailed descriptions to build trust with donors</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-coral rounded-full mt-2 flex-shrink-0"></div>
                    <p>Include photos to show your genuine needs</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-coral rounded-full mt-2 flex-shrink-0"></div>
                    <p>Share your wishlist link with friends and family</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-coral rounded-full mt-2 flex-shrink-0"></div>
                    <p>Send thank you notes to show appreciation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
