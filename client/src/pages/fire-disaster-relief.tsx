import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Flame, 
  Home, 
  Shirt, 
  Package, 
  Heart,
  Plus,
  Search
} from "lucide-react";

export default function FireDisasterRelief() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Home, name: "Temporary Housing Supplies", description: "Air mattresses, sleeping bags, blankets" },
    { icon: Shirt, name: "Clothing & Personal Items", description: "Basic clothing, toiletries, medications" },
    { icon: Package, name: "Emergency Supplies", description: "Food, water, first aid kits, flashlights" },
    { icon: Heart, name: "Comfort Items", description: "Books, toys for children, comfort items" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <Flame className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Fire Disaster Relief
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When fire disasters strike, families lose everything in an instant. MyNeedfully connects 
            fire victims with community supporters who can help replace essential items and rebuild lives.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">50,000+</div>
              <div className="text-gray-600">Homes lost to fires annually</div>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">72 hours</div>
              <div className="text-gray-600">Critical response window</div>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">100%</div>
              <div className="text-gray-600">Of donations go directly to families</div>
            </CardContent>
          </Card>
        </div>

        {/* How It Helps */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            How MyNeedfully Helps Fire Victims
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">For Fire Victims</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Create detailed needs lists for immediate essentials
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Share your story to connect with caring supporters
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive items shipped directly to temporary housing
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Track progress and thank supporters personally
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">For Supporters</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Browse verified fire victim needs lists
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Purchase specific items from trusted retailers
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Items ship directly to families in need
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive heartfelt thank you messages
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Needed Items After Fire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-red-200 hover:border-red-300 transition-colors">
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

        {/* Success Story */}
        <Card className="bg-red-50 border-red-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "MyNeedfully helped us rebuild our lives"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "After losing our home in the wildfire, we were overwhelmed. MyNeedfully connected us with 
                dozens of supporters who helped us get back on our feet. Within days, we had clothing, 
                supplies, and hope again."
              </p>
              <p className="text-red-600 font-semibold">- The Johnson Family, California</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Whether you need help or want to help others, get started today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Create Needs List
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Help Fire Victims
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}