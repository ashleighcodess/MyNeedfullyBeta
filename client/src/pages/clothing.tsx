import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shirt, 
  Footprints, 
  Sun, 
  Snowflake, 
  Users,
  Plus,
  Search
} from "lucide-react";

export default function Clothing() {
  const { isAuthenticated } = useAuth();

  const clothingCategories = [
    { icon: Shirt, name: "Basic Clothing", description: "Shirts, pants, underwear, everyday wear" },
    { icon: Footprints, name: "Footwear", description: "Shoes, boots, sneakers, work shoes" },
    { icon: Sun, name: "Seasonal Wear", description: "Summer clothes, swimwear, light layers" },
    { icon: Snowflake, name: "Winter Gear", description: "Coats, boots, warm clothing, accessories" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-teal-100 p-4 rounded-full">
              <Shirt className="h-12 w-12 text-teal-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Clothing Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everyone deserves dignity through proper clothing. MyNeedfully helps families 
            get weather-appropriate clothing, work attire, and essential garments for 
            all ages and life circumstances.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-teal-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-teal-600 mb-2">$1,800</div>
              <div className="text-gray-600">Average annual clothing cost per person</div>
            </CardContent>
          </Card>
          <Card className="text-center border-teal-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-teal-600 mb-2">25%</div>
              <div className="text-gray-600">Of children lack weather-appropriate clothing</div>
            </CardContent>
          </Card>
          <Card className="text-center border-teal-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-teal-600 mb-2">First impression</div>
              <div className="text-gray-600">Matters for jobs and opportunities</div>
            </CardContent>
          </Card>
        </div>

        {/* How Clothing Support Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Dignity Through Clothing
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-600">For Those in Need</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    List specific clothing sizes and types needed
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Include climate and work requirements
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive new clothing delivered to your home
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Feel confident and prepared for opportunities
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-600">For Clothing Angels</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Find people who need specific clothing items
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Purchase from trusted clothing retailers
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Help people feel confident and dignified
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Support job interviews and life opportunities
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Clothing Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Essential Clothing Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clothingCategories.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-teal-200 hover:border-teal-300 transition-colors">
                  <CardContent className="py-6">
                    <div className="bg-teal-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Clothing Needs by Situation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Supporting Different Life Situations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-600">Job Interview Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Professional dress shirts and blouses</li>
                  <li>• Dress pants and skirts</li>
                  <li>• Professional shoes</li>
                  <li>• Ties and accessories</li>
                  <li>• Clean, pressed presentation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-600">Growing Children</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• School-appropriate clothing</li>
                  <li>• Seasonal size updates</li>
                  <li>• Play clothes and pajamas</li>
                  <li>• Properly fitting shoes</li>
                  <li>• Weather-appropriate outerwear</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-600">Emergency Situations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Immediate replacement clothing</li>
                  <li>• Emergency weather protection</li>
                  <li>• Basic undergarments and socks</li>
                  <li>• Temporary work-appropriate attire</li>
                  <li>• Family clothing packages</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Story */}
        <Card className="bg-teal-50 border-teal-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "A new suit opened doors I thought were closed"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "After being homeless, I had nothing appropriate for job interviews. A supporter 
                through MyNeedfully sent me a complete professional outfit. That suit gave me 
                the confidence I needed, and I landed a job the very next week."
              </p>
              <p className="text-teal-600 font-semibold">- Michael R., Job Seeker</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Help Restore Dignity Through Clothing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Proper clothing opens doors to opportunities and self-confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Clothing Support
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Clothing Needs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}