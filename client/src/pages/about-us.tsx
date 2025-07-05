import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

        {/* Main Story Section */}
        <div className="mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-8 animate-slide-up">
            Our <span className="text-navy">Dream</span> Is To Transform<br />
            The Way To <span className="text-navy">Fulfill Wishes</span><br />
            Of <span className="text-navy">People In Need</span>.
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-6 animate-slide-in-left">
              <p className="text-gray-700 leading-relaxed transform transition-all duration-500 hover:translate-x-2">
                MyNeedfully.com Was Born From A Simple Observation: When People Face 
                Crises Like Natural Disasters, Domestic Violence, Or Homelessness, They Often 
                Need Specific Items To Rebuild Their Lives - But It's Hard For Friends, Family, And 
                Community Members To Know Exactly What To Provide.
              </p>
              <p className="text-gray-700 leading-relaxed transform transition-all duration-500 hover:translate-x-2">
                We Created A Platform That Makes It Easy For Individuals In Need To Create 
                Wishlists Of Essential Items, And For Others To Directly Fulfill These Needs. By 
                Connecting People In Crisis With Those Who Want To Help, We Enable 
                Communities To Provide Targeted, Meaningful Support.
              </p>
              <p className="text-gray-700 leading-relaxed transform transition-all duration-500 hover:translate-x-2">
                Our Vision Is A World Where No One Faces Crisis Alone, Where Communities 
                Respond Effectively To Individuals Needs, And Where The Path To Recovery Is 
                Made Smoother Through Direct, Tangible Support.
              </p>
              
              <div className="pt-4">
                <Link href="/browse">
                  <Button 
                    size="lg" 
                    className="bg-white text-navy border-2 border-navy hover:bg-navy hover:text-white rounded-full px-8 py-3 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Support A Needs List
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center animate-slide-in-right">
              <div className="relative group">
                <img 
                  src={aboutUsImage} 
                  alt="Family with needs list showing community support" 
                  className="w-full max-w-md h-auto rounded-xl shadow-2xl transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-coral/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
            <Card className="text-center bg-coral/10 border-coral/20 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-coral/15">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-navy mb-1 animate-pulse">900+</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Needs List Fulfilled</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-coral border-coral transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-coral/90">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-white mb-1 animate-pulse">$000,000</div>
                <div className="text-sm text-white/90 uppercase tracking-wide">Donation Raised</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-amber-100 border-amber-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-amber-200">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-navy mb-1 animate-pulse">100K</div>
                <div className="text-sm text-gray-600 uppercase tracking-wide">Smiles Spread</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-coral border-coral transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-coral/90">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-white mb-1 animate-pulse">000K</div>
                <div className="text-sm text-white/90 uppercase tracking-wide">Products Delivered</div>
              </CardContent>
            </Card>
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