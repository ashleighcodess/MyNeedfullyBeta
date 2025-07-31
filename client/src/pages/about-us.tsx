import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Link } from "wouter";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";
import { 
  Gift, 
  Share, 
  Heart, 
  CheckCircle,
  Users,
  DollarSign,
  Package,
  Smile
} from "lucide-react";

// Custom Box Heart SVG Component for Needs List Fulfilled
const BoxHeartIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Box outline */}
    <rect x="4" y="8" width="16" height="12" rx="1" fill="currentColor" opacity="0.9" />
    {/* Box top flaps */}
    <path d="M6 8v-1c0-0.5 0.5-1 1-1h2v2H6z" opacity="0.7" />
    <path d="M15 6h2c0.5 0 1 0.5 1 1v1h-3V6z" opacity="0.7" />
    {/* Heart on box */}
    <path d="M12 18c-1.5-1.2-4-3.5-4-6 0-1.1 0.9-2 2-2s2 0.9 2 2c0-1.1 0.9-2 2-2s2 0.9 2 2c0 2.5-2.5 4.8-4 6z" 
          fill="white" opacity="0.95" />
  </svg>
);

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

// Custom animated counter hook
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
import aboutUsImage from "@assets/AboutUsIMage2_1751592833990.png";
import missionImage from "@assets/AboutUsImage3_1751592935275.png";
import howItWorksBackground from "@assets/HowIcons_1751593054903.png";
import housefireImage from "@assets/housefire_1752846845405.jpg";

export default function AboutUs() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldWobble, setShouldWobble] = useState(false);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);

  // SEO Configuration
  useSEO({
    title: generatePageTitle("About Us - MyNeedfully's Mission to Help Communities"),
    description: generatePageDescription("Learn about MyNeedfully's mission to connect communities through crisis support. Discover how we help families in need through our transparent donation platform and generous supporters."),
    keywords: generateKeywords([
      "about MyNeedfully",
      "donation platform mission",
      "crisis support community",
      "helping families in need",
      "charitable giving platform"
    ]),
    canonical: generateCanonicalUrl("/about-us"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About MyNeedfully",
      "description": "Learn about MyNeedfully's mission to connect communities through crisis support",
      "url": "https://myneedfully.app/about-us",
      "mainEntity": {
        "@type": "Organization",
        "name": "MyNeedfully",
        "description": "A compassionate platform connecting people in crisis with community supporters",
        "url": "https://myneedfully.app",
        "foundingDate": "2025",
        "mission": "To connect hearts and fulfill needs by helping families in crisis through community support",
        "areaServed": "United States",
        "serviceType": "Crisis Support Platform"
      }
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.querySelector('[data-stats-section]');
      if (aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (isInViewport && !isVisible) {
          setIsVisible(true);
        }
      }

      // Check for image wobble trigger
      const imageSection = document.querySelector('[data-image-section]');
      if (imageSection) {
        const rect = imageSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const visibilityThreshold = 0.3; // 30% visible
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const elementHeight = rect.height;
        const visibilityRatio = visibleHeight / elementHeight;
        
        if (visibilityRatio >= visibilityThreshold && !shouldWobble) {
          setShouldWobble(true);
        }
      }

      // Check for How It Works animation trigger
      const howItWorksSection = document.querySelector('[data-how-it-works-section]');
      if (howItWorksSection) {
        const rect = howItWorksSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const visibilityThreshold = 0.2; // 20% visible
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const elementHeight = rect.height;
        const visibilityRatio = visibleHeight / elementHeight;
        
        if (visibilityRatio >= visibilityThreshold && !howItWorksVisible) {
          setHowItWorksVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible, shouldWobble, howItWorksVisible]);

  // Animated counter values
  const needsListFulfilled = useAnimatedCounter(127, 2000, isVisible);
  const needsListCreated = useAnimatedCounter(453, 2000, isVisible);
  const smilesSpread = useAnimatedCounter(2, 2000, isVisible); // Will display as 2k
  const productsDelivered = useAnimatedCounter(1, 2000, isVisible); // Will display as 1k

  const howItWorks = [
    {
      icon: Gift,
      title: "Create a Needs List",
      description: "Build a Needs List of essential items you or someone you know needs during a difficult time.",
      color: "text-coral"
    },
    {
      icon: Share,
      title: "Share with Community",
      description: "Share your Needs List with friends, family, and your social network — and the broader community who want to help.",
      color: "text-coral"
    },
    {
      icon: Heart,
      title: "Receive Support",
      description: "Items purchased from your Needs List are sent directly to you or your loved ones in need.",
      color: "text-coral"
    },
    {
      icon: CheckCircle,
      title: "Track Fulfillment",
      description: "Easily track which items have been fulfilled and those still needed.",
      color: "text-coral"
    }
  ];

  const missionPoints = [
    "We create a bridge between people in need and those with resources to share.",
    "We facilitate direct, meaningful assistance that addresses specific needs.",
    "We empower communities to respond effectively in times of crisis.",
    "We believe in the collective power of small acts of kindness."
  ];



  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div 
          className="text-center mb-4 relative bg-cover bg-center bg-no-repeat rounded-2xl overflow-hidden"
          style={{ 
            backgroundImage: `url(${howItWorksBackground})`
          }}
        >
          <div className="absolute inset-0 bg-white/90"></div>
          <div className="relative z-10 py-12 px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">About MyNeedfully</h1>
            <p className="text-gray-700 max-w-3xl mx-auto mb-4 text-[18px]">A Disaster Recovery Registry That Connects People in Need with Those Ready to Help</p>
          </div>
        </div>

        {/* Main Story Section */}
        <div className="mb-12 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-12">
            <div className="space-y-6 animate-slide-in-left">
              <div className="text-coral text-sm font-bold tracking-widest uppercase mb-4">
                ABOUT US
              </div>
              
              <h2 className="text-3xl md:text-4xl text-navy mb-8 animate-slide-up font-just-sans leading-tight">
                Our <span className="font-bold">vision</span> is a world where no one faces their crisis alone, where <span className="font-bold">communities</span> meet individual needs with compassion, and recovery is eased by direct and meaningful <span className="font-bold">support.</span>
              </h2>
            </div>
            
            <div className="flex justify-center lg:justify-end animate-slide-in-right" data-image-section>
              <div className="relative group w-full">
                <img 
                  src={aboutUsImage} 
                  alt="Family with needs list showing community support" 
                  className={`w-full h-[400px] lg:h-[450px] xl:h-[500px] object-cover rounded-xl shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl ${shouldWobble ? 'animate-wobble-in-right' : ''}`}
                  style={{ animationDelay: shouldWobble ? '0s' : undefined }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-coral/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up mt-8" data-stats-section>
            <Card className="text-left bg-orange-200 border-orange-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                      {needsListFulfilled}+
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Needs Lists Fulfilled</div>
                  </div>
                  <BoxHeartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mt-1" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-left bg-coral border-coral transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                      {needsListCreated}+
                    </div>
                    <div className="text-xs sm:text-sm text-white/90">Needs Lists Created</div>
                  </div>
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white mt-1" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-left bg-orange-200 border-orange-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                      {smilesSpread}k
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Smiles Spread</div>
                  </div>
                  <Smile className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mt-1" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-left bg-coral border-coral transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                      {productsDelivered}k
                    </div>
                    <div className="text-xs sm:text-sm text-white/90">Products Delivered</div>
                  </div>
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ready to Help Section - Full Width */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-coral text-sm font-bold tracking-widest uppercase mb-6">
                READY TO HELP
              </div>
              
              <h2 className="text-3xl md:text-4xl text-navy mb-8 font-just-sans leading-tight">
                How MyNeedfully <span className="font-bold">Simplifies</span> Disaster Recovery
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-8 text-lg text-gray-700 font-just-sans leading-relaxed">
              <p>
                Housing disasters like fires, floods, hurricanes, and tornadoes are traumatic and overwhelming. In the aftermath, survivors face immense loss and the exhausting challenge of recovery. They're often left trying to organize support while navigating displacement, emotional stress, and rebuilding their lives.
              </p>
              
              <p>
                At the same time, communities want to help, but they often don't know how. Donations can become scattered, duplicated, or mistimed. The intention is generous, but the impact isn't always aligned with what's actually needed.
              </p>
              
              <div className="text-center py-8">
                <p className="text-2xl font-semibold text-navy">
                  That's where MyNeedfully comes in.
                </p>
              </div>
              
              <p>
                MyNeedfully simplifies the recovery process. We provide a free, easy-to-use platform where people affected by disasters can create and share a personalized needs list just like a gift registry. Whether it's clothing, baby supplies, toiletries, furniture, or gift cards, survivors can communicate exactly what they need, and supporters can send help that's timely, specific, and meaningful.
              </p>
              
              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-coral">
                <p className="text-gray-700 mb-0">
                  The platform is free for users. MyNeedfully is a for-profit company that earns revenue through affiliate links with trusted e-commerce retailers. That means we can remain accessible to everyone without relying on donations or charging fees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Story Section */}
        <div className="mb-12 animate-fade-in">
          {/* Header and Image */}
          <div className="text-center mb-12">
            <div className="text-coral text-sm font-bold tracking-widest uppercase mb-4">
              OUR STORY
            </div>
            
            <h2 className="text-3xl md:text-4xl text-navy mb-12 animate-slide-up font-just-sans leading-tight">
              Born From <span className="font-bold">Personal Experience</span>
            </h2>
            
            <div className="flex justify-center animate-slide-in-left mb-12" data-story-image-section>
              <div className="relative group max-w-4xl w-full">
                <img 
                  src={housefireImage}
                  alt="House fire that inspired the creation of MyNeedfully" 
                  className="w-full h-[300px] md:h-[400px] lg:h-[450px] object-cover rounded-xl shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-coral/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
          
          {/* Story Content */}
          <div className="max-w-4xl mx-auto space-y-8 animate-slide-in-right">
            <p className="text-lg text-gray-700 font-just-sans leading-relaxed">
              MyNeedfully was born from personal experience. After a devastating house fire, we were overwhelmed by the kindness of friends, family, and co-workers who wanted to help. But we quickly realized how difficult it was to organize donations, communicate our needs, and navigate the recovery process. Around the same time, we faced another tragedy in the loss of a beloved family member to pancreatic cancer. Once again, our community stepped up, but the process of receiving support felt scattered and overwhelming. We knew there had to be a better way. We created MyNeedfully to simplify giving, connect communities, and provide a dignified way for people in crisis to ask for and receive exactly what they need when they need it most.
            </p>
            
            <p className="text-lg text-gray-700 font-just-sans leading-relaxed">
              This platform makes it easy for individuals to create a list of essential and specialty needs, and for others to directly fulfill these needs. By connecting people in need with those who want to help, we enable communities to provide meaningful support in an efficient manner.
            </p>
            
            <p className="text-lg text-gray-700 font-just-sans leading-relaxed">
              MyNeedfully is a for-profit company. To sustain our platform and keep it free to use, we participate in affiliate marketing programs. This means that when supporters purchase items through needs lists, we may earn a small commission–at no additional cost to the user. As an Amazon Associate, we earn from qualifying purchases. This affiliate model helps us maintain and grow MyNeedfully while continuing to serve individuals and communities with care and integrity.
            </p>
          </div>
        </div>



        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          <div>
            <img 
              src={missionImage} 
              alt="Two people embracing, showing compassion and support" 
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-navy mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-8">
              MyNeedfully.com helps individuals and families in crisis receive the support they need from their community.
            </p>
            
            <div className="space-y-4">
              {missionPoints.map((point, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-coral mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mb-8 bg-gradient-to-r from-coral/10 to-coral/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-navy mb-4">
              Ready to create a needs list for yourself or someone in need?
            </h2>
            <Link href="/create">
              <Button size="lg" className="bg-coral hover:bg-coral/90">
                Get Started Now
              </Button>
            </Link>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}