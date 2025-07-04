import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Gift, Heart, Users, Plus, MapPin, Clock } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faSmile } from "@fortawesome/free-solid-svg-icons";

// Custom Person Carry Box SVG Component for Products Delivered
const PersonCarryBoxIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Person head */}
    <circle cx="8" cy="4" r="2" />
    {/* Person body */}
    <path d="M8 6c-1.5 0-2.5 1-2.5 2.5v3c0 0.5 0.2 1 0.6 1.3l1.4 1.2v4c0 0.6 0.4 1 1 1s1-0.4 1-1v-4l1.4-1.2c0.4-0.3 0.6-0.8 0.6-1.3v-3C10.5 7 9.5 6 8 6z" />
    {/* Arms holding box */}
    <path d="M5.5 9c-0.3 0-0.5 0.2-0.5 0.5v2c0 0.3 0.2 0.5 0.5 0.5h1v-3h-1z" />
    <path d="M10.5 9v3h1c0.3 0 0.5-0.2 0.5-0.5v-2c0-0.3-0.2-0.5-0.5-0.5h-1z" />
    {/* Box being carried */}
    <rect x="13" y="8" width="6" height="5" rx="0.5" fill="currentColor" opacity="0.8" />
    {/* Box details */}
    <rect x="14" y="9" width="1" height="1" opacity="0.6" />
    <rect x="17" y="9" width="1" height="1" opacity="0.6" />
    <rect x="14" y="11" width="4" height="0.5" opacity="0.6" />
    {/* Motion lines */}
    <path d="M20 6l1.5-1 M21 8l1-0.5 M20.5 10l1.2-0.8" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
  </svg>
);

// Custom Box Heart SVG Component for Needs List Fulfilled
const BoxHeartIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Box base */}
    <rect x="3" y="8" width="18" height="12" rx="1" fill="currentColor" opacity="0.8" />
    {/* Box top flaps */}
    <path d="M3 8v-1c0-0.5 0.5-1 1-1h6v2H3z" opacity="0.6" />
    <path d="M21 8v-1c0-0.5-0.5-1-1-1h-6v2h7z" opacity="0.6" />
    {/* Box details */}
    <rect x="5" y="10" width="2" height="1" opacity="0.4" />
    <rect x="17" y="10" width="2" height="1" opacity="0.4" />
    <rect x="5" y="16" width="14" height="0.5" opacity="0.4" />
    {/* Heart on box */}
    <path d="M12 13.5c-1.5-1.5-4-1.5-4 0.5s2.5 3.5 4 5c1.5-1.5 4-4 4-5s-2.5-2-4-0.5z" fill="currentColor" opacity="1" />
  </svg>
);
import logoPath from "@assets/Logo_1_1751586675899.png";
import heroImagePath from "@assets/3b5b7b7c-182b-4d1a-8f03-f40b23139585_1751586386544.png";
import heartTreeImage from "@assets/NeedfullyHeartTree_1751655258585.png";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";

// Custom hook for animated counters
function useAnimatedCounter(targetValue: number, duration: number = 2000, startAnimation: boolean = false) {
  const [value, setValue] = useState(0);
  
  useEffect(() => {
    if (!startAnimation) return;
    
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
      
      setValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetValue, duration, startAnimation]);
  
  return value;
}

export default function Landing() {
  const journeyRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [progressSteps, setProgressSteps] = useState([false, false, false]);
  const [startTickerAnimation, setStartTickerAnimation] = useState(false);
  
  // Animated counter values
  const needsFulfilled = useAnimatedCounter(127, 2500, startTickerAnimation);
  const needsCreated = useAnimatedCounter(453, 2000, startTickerAnimation);
  const smilesSpread = useAnimatedCounter(2847, 3000, startTickerAnimation);
  const productsDelivered = useAnimatedCounter(1293, 2800, startTickerAnimation);
  
  useEffect(() => {
    const handleScroll = () => {
      // Handle journey map animations
      if (journeyRef.current) {
        const rect = journeyRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementHeight = rect.height;
        
        // Calculate scroll progress through the section
        const scrollProgress = Math.min(Math.max((viewportHeight - rect.top) / (viewportHeight + elementHeight), 0), 1);
        
        // Trigger line animations at different scroll thresholds
        const newProgressSteps = [
          scrollProgress > 0.1,   // First line
          scrollProgress > 0.2,   // Second line
          scrollProgress > 0.3    // Third line
        ];
        
        setProgressSteps(newProgressSteps);
      }
      
      // Handle ticker animations
      if (aboutRef.current && !startTickerAnimation) {
        const rect = aboutRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Trigger when section is 60% visible
        if (rect.top < viewportHeight * 0.8) {
          setStartTickerAnimation(true);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [startTickerAnimation]);

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

      {/* User Journey Map */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Your Journey To Fulfill Someone's Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Four simple steps to make a meaningful difference in someone's life</p>
          </div>
          
          <div className="relative" ref={journeyRef}>
            {/* Journey Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-coral-light border-2 border-coral rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Scroll-triggered connecting line - hidden on mobile */}
                  <div className="hidden md:block absolute top-12 left-24 h-0.5 bg-gradient-to-r from-coral to-coral-light transition-all duration-1000 ease-out" 
                       style={{
                         width: progressSteps[0] ? 'calc(100vw / 4 - 96px)' : '0px',
                         opacity: progressSteps[0] ? 1 : 0
                       }}></div>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">Log In, Sign Up, Or Continue As A Guest To Fulfill A Need</h3>
                <p className="text-gray-600 text-sm">Quick and easy registration to get started on your helping journey</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-coral-light border-2 border-coral rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-200">
                    <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="hidden md:block absolute top-12 left-24 h-0.5 bg-gradient-to-r from-coral to-coral-light transition-all duration-1000 ease-out" 
                       style={{
                         width: progressSteps[1] ? 'calc(100vw / 4 - 96px)' : '0px',
                         opacity: progressSteps[1] ? 1 : 0,
                         transitionDelay: '0.3s'
                       }}></div>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">Provide Your Personal Information</h3>
                <p className="text-gray-600 text-sm">Share basic details to ensure secure and personalized support</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-coral-light border-2 border-coral rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-400">
                    <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  <div className="hidden md:block absolute top-12 left-24 h-0.5 bg-gradient-to-r from-coral to-coral-light transition-all duration-1000 ease-out" 
                       style={{
                         width: progressSteps[2] ? 'calc(100vw / 4 - 96px)' : '0px',
                         opacity: progressSteps[2] ? 1 : 0,
                         transitionDelay: '0.6s'
                       }}></div>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">Fulfill A Need And Create A Personalized Needs List</h3>
                <p className="text-gray-600 text-sm">Choose items to support and optionally create your own needs list</p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-coral-light border-2 border-coral rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-600">
                    <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V5.5a2 2 0 10-2 0v1.5m2 0h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">Fulfill Someone's Need By Giving Their Needs List</h3>
                <p className="text-gray-600 text-sm">Complete the circle of giving by supporting others in need</p>
              </div>
            </div>
            
            {/* Mobile connecting lines */}
            <div className="md:hidden flex flex-col items-center space-y-4 mt-8">
              <div className="w-0.5 bg-gradient-to-b from-coral to-coral-light transition-all duration-1000 ease-out" 
                   style={{
                     height: progressSteps[0] ? '32px' : '0px',
                     opacity: progressSteps[0] ? 1 : 0
                   }}></div>
              <div className="w-0.5 bg-gradient-to-b from-coral to-coral-light transition-all duration-1000 ease-out" 
                   style={{
                     height: progressSteps[1] ? '32px' : '0px',
                     opacity: progressSteps[1] ? 1 : 0,
                     transitionDelay: '0.3s'
                   }}></div>
              <div className="w-0.5 bg-gradient-to-b from-coral to-coral-light transition-all duration-1000 ease-out" 
                   style={{
                     height: progressSteps[2] ? '32px' : '0px',
                     opacity: progressSteps[2] ? 1 : 0,
                     transitionDelay: '0.6s'
                   }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section ref={aboutRef} className="py-20 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content and Stats */}
            <div>
              <div className="mb-4">
                <span className="text-coral text-sm font-semibold tracking-wider uppercase">About Us</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6 leading-tight">
                Our <span className="text-coral">Dream</span> Is To Transform<br />
                The Way To <span className="text-navy font-black">Fulfill Needs</span><br />
                Of <span className="text-navy font-black">People In Need.</span>
              </h2>
              
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                MyNeedfully Was Born From Personal Experience.
              </p>
              
              {/* Animated Ticker Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Needs List Fulfilled */}
                <div className="bg-coral text-white p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                      <FontAwesomeIcon icon={faHeart} className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{needsFulfilled.toLocaleString()}+</div>
                      <div className="text-sm opacity-90">Needs List Fulfilled</div>
                    </div>
                  </div>
                </div>
                
                {/* Needs List Created */}
                <div className="bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="bg-coral/10 p-2 rounded-lg mr-3">
                      <Users className="h-6 w-6 text-coral" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-navy">{needsCreated.toLocaleString()}+</div>
                      <div className="text-sm text-gray-600">Needs List Created</div>
                    </div>
                  </div>
                </div>
                
                {/* Smiles Spread */}
                <div className="bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="bg-coral/10 p-2 rounded-lg mr-3">
                      <FontAwesomeIcon icon={faSmile} className="h-6 w-6 text-coral" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-navy">{smilesSpread >= 1000 ? `${Math.floor(smilesSpread / 1000)}k` : smilesSpread.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Smiles Spread</div>
                    </div>
                  </div>
                </div>
                
                {/* Products Delivered */}
                <div className="bg-coral text-white p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-2">
                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                      <PersonCarryBoxIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{productsDelivered >= 1000 ? `${Math.floor(productsDelivered / 1000)}k` : productsDelivered.toLocaleString()}</div>
                      <div className="text-sm opacity-90">Products Delivered</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button className="bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300">
                Discover More
              </Button>
            </div>
            
            {/* Right side - Heart Tree Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img 
                  src={heartTreeImage}
                  alt="Heart Tree representing community giving"
                  className="w-full max-w-md h-auto rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Out of the Box Needs - Emergency Products */}
      <section className="py-20 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">Out of the Box Needs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Jumpstart Your Needs List</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <select 
                id="store-select"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-coral focus:border-coral appearance-none"
              >
                <option value="">🏪 Select Store</option>
                <option value="amazon">Amazon</option>
                <option value="walmart">Walmart</option>
                <option value="target">Target</option>
              </select>
            </div>
            
            <div className="flex-1 relative">
              <select 
                id="category-select"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-coral focus:border-coral appearance-none"
              >
                <option value="">📋 Select Categories</option>
                <option value="emergency">Emergency Supplies</option>
                <option value="food">Food & Groceries</option>
                <option value="baby">Baby & Kids</option>
                <option value="health">Health & Personal Care</option>
                <option value="clothing">Clothing</option>
                <option value="household">Household Items</option>
              </select>
            </div>
            
            <div className="flex-1 relative">
              <select 
                id="price-select"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-coral focus:border-coral appearance-none"
              >
                <option value="">💰 Price Range</option>
                <option value="0-25">$0 - $25</option>
                <option value="25-50">$25 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100+">$100+</option>
              </select>
            </div>
            
            <Button 
              className="bg-coral text-white hover:bg-coral/90 px-8 py-3 rounded-lg"
              onClick={() => {
                const category = (document.getElementById('category-select') as HTMLSelectElement)?.value || 'emergency';
                window.location.href = `/browse?category=${category}`;
              }}
            >
              Search
            </Button>
          </div>

          {/* Emergency Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Food Product Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=200&fit=crop"
                  alt="Emergency Food Kit"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-coral text-white px-3 py-1 rounded-full text-sm font-medium">
                    Food
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <svg className="w-5 h-5 text-white bg-black/20 p-1 rounded-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy mb-2">Emergency Food Kit</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">Ready-to-eat meals, canned goods, and emergency water supply for disaster preparedness</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <img src="/attached_assets/amazon_1751644244382.png" alt="Amazon" className="w-4 h-4 rounded" />
                    <img src="/attached_assets/target_1751644244383.png" alt="Target" className="w-4 h-4 rounded" />
                    <img src="/attached_assets/walmart_1751644244383.png" alt="Walmart" className="w-4 h-4 rounded" />
                  </div>
                  <span className="text-lg font-bold text-coral">$79.00</span>
                </div>
                <Link href="/product-search?q=emergency+food+kit">
                  <Button className="w-full bg-coral text-white hover:bg-coral/90 text-sm">
                    View Products
                  </Button>
                </Link>
              </div>
            </div>

            {/* Clothes Product Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=200&fit=crop"
                  alt="Emergency Clothing"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Clothes
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <svg className="w-5 h-5 text-white bg-black/20 p-1 rounded-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy mb-2">Essential Clothing</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">Basic clothing items including shirts, pants, and undergarments for emergency situations</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <img src="/attached_assets/amazon_1751644244382.png" alt="Amazon" className="w-4 h-4 rounded" />
                    <img src="/attached_assets/target_1751644244383.png" alt="Target" className="w-4 h-4 rounded" />
                    <img src="/attached_assets/walmart_1751644244383.png" alt="Walmart" className="w-4 h-4 rounded" />
                  </div>
                  <span className="text-lg font-bold text-coral">$79.00</span>
                </div>
                <Link href="/product-search?q=emergency+clothing+basic">
                  <Button className="w-full bg-coral text-white hover:bg-coral/90 text-sm">
                    View Products
                  </Button>
                </Link>
              </div>
            </div>

            {/* Groceries Product Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop"
                  alt="Emergency Groceries"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Groceries
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <svg className="w-5 h-5 text-white bg-black/20 p-1 rounded-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy mb-2">Baby & Family Essentials</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">Diapers, formula, baby food, and family necessities for emergency preparedness</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <img src="/attached_assets/amazon_1751644244382.png" alt="Amazon" className="w-4 h-4 rounded" />
                    <img src="/attached_assets/target_1751644244383.png" alt="Target" className="w-4 h-4 rounded" />
                    <img src="/attached_assets/walmart_1751644244383.png" alt="Walmart" className="w-4 h-4 rounded" />
                  </div>
                  <span className="text-lg font-bold text-coral">$79.00</span>
                </div>
                <Link href="/product-search?q=baby+diapers+formula">
                  <Button className="w-full bg-coral text-white hover:bg-coral/90 text-sm">
                    View Products
                  </Button>
                </Link>
              </div>
            </div>

            {/* Skincare Product Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=200&fit=crop"
                  alt="Personal Care Items"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Skincare
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <svg className="w-5 h-5 text-white bg-black/20 p-1 rounded-full" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-navy mb-2">Personal Care Kit</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">Essential hygiene and personal care items including toiletries and health supplies</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <img src="/attached_assets/amazon_1751644244382.png" alt="Amazon" className="w-4 h-4 rounded" />
                    <img src="/attached_assets/target_1751644244383.png" alt="Target" className="w-4 h-4 rounded" />
                    <img src="/attached_assets/walmart_1751644244383.png" alt="Walmart" className="w-4 h-4 rounded" />
                  </div>
                  <span className="text-lg font-bold text-coral">$79.00</span>
                </div>
                <Link href="/product-search?q=personal+care+hygiene">
                  <Button className="w-full bg-coral text-white hover:bg-coral/90 text-sm">
                    View Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Button 
              className="bg-white text-coral border-2 border-coral hover:bg-coral hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300"
              onClick={() => window.location.href = '/browse'}
            >
              Explore Other Products
            </Button>
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
