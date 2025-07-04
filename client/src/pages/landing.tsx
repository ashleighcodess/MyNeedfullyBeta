import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Gift, Heart, Users, Plus, MapPin, Clock } from "lucide-react";
import logoPath from "@assets/Logo_1_1751586675899.png";
import heroImagePath from "@assets/3b5b7b7c-182b-4d1a-8f03-f40b23139585_1751586386544.png";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const featuredWishlists = [
    {
      id: 1,
      title: "Help the Johnson Family Rebuild",
      description: "After losing everything in a house fire, this family of four needs basic essentials including clothing, school supplies, and household items.",
      location: "Austin, TX",
      urgencyLevel: "urgent",
      completionPercentage: 85,
      totalItems: 23,
      imageUrl: "https://images.unsplash.com/photo-1609220136736-443140cffec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
    },
    {
      id: 2,
      title: "Back-to-School Support",
      description: "Local nonprofit helping 50 underprivileged children get ready for school with supplies, uniforms, and backpacks.",
      location: "Denver, CO",
      urgencyLevel: "high",
      completionPercentage: 42,
      totalItems: 150,
      imageUrl: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
    },
    {
      id: 3,
      title: "Senior Care Essentials",
      description: "Margaret, 78, needs assistance with medical supplies and daily living aids after her recent recovery from surgery.",
      location: "Seattle, WA",
      urgencyLevel: "medium",
      completionPercentage: 67,
      totalItems: 12,
      imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
    }
  ];

  const recentActivity = [
    { supporter: "Sarah M.", action: "supported", item: "Baby formula and diapers to help newborn twins", timeAgo: "2 hours ago" },
    { supporter: "Michael D.", action: "fulfilled", item: "School backpacks for three children", timeAgo: "4 hours ago" },
    { supporter: "Local Church", action: "completed", item: "Emergency food package for hurricane victims", timeAgo: "6 hours ago" }
  ];

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
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={logoPath} alt="MyNeedfully Logo" className="h-8 w-auto" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#browse" className="text-gray-700 hover:text-coral transition-colors">Browse Wishlists</a>
              <a href="#create" className="text-gray-700 hover:text-coral transition-colors">Create Wishlist</a>
              <a href="#how" className="text-gray-700 hover:text-coral transition-colors">How It Works</a>
              <a href="#about" className="text-gray-700 hover:text-coral transition-colors">About</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLogin} className="text-gray-700 hover:text-coral">
                Sign In
              </Button>
              <Button onClick={handleLogin} className="bg-coral text-white hover:bg-coral/90 rounded-full px-6">
                Get Started
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <i className="fas fa-bars text-xl"></i>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Community illustration background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImagePath})` }}
        />
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 hero-overlay" />
        
        {/* Smooth transition overlay to white space below */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-navy mb-6 leading-tight hero-text-shadow">
            A Registry For Recovery,
            <span className="text-coral"> Relief and Hardships</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-800 mb-8 max-w-xl mx-auto leading-relaxed hero-text-shadow font-medium">
            Create and Share a Needs List to Help Yourself or Loved Ones. Get the Support You Need During Tough Times.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="p-2 shadow-xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    placeholder="Search needs lists by keywords, location, or needs..." 
                    className="pl-12 py-4 text-lg border-0 focus:ring-2 focus:ring-coral/50"
                  />
                </div>
                <Button className="bg-coral text-white hover:bg-coral/90 px-8 py-4 text-lg whitespace-nowrap rounded-xl">
                  <Search className="mr-2 h-5 w-5" />
                  Search Needs
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="outline" 
              className="bg-white text-coral border-2 border-coral hover:bg-coral hover:text-white rounded-full px-8 py-4 text-lg shadow-lg"
            >
              <Gift className="mr-2 h-5 w-5" />
              Browse Needs Lists
            </Button>
            <Button 
              className="bg-navy text-white hover:bg-navy/90 rounded-full px-8 py-4 text-lg shadow-lg"
              onClick={handleLogin}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Wishlist
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-coral">50K+</div>
              <div className="text-gray-600">Wishes Fulfilled</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-coral">$2.5M+</div>
              <div className="text-gray-600">In Support</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-coral">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-coral">15K+</div>
              <div className="text-gray-600">Active Supporters</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Wishlists */}
      <section id="browse" className="py-20 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Featured Needs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real families and organizations who need your support right now</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredWishlists.map((wishlist) => (
              <Card key={wishlist.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <img 
                  src={wishlist.imageUrl} 
                  alt={wishlist.title}
                  className="w-full h-48 object-cover"
                />
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getUrgencyColor(wishlist.urgencyLevel)}>
                      {wishlist.urgencyLevel.charAt(0).toUpperCase() + wishlist.urgencyLevel.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">{wishlist.completionPercentage}% Complete</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-navy mb-2">{wishlist.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{wishlist.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{wishlist.location}</span>
                    </div>
                    <div className="text-sm text-gray-500">{wishlist.totalItems} items needed</div>
                  </div>
                  
                  <Progress value={wishlist.completionPercentage} className="mb-4" />
                  
                  <Button className="w-full bg-coral text-white hover:bg-coral/90">
                    View Needs List
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button className="bg-navy text-white hover:bg-navy/90 px-8 py-4 text-lg rounded-full">
              View All Needs Lists
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">How MyNeedfully Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Simple, transparent, and effective way to connect those who need help with those who want to give</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-list-ul text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-navy mb-4">Create Your Needs List</h3>
              <p className="text-gray-600 leading-relaxed">Recipients create detailed needs lists with specific items they need. Add photos, descriptions, and verify your story to build trust.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-white h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-navy mb-4">Supporters Discover Needs</h3>
              <p className="text-gray-600 leading-relaxed">Generous donors browse verified wishlists, search by location or need type, and choose meaningful ways to help real families.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-white h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-navy mb-4">Direct Impact</h3>
              <p className="text-gray-600 leading-relaxed">Items are purchased and shipped directly to recipients. Track fulfillment, receive thank you notes, and see your real impact.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Search Integration */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Find the Perfect Items</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Search millions of products from trusted retailers to add to your wishlist</p>
          </div>

          {/* Product Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="p-6 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    placeholder="Search for products (e.g., baby formula, school supplies, groceries)" 
                    className="pl-12 py-4 border border-gray-200 focus:ring-2 focus:ring-coral/50 focus:border-coral"
                  />
                </div>
                <select className="px-4 py-4 border border-gray-200 rounded-md focus:ring-2 focus:ring-coral/50 focus:border-coral">
                  <option>All Categories</option>
                  <option>Baby & Kids</option>
                  <option>Household</option>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Health & Personal Care</option>
                </select>
                <Button className="bg-coral text-white hover:bg-coral/90 px-8 py-4 whitespace-nowrap">
                  Search Products
                </Button>
              </div>
            </Card>
          </div>

          {/* Popular Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: "fas fa-baby", label: "Baby Care" },
              { icon: "fas fa-graduation-cap", label: "School" },
              { icon: "fas fa-home", label: "Home" },
              { icon: "fas fa-utensils", label: "Food" },
              { icon: "fas fa-tshirt", label: "Clothing" },
              { icon: "fas fa-heartbeat", label: "Health" }
            ].map((category, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all cursor-pointer">
                <i className={`${category.icon} text-coral text-3xl mb-3`}></i>
                <div className="font-semibold text-gray-700">{category.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Ticker */}
      <section className="py-12 bg-coral text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-center mb-8">Recent Acts of Kindness</h3>
          
          {/* Horizontal scrolling ticker */}
          <div className="flex animate-scroll space-x-8">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex-shrink-0 bg-white/10 rounded-xl p-6 min-w-80">
                <div className="flex items-center space-x-3 mb-3">
                  <Gift className="text-coral-light h-5 w-5" />
                  <span className="font-semibold">{activity.supporter}</span>
                  <span>{activity.action}</span>
                </div>
                <div className="text-sm opacity-90">{activity.item}</div>
                <div className="text-xs opacity-75 mt-2 flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {activity.timeAgo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of caring people who are helping families and communities rebuild, recover, and thrive.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-coral text-white hover:bg-coral/90 px-8 py-4 text-lg rounded-full">
              <Search className="mr-2 h-5 w-5" />
              Find Wishlists to Support
            </Button>
            <Button 
              variant="outline" 
              className="bg-white text-navy hover:bg-gray-100 px-8 py-4 text-lg rounded-full border-white"
              onClick={handleLogin}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your Wishlist
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <img src={logoPath} alt="MyNeedfully Logo" className="h-8 w-auto mb-4" />
              <p className="text-gray-400 mb-4">Connecting hearts and fulfilling needs through verified wishlists and transparent donations.</p>
              <div className="flex space-x-4">
                <i className="fab fa-facebook text-gray-400 hover:text-coral cursor-pointer transition-colors"></i>
                <i className="fab fa-twitter text-gray-400 hover:text-coral cursor-pointer transition-colors"></i>
                <i className="fab fa-instagram text-gray-400 hover:text-coral cursor-pointer transition-colors"></i>
                <i className="fab fa-linkedin text-gray-400 hover:text-coral cursor-pointer transition-colors"></i>
              </div>
            </div>
            
            {/* For Supporters */}
            <div>
              <h4 className="text-lg font-semibold mb-4">For Supporters</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Wishlists</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How to Donate</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Impact Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tax Information</a></li>
              </ul>
            </div>
            
            {/* For Recipients */}
            <div>
              <h4 className="text-lg font-semibold mb-4">For Recipients</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Create Wishlist</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Verification Process</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support Resources</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <hr className="border-gray-800 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 MyNeedfully. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <i className="fas fa-shield-alt text-green-400"></i>
                <span>Verified Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <i className="fas fa-lock text-green-400"></i>
                <span>SSL Protected</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
