import React, { useState, useMemo, memo, lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";
import { 
  Home, 
  Utensils, 
  Heart, 
  DollarSign, 
  AlertTriangle,
  Phone,
  ExternalLink
} from "lucide-react";

// Simplified resource card component
const ResourceCard = memo(({ resource }: { resource: any }) => (
  <Card className="hover:shadow-md transition-shadow border-l-4 border-coral/20 hover:border-l-coral">
    <CardContent className="p-4">
      <h3 className="text-lg font-semibold text-navy mb-3">{resource.name}</h3>
      <div className="flex items-center gap-2 p-2 bg-coral/5 rounded mb-3">
        <Phone className="h-4 w-4 text-coral" />
        <span className="font-semibold text-navy">{resource.phone}</span>
      </div>
      {resource.website && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-coral/30 hover:bg-coral hover:text-white"
          onClick={() => window.open(resource.website, '_blank')}
        >
          Visit Website
        </Button>
      )}
    </CardContent>
  </Card>
));

export default function Resources() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // SEO Configuration
  useSEO({
    title: generatePageTitle("Crisis Support Resources - MyNeedfully"),
    description: generatePageDescription("Find essential crisis support resources including housing assistance, food aid, mental health support, financial assistance, and emergency services."),
    keywords: generateKeywords([
      "crisis support resources",
      "emergency assistance",
      "housing help",
      "food assistance",
      "mental health support",
      "financial aid",
      "disaster relief"
    ]),
    canonical: generateCanonicalUrl("/resources"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Crisis Support Resources",
      "description": "Comprehensive directory of crisis support resources and emergency assistance programs",
      "url": "https://myneedfully.app/resources"
    }
  });
  
  // Streamlined resource categories for faster loading
  const resourceCategories = useMemo(() => ({
    housing: {
      title: "Housing",
      icon: Home,
      resources: [
        { name: "HUD Housing Assistance", phone: "(800) 569-4287", website: "https://www.hud.gov" },
        { name: "Homeless Shelter Directory", phone: "211", website: "https://www.homelessshelterdirectory.org" },
        { name: "National Call Center for Homeless Veterans", phone: "(877) 424-3838", website: "https://www.va.gov/homeless/nationalcallcenter.asp" },
        { name: "United Way 2-1-1", phone: "2-1-1", website: "https://www.211.org/" },
        { name: "National Coalition for the Homeless", phone: "(202) 462-4822", website: "https://nationalhomeless.org/" },
        { name: "Salvation Army – Housing & Homeless Services", phone: "(800) 725-2769", website: "https://www.salvationarmyusa.org/usn/" },
        { name: "Catholic Charities USA – Housing Assistance", phone: "(703) 549-1390", website: "https://www.catholiccharitiesusa.org/" },
        { name: "Continuum of Care (CoC) Homeless Assistance Programs – HUD", phone: "(202) 708-1112", website: "https://www.hudexchange.info/programs/coc/" }
      ]
    },
    food: {
      title: "Food", 
      icon: Utensils,
      resources: [
        { name: "Feeding America", phone: "(800) 771-2303", website: "https://www.feedingamerica.org" },
        { name: "SNAP Benefits", phone: "(800) 221-5689", website: "https://www.fns.usda.gov/snap" },
        { name: "WIC (Women, Infants, and Children Program)", phone: "(800) 942-3678", website: "https://www.fns.usda.gov/wic" },
        { name: "USDA National Hunger Hotline", phone: "(866) 348-6479", website: "https://www.hungerfreeamerica.org/program/national-hunger-hotline/" },
        { name: "No Kid Hungry", phone: "(877) 731-0446", website: "https://www.nokidhungry.org/" },
        { name: "The Salvation Army – Food Assistance", phone: "(800) 725-2769", website: "https://www.salvationarmyusa.org/usn/" },
        { name: "Food Research & Action Center (FRAC)", phone: "(202) 986-2200", website: "https://frac.org/" },
        { name: "Catholic Charities USA – Food Assistance", phone: "(703) 549-1390", website: "https://www.catholiccharitiesusa.org/" },
        { name: "WhyHunger Hotline", phone: "(800) 548-6479", website: "https://whyhunger.org/find-food/" }
      ]
    },
    mental: {
      title: "Mental Health",
      icon: Heart,
      resources: [
        { name: "Crisis Lifeline", phone: "988", website: "https://suicidepreventionlifeline.org" },
        { name: "Crisis Text Line", phone: "Text HOME to 741741", website: "https://www.crisistextline.org" },
        { name: "National Alliance on Mental Illness (NAMI) HelpLine", phone: "(800) 950-6264", website: "https://www.nami.org/help" },
        { name: "SAMHSA National Helpline", phone: "(800) 662-4357", website: "https://www.samhsa.gov/find-help/national-helpline" },
        { name: "Trevor Project (LGBTQ Youth Crisis & Support)", phone: "(866) 488-7386", website: "https://www.thetrevorproject.org/" },
        { name: "Veterans Crisis Line", phone: "988, Press 1", website: "https://www.veteranscrisisline.net/" },
        { name: "Mental Health America", phone: "(703) 684-7722", website: "https://www.mhanational.org/" }
      ]
    },
    financial: {
      title: "Financial",
      icon: DollarSign,
      resources: [
        { name: "211 United Way", phone: "211", website: "https://www.211.org" },
        { name: "Salvation Army", phone: "(800) 725-2769", website: "https://www.salvationarmyusa.org" }
      ]
    },
    emergency: {
      title: "Emergency",
      icon: AlertTriangle,
      resources: [
        { name: "Emergency Services", phone: "911", website: "" },
        { name: "Red Cross", phone: "(800) 733-2767", website: "https://www.redcross.org" }
      ]
    }
  }), []);

  return (
    <div className="min-h-screen bg-warm-bg relative">
      
      {/* Simplified background - removed heavy image */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-96 h-96 opacity-[0.03] select-none bg-coral/10 rounded-full blur-3xl"></div>
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
                  <ResourceCard key={`${key}-${index}`} resource={resource} />
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
              <Link href={isAuthenticated ? "/create" : "/signup"}>
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