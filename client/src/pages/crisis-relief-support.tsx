import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  AlertTriangle, 
  Shield, 
  Heart, 
  Clock, 
  Plus,
  Search
} from "lucide-react";

export default function CrisisReliefSupport() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Clock, name: "Immediate Response", description: "Emergency shelter, food, water, medical care" },
    { icon: Shield, name: "Safety & Security", description: "Safe housing, protection, legal assistance" },
    { icon: Heart, name: "Emotional Support", description: "Counseling, therapy, trauma recovery resources" },
    { icon: AlertTriangle, name: "Recovery Planning", description: "Rebuilding supplies, financial assistance, job training" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Crisis Relief Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When crisis strikes, immediate support can make the difference between survival and tragedy. MyNeedfully connects 
            people in crisis with community members ready to provide urgent assistance and long-term recovery support.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">64M+</div>
              <div className="text-gray-600">People worldwide displaced by crisis</div>
            </CardContent>
          </Card>
          <Card className="text-center border-orange-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">72 hrs</div>
              <div className="text-gray-600">Critical window for crisis response</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">91%</div>
              <div className="text-gray-600">Recovery success with community support</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Crisis Support Areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-red-600" />
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
        <Card className="bg-red-50 border-red-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get Crisis Relief Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">Report Crisis</h3>
                <p className="text-sm text-gray-600">Share your urgent situation and immediate needs</p>
              </div>
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Rapid Response</h3>
                <p className="text-sm text-gray-600">Community mobilizes to provide immediate assistance</p>
              </div>
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Long-term Recovery</h3>
                <p className="text-sm text-gray-600">Continued support for rebuilding and recovery</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Crisis Relief Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            In times of crisis, every second counts. Connect with emergency support right now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Crisis Relief
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Provide Crisis Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}