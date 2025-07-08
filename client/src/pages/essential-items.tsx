import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Package, 
  Utensils, 
  Shirt, 
  Home, 
  Baby,
  Plus,
  Search
} from "lucide-react";

export default function EssentialItems() {
  const { isAuthenticated } = useAuth();

  const essentialCategories = [
    { icon: Utensils, name: "Food & Water", description: "Non-perishable food, clean water, baby formula" },
    { icon: Shirt, name: "Clothing & Personal Care", description: "Weather-appropriate clothing, hygiene items" },
    { icon: Home, name: "Shelter & Comfort", description: "Blankets, pillows, basic furniture" },
    { icon: Baby, name: "Family Necessities", description: "Diapers, baby items, school supplies" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <Package className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Essential Items Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everyone deserves access to basic necessities. MyNeedfully helps families get 
            essential items they need for daily living, from food and clothing to personal 
            care items and household basics.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">37 million</div>
              <div className="text-gray-600">Americans face food insecurity</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">1 in 7</div>
              <div className="text-gray-600">Children lack basic necessities</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">Community</div>
              <div className="text-gray-600">Support makes the difference</div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Connecting Basic Needs with Community Care
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600">For Those in Need</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    List specific essential items your family needs
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Share your situation with dignity and respect
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive items delivered directly to your home
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Connect with caring community supporters
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600">For Community Helpers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Browse authentic needs from local families
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Purchase items from trusted retailers
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Make immediate impact on families
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Build stronger community connections
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Essential Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Requested Essential Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialCategories.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-green-200 hover:border-green-300 transition-colors">
                  <CardContent className="py-6">
                    <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Common Essential Items List */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Frequently Needed Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600">Food & Kitchen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Canned goods and non-perishables</li>
                  <li>• Rice, pasta, and grains</li>
                  <li>• Baby formula and baby food</li>
                  <li>• Basic kitchen utensils</li>
                  <li>• Plates, cups, and bowls</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600">Personal Care</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Soap, shampoo, toothpaste</li>
                  <li>• Deodorant and feminine hygiene</li>
                  <li>• Diapers and baby wipes</li>
                  <li>• Towels and washcloths</li>
                  <li>• First aid supplies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600">Household Basics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Cleaning supplies</li>
                  <li>• Laundry detergent</li>
                  <li>• Blankets and pillows</li>
                  <li>• Basic tools and batteries</li>
                  <li>• Garbage bags and storage</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Story */}
        <Card className="bg-green-50 border-green-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "Small acts of kindness made a huge difference"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "When I lost my job, even buying groceries became impossible. Through MyNeedfully, 
                neighbors I'd never met sent food, cleaning supplies, and even toys for my kids. 
                Their generosity helped us get through the toughest months."
              </p>
              <p className="text-green-600 font-semibold">- Jennifer K., Single Mother</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Be Part of the Essential Support Network
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every family deserves access to basic necessities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Essential Items
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Help Families in Need
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}