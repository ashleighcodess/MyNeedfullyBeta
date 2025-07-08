import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Droplets, 
  Home, 
  Shirt, 
  Package, 
  Heart,
  Plus,
  Search
} from "lucide-react";

export default function EmergencyFloodRelief() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Home, name: "Water Damage Cleanup", description: "Dehumidifiers, fans, pumps, cleaning supplies" },
    { icon: Shirt, name: "Emergency Clothing", description: "Dry clothing, shoes, personal items" },
    { icon: Package, name: "Emergency Supplies", description: "Non-perishable food, water, batteries" },
    { icon: Heart, name: "Recovery Support", description: "Temporary shelter items, comfort supplies" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Droplets className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Emergency Flood Relief
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When flooding strikes, families face devastating water damage and urgent needs. MyNeedfully connects 
            flood victims with community supporters who can help with cleanup supplies, emergency items, and recovery essentials.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">38,000+</div>
              <div className="text-gray-600">Flood disasters annually in US</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">5M+</div>
              <div className="text-gray-600">People affected by floods yearly</div>
            </CardContent>
          </Card>
          <Card className="text-center border-purple-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">$15B+</div>
              <div className="text-gray-600">Annual flood damage costs</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Essential Flood Recovery Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
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
        <Card className="bg-blue-50 border-blue-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get Flood Relief Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">Share Your Flood Story</h3>
                <p className="text-sm text-gray-600">Document your flood damage and immediate needs for recovery</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">List Priority Items</h3>
                <p className="text-sm text-gray-600">Add cleanup supplies, emergency items, and recovery essentials</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Receive Community Help</h3>
                <p className="text-sm text-gray-600">Local supporters provide supplies to help you recover</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Flood Recovery Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Don't face flood recovery alone. Connect with a caring community ready to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Flood Relief
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Flood Victims
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}