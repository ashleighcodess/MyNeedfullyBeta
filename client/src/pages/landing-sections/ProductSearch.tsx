import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink } from "lucide-react";

const ProductSearch: React.FC = () => {
  const categories = [
    {
      title: "Emergency Essentials",
      description: "Basic necessities for immediate relief",
      color: "bg-red-50 border-red-200 text-red-800",
      icon: "🆘"
    },
    {
      title: "Home & Kitchen",
      description: "Essential household items and appliances",
      color: "bg-blue-50 border-blue-200 text-blue-800",
      icon: "🏠"
    },
    {
      title: "Clothing & Personal",
      description: "Clothing, shoes, and personal care items",
      color: "bg-green-50 border-green-200 text-green-800",
      icon: "👕"
    },
    {
      title: "Children & Baby",
      description: "Everything for kids and infants",
      color: "bg-purple-50 border-purple-200 text-purple-800",
      icon: "👶"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Shop by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse products from trusted retailers to support families in need.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <Badge className={category.color}>
                  Browse Items
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <h3 className="text-2xl font-bold text-navy mb-6">Shop from Trusted Partners</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="text-lg font-semibold text-gray-600">Amazon</div>
            <div className="text-lg font-semibold text-gray-600">Walmart</div>
            <div className="text-lg font-semibold text-gray-600">Target</div>
            <div className="text-lg font-semibold text-gray-600">Home Depot</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSearch;