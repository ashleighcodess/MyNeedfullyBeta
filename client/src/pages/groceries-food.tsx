import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShoppingCart, 
  Apple, 
  Beef, 
  Milk, 
  Plus,
  Search
} from "lucide-react";

export default function GroceriesFood() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Apple, name: "Fresh Produce", description: "Fruits, vegetables, healthy fresh food options" },
    { icon: Beef, name: "Proteins", description: "Meat, fish, eggs, beans, protein-rich foods" },
    { icon: Milk, name: "Dairy & Staples", description: "Milk, cheese, bread, rice, pasta, cooking basics" },
    { icon: ShoppingCart, name: "Pantry Essentials", description: "Canned goods, spices, oils, non-perishable items" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <ShoppingCart className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Groceries & Food Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nutritious food is essential for health and well-being. MyNeedfully connects 
            families in need with community supporters who provide groceries and food supplies.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">42M+</div>
              <div className="text-gray-600">Americans experience food insecurity</div>
            </CardContent>
          </Card>
          <Card className="text-center border-orange-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">$1,200+</div>
              <div className="text-gray-600">Monthly grocery costs for families</div>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">13M+</div>
              <div className="text-gray-600">Children face hunger daily</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Needed Food Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
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

        {/* How to Get Help */}
        <Card className="bg-green-50 border-green-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get Food Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">Share Food Needs</h3>
                <p className="text-sm text-gray-600">List the groceries and food items your family needs</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Community Provides</h3>
                <p className="text-sm text-gray-600">Local supporters purchase groceries and deliver food</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Nourish & Thrive</h3>
                <p className="text-sm text-gray-600">Nutritious food helps your family stay healthy and strong</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Food Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            No one should go hungry. Connect with caring community members who want to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Food Support
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Food Needs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}