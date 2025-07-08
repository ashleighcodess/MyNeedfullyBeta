import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Plus,
  Search,
  Heart,
  Gift,
  MessageCircle,
  User,
  Mail,
  TrendingUp,
  BarChart3,
  ShoppingCart,
  List,
  Zap
} from "lucide-react";

export default function QuickActions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data for completion status
  const { data: userWishlists } = useQuery({
    queryKey: ["/api/user/wishlists"],
    enabled: !!user,
  });

  const { data: userDonations } = useQuery({
    queryKey: ["/api/user/donations"],
    enabled: !!user,
  });

  const { data: thankYouNotes } = useQuery({
    queryKey: ["/api/thank-you-notes"],
    enabled: !!user,
  });

  // Email verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/resend-verification");
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const quickActions = [
    {
      id: 'create_needs_list',
      title: "Create Needs List",
      description: "Share what you need with the community",
      href: "/create",
      icon: Plus,
      color: 'text-coral',
      bgColor: 'bg-coral/10',
      completed: !!(userWishlists && userWishlists.length > 0)
    },
    {
      id: 'browse_needs',
      title: "Browse Needs Lists",
      description: "Find ways to help others in your community",
      href: "/browse",
      icon: Search,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      completed: false
    },
    {
      id: 'support_someone',
      title: "Support Someone",
      description: "Purchase items for those in need",
      href: "/browse",
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      completed: !!(userDonations && userDonations.length > 0)
    },
    {
      id: 'find_products',
      title: "Find Products",
      description: "Search for specific items across retailers",
      href: "/products",
      icon: ShoppingCart,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      completed: false
    },
    {
      id: 'my_lists',
      title: "My Needs Lists",
      description: "Manage your created needs lists",
      href: "/my-needs-lists",
      icon: List,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      completed: !!(userWishlists && userWishlists.length > 0)
    },
    {
      id: 'send_thanks',
      title: "Send Thank You",
      description: "Express gratitude to your supporters",
      action: () => window.location.href = '/profile#thankyou',
      icon: MessageCircle,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      completed: !!(thankYouNotes && thankYouNotes.filter((note: any) => note.fromUserId === user?.id).length > 0)
    }
  ];

  const profileActions = [
    {
      id: 'edit_profile',
      title: "Complete Profile",
      description: "Add your photo and personal information",
      href: "/profile/edit",
      icon: User,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      completed: !!(user?.firstName && user?.lastName && user?.profileImageUrl)
    },
    {
      id: 'verify_email',
      title: "Verify Email",
      description: "Confirm your email address for security",
      action: () => {
        if (!user?.isVerified) {
          resendVerificationMutation.mutate();
        }
      },
      icon: Mail,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      completed: !!user?.isVerified
    }
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-coral/10 rounded-full flex items-center justify-center">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-coral" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quick Actions</h1>
            <p className="text-sm sm:text-base text-gray-600">Take action to help your community and manage your needs</p>
          </div>
        </div>
      </div>

      {/* Welcome back message */}
      {user && (
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-coral/5 to-coral/10 border-coral/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-coral/10 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-coral" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Welcome back, {user.firstName || 'Friend'}!
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Ready to make a difference? Choose an action below to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-coral" />
            Community Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action) => (
              <Card key={action.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                {action.href ? (
                  <Link href={action.href}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <action.icon className={`h-6 w-6 ${action.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{action.title}</h3>
                            {action.completed && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                ✓ Done
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                ) : (
                  <CardContent className="p-6" onClick={action.action}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <action.icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{action.title}</h3>
                          {action.completed && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              ✓ Done
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Profile Setup Actions */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-coral" />
            Profile Setup
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {profileActions.map((action) => (
              <Card key={action.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                {action.href ? (
                  <Link href={action.href}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${action.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                          <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{action.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                ) : (
                  <CardContent className="p-4 sm:p-6 cursor-pointer" onClick={action.action}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${action.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                        <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{action.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <Card className="bg-gray-50">
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-coral" />
              View Full Dashboard
            </h3>
            <p className="text-gray-600 mb-4 text-xs sm:text-sm">
              Access your complete profile, statistics, and detailed management options.
            </p>
            <Link href="/profile">
              <Button className="bg-coral hover:bg-coral/90 text-white text-sm sm:text-base w-full sm:w-auto">
                Go to Full Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}