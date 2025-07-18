import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { 
  ArrowRight, 
  ExternalLink, 
  Home, 
  Shield, 
  AlertTriangle,
  FileText,
  Camera,
  Users,
  PhoneCall,
  Flame,
  Building,
  Heart,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

export default function SupportResources() {
  const { isAuthenticated } = useAuth();

  // SEO Configuration
  useSEO({
    title: generatePageTitle("Support Resources - House Fire Recovery Guide"),
    description: generatePageDescription("Complete guide to recovering from house fires and accessing crisis support resources. Learn step-by-step recovery processes, insurance navigation, and community assistance programs."),
    keywords: generateKeywords([
      "house fire recovery",
      "fire disaster relief",
      "emergency support resources",
      "insurance claims fire",
      "crisis support services",
      "fire recovery guide",
      "emergency housing assistance",
      "disaster relief resources"
    ]),
    canonical: generateCanonicalUrl("/support-resources"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Support Resources - House Fire Recovery",
      "description": "Complete guide to house fire recovery and crisis support resources",
      "url": "https://myneedfully.app/support-resources",
      "isPartOf": {
        "@type": "WebSite",
        "name": "MyNeedfully",
        "url": "https://myneedfully.app"
      },
      "mainEntity": {
        "@type": "HowTo",
        "name": "How to Recover from a House Fire",
        "description": "Step-by-step guide for recovering from house fire devastation",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Ensure Safety First",
            "text": "Immediately evacuate everyone to a safe location and call 911"
          },
          {
            "@type": "HowToStep", 
            "name": "Immediate Assistance",
            "text": "Contact trusted family members or friends and notify your insurance company"
          },
          {
            "@type": "HowToStep",
            "name": "Document Everything",
            "text": "Take photos and videos of damage, create inventory of lost items"
          }
        ]
      }
    }
  });

  const recoverySteps = [
    {
      id: 1,
      title: "Ensure Safety First",
      icon: Shield,
      description: "Immediately evacuate everyone to a safe location.",
      details: [
        "Call 911 as soon as possible",
        "Avoid re-entering your home until emergency personnel have declared it safe"
      ],
      urgency: "critical"
    },
    {
      id: 2,
      title: "Immediate Assistance", 
      icon: PhoneCall,
      description: "Contact trusted family members or friends to secure temporary housing.",
      details: [
        "Notify your insurance company as soon as possible to initiate your claim"
      ],
      urgency: "high"
    },
    {
      id: 3,
      title: "Engage with Emergency Services",
      icon: Building,
      description: "Request a copy of the fire report from the responding fire department.",
      details: [
        "You'll need this document for your insurance claim",
        "Ask the responding police officers for their report or any additional documentation they provide"
      ],
      urgency: "high"
    },
    {
      id: 4,
      title: "Document Everything",
      icon: Camera,
      description: "Take photos and videos of the damage, inside and outside the home.",
      details: [
        "Create an inventory of damaged or lost items, including estimates on their value",
        "Keep all receipts for any immediate expenses, such as clothing, food, and accommodations"
      ],
      urgency: "medium"
    },
    {
      id: 5,
      title: "Manage Insurance Claims",
      icon: FileText,
      description: "Work directly with your insurance adjuster provided by your insurance company.",
      details: [
        "Keep detailed notes of all communications with the insurance company and adjusters",
        "Be cautious of early low-ball offers or settlement checks from your insurance company",
        "It's important to thoroughly evaluate your losses and get quotes from contractors before accepting any settlement"
      ],
      urgency: "medium"
    },
    {
      id: 6,
      title: "Beware of 'Ambulance Chasers' (Public Adjusters)",
      icon: AlertTriangle,
      description: "Public adjusters may approach you offering assistance. Proceed with caution.",
      details: [
        "Public adjusters can be very helpful, but they also have a polarizing reputation",
        "Their job is to negotiate with your insurance company to make sure you receive proper remuneration for the damage",
        "Verify any public adjuster's credentials and reputation thoroughly before signing any contracts",
        "Understand their fees and ensure their operations align with state regulations",
        "Get multiple quotes if you want to proceed with a public adjuster"
      ],
      urgency: "medium"
    },
    {
      id: 7,
      title: "Professional Remediation Services",
      icon: Home,
      description: "Use a trusted, certified remediation company to clean and secure your home.",
      details: [
        "Ensure the remediation company provides a detailed written estimate and a clear timeline for work completion"
      ],
      urgency: "low"
    }
  ];

  const supportResources = [
    {
      name: "American Red Cross",
      description: "Home fire recovery assistance and emergency support",
      url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/fire/home-fire-recovery.html",
      type: "emergency"
    },
    {
      name: "US Fire Administration",
      description: "Federal fire safety and recovery resources",
      url: "https://www.usfa.fema.gov/prevention/home-fires/after-a-fire/",
      type: "government"
    }
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-coral rounded-lg">
              <Flame className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">House Fire Recovery Guide</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Recovering from a house fire is not just about surviving the initial devastation. It's a long, challenging journey that requires comprehensive support and guidance.
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="bg-coral-light border border-coral rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Heart className="h-6 w-6 text-coral mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-navy text-lg mb-2">Understanding Your Journey</h3>
                  <p className="text-gray-700 leading-relaxed">
                    From securing temporary housing and replacing critical documents, to navigating complex insurance claims and emotional trauma, rebuilding your life takes significant time, resources, and community support. While immediate needs are urgent, the road to full recovery can span months or even years. The importance of sustained support and practical assistance long after the flames are extinguished cannot be overstated.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recovery Steps */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">Step-by-Step Recovery Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recoverySteps.map((step) => {
              const IconComponent = step.icon;
              
              return (
                <Card key={step.id} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-coral-light rounded-lg">
                        <IconComponent className="h-6 w-6 text-coral" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">Step {step.id}</span>
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    {step.details.length > 0 && (
                      <ul className="space-y-2">
                        {step.details.map((detail, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Support Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">Additional Support Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ExternalLink className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy">{resource.name}</h3>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-coral hover:text-coral-dark transition-colors"
                  >
                    <span>Visit Resource</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-coral text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Need Community Support?</h3>
              <p className="text-coral-light mb-6 max-w-2xl mx-auto">
                Beyond recovery resources, our community is here to help with immediate needs through personalized support lists.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/browse">
                  <Button className="bg-white text-coral hover:bg-gray-100">
                    Find Support Lists
                  </Button>
                </Link>
                {isAuthenticated ? (
                  <Link href="/create">
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-coral">
                      Create Your List
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/signup">
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-coral">
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}