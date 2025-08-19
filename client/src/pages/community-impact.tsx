import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Heart, 
  Package, 
  TrendingUp, 
  Globe, 
  Calendar,
  Award,
  Target,
  Zap,
  Activity
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

export default function CommunityImpact() {
  const [timeRange, setTimeRange] = useState("30d");
  const [animatedStats, setAnimatedStats] = useState({
    totalSupport: 0,
    itemsFulfilled: 0,
    familiesHelped: 0,
    donationValue: 0
  });

  // Fetch real platform statistics
  const { data: platformStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/platform-stats'],
    retry: 1,
  });

  // Use platform stats or fallback to initial values
  const finalStats = platformStats ? {
    totalSupport: platformStats.totalSupport || 0,
    itemsFulfilled: platformStats.itemsFulfilled || 0,  
    familiesHelped: platformStats.familiesHelped || 0,
    donationValue: platformStats.donationValue || 0
  } : {
    totalSupport: 0,
    itemsFulfilled: 0,  
    familiesHelped: 0,
    donationValue: 0
  };

  // Sample recent activity data
  const recentActivity = [
    {
      id: "1",
      supporter: "Sarah M.",
      action: "purchased",
      item: "Emergency Food Kit",
      timeAgo: "2 hours ago",
      location: "Austin, TX",
      impact: "Helped a family after flooding",
      type: "purchase"
    },
    {
      id: "2",
      supporter: "Michael R.",
      action: "sent gratitude",
      item: "a heartfelt thank you",
      timeAgo: "4 hours ago",
      location: "Community",
      impact: "Spread kindness and appreciation",
      type: "gratitude"
    },
    {
      id: "3",
      supporter: "Jennifer L.",
      action: "created",
      item: "Baby Essentials List",
      timeAgo: "6 hours ago",
      location: "Phoenix, AZ",
      impact: "Shared their story with the community",
      type: "creation"
    },
    {
      id: "4",
      supporter: "David K.",
      action: "purchased",
      item: "School Supplies Bundle",
      timeAgo: "8 hours ago",
      location: "Miami, FL",
      impact: "Helped children get ready for school",
      type: "purchase"
    },
    {
      id: "5",
      supporter: "Community Member",
      action: "created",
      item: "Medical Recovery List",
      timeAgo: "12 hours ago",
      location: "Seattle, WA",
      impact: "Shared their recovery journey",
      type: "creation"
    }
  ];

  // Animated counter effect
  useEffect(() => {
    if (finalStats) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = steps / duration;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        const progress = currentStep / steps;
        setAnimatedStats({
          totalSupport: Math.floor(finalStats.totalSupport * progress),
          itemsFulfilled: Math.floor(finalStats.itemsFulfilled * progress),
          familiesHelped: Math.floor(finalStats.familiesHelped * progress),
          donationValue: Math.floor(finalStats.donationValue * progress)
        });
        
        currentStep++;
        if (currentStep > steps) {
          clearInterval(timer);
          setAnimatedStats({
            totalSupport: finalStats.totalSupport,
            itemsFulfilled: finalStats.itemsFulfilled,
            familiesHelped: finalStats.familiesHelped,
            donationValue: finalStats.donationValue
          });
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [finalStats]);

  // Sample data for development - will be replaced with real API data
  const impactOverTime = [
    { month: "Jan", families: 45, items: 234, value: 12500 },
    { month: "Feb", families: 62, items: 318, value: 18200 },
    { month: "Mar", families: 78, items: 445, value: 24600 },
    { month: "Apr", families: 91, items: 523, value: 31200 },
    { month: "May", families: 108, items: 687, value: 42800 },
    { month: "Jun", families: 134, items: 798, value: 55300 }
  ];

  const categoryBreakdown = [
    { name: "Household", value: 35, count: 245, color: "#FF6B6B" },
    { name: "Clothing", value: 28, count: 198, color: "#4ECDC4" },
    { name: "Education", value: 15, count: 105, color: "#45B7D1" },
    { name: "Baby/Kids", value: 12, count: 84, color: "#96CEB4" },
    { name: "Electronics", value: 6, count: 42, color: "#FECA57" },
    { name: "Other", value: 4, count: 28, color: "#DDA0DD" }
  ];

  const urgencyDistribution = [
    { level: "Urgent", count: 23, percentage: 18 },
    { level: "High", count: 45, percentage: 35 },
    { level: "Medium", count: 38, percentage: 30 },
    { level: "Low", count: 22, percentage: 17 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Impact Tracker
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See the incredible difference our community is making together. Every click, every fulfilled item, 
            every act of kindness creates ripples of positive change.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-md">
            {["7d", "30d", "90d", "1y"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  timeRange === range
                    ? "bg-coral text-white shadow-md"
                    : "text-gray-600 hover:text-coral"
                }`}
              >
                {range === "7d" && "7 Days"}
                {range === "30d" && "30 Days"}
                {range === "90d" && "90 Days"}
                {range === "1y" && "1 Year"}
              </button>
            ))}
          </div>
        </div>

        {/* Key Statistics Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : statsError ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Unable to load statistics</p>
              <p className="text-sm text-gray-600">Please check back later or contact support if this persists.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Total Support Actions</CardTitle>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {formatNumber(animatedStats.totalSupport)}
              </div>
              <p className="text-blue-200 text-sm">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Items Fulfilled</CardTitle>
                <Package className="h-8 w-8 text-green-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {formatNumber(animatedStats.itemsFulfilled)}
              </div>
              <p className="text-green-200 text-sm">
                +18% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Families Helped</CardTitle>
                <Heart className="h-8 w-8 text-purple-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {formatNumber(animatedStats.familiesHelped)}
              </div>
              <p className="text-purple-200 text-sm">
                +25% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Total Value</CardTitle>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(animatedStats.donationValue)}
              </div>
              <p className="text-orange-200 text-sm">
                +22% from last month
              </p>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Impact Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Impact Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={impactOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="families" 
                        stackId="1"
                        stroke="#FF6B6B" 
                        fill="#FF6B6B" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Support by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Community Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500 p-2 rounded-full">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-800">1,000th Item</p>
                        <p className="text-sm text-yellow-700">Fulfilled last week</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-full">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">100 Families</p>
                        <p className="text-sm text-green-700">Helped this month</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-full">
                        <Globe className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-800">50 States</p>
                        <p className="text-sm text-blue-700">Communities reached</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={impactOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="families" 
                      stroke="#FF6B6B" 
                      strokeWidth={3}
                      name="Families Helped"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="items" 
                      stroke="#4ECDC4" 
                      strokeWidth={3}
                      name="Items Fulfilled"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FF6B6B" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Urgency Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {urgencyDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={item.level === "Urgent" ? "destructive" : 
                                   item.level === "High" ? "default" : "secondary"}
                          >
                            {item.level}
                          </Badge>
                          <span className="font-medium">{item.count} needs lists</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-coral h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Community Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-all">
                      <div className={`p-3 rounded-full ${
                        activity.type === "purchase" ? "bg-green-100 text-green-600" :
                        activity.type === "creation" ? "bg-blue-100 text-blue-600" :
                        activity.type === "gratitude" ? "bg-yellow-100 text-yellow-600" :
                        "bg-purple-100 text-purple-600"
                      }`}>
                        {activity.type === "purchase" && <Package className="h-5 w-5" />}
                        {activity.type === "creation" && <Users className="h-5 w-5" />}
                        {activity.type === "gratitude" && <Heart className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          <span className="text-coral">{activity.supporter}</span> {activity.action} <span className="text-navy">{activity.item}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{activity.impact}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">{activity.timeAgo}</span>
                          <span className="text-xs bg-coral/10 text-coral px-2 py-1 rounded-full">{activity.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}