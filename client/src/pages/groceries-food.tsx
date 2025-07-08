import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShoppingCart, 
  Apple, 
  Milk, 
  Bread, 
  Heart,
  Plus,
  Search
} from "lucide-react";

export default function GroceriesFood() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Apple, name: "Fresh Produce", description: "Fruits, vegetables, fresh ingredients for healthy meals" },
    { icon: Milk, name: "Dairy & Protein", description: "Milk, eggs, cheese, meat, protein sources" },
    { icon: Bread, name: "Pantry Staples", description: "Bread, rice, pasta, canned goods, dry goods" },
    { icon: Heart, name: "Baby & Special Diet", description: "Baby formula, dietary supplements, special needs food" }
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
            No one should go hungry. MyNeedfully connects families facing food insecurity 
            with community members who can provide groceries and essential food items.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">38M+</div>
              <div className="text-gray-600">Americans face food insecurity</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">12M+</div>
              <div className="text-gray-600">Children experience hunger</div>
            </CardContent>
          </Card>
          <Card className="text-center border-orange-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">$300+</div>
              <div className="text-gray-600">Monthly grocery costs per family</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Needed Food Items
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
                <h3 className="font-semibold text-navy mb-2">Share Your Food Needs</h3>
                <p className="text-sm text-gray-600">List the groceries and food items your family needs</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Community Provides</h3>
                <p className="text-sm text-gray-600">Local supporters purchase groceries and food items</p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Feed Your Family</h3>
                <p className="text-sm text-gray-600">Receive nutritious food to keep your family healthy</p>
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
            Every family deserves nutritious food. Connect with caring community members.
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