import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import submarkLogo from "@assets/Logo_5_1751594497665.png";
import { 
  Home, 
  Utensils, 
  Heart, 
  DollarSign, 
  AlertTriangle,
  Phone,
  ExternalLink
} from "lucide-react";

export default function Resources() {
  const resourceCategories = {
    housing: {
      title: "Housing",
      icon: Home,
      resources: [
        {
          name: "National Low Income Housing Coalition",
          description: "Advocates for affordable housing and provides resources for finding housing assistance.",
          phone: "(202) 662-1530",
          website: "https://nlihc.org"
        },
        {
          name: "HUD Housing Assistance",
          description: "Federal assistance programs including Section 8 vouchers and public housing.",
          phone: "(800) 569-4287",
          website: "https://www.hud.gov"
        },
        {
          name: "Homeless Shelter Directory",
          description: "Find emergency shelters and transitional housing in your area.",
          phone: "(211) - Dial 2-1-1",
          website: "https://www.homelessshelterdirectory.org"
        }
      ]
    },
    food: {
      title: "Food Assistance", 
      icon: Utensils,
      resources: [
        {
          name: "Feeding America",
          description: "Nationwide Network Of Food Banks And Pantries.",
          phone: "(800) 771-2303",
          website: "https://www.feedingamerica.org"
        },
        {
          name: "SNAP Benefits (Food Stamps)",
          description: "Government Assistance For Purchasing Food.",
          phone: "(800) 221-5689",
          website: "https://www.fns.usda.gov/snap"
        },
        {
          name: "Meals On Wheels",
          description: "Meals Delivery For Seniors And Disabled Individuals.",
          phone: "(888) 998-6325",
          website: "https://www.mealsonwheelsamerica.org"
        },
        {
          name: "WIC Program",
          description: "Nutrition assistance for women, infants, and children.",
          phone: "(800) 942-3678",
          website: "https://www.fns.usda.gov/wic"
        }
      ]
    },
    mental: {
      title: "Mental Health",
      icon: Heart,
      resources: [
        {
          name: "National Suicide Prevention Lifeline",
          description: "24/7 Support For People In Distress",
          phone: "988 Or (800) 273-8255",
          website: "https://suicidepreventionlifeline.org"
        },
        {
          name: "Crisis Text Line",
          description: "Free, 24/7 crisis support via text message.",
          phone: "Text HOME to 741741",
          website: "https://www.crisistextline.org"
        },
        {
          name: "NAMI (National Alliance on Mental Illness)",
          description: "Mental health support, education, and advocacy.",
          phone: "(800) 950-6264",
          website: "https://www.nami.org"
        },
        {
          name: "SAMHSA National Helpline",
          description: "Treatment referral and information service for mental health and substance abuse.",
          phone: "(800) 662-4357",
          website: "https://www.samhsa.gov"
        }
      ]
    },
    financial: {
      title: "Financial Aid",
      icon: DollarSign,
      resources: [
        {
          name: "211 United Way",
          description: "Connect with local financial assistance programs and resources.",
          phone: "Dial 2-1-1",
          website: "https://www.211.org"
        },
        {
          name: "Salvation Army",
          description: "Emergency financial assistance for rent, utilities, and basic needs.",
          phone: "(800) 725-2769",
          website: "https://www.salvationarmyusa.org"
        },
        {
          name: "Catholic Charities",
          description: "Financial assistance and support services regardless of faith.",
          phone: "(703) 549-1390",
          website: "https://www.catholiccharitiesusa.org"
        },
        {
          name: "LIHEAP Energy Assistance",
          description: "Help with heating and cooling costs for low-income households.",
          phone: "(866) 674-6327",
          website: "https://www.acf.hhs.gov/ocs/programs/liheap"
        }
      ]
    },
    emergency: {
      title: "Emergency Help",
      icon: AlertTriangle,
      resources: [
        {
          name: "Emergency Services",
          description: "For immediate life-threatening emergencies.",
          phone: "911",
          website: ""
        },
        {
          name: "Red Cross Emergency Assistance",
          description: "Emergency shelter, food, and relief supplies during disasters.",
          phone: "(800) 733-2767",
          website: "https://www.redcross.org"
        },
        {
          name: "FEMA Disaster Assistance",
          description: "Federal emergency assistance for disaster survivors.",
          phone: "(800) 621-3362",
          website: "https://www.fema.gov"
        },
        {
          name: "National Domestic Violence Hotline",
          description: "24/7 confidential support for domestic violence survivors.",
          phone: "(800) 799-7233",
          website: "https://www.thehotline.org"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg relative">
      
      {/* Background Submark */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src={submarkLogo} 
          alt="" 
          className="w-96 h-96 opacity-[0.03] select-none"
        />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">Resources</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Helpful Links And Contacts For Those In Need Of Support Beyond Material Items.
          </p>
        </div>

        {/* Finding Help Section */}
        <Card className="mb-8 bg-gradient-to-r from-coral/10 to-coral/20 border-l-4 border-coral shadow-lg">
          <CardContent className="p-8 text-center relative">
            <div className="absolute top-4 right-4 w-8 h-8 bg-coral/20 rounded-full"></div>
            <h2 className="text-2xl font-bold text-navy mb-4">Finding Help</h2>
            <p className="text-gray-700 mb-6">
              Beyond Needs Lists, There Are Many Organizations And Programs That Can Provide Assistance During Difficult Times. 
              We've Compiled This Resource Directory To Help You Find Additional Support.
            </p>
          </CardContent>
        </Card>

        {/* Resources Tabs */}
        <Tabs defaultValue="housing" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-100 p-1 rounded-lg">
            {Object.entries(resourceCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="flex items-center gap-2 data-[state=active]:bg-coral data-[state=active]:text-white transition-all"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.title}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(resourceCategories).map(([key, category]) => (
            <TabsContent key={key} value={key}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.resources.map((resource, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all hover:border-coral/30 border-l-4 border-coral/20 hover:border-l-coral relative group">
                    <CardContent className="p-6">
                      <div className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-navy group-hover:text-coral/90 transition-colors">{resource.name}</h3>
                        {resource.website && (
                          <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-coral transition-colors" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {resource.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-2 bg-coral/5 rounded-lg">
                          <Phone className="h-4 w-4 text-coral" />
                          <span className="font-semibold text-navy">{resource.phone}</span>
                        </div>
                        
                        {resource.website && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-coral/30 hover:bg-coral hover:text-white transition-colors"
                            onClick={() => window.open(resource.website, '_blank')}
                          >
                            Visit Website
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Emergency Notice */}
        <Card className="mt-8 bg-red-50 border-red-200 border-l-4 border-l-red-500 shadow-lg">
          <CardContent className="p-6 text-center relative">
            <div className="absolute top-2 right-2 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Notice</h3>
            <p className="text-red-700">
              If You Or Someone You Know Is In Immediate Danger, Please Call Emergency Services At{" "}
              <span className="font-bold bg-red-100 px-2 py-1 rounded">911</span>.
            </p>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-coral/10 to-coral/20 border-l-4 border-coral shadow-lg">
          <CardContent className="p-8 text-center relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-16 h-1 bg-coral rounded-full"></div>
            <div className="absolute top-4 right-4 w-6 h-6 bg-coral/20 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 bg-coral/30 rounded-full"></div>
            <h2 className="text-2xl font-bold text-navy mb-4">
              Need Material Support Too?
            </h2>
            <p className="text-gray-700 mb-6">
              Browse active needs lists to help community members with specific items they need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" className="bg-coral hover:bg-coral/90 shadow-lg hover:shadow-xl transition-all">
                  Browse Needs Lists
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral hover:text-white transition-all">
                  Create Your Needs List
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}