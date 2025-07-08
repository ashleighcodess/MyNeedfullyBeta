import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Package, 
  Utensils, 
  Bed, 
  Lightbulb, 
  Plus,
  Search
} from "lucide-react";

export default function EssentialItems() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Utensils, name: "Food & Water", description: "Non-perishable food, clean water, cooking supplies" },
    { icon: Bed, name: "Shelter & Bedding", description: "Blankets, pillows, sleeping bags, temporary shelter" },
    { icon: Lightbulb, name: "Power & Light", description: "Flashlights, batteries, generators, emergency lighting" },
    { icon: Package, name: "Basic Supplies", description: "Toiletries, first aid, tools, communication devices" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-amber-100 p-4 rounded-full">
              <Package className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Essential Items Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Basic necessities are fundamental to human dignity and survival. MyNeedfully connects 
            people in need with community supporters who provide life's essential items.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-amber-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-amber-600 mb-2">37M+</div>
              <div className="text-gray-600">Americans lack access to basic necessities</div>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">$2,100+</div>
              <div className="text-gray-600">Monthly cost of essential items</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">68%</div>
              <div className="text-gray-600">Families struggle with basic needs</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Critical Essential Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="bg-amber-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-amber-600" />
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
        <Card className="bg-amber-50 border-amber-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get Essential Items Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">List Your Needs</h3>
                <p className="text-sm text-gray-600">Share what essential items you need to survive and thrive</p>
              </div>
              <div className="text-center">
                <div className="bg-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Community Responds</h3>
                <p className="text-sm text-gray-600">Local supporters provide essential items and supplies</p>
              </div>
              <div className="text-center">
                <div className="bg-amber-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Stability Restored</h3>
                <p className="text-sm text-gray-600">Essential items help you rebuild stability and security</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Essential Items Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Everyone deserves access to life's basic necessities. Your community wants to help.
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
                Support Essential Needs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}