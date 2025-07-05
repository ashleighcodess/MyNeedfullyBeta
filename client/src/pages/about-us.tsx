import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { Link } from "wouter";
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
import aboutUsImage from "@assets/AboutUsIMage2_1751592833990.png";
import missionImage from "@assets/AboutUsImage3_1751592935275.png";
import howItWorksBackground from "@assets/HowIcons_1751593054903.png";

export default function AboutUs() {
  const stats = [
    { icon: Gift, label: "Needs Lists Fulfilled", value: "300+", color: "text-coral" },
    { icon: DollarSign, label: "Donations Raised", value: "$20,000", color: "text-green-600" },
    { icon: Smile, label: "Smiles Spread", value: "400+", color: "text-amber-500" },
    { icon: Package, label: "Products Delivered", value: "1,200+", color: "text-blue-600" }
  ];

  const howItWorks = [
    {
      icon: Gift,
      title: "Create a Needs List",
      description: "Build a Needs List of essential items you or someone you know needs during a difficult time.",
      color: "bg-coral/10 text-coral"
    },
    {
      icon: Share,
      title: "Share with Community",
      description: "Share your Needs List with friends, family, and your social network — and the broader community who want to help.",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: Heart,
      title: "Receive Support",
      description: "Items purchased from your Needs List are sent directly to you or your loved ones in need.",
      color: "bg-pink-500/10 text-pink-600"
    },
    {
      icon: CheckCircle,
      title: "Track Fulfillment",
      description: "Easily track which items have been fulfilled and those still needed.",
      color: "bg-green-500/10 text-green-600"
    }
  ];

  const missionPoints = [
    "We Create A Bridge Between People In Need And Those With Resources To Share.",
    "We Facilitate Direct, Meaningful Assistance That Addresses Specific Needs.",
    "We Empower Communities To Respond Effectively In Times Of Crisis.",
    "We Believe In The Collective Power Of Small Acts Of Kindness."
  ];

  const partners = [
    { name: "Amazon", logo: "🛒" },
    { name: "Walmart", logo: "🏪" },
    { name: "Target", logo: "🎯" },
    { name: "DoorDash", logo: "🚗" },
    { name: "Uber Eats", logo: "🍔" },
    { name: "Lowe's", logo: "🔨" },
    { name: "IKEA", logo: "🏠" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
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
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-4">
              Our mission is to connect people in crisis with the community support they need.
            </p>
          </div>
        </div>

        {/* Main Story */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-navy mb-6 text-center">
              Our Dream Is To Transform The Way To Fulfill Needs Of People In Need.
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                MyNeedfully.com was born from a simple observation: when people face crises like natural disasters, 
                domestic violence, or homelessness, they often need specific items to rebuild their lives – but it's 
                hard for friends, family, and community members to know exactly what to provide.
              </p>
              <p>
                We created a platform that makes it easy for individuals in need to create needs lists of essential items, 
                and for others to directly fulfill these needs. By connecting people in crisis with those who want to help, 
                we enable communities to provide targeted, meaningful support.
              </p>
              <p>
                Our vision is a world where no one faces crisis alone, where communities respond effectively to individuals' 
                needs, and where the path to recovery is made smoother through direct, tangible support.
              </p>
            </div>
            <div className="text-center mt-8">
              <Link href="/browse">
                <Button size="lg" className="bg-coral hover:bg-coral/90">
                  Support A Needs List
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Image and Statistics Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-8">
            <div>
              <img 
                src={aboutUsImage} 
                alt="Community helping and supporting each other" 
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <stat.icon className={`h-12 w-12 mx-auto mb-4 ${stat.color}`} />
                    <div className="text-3xl font-bold text-navy mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div 
          className="mb-8 relative bg-cover bg-center bg-no-repeat rounded-2xl overflow-hidden"
          style={{ 
            backgroundImage: `url(${howItWorksBackground})`,
            minHeight: '500px'
          }}
        >
          <div className="absolute inset-0 bg-white/85"></div>
          <div className="relative z-10 p-8 md:p-12">
            <h2 className="text-3xl font-bold text-navy text-center mb-4">How MyNeedfully Works</h2>
            <p className="text-lg text-gray-600 text-center mb-12">
              A Simple Process To Connect People In Need With Those Who Want To Help.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <Card key={index} className="text-center bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mx-auto mb-4`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-navy mb-3">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mb-8 bg-gradient-to-r from-coral/10 to-coral/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-navy mb-4">
              Ready To Create A Needs List For Yourself Or Someone In Need?
            </h2>
            <Link href="/create">
              <Button size="lg" className="bg-coral hover:bg-coral/90">
                Get Started Now
              </Button>
            </Link>
          </CardContent>
        </Card>

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
              MyNeedfully.Com Helps Individuals And Families In Crisis Receive The Support They Need From Their Community.
            </p>
            
            <div className="space-y-4">
              {missionPoints.map((point, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partners Section */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-8">Our Partners In Cause</h2>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-6">
              {partners.map((partner, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">{partner.logo}</span>
                  </div>
                  <p className="text-sm text-gray-600">{partner.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}