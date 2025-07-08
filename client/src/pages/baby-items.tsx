import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Baby, 
  Milk, 
  Shirt, 
  Zap, 
  Heart,
  Plus,
  Search
} from "lucide-react";

export default function BabyItems() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Milk, name: "Feeding Essentials", description: "Formula, baby food, bottles, feeding supplies" },
    { icon: Shirt, name: "Clothing & Diapers", description: "Baby clothes, diapers, wipes, comfort items" },
    { icon: Zap, name: "Safety & Care", description: "Car seats, strollers, baby monitors, safety gear" },
    { icon: Heart, name: "Development & Play", description: "Toys, books, developmental items, comfort blankets" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-pink-100 p-4 rounded-full">
              <Baby className="h-12 w-12 text-pink-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Baby Items Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every baby deserves the essentials for healthy development. MyNeedfully connects 
            families with newborns and young children to community supporters who provide baby items.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-pink-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-pink-600 mb-2">12M+</div>
              <div className="text-gray-600">Children under 5 in poverty</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">$3,000+</div>
              <div className="text-gray-600">Annual cost of baby essentials</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
              <div className="text-gray-600">Families struggle with baby costs</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Needed Baby Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="bg-pink-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-pink-600" />
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
        <Card className="bg-pink-50 border-pink-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get Baby Items Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">Share Your Baby's Needs</h3>
                <p className="text-sm text-gray-600">List the essential items your baby needs for healthy development</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Community Provides</h3>
                <p className="text-sm text-gray-600">Caring supporters purchase baby items and supplies</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Baby Thrives</h3>
                <p className="text-sm text-gray-600">Your baby receives essential items for healthy growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Baby Items Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every baby deserves the best start in life. Connect with caring community members.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Baby Items
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Baby Needs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}