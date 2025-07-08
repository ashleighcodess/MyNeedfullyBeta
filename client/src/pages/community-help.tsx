import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Home, 
  Heart, 
  HandHeart, 
  Plus,
  Search
} from "lucide-react";

export default function CommunityHelp() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Home, name: "Household Support", description: "Furniture, appliances, home maintenance, utilities" },
    { icon: Heart, name: "Emotional Support", description: "Mental health resources, counseling, comfort items" },
    { icon: HandHeart, name: "Volunteer Services", description: "Transportation, childcare, elderly care, pet care" },
    { icon: Users, name: "Social Connection", description: "Community events, group activities, networking support" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-teal-100 p-4 rounded-full">
              <Users className="h-12 w-12 text-teal-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Community Help
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Strong communities support each other through all of life's challenges. MyNeedfully connects 
            community members who need support with neighbors ready to help in any way they can.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-teal-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-teal-600 mb-2">73%</div>
              <div className="text-gray-600">Americans feel disconnected from community</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">50M+</div>
              <div className="text-gray-600">People provide volunteer support annually</div>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-gray-600">People want to help their neighbors</div>
            </CardContent>
          </Card>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Ways Communities Support Each Other
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="bg-teal-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-teal-600" />
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
        <Card className="bg-teal-50 border-teal-200 mb-12">
          <CardContent className="py-8">
            <h2 className="text-2xl font-bold text-navy text-center mb-6">
              How to Get Community Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-navy mb-2">Share Your Needs</h3>
                <p className="text-sm text-gray-600">Tell your community what kind of support would help you most</p>
              </div>
              <div className="text-center">
                <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-navy mb-2">Neighbors Respond</h3>
                <p className="text-sm text-gray-600">Community members offer help, items, and services</p>
              </div>
              <div className="text-center">
                <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-navy mb-2">Community Grows</h3>
                <p className="text-sm text-gray-600">Support creates lasting connections and stronger neighborhoods</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Community Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            You don't have to face challenges alone. Your community is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Community Help
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Help Your Community
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}