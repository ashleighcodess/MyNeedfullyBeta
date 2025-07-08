import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  GraduationCap, 
  BookOpen, 
  Pen, 
  Laptop, 
  Heart,
  Plus,
  Search
} from "lucide-react";

export default function SchoolSupplies() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: BookOpen, name: "Books & Materials", description: "Textbooks, workbooks, educational materials" },
    { icon: Pen, name: "Writing Supplies", description: "Pencils, pens, notebooks, paper, art supplies" },
    { icon: Laptop, name: "Technology", description: "Calculators, laptops, tablets, educational software" },
    { icon: Heart, name: "Essentials & Clothing", description: "Backpacks, lunch supplies, uniforms, shoes" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-purple-100 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            School Supplies Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every child deserves access to education. MyNeedfully connects students in need 
            with community supporters who provide school supplies and educational materials.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-purple-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">16M+</div>
              <div className="text-gray-600">Students from low-income families</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">$700+</div>
              <div className="text-gray-600">Annual school supply costs</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
              <div className="text-gray-600">Teachers spend own money on supplies</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Needed School Supplies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-purple-600" />
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
        <Card className="bg-purple-50 border-purple-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get School Supplies Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">Share School Needs</h3>
                <p className="text-sm text-gray-600">List the supplies your child needs for school success</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Community Supports</h3>
                <p className="text-sm text-gray-600">Local supporters purchase school supplies and materials</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Student Succeeds</h3>
                <p className="text-sm text-gray-600">Your child receives supplies needed for educational success</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get School Supplies Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Education is a right, not a privilege. Connect with caring community members.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request School Supplies
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Student Needs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}