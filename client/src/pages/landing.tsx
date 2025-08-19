import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Gift, Heart, Users, Plus, MapPin, Clock, Zap, Mail, Share2, Shield, ChevronDown, CheckCircle, ArrowRight, Flame, Droplets, Stethoscope, ShoppingCart, Baby, GraduationCap, Shirt, Sparkles, LifeBuoy } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faSmile } from "@fortawesome/free-solid-svg-icons";
import amazonLogo from "@assets/amazon_1751644244382.png";
import targetLogo from "@assets/target_1751644244383.png";
import walmartLogo from "@assets/walmart_1751644244383.png";
import emergencyFoodImage from "@assets/emergencyfood_1751658641250.jpg";
import essentialClothingImage from "@assets/essentialclothin_1751658676599.jpg";
import babyEssentialsImage from "@assets/babyandfamily_1751658729999.jpg";
import crisisHygieneImage from "@assets/crisishygiene_1751658766232.jpg";
import familyTreeImage from "@assets/Familywithtree_1751744939187.png";
import warmBackgroundImage from "@assets/HowIcons_1751746474339.png";
import hurricaneRecoveryImage from "@assets/Familywithtree_1751744939187.png";

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
import logoPath from "@assets/MyNeedfully_1754922279088.png";
import heroImagePath from "@assets/3b5b7b7c-182b-4d1a-8f03-f40b23139585_1751586386544.png";
import heartTreeImage from "@assets/NeedfullyHeartTree_1751655258585.png";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { usePerformance, markPerformance } from "@/hooks/usePerformance";

// Lazy load non-critical sections
const LazyFeaturedWishlists = lazy(() => import('./landing-sections/FeaturedWishlists'));
const LazyFooterSection = lazy(() => import('./landing-sections/FooterSection'));

// Custom hook for scroll-triggered wobble animation
const useWobbleAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return { isVisible, elementRef };
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search needs lists by keywords, location, or needs...");
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Performance monitoring
  usePerformance();

  // Mark performance milestones
  useEffect(() => {
    markPerformance('landing-component-mount');
    
    return () => {
      markPerformance('landing-component-unmount');
    };
  }, []);

  // SEO Configuration
  useSEO({
    title: generatePageTitle("A Registry For Recovery, Relief and Hardships", false),
    description: generatePageDescription("MyNeedfully connects people in crisis with generous supporters through secure needs lists. Help families recover from disasters, medical emergencies, and hardships by donating essential items they need most."),
    keywords: generateKeywords([
      "crisis support platform",
      "disaster relief registry",
      "medical emergency help",
      "family recovery assistance",
      "community donation platform"
    ]),
    canonical: generateCanonicalUrl("/"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "MyNeedfully",
      "url": "https://myneedfully.app",
      "description": "A compassionate donation platform connecting people in crisis with generous supporters through secure needs lists and community support.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://myneedfully.app/browse?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "mainEntity": {
        "@type": "Organization",
        "name": "MyNeedfully",
        "url": "https://myneedfully.app",
        "logo": "https://myneedfully.app/attached_assets/Logo_6_1752017502495.png",
        "sameAs": []
      }
    }
  });
  
  // Initialize wobble animation hooks
  const { isVisible: isWobbleVisible, elementRef: wobbleRef } = useWobbleAnimation();
  const { isVisible: isSupportWobbleVisible, elementRef: supportWobbleRef } = useWobbleAnimation();
  const { isVisible: isHowWorksVisible, elementRef: howWorksRef } = useWobbleAnimation();
  
  // Featured wishlists query - only shows section when admin has featured lists
  const { data: featuredWishlistsData, isLoading: featuredLoading } = useQuery<any[]>({
    queryKey: ['/api/featured-wishlists'],
    enabled: true, // Re-enabled to show only admin-selected featured lists
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 240000, // Consider data stale after 4 minutes
  });
  
  // Animated counter values
  const needsFulfilled = useAnimatedCounter(127, 2500, startTickerAnimation);
  const needsCreated = useAnimatedCounter(453, 2000, startTickerAnimation);
  const smilesSpread = useAnimatedCounter(2847, 3000, startTickerAnimation);
  const productsDelivered = useAnimatedCounter(1293, 2800, startTickerAnimation);
  
  // Handle responsive placeholder text
  useEffect(() => {
    const updatePlaceholder = () => {
      if (window.innerWidth < 768) {
        setSearchPlaceholder("Search by location or situation...");
      } else {
        setSearchPlaceholder("Search by location, name, or situation...");
      }
    };
    
    updatePlaceholder();
    window.addEventListener('resize', updatePlaceholder);
    
    return () => window.removeEventListener('resize', updatePlaceholder);
  }, []);

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

  const handleCreateList = () => {
    if (isAuthenticated) {
      setLocation("/create");
    } else {
      setLocation("/signup");
    }
  };

  const handleNeedsListSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/browse?q=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation('/browse');
    }
  };



  // Only use database featured wishlists - no fallback data
  const featuredWishlists = featuredWishlistsData || [];

  // Real-time activity data from platform - disabled for performance
  // const { data: recentActivity = [] } = useQuery<any[]>({
  //   queryKey: ['/api/recent-activity'],
  //   refetchInterval: 15000, // Refresh every 15 seconds for live updates
  // });
  const recentActivity: any[] = [];

  // State for interactive features
  const [likedActivities, setLikedActivities] = useState(new Set());
  const [visibleActivities, setVisibleActivities] = useState(3);
  const [activityRef, setActivityRef] = useState<HTMLDivElement | null>(null);
  const [isActivityVisible, setIsActivityVisible] = useState(false);

  // Handle heart reactions
  const handleLike = (activityId: string) => {
    setLikedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  // Intersection observer for activity section
  useEffect(() => {
    if (!activityRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActivityVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(activityRef);
    return () => observer.disconnect();
  }, [activityRef]);

  // Fallback data for empty state (using real platform activity when available)
  const displayActivity = recentActivity.length > 0 ? recentActivity : [
    { 
      id: "demo-1",
      supporter: "Sarah M.", 
      action: "supported", 
      item: "Baby formula and diapers to help newborn twins", 
      timeAgo: "2 hours ago",
      location: "Austin, TX",
      impact: "twins"
    },
    { 
      id: "demo-2",
      supporter: "Michael D.", 
      action: "fulfilled", 
      item: "School backpacks for three children", 
      timeAgo: "4 hours ago",
      location: "Denver, CO", 
      impact: "3 children"
    },
    { 
      id: "demo-3",
      supporter: "Local Church", 
      action: "completed", 
      item: "Emergency food package for hurricane victims", 
      timeAgo: "6 hours ago",
      location: "Miami, FL",
      impact: "12 families"
    },
    { 
      id: "demo-4",
      supporter: "Jennifer K.", 
      action: "donated", 
      item: "Winter coats and blankets for homeless shelter", 
      timeAgo: "8 hours ago",
      location: "Chicago, IL",
      impact: "25 people"
    },
    { 
      id: "demo-5",
      supporter: "Tech Team Inc.", 
      action: "sponsored", 
      item: "Laptops and school supplies for remote learning", 
      timeAgo: "12 hours ago",
      location: "San Francisco, CA",
      impact: "30 students"
    },
    { 
      id: "demo-6",
      supporter: "Maria R.", 
      action: "fulfilled", 
      item: "Medical supplies for elderly care facility", 
      timeAgo: "1 day ago",
      location: "Phoenix, AZ",
      impact: "50+ seniors"
    }
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
      {/* Hero Section */}
      <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Community illustration background - reduced on mobile */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat hero-bg-mobile"
          style={{ 
            backgroundImage: `url(${heroImagePath})`,
            backgroundAttachment: 'scroll'
          }}
        />
        
        {/* Enhanced overlay for better mobile text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/70 sm:from-white/50 sm:via-white/30 sm:to-white/50 md:from-white/40 md:via-white/20 md:to-white/40 lg:from-white/30 lg:via-white/15 lg:to-white/30" />
        
        {/* Smooth transition overlay to white space below */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 lg:h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
        
        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16 md:py-24 lg:py-32">
          {/* MyNeedfully Logo */}
          <div className="mb-4 sm:mb-6">
            <ResponsiveImage 
              src={logoPath} 
              alt="MyNeedfully Logo" 
              className="h-12 sm:h-16 md:h-20 w-auto mx-auto" 
              priority
              width={300}
              height={60}
            />
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy mb-3 sm:mb-4 leading-tight hero-text-shadow font-just-sans">
            Registry for Disaster and Crisis Recovery
          </h1>
          
          {/* CTA Buttons under tagline */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-lg mx-auto mb-6 sm:mb-8">
            <Button 
              className="bg-coral text-white hover:bg-coral/90 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg w-full sm:w-auto font-semibold"
              onClick={handleCreateList}
              data-metadata="registry"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Create a Needs List
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/90 text-navy border-2 border-navy hover:bg-navy hover:text-white rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg w-full sm:w-auto font-semibold"
              onClick={() => setLocation('/browse')}
            >
              <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Search for a Needs List
            </Button>
          </div>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-800 max-w-5xl mx-auto leading-relaxed hero-text-shadow font-medium font-just-sans">A Needs List provides a simple way to organize and share your recovery needs with your community.</p>
        </div>
        
        {/* Seamless gradient transition overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24 lg:h-32 bg-gradient-to-b from-transparent via-orange-50/30 to-orange-100/60 pointer-events-none"></div>
      </section>
      {/* How It Works - Enhanced with Microanimations */}
      <section 
        id="how" 
        className="py-8 md:py-12 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${warmBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay to tone down brightness */}
        <div className="absolute inset-0 bg-white/40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div 
            ref={howWorksRef}
            className={`text-center mb-10 transition-all duration-1000 ease-out ${
              isHowWorksVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-4 font-just-sans">How Our Disaster Recovery Registry Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-just-sans font-light mb-8">MyNeedfully helps people recovering from house fires, floods, and other emergencies create personalized needs lists, so they get exactly what they need when they need it. Whether you're rebuilding after a disaster or looking to support someone in crisis, MyNeedfully makes giving and receiving fast, simple, and effective.</p>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-just-sans font-light mb-8">Create a needs list to support your recovery or browse public lists to send help. Our disaster recovery platform makes it easy to connect people in need with those who want to help—near or far.</p>
            



          </div>



          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 ease-out ${
              isHowWorksVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-12'
            }`}
            style={{ transitionDelay: isHowWorksVisible ? '200ms' : '0ms' }}
          >
            {/* Step 1 - Create A Needs List */}
            <div 
              className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 text-center transform group ${
                isHowWorksVisible 
                  ? 'opacity-100 translate-y-0 hover:scale-105' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: isHowWorksVisible ? '400ms' : '0ms' }}
            >
              <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-coral-dark">
                <Gift className="text-white h-10 w-10 stroke-2" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-navy mb-4 font-just-sans group-hover:text-coral transition-colors duration-300">Create a needs list</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-just-sans font-light">Build your own disaster recovery registry with essential items like clothes, toiletries, baby supplies, furniture, or gift cards after a fire, flood, or other crisis.</p>
            </div>

            {/* Step 2 - Share With Community */}
            <div 
              className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 text-center transform group ${
                isHowWorksVisible 
                  ? 'opacity-100 translate-y-0 hover:scale-105' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: isHowWorksVisible ? '600ms' : '0ms' }}
            >
              <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-coral-dark">
                <Share2 className="text-white h-10 w-10 stroke-2" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-navy mb-4 font-just-sans group-hover:text-coral transition-colors duration-300">Share with community</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-just-sans font-light">Easily share your personalized list with friends, family, neighbors, or community groups via text, email, or social media.
</p>
            </div>

            {/* Step 3 - Receive Support */}
            <div 
              className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 text-center transform group ${
                isHowWorksVisible 
                  ? 'opacity-100 translate-y-0 hover:scale-105' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: isHowWorksVisible ? '800ms' : '0ms' }}
            >
              <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-coral-dark">
                <Heart className="text-white h-10 w-10 stroke-2" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-navy mb-4 font-just-sans group-hover:text-coral transition-colors duration-300">Receive support</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-just-sans font-light">Supporters purchase items directly from your list through trusted online retailers. Everything ships straight to your temporary housing, a family member's home, or wherever you're staying.</p>
            </div>

            {/* Step 4 - Track Fulfillment */}
            <div 
              className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 text-center transform group ${
                isHowWorksVisible 
                  ? 'opacity-100 translate-y-0 hover:scale-105' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: isHowWorksVisible ? '1000ms' : '0ms' }}
            >
              <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-coral-dark">
                <Shield className="text-white h-10 w-10 stroke-2" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-navy mb-4 font-just-sans group-hover:text-coral transition-colors duration-300">Track fulfillment</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-just-sans font-light">See which items have been purchased and what's still needed. Update your list as your recovery progresses.</p>
            </div>
          </div>

          {/* Quick Actions - Moved below explanation */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center max-w-lg mx-auto mt-12">
            <Button 
              className="bg-navy text-white hover:bg-navy/90 rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg shadow-lg w-full sm:w-auto"
              onClick={handleCreateList}
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4 md:h-5 md:w-5" />
              {isAuthenticated ? "Create Needs List" : "Get Started"}
            </Button>
            <Button 
              variant="outline" 
              className="bg-white text-coral border-2 border-coral hover:bg-coral hover:text-white rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg shadow-lg w-full sm:w-auto"
              onClick={() => setLocation('/products')}
            >
              <Search className="mr-1 sm:mr-2 h-4 w-4 md:h-5 md:w-5" />
              Browse Products
            </Button>
          </div>

          {/* Platform Sustainability Alert */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-coral/5 border border-coral/20 rounded-lg p-4 relative z-10">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-coral" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-navy font-just-sans">
                    <span className="font-semibold">Transparency Note:</span> MyNeedfully is free to use. Some product links on the site are affiliate links, which means we may earn a small commission—at no extra cost to you—when items are purchased through a needs list. As an Amazon Associate, we earn from qualifying purchases. This helps us keep MyNeedfully free for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* About Us Section */}
      <section ref={aboutRef} className="py-12 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content and Stats */}
            <div>
              <div className="mb-4">
                <span className="text-coral text-sm font-semibold tracking-wider uppercase">About Us</span>
              </div>
              
              <h2 className="text-2xl md:text-[32px] font-bold text-navy mb-6 leading-relaxed">
                Our <span className="text-coral">mission</span> is to simplify disaster recovery by helping people affected by fires, floods, and other emergencies receive exactly what they need while empowering communities to <span className="text-coral">provide meaningful, timely support.</span>
              </h2>
              
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">MyNeedfully was born from personal experience.</p>
              
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
              
              <Button 
                className="bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
                onClick={() => setLocation('/about')}
              >
                Discover More
              </Button>
            </div>
            
            {/* Right side - Heart Tree Image with Wobble Animation */}
            <div className="flex justify-center lg:justify-end">
              <div 
                ref={wobbleRef}
                className={`relative ${
                  isWobbleVisible 
                    ? 'animate-wobble-in-right' 
                    : 'transform translate-x-20 opacity-60'
                }`}
              >
                <ResponsiveImage 
                  src={heartTreeImage}
                  alt="Heart Tree representing community giving"
                  className="w-full max-w-md h-auto rounded-3xl shadow-2xl"
                  loading="lazy"
                  width={400}
                  height={500}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* User Journey Map */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-navy mb-4">Your Journey To Fulfill Someone's Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Four simple steps to make a meaningful difference in someone's life</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-6 mb-4 md:mb-6">
              <Card className="p-2 shadow-xl">
                <form onSubmit={handleNeedsListSearch} className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                    <Input 
                      placeholder={searchPlaceholder}
                      className="pl-8 sm:pl-10 md:pl-12 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg border-0 focus:ring-2 focus:ring-coral/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="bg-coral text-white hover:bg-coral/90 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg whitespace-nowrap rounded-xl">
                    <Search className="mr-1 sm:mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Search Needs
                  </Button>
                </form>
              </Card>
            </div>
          </div>
          
          <div className="relative" ref={journeyRef}>
            {/* Journey Steps */}
            <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-coral-light border-2 border-coral rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Desktop connecting line */}
                  <div className="hidden md:block absolute top-12 left-24 h-0.5 bg-gradient-to-r from-coral to-coral-light transition-all duration-1000 ease-out" 
                       style={{
                         width: progressSteps[0] ? 'calc(100vw / 4 - 96px)' : '0px',
                         opacity: progressSteps[0] ? 1 : 0
                       }}></div>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">Log In Or Sign Up To Fulfill A Need</h3>
                <p className="text-gray-600 text-sm">Quick and easy registration to get started on your helping journey</p>
              </div>

              {/* Mobile connecting line 1 */}
              <div className="md:hidden flex justify-center">
                <div className="w-0.5 bg-gradient-to-b from-coral to-coral-light transition-all duration-1000 ease-out" 
                     style={{
                       height: progressSteps[0] ? '32px' : '0px',
                       opacity: progressSteps[0] ? 1 : 0
                     }}></div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-coral-light border-2 border-coral rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-200">
                    <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  {/* Desktop connecting line */}
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

              {/* Mobile connecting line 2 */}
              <div className="md:hidden flex justify-center">
                <div className="w-0.5 bg-gradient-to-b from-coral to-coral-light transition-all duration-1000 ease-out" 
                     style={{
                       height: progressSteps[1] ? '32px' : '0px',
                       opacity: progressSteps[1] ? 1 : 0,
                       transitionDelay: '0.3s'
                     }}></div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-coral-light border-2 border-coral rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animation-delay-400">
                    <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  {/* Desktop connecting line */}
                  <div className="hidden md:block absolute top-12 left-24 h-0.5 bg-gradient-to-r from-coral to-coral-light transition-all duration-1000 ease-out" 
                       style={{
                         width: progressSteps[2] ? 'calc(100vw / 4 - 96px)' : '0px',
                         opacity: progressSteps[2] ? 1 : 0,
                         transitionDelay: '0.6s'
                       }}></div>
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">Create a Needs List on someone's behalf and/or fulfill an ask from an existing Need List</h3>
                <p className="text-gray-600 text-sm">Support others in needs by creating a Needs Lists or giving to an existing Needs List</p>
              </div>

              {/* Mobile connecting line 3 */}
              <div className="md:hidden flex justify-center">
                <div className="w-0.5 bg-gradient-to-b from-coral to-coral-light transition-all duration-1000 ease-out" 
                     style={{
                       height: progressSteps[2] ? '32px' : '0px',
                       opacity: progressSteps[2] ? 1 : 0,
                       transitionDelay: '0.6s'
                     }}></div>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Featured Needs Section */}
      <section id="browse" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-4">Featured Needs</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">Real families and organizations who need your support right now</p>
          </div>

          <div className="space-y-8">
            {/* Large featured card */}
            {featuredWishlists.length > 0 && (
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Image section */}
                  <div className="relative">
                    <img 
                      src={featuredWishlists[0].imageUrl} 
                      alt={featuredWishlists[0].title}
                      className="w-full h-48 sm:h-56 md:h-64 lg:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getUrgencyColor(featuredWishlists[0].urgencyLevel)}>
                        {featuredWishlists[0].urgencyLevel.charAt(0).toUpperCase() + featuredWishlists[0].urgencyLevel.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Content section */}
                  <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs sm:text-sm text-gray-500">{featuredWishlists[0].completionPercentage}% Complete</span>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-navy mb-4">{featuredWishlists[0].title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{featuredWishlists[0].description}</p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>{featuredWishlists[0].location}</span>
                      </div>
                      <div className="text-sm text-gray-500">{featuredWishlists[0].totalItems} items needed</div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{featuredWishlists[0].completionPercentage}%</span>
                      </div>
                      <Progress value={featuredWishlists[0].completionPercentage} className="h-2" />
                    </div>
                    
                    <Link href={`/wishlist/${featuredWishlists[0].id}`}>
                      <Button className="w-full bg-coral text-white hover:bg-coral/90 py-3 text-base rounded-full">
                        View & Support This Family
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            )}

            {/* Grid of smaller cards */}
            {featuredWishlists.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredWishlists.slice(1, 7).map((wishlist) => (
                  <Card key={wishlist.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="relative">
                      <img 
                        src={wishlist.imageUrl} 
                        alt={wishlist.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={getUrgencyColor(wishlist.urgencyLevel)}>
                          {wishlist.urgencyLevel.charAt(0).toUpperCase() + wishlist.urgencyLevel.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg text-navy mb-2 line-clamp-2">{wishlist.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{wishlist.description}</p>
                      
                      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          <span>{wishlist.location}</span>
                        </div>
                        <span>{wishlist.totalItems} items</span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span className="font-semibold">{wishlist.completionPercentage}%</span>
                        </div>
                        <Progress value={wishlist.completionPercentage} className="h-2" />
                      </div>
                      
                      <Link href={`/wishlist/${wishlist.id}`}>
                        <Button className="w-full bg-coral text-white hover:bg-coral/90 text-sm">
                          View & Support
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/browse">
              <Button className="bg-navy text-white hover:bg-navy/90 px-8 py-4 text-lg rounded-full">
                View All Needs Lists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ARCHIVED: Common Needs Section - Hidden but preserved for future restoration 
            
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-4">Common Needs</h2>
                  <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">Jumpstart Your Needs List</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 max-w-4xl mx-auto px-4 sm:px-0">
                  <div className="flex-1 relative">
                    <select 
                      id="category-select"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-coral focus:border-coral appearance-none"
                    >
                      <option value="">Select Categories</option>
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
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-coral focus:border-coral appearance-none"
                    >
                      <option value="">Price Range</option>
                      <option value="0-25">$0 - $25</option>
                      <option value="25-50">$25 - $50</option>
                      <option value="50-100">$50 - $100</option>
                      <option value="100+">$100+</option>
                    </select>
                  </div>
                  
                  <Button 
                    className="bg-coral text-white hover:bg-coral/90 px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg whitespace-nowrap"
                    onClick={() => {
                      const category = (document.getElementById('category-select') as HTMLSelectElement)?.value || 'emergency';
                      const priceRange = (document.getElementById('price-select') as HTMLSelectElement)?.value || '';
                      
                      let searchQuery = `${category}+essentials`;
                      let params = new URLSearchParams();
                      params.set('q', searchQuery);
                      
                      if (priceRange) {
                        const [min, max] = priceRange.includes('-') ? priceRange.split('-') : ['', priceRange.replace('+', '')];
                        if (min) params.set('min_price', min);
                        if (max && max !== '+') params.set('max_price', max);
                      }
                      
                      window.location.href = `/product-search?${params.toString()}`;
                    }}
                  >
                    Search
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white">
                    <div className="relative h-48">
                      <img 
                        src={emergencyFoodImage}
                        alt="Emergency Food Kit"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-coral text-white px-3 py-1 rounded-full text-sm font-medium">
                          Food
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-navy mb-2">Emergency Food Kit</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">Ready-to-eat meals, canned goods, and emergency water supply for disaster preparedness</p>
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex items-center space-x-2">
                          <img src={amazonLogo} alt="Amazon" className="w-4 h-4 rounded" />
                          <img src={targetLogo} alt="Target" className="w-4 h-4 rounded" />
                          <img src={walmartLogo} alt="Walmart" className="w-4 h-4 rounded" />
                        </div>
                      </div>
                      <Link href="/product-search?q=emergency+food+kit">
                        <Button className="w-full bg-coral text-white hover:bg-coral/90 text-sm">
                          View Products
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white">
                    <div className="relative h-48">
                      <img 
                        src={essentialClothingImage}
                        alt="Essential Clothing"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-navy text-white px-3 py-1 rounded-full text-sm font-medium">
                          Clothes
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-navy mb-2">Essential Clothing</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">Basic clothing items including shirts, pants, and undergarments for emergency situations</p>
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex items-center space-x-2">
                          <img src={amazonLogo} alt="Amazon" className="w-4 h-4 rounded" />
                          <img src={targetLogo} alt="Target" className="w-4 h-4 rounded" />
                          <img src={walmartLogo} alt="Walmart" className="w-4 h-4 rounded" />
                        </div>
                      </div>
                      <Link href="/product-search?q=essential+clothing+basic">
                        <Button className="w-full bg-coral text-white hover:bg-coral/90 text-sm">
                          View Products
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white">
                    <div className="relative h-48">
                      <img 
                        src={babyEssentialsImage}
                        alt="Baby & Family Essentials"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-warm-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                          Baby & Kids
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-navy mb-2">Baby & Family Essentials</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">Diapers, formula, baby food, and family necessities for emergency preparedness</p>
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex items-center space-x-2">
                          <img src={amazonLogo} alt="Amazon" className="w-4 h-4 rounded" />
                          <img src={targetLogo} alt="Target" className="w-4 h-4 rounded" />
                          <img src={walmartLogo} alt="Walmart" className="w-4 h-4 rounded" />
                        </div>
                      </div>
                      <Link href="/product-search?q=baby+diapers+formula">
                        <Button className="w-full bg-coral text-white hover:bg-coral/90 text-sm">
                          View Products
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white">
                    <div className="relative h-48">
                      <img 
                        src={crisisHygieneImage}
                        alt="Crisis Hygiene Kit"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Crisis Care
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-navy mb-2">Crisis Hygiene Kit</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">Toothbrushes, soap, feminine products, toilet paper, and essential hygiene items for emergencies</p>
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex items-center space-x-2">
                          <img src={amazonLogo} alt="Amazon" className="w-4 h-4 rounded" />
                          <img src={targetLogo} alt="Target" className="w-4 h-4 rounded" />
                          <img src={walmartLogo} alt="Walmart" className="w-4 h-4 rounded" />
                        </div>
                      </div>
                      <Link href="/product-search?q=toothbrush+soap+toilet+paper+tampons+hygiene+essentials">
                        <Button className="w-full bg-coral text-white hover:bg-coral/90 text-sm">
                          View Products
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

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
            
            */}
      {/* What Do People Use MyNeedfully For? - Hidden in production until ready to launch */}
      {import.meta.env.VITE_SHOW_CATEGORY_SECTION !== 'false' && (
        <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-navy mb-6">What Do People Use MyNeedfully For?</h2>
            <p className="max-w-4xl mx-auto text-lg text-gray-600 leading-relaxed">
              What matters most is getting the support you need, when you need it. Our platform is designed to empower people with simple tools and a transparent process, so giving feels personal and impactful every time.
            </p>
          </div>

          {/* Category Cards Grid - Compact Style */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-8">
              {/* Fire Disaster Relief */}
              <Link href="/fire-disaster-relief">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <Flame className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Fire Disaster Relief</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Emergency Flood Relief */}
              <Link href="/emergency-flood-relief">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <Droplets className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Emergency Flood Relief</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Medical Necessity */}
              <Link href="/medical-necessity">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <Stethoscope className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Medical Necessity</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Essential Items */}
              <Link href="/essential-items">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <Gift className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Essential Items</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Groceries and Food */}
              <Link href="/groceries-food">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <ShoppingCart className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Groceries and Food</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Baby Items */}
              <Link href="/baby-items">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <Baby className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Baby Items</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* School Supplies */}
              <Link href="/school-supplies">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <GraduationCap className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">School Supplies</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Clothing */}
              <Link href="/clothing">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <Shirt className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Clothing</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Community Help */}
              <Link href="/community-help">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <Users className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Community Help</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Personal Care Supplies */}
              <Link href="/personal-care-supplies">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <Heart className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Personal Care Supplies</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Crisis Relief Support */}
              <Link href="/crisis-relief-support">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <Shield className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Crisis Relief Support</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>

              {/* Support Resources */}
              <Link href="/support-resources">
                <div className="group flex items-center space-x-4 cursor-pointer hover:scale-105 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-coral transition-colors flex-shrink-0">
                    <LifeBuoy className="h-6 w-6 text-navy group-hover:text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy text-base group-hover:text-coral transition-colors">Support Resources</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-coral group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-700 mb-6">Ready to create a needs list for yourself or someone in need?</p>
            <Button 
              className="bg-coral text-white hover:bg-coral/90 px-8 py-3 rounded-full text-lg font-semibold"
              onClick={handleCreateList}
            >
              {isAuthenticated ? "Create Needs List" : "Get Started Now"}
            </Button>
          </div>
        </div>
      </section>
      )}
      {/* Need More Than Just Items Section */}
      <section className="py-20 bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="animate-fade-in-up">
              <div className="mb-4">
                <span className="text-coral text-sm font-semibold tracking-wider uppercase">Support Resources</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-navy mb-6 leading-tight">
                Need More Than<br />
                <span className="text-coral">Just Items?</span><br />
                We're <span className="text-navy font-black">Here to Help.</span>
              </h2>
              
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Life can get tough, and sometimes we all need a little more support. Whether it's housing, food assistance, mental health resources, or emergency aid — explore trusted organizations ready to help you beyond material needs.
              </p>
              
              <Button 
                className="bg-coral text-white hover:bg-coral/90 px-8 py-4 text-lg rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => window.location.href = '/resources'}
              >
                Browse Support Resources
              </Button>
            </div>
            
            {/* Right image with Wobble Animation */}
            <div className="flex-1">
              <div 
                ref={supportWobbleRef}
                className={`relative ${
                  isSupportWobbleVisible 
                    ? 'animate-wobble-in-right' 
                    : 'transform translate-x-20 opacity-60'
                }`}
              >
                <img 
                  src={familyTreeImage}
                  alt="Family with support tree illustration"
                  className="w-full h-auto rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105"
                />
                {/* Decorative gradient overlay */}
                <div className="absolute -inset-4 bg-gradient-to-r from-coral/20 to-transparent rounded-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      

      {/* Call to Action */}
      <section className="py-12 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-6 opacity-90">Join thousands of caring people who are helping families and communities rebuild, recover, and thrive.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-coral text-white hover:bg-coral/90 px-8 py-4 text-lg rounded-full"
              onClick={() => setLocation('/browse')}
            >
              <Search className="mr-2 h-5 w-5" />
              Find Needs Lists to Support
            </Button>
            <Button 
              variant="outline" 
              className="bg-white text-navy hover:bg-gray-100 px-8 py-4 text-lg rounded-full border-white"
              onClick={handleCreateList}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your Needs List
            </Button>
          </div>
        </div>
      </section>

      <Suspense fallback={
        <div className="py-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral"></div>
        </div>
      }>
        <LazyFooterSection />
      </Suspense>
    </div>
  );
}
