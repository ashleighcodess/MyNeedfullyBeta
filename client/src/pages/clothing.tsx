import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shirt, 
  ShirtIcon, 
  Footprints, 
  Coat, 
  Heart,
  Plus,
  Search
} from "lucide-react";

export default function Clothing() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Shirt, name: "Everyday Clothing", description: "Shirts, pants, underwear, basic wardrobe items" },
    { icon: Footprints, name: "Footwear", description: "Shoes, boots, sandals, socks for all seasons" },
    { icon: Coat, name: "Seasonal Wear", description: "Coats, jackets, sweaters, weather-appropriate clothing" },
    { icon: Heart, name: "Special Occasions", description: "Work clothes, interview attire, formal wear" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Shirt className="h-12 w-12 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Clothing Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everyone deserves dignity through proper clothing. MyNeedfully connects people in need 
            with community supporters who provide clothing and footwear for all occasions.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-indigo-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-indigo-600 mb-2">46M+</div>
              <div className="text-gray-600">Americans struggle with clothing costs</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">$1,800+</div>
              <div className="text-gray-600">Annual clothing costs per person</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
              <div className="text-gray-600">Families skip buying necessary clothing</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Needed Clothing Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="bg-indigo-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How to Get Help */}
        <Card className="bg-indigo-50 border-indigo-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get Clothing Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">Share Clothing Needs</h3>
                <p className="text-sm text-gray-600">List the clothing items you need for work, school, or daily life</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Community Provides</h3>
                <p className="text-sm text-gray-600">Local supporters purchase clothing and footwear for you</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Rebuild Confidence</h3>
                <p className="text-sm text-gray-600">Feel confident and prepared with proper clothing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Clothing Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Proper clothing builds confidence and opens opportunities. Connect with caring community members.
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