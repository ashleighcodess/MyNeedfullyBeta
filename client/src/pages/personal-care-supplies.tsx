import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Sparkles, 
  Droplets, 
  Heart, 
  Baby, 
  Shield,
  Plus,
  Search
} from "lucide-react";

export default function PersonalCareSupplies() {
  const { isAuthenticated } = useAuth();

  const careCategories = [
    { icon: Droplets, name: "Hygiene Essentials", description: "Soap, shampoo, toothpaste, deodorant" },
    { icon: Heart, name: "Health & Wellness", description: "Vitamins, first aid, pain relief" },
    { icon: Baby, name: "Family Care", description: "Feminine hygiene, baby care, family needs" },
    { icon: Shield, name: "Personal Safety", description: "Sunscreen, protective items, safety gear" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-cyan-100 p-4 rounded-full">
              <Sparkles className="h-12 w-12 text-cyan-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Personal Care Supplies
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Personal care is a basic human dignity. MyNeedfully helps people access essential 
            hygiene products, health supplies, and personal care items that promote wellness, 
            confidence, and healthy living.
          </p>
        </div>

        {/* Personal Care Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-cyan-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-cyan-600 mb-2">$600</div>
              <div className="text-gray-600">Average annual personal care costs</div>
            </CardContent>
          </Card>
          <Card className="text-center border-cyan-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-cyan-600 mb-2">12 million</div>
              <div className="text-gray-600">Americans lack access to basic hygiene</div>
            </CardContent>
          </Card>
          <Card className="text-center border-cyan-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-cyan-600 mb-2">dignity</div>
              <div className="text-gray-600">Starts with basic personal care</div>
            </CardContent>
          </Card>
        </div>

        {/* How Personal Care Support Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Supporting Personal Dignity and Health
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-600">For Those in Need</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Request specific personal care and hygiene items
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Include health and wellness needs
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive items privately and discreetly
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Maintain health and dignity
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-600">For Care Supporters</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Find people who need personal care items
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Purchase from trusted health and beauty retailers
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Support health and wellness in your community
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Help restore confidence and dignity
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Personal Care Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Essential Personal Care Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {careCategories.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-cyan-200 hover:border-cyan-300 transition-colors">
                  <CardContent className="py-6">
                    <div className="bg-cyan-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-cyan-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Specific Personal Care Needs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Common Personal Care Needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-600">Daily Hygiene</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Soap, body wash, and shampoo</li>
                  <li>• Toothbrushes and toothpaste</li>
                  <li>• Deodorant and antiperspirant</li>
                  <li>• Razors and shaving cream</li>
                  <li>• Towels and washcloths</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-600">Health & Wellness</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Vitamins and supplements</li>
                  <li>• First aid and bandages</li>
                  <li>• Pain relief and medications</li>
                  <li>• Thermometers and health monitors</li>
                  <li>• Sunscreen and protective items</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-cyan-200">
              <CardHeader>
                <CardTitle className="text-cyan-600">Family Specific</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Feminine hygiene products</li>
                  <li>• Baby diapers and wipes</li>
                  <li>• Adult incontinence products</li>
                  <li>• Elderly care and mobility aids</li>
                  <li>• Special dietary supplements</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dignity and Health */}
        <Card className="bg-cyan-50 border-cyan-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <Heart className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-navy mb-4">
                Personal Care is Healthcare
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                Access to personal care items isn't a luxury - it's essential for health, 
                dignity, and participation in society. From job interviews to school attendance, 
                basic personal care opens doors to opportunities and improves quality of life.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Story */}
        <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "Basic care items changed everything for my confidence"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "After losing my job, I couldn't afford even basic hygiene items. Going to 
                interviews became embarrassing. Through MyNeedfully, supporters sent 
                everything I needed to feel confident again. That confidence helped me land 
                a new job within a month."
              </p>
              <p className="text-cyan-600 font-semibold">- Robert K., Job Seeker</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Support Personal Dignity and Health
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Everyone deserves access to basic personal care and hygiene.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Personal Care Items
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Personal Care Needs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}