import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Sparkles, 
  Heart, 
  Droplets, 
  Smile, 
  Plus,
  Search
} from "lucide-react";

export default function PersonalCareSupplies() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Sparkles, name: "Hygiene Essentials", description: "Soap, shampoo, toothbrush, toothpaste, deodorant" },
    { icon: Heart, name: "Health & Wellness", description: "Medications, vitamins, first aid supplies, medical equipment" },
    { icon: Droplets, name: "Feminine Care", description: "Menstrual products, maternity supplies, women's health items" },
    { icon: Smile, name: "Comfort & Dignity", description: "Skincare, hair care, grooming supplies, personal comfort items" }
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
            Personal care is essential for health and dignity. MyNeedfully connects people in need 
            with community supporters who provide hygiene supplies and personal care items.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-cyan-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-cyan-600 mb-2">25M+</div>
              <div className="text-gray-600">Americans lack access to basic hygiene</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">$400+</div>
              <div className="text-gray-600">Annual personal care costs per person</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">78%</div>
              <div className="text-gray-600">People skip personal care due to cost</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Needed Personal Care Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
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

        {/* How to Get Help */}
        <Card className="bg-cyan-50 border-cyan-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get Personal Care Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">Share Your Needs</h3>
                <p className="text-sm text-gray-600">List the personal care items you need for health and dignity</p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Community Provides</h3>
                <p className="text-sm text-gray-600">Local supporters purchase personal care supplies for you</p>
              </div>
              <div className="text-center">
                <div className="bg-cyan-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Maintain Dignity</h3>
                <p className="text-sm text-gray-600">Feel confident and healthy with proper personal care</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Personal Care Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Personal care is a basic human need. Connect with caring community members.
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