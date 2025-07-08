import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Waves, 
  Home, 
  Heart, 
  Shield, 
  Plus,
  Search
} from "lucide-react";

export default function EmergencyFloodRelief() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Shield, name: "Immediate Safety", description: "Emergency shelter, dry clothing, safe drinking water" },
    { icon: Home, name: "Home Recovery", description: "Cleaning supplies, dehumidifiers, repair materials" },
    { icon: Heart, name: "Health & Wellness", description: "First aid, medications, hygiene supplies" },
    { icon: Waves, name: "Water Damage", description: "Pumps, fans, waterproof storage, replacement items" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Waves className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Emergency Flood Relief
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When floods strike, immediate action saves lives and livelihoods. MyNeedfully connects 
            flood victims with community supporters who provide essential relief supplies and recovery assistance.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">40M+</div>
              <div className="text-gray-600">Americans at risk of flooding</div>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">$54B+</div>
              <div className="text-gray-600">Annual flood damage costs</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">72 hrs</div>
              <div className="text-gray-600">Critical recovery window</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Essential Flood Relief Items
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
                <h3 className="font-semibold text-navy mb-2">Report Flood Damage</h3>
                <p className="text-sm text-gray-600">Share your immediate needs and flood damage situation</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Emergency Response</h3>
                <p className="text-sm text-gray-600">Community provides immediate relief supplies and assistance</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Rebuild & Recovery</h3>
                <p className="text-sm text-gray-600">Ongoing support for home repair and life restoration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Flood Relief Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Don't face flood recovery alone. Your community is here to help rebuild your life.
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