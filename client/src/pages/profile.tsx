import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import WishlistCard from "@/components/wishlist-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  Mail,
  Shield,
  List,
  Search,
  Archive,
  LogOut,
  Award,
  Edit
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Set document title and handle URL hash navigation
  useEffect(() => {
    document.title = 'Dashboard - MyNeedfully';
    
    // Check for hash fragment in URL and navigate to appropriate section
    const hash = window.location.hash;
    if (hash === '#my-lists') {
      setActiveTab('lists');
    }
    
    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash;
      if (newHash === '#my-lists') {
        setActiveTab('lists');
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const { data: userWishlists } = useQuery({
    queryKey: ['/api/user/wishlists'],
    enabled: !!user,
  });

  const { data: userDonations } = useQuery({
    queryKey: ['/api/user/donations'],
    enabled: !!user,
  });

  const { data: thankYouNotes } = useQuery({
    queryKey: ['/api/thank-you-notes'],
    enabled: !!user?.id,
  });

  // Calculate dynamic profile completion
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    let completed = 0;
    const total = 10; // Total possible completion items
    
    // Basic profile fields (4 points)
    if (user.firstName) completed += 1;
    if (user.lastName) completed += 1;
    if (user.email) completed += 1;
    if (user.profileImageUrl) completed += 1;
    
    // Profile engagement (3 points)
    if (userWishlists && userWishlists.length > 0) completed += 1;
    if (userDonations && userDonations.length > 0) completed += 1;
    if (thankYouNotes && thankYouNotes.length > 0) completed += 1;
    
    // Additional profile elements (3 points)
    if (user.createdAt) completed += 1; // Account age
    if (user.id) completed += 1; // Member ID exists
    completed += 1; // Default supporter status
    
    return Math.round((completed / total) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  
  // Determine user badges
  const getUserBadges = () => {
    const badges = [];
    
    // Always show supporter badge
    badges.push({
      label: "Supporter",
      color: "bg-coral/10 text-coral border-coral",
      icon: Award
    });
    
    // Show "In Need" badge if user has created any needs lists
    if (userWishlists && userWishlists.length > 0) {
      badges.push({
        label: "In Need",
        color: "bg-blue-50 text-blue-600 border-blue-200",
        icon: Heart
      });
    }
    
    return badges;
  };
  
  const userBadges = getUserBadges();
  const memberSince = new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const activeWishlists = userWishlists?.filter((w: any) => w.status === 'active') || [];
  const completedWishlists = userWishlists?.filter((w: any) => w.status === 'completed') || [];
  const totalItemsReceived = userWishlists?.reduce((sum: number, w: any) => sum + w.fulfilledItems, 0) || 0;
  const totalViews = userWishlists?.reduce((sum: number, w: any) => sum + w.viewCount, 0) || 0;

  const sidebarItems = [
    { id: 'profile', label: 'My Profile', icon: User, active: activeTab === 'profile' },
    { id: 'lists', label: 'My Lists', icon: List, active: activeTab === 'lists' },
    { id: 'privacy', label: 'Privacy Settings', icon: Settings, active: activeTab === 'privacy' },
    { id: 'create', label: 'Create List', icon: Gift, active: activeTab === 'create' },
    { id: 'find', label: 'Find Lists', icon: Search, active: activeTab === 'find' },
    { id: 'archive', label: 'Archive List', icon: Archive, active: activeTab === 'archive' },
  ];

  const getCompletionTasks = () => {
    const tasks = [];
    
    if (!user?.profileImageUrl) {
      tasks.push({
        title: "Add Profile Photo",
        description: "Help the community connect with you",
        action: "Upload"
      });
    }
    
    if (!userWishlists || userWishlists.length === 0) {
      tasks.push({
        title: "Create Your First Needs List",
        description: "Share what you need with the community",
        action: "Create"
      });
    }
    
    if (!user?.lastName) {
      tasks.push({
        title: "Complete Your Name",
        description: "Add your last name for better trust",
        action: "Add"
      });
    }
    
    return tasks;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Please Log In</h3>
            <p className="text-gray-600">You need to be logged in to view your profile.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your profile, needs lists, and community connections</p>
        </div>
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            {/* Profile Summary Card */}
            <Card className="mb-6">
              <CardContent className="p-6 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName || 'User'} />
                  <AvatarFallback className="text-xl bg-coral text-white">
                    {user.firstName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-navy mb-1">
                  Hi, {user.firstName}!
                </h3>
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  {userBadges.map((badge, index) => {
                    const IconComponent = badge.icon;
                    return (
                      <Badge key={index} variant="outline" className={badge.color}>
                        <IconComponent className="mr-1 h-3 w-3" />
                        {badge.label}
                      </Badge>
                    );
                  })}
                </div>
                
                <div className="text-left">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Profile completion</span>
                    <span className="font-semibold">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <Link 
                      key={item.id}
                      href={
                        item.id === 'profile' ? '/profile' :
                        item.id === 'lists' ? '/profile' :
                        item.id === 'privacy' ? '/profile/privacy' :
                        item.id === 'create' ? '/create' :
                        item.id === 'find' ? '/find' :
                        item.id === 'archive' ? '/profile' : '/profile'
                      }
                    >
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          item.active 
                            ? 'bg-coral text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    </Link>
                  ))}
                  
                  <div className="border-t pt-2 mt-4">
                    <button 
                      onClick={() => window.location.href = '/api/logout'}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Log Out</span>
                    </button>
                  </div>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <>
                {/* Profile Header */}
                <div className="mb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-navy">
                          {user.firstName} {user.lastName || ''}
                        </h1>
                        <Badge className="bg-coral text-white">
                          <Shield className="mr-1 h-3 w-3" />
                          Supporter
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">
                        I'm {user.firstName} who loves to help people. My name is {user.firstName}.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Member since {memberSince}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-coral mb-1">{profileCompletion}%</div>
                      <div className="text-sm text-gray-600 mb-4">Complete Profile</div>
                      <Link href="/profile/edit">
                        <Button className="bg-coral hover:bg-coral/90">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Profile Stats */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-coral" />
                      <span>Profile Stats</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <div className="text-lg font-semibold text-navy">Profile Completion</div>
                        <div className="text-2xl font-bold text-coral">{profileCompletion}%</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-navy">Account Type</div>
                        <div className="text-xl font-semibold text-gray-700">
                          {userWishlists && userWishlists.length > 0 ? "Supporter & Creator" : "Supporter"}
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-navy">Member ID</div>
                        <div className="text-xl font-semibold text-gray-700">#{user.id?.slice(-6) || '000000'}</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-navy">Account Status</div>
                        <div className={`text-xl font-semibold ${user?.isVerified ? 'text-green-600' : 'text-orange-500'}`}>
                          {user?.isVerified ? 'Verified' : 'Unverified'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Complete Your Profile */}
                {getCompletionTasks().length > 0 && (
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Complete Your Profile</CardTitle>
                      <p className="text-gray-600">Add these details to improve your profile and build trust in the community:</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getCompletionTasks().map((task, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-semibold">{task.title}</h4>
                              <p className="text-sm text-gray-600">{task.description}</p>
                            </div>
                            {task.title === "Add Profile Photo" ? (
                              <Link href="/profile/edit">
                                <Button variant="outline" size="sm">{task.action}</Button>
                              </Link>
                            ) : task.title === "Create Your First Needs List" ? (
                              <Link href="/create">
                                <Button variant="outline" size="sm">{task.action}</Button>
                              </Link>
                            ) : (
                              <Button variant="outline" size="sm">{task.action}</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Activity Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Heart className="mx-auto h-8 w-8 text-coral mb-3" />
                      <div className="text-2xl font-bold text-navy mb-1">
                        {userDonations?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Items Supported</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Gift className="mx-auto h-8 w-8 text-coral mb-3" />
                      <div className="text-2xl font-bold text-navy mb-1">
                        {userWishlists?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Needs Lists Created</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Award className="mx-auto h-8 w-8 text-coral mb-3" />
                      <div className="text-2xl font-bold text-navy mb-1">
                        {thankYouNotes?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Thank You Notes</div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === 'lists' && (
              <div className="space-y-6">
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
                          <WishlistCard key={wishlist.id} wishlist={wishlist} isOwner={true} />
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
                          <WishlistCard key={wishlist.id} wishlist={wishlist} isOwner={true} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Other tabs can be implemented similarly */}
            {activeTab !== 'profile' && activeTab !== 'lists' && (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-gray-600">This feature is currently under development.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}