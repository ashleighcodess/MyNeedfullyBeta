import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import WishlistCard from "@/components/wishlist-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  User, 
  Heart, 
  Gift, 
  MessageSquare, 
  Settings, 
  Plus,
  Calendar,
  MapPin,
  Check,
  Clock,
  Eye,
  TrendingUp
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const { data: userWishlists } = useQuery({
    queryKey: [`/api/users/${user?.id}/wishlists`],
    enabled: !!user?.id,
  });

  const { data: userDonations } = useQuery({
    queryKey: [`/api/users/${user?.id}/donations`],
    enabled: !!user?.id,
  });

  const { data: thankYouNotes } = useQuery({
    queryKey: ['/api/thank-you-notes'],
    enabled: !!user?.id,
  });

  const activeWishlists = userWishlists?.filter((w: any) => w.status === 'active') || [];
  const completedWishlists = userWishlists?.filter((w: any) => w.status === 'completed') || [];
  const totalItemsReceived = userWishlists?.reduce((sum: number, w: any) => sum + w.fulfilledItems, 0) || 0;
  const totalViews = userWishlists?.reduce((sum: number, w: any) => sum + w.viewCount, 0) || 0;

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-coral/20"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-coral/10 rounded-full flex items-center justify-center border-4 border-coral/20">
                      <User className="h-12 w-12 text-coral" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-navy mb-1">
                        {user?.firstName} {user?.lastName}
                      </h1>
                      <p className="text-gray-600 mb-2">{user?.email}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          Joined {new Date(user?.createdAt || '').toLocaleDateString()}
                        </div>
                        {user?.isVerified && (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button variant="outline" className="border-coral text-coral hover:bg-coral/10">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-6 w-6 text-coral" />
              </div>
              <div className="text-2xl font-bold text-navy">{userWishlists?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Wishlists</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-navy">{totalItemsReceived}</div>
              <div className="text-sm text-gray-600">Items Received</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-navy">{totalViews}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-navy">{thankYouNotes?.length || 0}</div>
              <div className="text-sm text-gray-600">Thank You Notes</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="wishlists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wishlists">My Wishlists</TabsTrigger>
            <TabsTrigger value="donations">My Donations</TabsTrigger>
            <TabsTrigger value="thank-you">Thank You Notes</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Wishlists Tab */}
          <TabsContent value="wishlists" className="space-y-6">
            {/* Active Wishlists */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-coral" />
                  Active Wishlists ({activeWishlists.length})
                </CardTitle>
                <Link href="/create">
                  <Button className="bg-coral hover:bg-coral/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {activeWishlists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeWishlists.map((wishlist: any) => (
                      <WishlistCard key={wishlist.id} wishlist={wishlist} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">You don't have any active wishlists yet</p>
                    <Link href="/create">
                      <Button className="bg-coral hover:bg-coral/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Wishlist
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Wishlists */}
            {completedWishlists.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-600" />
                    Completed Wishlists ({completedWishlists.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedWishlists.map((wishlist: any) => (
                      <WishlistCard key={wishlist.id} wishlist={wishlist} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="mr-2 h-5 w-5 text-coral" />
                  My Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userDonations && userDonations.length > 0 ? (
                  <div className="space-y-4">
                    {userDonations.map((donation: any) => (
                      <div key={donation.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-navy mb-1">
                              {donation.item?.title || 'Donation'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              To: {donation.wishlist?.title}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                              <Badge className={
                                donation.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                donation.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {donation.status}
                              </Badge>
                            </div>
                          </div>
                          {donation.amount && (
                            <div className="text-lg font-semibold text-coral">
                              ${donation.amount}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">You haven't made any donations yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thank You Notes Tab */}
          <TabsContent value="thank-you">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-coral" />
                  Thank You Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {thankYouNotes && thankYouNotes.length > 0 ? (
                  <div className="space-y-4">
                    {thankYouNotes.map((note: any) => (
                      <div key={note.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-navy mb-1">
                              {note.subject || 'Thank You'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              From: {note.from?.firstName} {note.from?.lastName}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{note.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">No thank you notes yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-coral" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Activity items would be populated from a real activity feed */}
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">No recent activity</p>
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
