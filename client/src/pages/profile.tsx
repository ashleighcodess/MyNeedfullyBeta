import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  MessageCircle, 
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
  X,
  Pause,
  EyeOff,
  Award,
  Edit,
  ShoppingCart,
  RefreshCw
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notesFilter, setNotesFilter] = useState('all'); // 'all', 'sent', 'received'
  const [userKey, setUserKey] = useState(0); // Force re-render key
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Email verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/auth/resend-verification');
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for verification instructions.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    },
  });

  // Set document title and handle URL hash navigation
  useEffect(() => {
    document.title = 'Dashboard - MyNeedfully';
    
    // Check for URL parameters to navigate to specific tab
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'archive') {
      setActiveTab('archive');
    }
    
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
    
    // Listen for user data updates to force re-render
    const handleUserUpdate = () => {
      setUserKey(prev => prev + 1);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('userDataUpdated', handleUserUpdate);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('userDataUpdated', handleUserUpdate);
    };
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

  // Restore wishlist mutation
  const restoreWishlistMutation = useMutation({
    mutationFn: (wishlistId: number) =>
      apiRequest('PATCH', `/api/wishlists/${wishlistId}`, { status: 'active' }),
    onSuccess: () => {
      toast({
        title: "Needs List Restored",
        description: "Your needs list has been restored and is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/wishlists'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore needs list. Please try again.",
        variant: "destructive",
      });
    },
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
    { id: 'purchases', label: 'My Purchases', icon: ShoppingCart, active: activeTab === 'purchases' },
    { id: 'thankyou', label: 'Thank You Notes', icon: MessageCircle, active: activeTab === 'thankyou' },
    { id: 'privacy', label: 'Privacy Settings', icon: Settings, active: activeTab === 'privacy' },
    { id: 'create', label: 'Create List', icon: Gift, active: activeTab === 'create' },
    { id: 'find', label: 'Find Lists', icon: Search, active: activeTab === 'find' },
    { id: 'archive', label: 'Archive List', icon: Archive, active: activeTab === 'archive' },
  ];

  // Enhanced gamified profile completion system
  const getProfileCompletionData = () => {
    const tasks = [
      {
        id: 'profile_photo',
        title: "Add Profile Photo",
        description: "Help the community connect with you",
        points: 20,
        completed: !!user?.profileImageUrl,
        action: () => window.location.href = '/profile/edit',
        icon: User,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
      },
      {
        id: 'complete_name',
        title: "Complete Your Name",
        description: "Add your full name for better trust",
        points: 15,
        completed: !!(user?.firstName && user?.lastName),
        action: () => setActiveTab('privacy'),
        icon: User,
        color: 'text-green-500',
        bgColor: 'bg-green-50'
      },
      {
        id: 'first_needs_list',
        title: "Create Your First Needs List",
        description: "Share what you need with the community",
        points: 50,
        completed: !!(userWishlists && userWishlists.length > 0),
        action: () => window.location.href = '/create',
        icon: Gift,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50'
      },
      {
        id: 'email_verified',
        title: "Verify Your Email",
        description: "Confirm your email address",
        points: 25,
        completed: !!user?.isVerified,
        action: () => {
          if (!user?.isVerified) {
            resendVerificationMutation.mutate();
          }
        },
        icon: Mail,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50'
      },
      {
        id: 'first_purchase',
        title: "Support Someone",
        description: "Make your first purchase to help someone",
        points: 100,
        completed: !!(userDonations && userDonations.length > 0),
        action: () => window.location.href = '/browse',
        icon: Heart,
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      },
      {
        id: 'thank_you_note',
        title: "Send a Thank You Note",
        description: "Express gratitude to a supporter",
        points: 30,
        completed: !!(thankYouNotes && thankYouNotes.filter((note: any) => note.fromUserId === user?.id).length > 0),
        action: () => setActiveTab('thankyou'),
        icon: MessageCircle,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50'
      }
    ];

    const completedTasks = tasks.filter(task => task.completed);
    const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    const earnedPoints = completedTasks.reduce((sum, task) => sum + task.points, 0);
    const completionPercentage = Math.round((earnedPoints / totalPoints) * 100);

    return {
      tasks,
      completedTasks,
      totalPoints,
      earnedPoints,
      completionPercentage,
      pendingTasks: tasks.filter(task => !task.completed)
    };
  };

  const getAchievementLevel = (percentage: number) => {
    if (percentage >= 100) return { level: 'Champion', emoji: '🏆', color: 'text-yellow-500' };
    if (percentage >= 80) return { level: 'Expert', emoji: '🌟', color: 'text-purple-500' };
    if (percentage >= 60) return { level: 'Explorer', emoji: '🎯', color: 'text-blue-500' };
    if (percentage >= 40) return { level: 'Builder', emoji: '🔨', color: 'text-green-500' };
    if (percentage >= 20) return { level: 'Starter', emoji: '🌱', color: 'text-orange-500' };
    return { level: 'Beginner', emoji: '✨', color: 'text-gray-500' };
  };

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy">Dashboard</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your profile, needs lists, and community connections</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - Mobile: Stack on top, Desktop: Side */}
          <div className="lg:w-64 lg:flex-shrink-0">
            {/* Profile Summary Card */}
            <Card className="mb-4 lg:mb-6">
              <CardContent className="p-4 sm:p-6 text-center">
                <Avatar className="h-16 sm:h-20 w-16 sm:w-20 mx-auto mb-3 sm:mb-4">
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName || 'User'} />
                  <AvatarFallback className="text-lg sm:text-xl bg-gradient-to-br from-coral to-coral/70 text-white font-bold">
                    {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-navy mb-1 text-lg">
                  Hi, {user.firstName}!
                </h3>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4 justify-center">
                  {userBadges.map((badge, index) => {
                    const IconComponent = badge.icon;
                    return (
                      <Badge key={index} variant="outline" className={`${badge.color} text-xs`}>
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

            {/* Navigation Menu - Hidden on mobile, use mobile tabs instead */}
            <Card className="hidden lg:block">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    // For external navigation items, use Link
                    if (item.id === 'privacy' || item.id === 'create' || item.id === 'find') {
                      return (
                        <Link key={item.id} href={
                          item.id === 'privacy' ? '/profile/privacy' :
                          item.id === 'create' ? '/create' :
                          item.id === 'find' ? '/browse' : '/profile'
                        }>
                          <div className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                            item.active 
                              ? 'bg-coral text-white' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}>
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.label}</span>
                          </div>
                        </Link>
                      );
                    }
                    
                    // For internal tab navigation, use button
                    return (
                      <button
                        key={item.id}
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
                    );
                  })}
                  
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
            
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden mb-4">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
                {sidebarItems.filter(item => !['privacy', 'create', 'find'].includes(item.id)).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      item.active 
                        ? 'bg-coral text-white' 
                        : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="hidden xs:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <>
                {/* Profile Header */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-navy">
                          {user.firstName} {user.lastName || ''}
                        </h1>
                        <Badge className="bg-coral text-white w-fit mt-2 sm:mt-0">
                          <Shield className="mr-1 h-3 w-3" />
                          Supporter
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        I'm {user.firstName} who loves to help people. My name is {user.firstName}.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>Member since {memberSince}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-coral mb-1">{profileCompletion}%</div>
                      <div className="text-sm text-gray-600 mb-3 sm:mb-4">Complete Profile</div>
                      <Link href="/profile/edit">
                        <Button className="bg-coral hover:bg-coral/90 w-full sm:w-auto">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Profile Stats */}
                <Card className="mb-6 sm:mb-8">
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center space-x-2 text-lg">
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

                {/* Gamified Complete Your Profile */}
                {(() => {
                  const completionData = getProfileCompletionData();
                  const achievement = getAchievementLevel(completionData.completionPercentage);
                  
                  return (
                    <Card className="mb-8 bg-gradient-to-br from-coral/5 to-purple/5 border-coral/20">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-coral/10 rounded-full">
                              <Award className="h-6 w-6 text-coral" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">Profile Journey</CardTitle>
                              <p className="text-gray-600 text-sm">Level up your community impact!</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-coral flex items-center space-x-2">
                              <span className="text-xl">{achievement.emoji}</span>
                              <span>{completionData.completionPercentage}%</span>
                            </div>
                            <div className={`text-sm font-medium ${achievement.color}`}>
                              {achievement.level}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold">{completionData.earnedPoints} / {completionData.totalPoints} points</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-coral to-purple h-3 rounded-full transition-all duration-500"
                              style={{ width: `${completionData.completionPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Achievement Levels */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
                          {[
                            { level: 'Beginner', emoji: '✨', min: 0 },
                            { level: 'Starter', emoji: '🌱', min: 20 },
                            { level: 'Builder', emoji: '🔨', min: 40 },
                            { level: 'Explorer', emoji: '🎯', min: 60 },
                            { level: 'Expert', emoji: '🌟', min: 80 },
                            { level: 'Champion', emoji: '🏆', min: 100 }
                          ].map((level, index) => (
                            <div 
                              key={index}
                              className={`text-center p-2 rounded-lg border-2 transition-all ${
                                completionData.completionPercentage >= level.min 
                                  ? 'bg-coral text-white border-coral' 
                                  : 'bg-gray-50 border-gray-200 text-gray-400'
                              }`}
                            >
                              <div className="text-lg">{level.emoji}</div>
                              <div className="text-xs font-medium">{level.level}</div>
                            </div>
                          ))}
                        </div>

                        {/* Pending Tasks */}
                        {completionData.pendingTasks.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 mb-4">Complete These Tasks:</h4>
                            {completionData.pendingTasks.map((task) => (
                              <div 
                                key={task.id}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-coral/30 transition-all cursor-pointer"
                                onClick={task.action}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${task.bgColor}`}>
                                    <task.icon className={`h-5 w-5 ${task.color}`} />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                    <p className="text-sm text-gray-600">{task.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-coral">+{task.points}</div>
                                  <div className="text-xs text-gray-500">points</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Completed Tasks */}
                        {completionData.completedTasks.length > 0 && (
                          <div className="mt-6 pt-6 border-t">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <Check className="h-5 w-5 text-green-500" />
                              <span>Completed ({completionData.completedTasks.length})</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {completionData.completedTasks.map((task) => (
                                <div 
                                  key={task.id}
                                  className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                                >
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <task.icon className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-green-900">{task.title}</h4>
                                    <p className="text-sm text-green-700">+{task.points} points earned</p>
                                  </div>
                                  <Check className="h-5 w-5 text-green-500" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Completion Celebration */}
                        {completionData.completionPercentage === 100 && (
                          <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🎉</div>
                              <h3 className="text-xl font-bold text-yellow-800 mb-2">
                                Congratulations, Champion!
                              </h3>
                              <p className="text-yellow-700">
                                You've completed your profile journey and earned all {completionData.totalPoints} points!
                                You're now a verified community champion ready to make maximum impact.
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Activity Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-coral/30"
                    onClick={() => setActiveTab('purchases')}
                  >
                    <CardContent className="p-6 text-center">
                      <Heart className="mx-auto h-8 w-8 text-coral mb-3" />
                      <div className="text-2xl font-bold text-navy mb-1">
                        {userDonations?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Items Supported</div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-coral/30"
                    onClick={() => setActiveTab('lists')}
                  >
                    <CardContent className="p-6 text-center">
                      <Gift className="mx-auto h-8 w-8 text-coral mb-3" />
                      <div className="text-2xl font-bold text-navy mb-1">
                        {userWishlists?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Needs Lists Created</div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-coral/30"
                    onClick={() => setActiveTab('thankyou')}
                  >
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
              <div className="space-y-4 sm:space-y-6">
                {/* Active Wishlists */}
                <Card>
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-coral" />
                      Active Wishlists ({activeWishlists.length})
                    </CardTitle>
                    <Link href="/create">
                      <Button className="bg-coral hover:bg-coral/90 w-full sm:w-auto text-sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {activeWishlists.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {activeWishlists.map((wishlist: any) => (
                          <WishlistCard key={wishlist.id} wishlist={wishlist} isOwner={true} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <Heart className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-3 sm:mb-4" />
                        <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">You don't have any active wishlists yet</p>
                        <Link href="/create">
                          <Button className="bg-coral hover:bg-coral/90 w-full sm:w-auto">
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
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center text-lg sm:text-xl">
                        <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        Completed Wishlists ({completedWishlists.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {completedWishlists.map((wishlist: any) => (
                          <WishlistCard key={wishlist.id} wishlist={wishlist} isOwner={true} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Thank You Notes Section */}
            {activeTab === 'thankyou' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Thank You Notes</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Messages of gratitude shared within our community</p>
                </div>

                {/* Filter Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div 
                    className={`cursor-pointer rounded-xl p-4 sm:p-6 border-2 transition-all hover:shadow-lg ${
                      notesFilter === 'all' 
                        ? 'bg-navy text-white border-navy' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setNotesFilter('all')}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 sm:p-3 rounded-lg ${notesFilter === 'all' ? 'bg-white/20' : 'bg-gray-100'}`}>
                        <MessageSquare className={`h-5 w-5 sm:h-6 sm:w-6 ${notesFilter === 'all' ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="text-xl sm:text-2xl font-bold">
                          {thankYouNotes?.length || 0}
                        </div>
                        <div className="text-xs sm:text-sm opacity-80">All Notes</div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`cursor-pointer rounded-xl p-4 sm:p-6 border-2 transition-all hover:shadow-lg ${
                      notesFilter === 'sent' 
                        ? 'bg-coral text-white border-coral' 
                        : 'bg-gradient-to-r from-coral/10 to-coral/5 border-coral/20 hover:border-coral/30'
                    }`}
                    onClick={() => setNotesFilter('sent')}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 sm:p-3 rounded-lg ${notesFilter === 'sent' ? 'bg-white/20' : 'bg-coral'}`}>
                        <MessageCircle className={`h-5 w-5 sm:h-6 sm:w-6 ${notesFilter === 'sent' ? 'text-white' : 'text-white'}`} />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="text-xl sm:text-2xl font-bold">
                          {thankYouNotes?.filter((note: any) => note.fromUserId === user?.id).length || 0}
                        </div>
                        <div className="text-xs sm:text-sm opacity-80">Notes Sent</div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`cursor-pointer rounded-xl p-4 sm:p-6 border-2 transition-all hover:shadow-lg ${
                      notesFilter === 'received' 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'bg-gradient-to-r from-green-50 to-green-25 border-green-200 hover:border-green-300'
                    }`}
                    onClick={() => setNotesFilter('received')}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 sm:p-3 rounded-lg ${notesFilter === 'received' ? 'bg-white/20' : 'bg-green-500'}`}>
                        <Heart className={`h-5 w-5 sm:h-6 sm:w-6 ${notesFilter === 'received' ? 'text-white' : 'text-white'}`} />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="text-xl sm:text-2xl font-bold">
                          {thankYouNotes?.filter((note: any) => note.toUserId === user?.id).length || 0}
                        </div>
                        <div className="text-xs sm:text-sm opacity-80">Notes Received</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-6">
                  {(() => {
                    let filteredNotes = thankYouNotes || [];
                    
                    if (notesFilter === 'sent') {
                      filteredNotes = filteredNotes.filter((note: any) => note.fromUserId === user?.id);
                    } else if (notesFilter === 'received') {
                      filteredNotes = filteredNotes.filter((note: any) => note.toUserId === user?.id);
                    }
                    
                    return filteredNotes.length > 0 ? (
                      <div className="space-y-6">
                        {notesFilter === 'all' ? (
                          // For "All Notes" view, group by type with section headers
                          <>
                            {/* Sent Notes Section */}
                            {filteredNotes.filter((note: any) => note.fromUserId === user?.id).length > 0 && (
                              <div>
                                <div className="flex items-center mb-4">
                                  <div className="p-2 bg-coral rounded-lg mr-3">
                                    <MessageCircle className="h-5 w-5 text-white" />
                                  </div>
                                  <h3 className="text-lg font-semibold text-navy">Notes You've Sent ({filteredNotes.filter((note: any) => note.fromUserId === user?.id).length})</h3>
                                </div>
                                <div className="space-y-3">
                                  {filteredNotes.filter((note: any) => note.fromUserId === user?.id).map((note: any) => (
                                    <div 
                                      key={note.id} 
                                      className="p-5 rounded-lg bg-coral/5 border border-coral/20 hover:border-coral/30 transition-all hover:shadow-md"
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                          <div className="p-1.5 bg-coral rounded-full">
                                            <MessageCircle className="h-3 w-3 text-white" />
                                          </div>
                                          <div>
                                            <div className="font-medium text-navy">To: {note.touserfirstname && note.touserlastname ? `${note.touserfirstname} ${note.touserlastname}` : note.touserfirstname || 'Anonymous'}</div>
                                            <div className="text-xs text-gray-500">
                                              {new Date(note.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-coral/10 text-coral text-xs">
                                          Sent
                                        </Badge>
                                      </div>
                                      <p className="text-gray-700 text-sm italic mb-3">"{note.message}"</p>
                                      {note.wishlistTitle && (
                                        <div className="flex items-center text-xs text-gray-600 bg-white/70 rounded p-2">
                                          <Gift className="h-3 w-3 mr-1.5" />
                                          <span>For: <span className="font-medium">{note.wishlistTitle}</span></span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Received Notes Section */}
                            {filteredNotes.filter((note: any) => note.toUserId === user?.id).length > 0 && (
                              <div>
                                <div className="flex items-center mb-4">
                                  <div className="p-2 bg-green-500 rounded-lg mr-3">
                                    <Heart className="h-5 w-5 text-white" />
                                  </div>
                                  <h3 className="text-lg font-semibold text-navy">Notes You've Received ({filteredNotes.filter((note: any) => note.toUserId === user?.id).length})</h3>
                                </div>
                                <div className="space-y-3">
                                  {filteredNotes.filter((note: any) => note.toUserId === user?.id).map((note: any) => (
                                    <div 
                                      key={note.id} 
                                      className="p-5 rounded-lg bg-green-50 border border-green-200 hover:border-green-300 transition-all hover:shadow-md"
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                          <div className="p-1.5 bg-green-500 rounded-full">
                                            <Heart className="h-3 w-3 text-white" />
                                          </div>
                                          <div>
                                            <div className="font-medium text-navy">From: {note.fromuserfirstname && note.fromuserlastname ? `${note.fromuserfirstname} ${note.fromuserlastname}` : note.fromuserfirstname || 'Anonymous'}</div>
                                            <div className="text-xs text-gray-500">
                                              {new Date(note.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                          Received
                                        </Badge>
                                      </div>
                                      <p className="text-gray-700 text-sm italic mb-3">"{note.message}"</p>
                                      {note.wishlistTitle && (
                                        <div className="flex items-center text-xs text-gray-600 bg-white/70 rounded p-2">
                                          <Gift className="h-3 w-3 mr-1.5" />
                                          <span>For: <span className="font-medium">{note.wishlistTitle}</span></span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          // For filtered views (sent/received only), show single list
                          <div className="space-y-4">
                            {filteredNotes.map((note: any) => {
                              const isSent = note.fromUserId === user?.id;
                              return (
                                <div 
                                  key={note.id} 
                                  className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                                    isSent 
                                      ? 'bg-coral/5 border-coral/20 hover:border-coral/30' 
                                      : 'bg-green-50 border-green-200 hover:border-green-300'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className={`p-2 rounded-full ${isSent ? 'bg-coral' : 'bg-green-500'}`}>
                                        {isSent ? (
                                          <MessageCircle className="h-4 w-4 text-white" />
                                        ) : (
                                          <Heart className="h-4 w-4 text-white" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-navy">
                                          {isSent 
                                            ? `To: ${note.touserfirstname && note.touserlastname ? `${note.touserfirstname} ${note.touserlastname}` : note.touserfirstname || 'Anonymous'}` 
                                            : `From: ${note.fromuserfirstname && note.fromuserlastname ? `${note.fromuserfirstname} ${note.fromuserlastname}` : note.fromuserfirstname || 'Anonymous'}`}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {new Date(note.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge 
                                      variant="secondary" 
                                      className={`${isSent ? 'bg-coral/10 text-coral' : 'bg-green-100 text-green-700'}`}
                                    >
                                      {isSent ? 'Sent' : 'Received'}
                                    </Badge>
                                  </div>
                                  
                                  <div className="mb-4">
                                    <p className="text-gray-700 leading-relaxed italic">"{note.message}"</p>
                                  </div>
                                  
                                  {note.wishlistTitle && (
                                    <div className="flex items-center text-sm text-gray-600 bg-white/50 rounded-lg p-3">
                                      <Gift className="h-4 w-4 mr-2" />
                                      <span>Related to: <span className="font-medium">{note.wishlistTitle}</span></span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                        <div className="text-center py-16">
                          <div className="mb-6">
                            {notesFilter === 'sent' ? (
                              <MessageCircle className="mx-auto h-16 w-16 text-gray-300" />
                            ) : notesFilter === 'received' ? (
                              <Heart className="mx-auto h-16 w-16 text-gray-300" />
                            ) : (
                              <MessageSquare className="mx-auto h-16 w-16 text-gray-300" />
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-navy mb-2">
                            {notesFilter === 'sent' ? 'No Notes Sent Yet' :
                             notesFilter === 'received' ? 'No Notes Received Yet' :
                             'No Thank You Notes Yet'}
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {notesFilter === 'sent' ? 
                              'You haven\'t sent any thank you notes yet. Make a purchase to send your first note of gratitude.' :
                              notesFilter === 'received' ? 
                              'You haven\'t received any thank you notes yet. Create a needs list to start receiving support.' :
                              'Thank you notes will appear here when you send or receive messages of gratitude within our community.'
                            }
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/browse">
                              <Button className="bg-coral hover:bg-coral/90">
                                Browse Needs Lists
                              </Button>
                            </Link>
                            <Link href="/create">
                              <Button variant="outline" className="border-coral text-coral hover:bg-coral hover:text-white">
                                Create Needs List
                              </Button>
                            </Link>
                          </div>
                        </div>
                      );
                  })()}
                </div>
              </div>
            )}

            {/* Purchase History Section */}
            {activeTab === 'purchases' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy">My Purchase History</h2>
                    <p className="text-gray-600 text-sm sm:text-base">Items you've purchased to support others in need</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold text-coral">{userDonations?.length || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Total Items Purchased</div>
                  </div>
                </div>

                {/* Purchase Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-r from-coral to-orange-500 rounded-xl p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Items Purchased</p>
                        <p className="text-xl sm:text-2xl font-bold">{userDonations?.length || 0}</p>
                      </div>
                      <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-navy to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm">People Helped</p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {userDonations ? [...new Set(userDonations.map((d: any) => d.wishlistUserId))].length : 0}
                        </p>
                      </div>
                      <Heart className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  </div>
                </div>

                {/* Purchase List */}
                <div className="space-y-4">
                  {userDonations && userDonations.length > 0 ? (
                    userDonations.map((purchase: any) => {
                      // Get retailer logo/name based on the retailer field
                      const getRetailerInfo = (retailer: string) => {
                        switch(retailer?.toLowerCase()) {
                          case 'amazon':
                            return { name: 'Amazon', color: 'bg-orange-500' };
                          case 'walmart':
                            return { name: 'Walmart', color: 'bg-blue-600' };
                          case 'target':
                            return { name: 'Target', color: 'bg-red-500' };
                          default:
                            return { name: retailer || 'Unknown', color: 'bg-gray-500' };
                        }
                      };
                      
                      const retailerInfo = getRetailerInfo(purchase.retailer);
                      
                      return (
                        <Card key={purchase.id} className="hover:shadow-lg transition-all duration-200">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-start space-x-3 mb-3 sm:mb-4">
                                  <div className="p-2 bg-coral rounded-lg flex-shrink-0">
                                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-navy text-sm sm:text-base leading-tight">{purchase.itemTitle}</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                      Purchased for: <Link 
                                        href={`/wishlist/${purchase.wishlistId}`}
                                        className="font-medium text-coral hover:text-coral/80 underline cursor-pointer transition-colors"
                                      >
                                        {purchase.wishlistTitle}
                                      </Link>
                                    </p>
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                                    <div className={`px-2 sm:px-3 py-1 rounded-full text-white text-xs font-medium ${retailerInfo.color}`}>
                                      {retailerInfo.name}
                                    </div>
                                    <Badge variant="secondary" className="bg-coral text-white text-xs">
                                      Confirmed
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <div className="font-medium">
                                        {new Date(purchase.fulfilledAt || purchase.createdAt).toLocaleDateString('en-US', { 
                                          year: 'numeric', 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {new Date(purchase.fulfilledAt || purchase.createdAt).toLocaleTimeString('en-US', { 
                                          hour: 'numeric', 
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="truncate">{purchase.wishlistLocation || 'Location not specified'}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-gray-600">
                                    <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="truncate">For: {purchase.recipientFirstName && purchase.recipientLastName 
                                      ? `${purchase.recipientFirstName} ${purchase.recipientLastName}` 
                                      : purchase.recipientFirstName || 'Anonymous'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 sm:ml-4">
                                <div className="text-xs sm:text-sm text-gray-600 font-medium">
                                  Qty: {purchase.quantity || 1}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 sm:py-16">
                      <div className="mb-4 sm:mb-6">
                        <ShoppingCart className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-navy mb-2">No Purchases Yet</h3>
                      <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
                        You haven't purchased any items for others yet. Browse needs lists to start supporting your community.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                        <Link href="/browse">
                          <Button className="bg-coral hover:bg-coral/90 text-white w-full sm:w-auto">
                            Browse Needs Lists
                          </Button>
                        </Link>
                        <Link href="/products">
                          <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white w-full sm:w-auto">
                            Shop Emergency Supplies
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Archive Section */}
            {activeTab === 'archive' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Archive Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Archive</h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Completed, cancelled, or private needs lists are automatically archived here
                  </p>
                </div>

                {(() => {
                  // Calculate archived wishlists
                  const archivedWishlists = userWishlists?.filter((w: any) => 
                    w.status === 'completed' || 
                    w.status === 'cancelled' || 
                    w.status === 'paused' ||
                    w.isPublic === false
                  ) || [];

                  if (archivedWishlists.length === 0) {
                    return (
                      <Card>
                        <CardContent className="p-8 sm:p-12 text-center">
                          <Archive className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Archived Lists</h3>
                          <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-md mx-auto">
                            When your needs lists are completed, cancelled, or made private, they'll appear here for easy access.
                          </p>
                          <Link href="/create">
                            <Button className="bg-coral hover:bg-coral/90">
                              <Plus className="mr-2 h-4 w-4" />
                              Create Your First List
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <>
                      {/* Archive Statistics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <Card className="text-center p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {archivedWishlists.filter((w: any) => w.status === 'completed').length}
                          </div>
                          <div className="text-sm text-gray-600">Completed</div>
                        </Card>
                        <Card className="text-center p-4">
                          <div className="text-2xl font-bold text-red-600">
                            {archivedWishlists.filter((w: any) => w.status === 'cancelled').length}
                          </div>
                          <div className="text-sm text-gray-600">Cancelled</div>
                        </Card>
                        <Card className="text-center p-4">
                          <div className="text-2xl font-bold text-yellow-600">
                            {archivedWishlists.filter((w: any) => w.status === 'paused').length}
                          </div>
                          <div className="text-sm text-gray-600">Paused</div>
                        </Card>
                        <Card className="text-center p-4">
                          <div className="text-2xl font-bold text-gray-600">
                            {archivedWishlists.filter((w: any) => w.isPublic === false).length}
                          </div>
                          <div className="text-sm text-gray-600">Private</div>
                        </Card>
                      </div>

                      {/* Completed Lists */}
                      {archivedWishlists.filter((w: any) => w.status === 'completed').length > 0 && (
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg sm:text-xl">
                              <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                              Completed Lists ({archivedWishlists.filter((w: any) => w.status === 'completed').length})
                            </CardTitle>
                            <p className="text-sm text-gray-600">These needs lists have been 100% fulfilled by the community</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                              {archivedWishlists.filter((w: any) => w.status === 'completed').map((wishlist: any) => (
                                <div key={wishlist.id} className="relative">
                                  <WishlistCard wishlist={wishlist} isOwner={true} />
                                  <div className="absolute top-2 right-2">
                                    <Badge className="bg-green-500 text-white">
                                      <Check className="mr-1 h-3 w-3" />
                                      Complete
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Cancelled Lists */}
                      {archivedWishlists.filter((w: any) => w.status === 'cancelled').length > 0 && (
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg sm:text-xl">
                              <X className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                              Cancelled Lists ({archivedWishlists.filter((w: any) => w.status === 'cancelled').length})
                            </CardTitle>
                            <p className="text-sm text-gray-600">These needs lists were cancelled and removed from public view</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                              {archivedWishlists.filter((w: any) => w.status === 'cancelled').map((wishlist: any) => (
                                <div key={wishlist.id} className="relative">
                                  <WishlistCard wishlist={wishlist} isOwner={true} />
                                  <div className="absolute top-2 right-2 flex space-x-2">
                                    <Badge className="bg-red-500 text-white">
                                      <X className="mr-1 h-3 w-3" />
                                      Cancelled
                                    </Badge>
                                  </div>
                                  <div className="absolute bottom-2 left-2 right-2">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        if (confirm('Are you sure you want to restore this needs list? It will become active and visible to the public again.')) {
                                          restoreWishlistMutation.mutate(wishlist.id);
                                        }
                                      }}
                                      disabled={restoreWishlistMutation.isPending}
                                      className="w-full bg-green-600 hover:bg-green-700 text-white mt-2"
                                    >
                                      <RefreshCw className="mr-1 h-3 w-3" />
                                      Restore
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Paused Lists */}
                      {archivedWishlists.filter((w: any) => w.status === 'paused').length > 0 && (
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg sm:text-xl">
                              <Pause className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                              Paused Lists ({archivedWishlists.filter((w: any) => w.status === 'paused').length})
                            </CardTitle>
                            <p className="text-sm text-gray-600">These needs lists are temporarily paused and not accepting new support</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                              {archivedWishlists.filter((w: any) => w.status === 'paused').map((wishlist: any) => (
                                <div key={wishlist.id} className="relative">
                                  <WishlistCard wishlist={wishlist} isOwner={true} />
                                  <div className="absolute top-2 right-2">
                                    <Badge className="bg-yellow-500 text-white">
                                      <Pause className="mr-1 h-3 w-3" />
                                      Paused
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Private Lists */}
                      {archivedWishlists.filter((w: any) => w.isPublic === false).length > 0 && (
                        <Card>
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center text-lg sm:text-xl">
                              <EyeOff className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                              Private Lists ({archivedWishlists.filter((w: any) => w.isPublic === false).length})
                            </CardTitle>
                            <p className="text-sm text-gray-600">These needs lists are set to private and not visible to the public</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                              {archivedWishlists.filter((w: any) => w.isPublic === false).map((wishlist: any) => (
                                <div key={wishlist.id} className="relative">
                                  <WishlistCard wishlist={wishlist} isOwner={true} />
                                  <div className="absolute top-2 right-2">
                                    <Badge className="bg-gray-500 text-white">
                                      <EyeOff className="mr-1 h-3 w-3" />
                                      Private
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {activeTab !== 'profile' && activeTab !== 'lists' && activeTab !== 'thankyou' && activeTab !== 'purchases' && activeTab !== 'archive' && (
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