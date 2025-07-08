import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Package, 
  Utensils, 
  Shield, 
  Lightbulb, 
  Heart,
  Plus,
  Search
} from "lucide-react";

export default function EssentialItems() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Utensils, name: "Food & Water", description: "Non-perishable food, water bottles, emergency meals" },
    { icon: Shield, name: "Safety & First Aid", description: "First aid kits, emergency medications, safety supplies" },
    { icon: Lightbulb, name: "Power & Light", description: "Flashlights, batteries, power banks, candles" },
    { icon: Heart, name: "Comfort & Hygiene", description: "Blankets, toiletries, personal care items" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full">
              <Package className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Essential Items Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When life's essentials become out of reach, communities come together. MyNeedfully connects 
            people in need with supporters who can provide basic necessities for survival and comfort.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-orange-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">37M+</div>
              <div className="text-gray-600">Americans face food insecurity</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">580K+</div>
              <div className="text-gray-600">People experiencing homelessness</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">$200+</div>
              <div className="text-gray-600">Monthly cost of basic essentials</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Needed Essential Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-orange-600" />
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
        <Card className="bg-orange-50 border-orange-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get Essential Items Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">Share Your Essential Needs</h3>
                <p className="text-sm text-gray-600">List the basic necessities you need for daily survival</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Community Support</h3>
                <p className="text-sm text-gray-600">Local supporters provide essential items to help you</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Rebuild Stability</h3>
                <p className="text-sm text-gray-600">Focus on getting back on your feet with community help</p>
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
            Basic necessities shouldn't be a struggle. Connect with caring community members.
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