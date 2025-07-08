import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Heart, 
  HandHeart, 
  Home, 
  Shield,
  Plus,
  Search
} from "lucide-react";

export default function CommunityHelp() {
  const { isAuthenticated } = useAuth();

  const helpCategories = [
    { icon: Heart, name: "Emotional Support", description: "Comfort items, books, wellness products" },
    { icon: Home, name: "Housing Transition", description: "Moving supplies, furniture, household basics" },
    { icon: Shield, name: "Safety & Protection", description: "Security items, personal safety, peace of mind" },
    { icon: HandHeart, name: "Life Transitions", description: "Support during major life changes" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Users className="h-12 w-12 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Community Help & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Sometimes people need more than just material items - they need community connection 
            and support during life's challenges. MyNeedfully creates bridges between those who 
            need help and those ready to provide it.
          </p>
        </div>

        {/* Community Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-indigo-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-indigo-600 mb-2">stronger</div>
              <div className="text-gray-600">Communities formed through mutual aid</div>
            </CardContent>
          </Card>
          <Card className="text-center border-indigo-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-indigo-600 mb-2">together</div>
              <div className="text-gray-600">We overcome challenges better</div>
            </CardContent>
          </Card>
          <Card className="text-center border-indigo-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-indigo-600 mb-2">hope</div>
              <div className="text-gray-600">Restored through community care</div>
            </CardContent>
          </Card>
        </div>

        {/* How Community Help Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Building Bridges of Support
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-600">For Those Seeking Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Share your situation with a caring community
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Request both material and emotional support
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Connect with local and online supporters
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Build lasting community relationships
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-600">For Community Helpers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Find people in your community who need support
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Provide both practical and emotional assistance
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Make meaningful connections with neighbors
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Strengthen your local community bonds
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Help Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Types of Community Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-indigo-200 hover:border-indigo-300 transition-colors">
                  <CardContent className="py-6">
                    <div className="bg-indigo-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Types of Community Situations */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            When Community Support Makes a Difference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-600">Life Transitions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• New to the community</li>
                  <li>• Aging in place support</li>
                  <li>• Recent life changes</li>
                  <li>• Career transitions</li>
                  <li>• Family structure changes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-600">Isolation & Loneliness</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Limited social connections</li>
                  <li>• Physical mobility challenges</li>
                  <li>• Language barriers</li>
                  <li>• Mental health struggles</li>
                  <li>• Grief and loss support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-indigo-600">Rebuilding & Recovery</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Recovery from setbacks</li>
                  <li>• Building new routines</li>
                  <li>• Developing life skills</li>
                  <li>• Finding purpose and direction</li>
                  <li>• Creating stability</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community Values */}
        <Card className="bg-indigo-50 border-indigo-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-navy mb-4">
                We Believe in Community
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                Everyone deserves to feel connected, supported, and valued. Through MyNeedfully's 
                community help platform, neighbors help neighbors, creating stronger, more 
                resilient communities where everyone can thrive.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Story */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "I found a whole community that cares"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "Moving to a new city during the pandemic left me completely isolated. Through 
                MyNeedfully, I connected with neighbors who not only helped with essentials 
                but became real friends. Now I pay it forward by helping others feel welcome."
              </p>
              <p className="text-indigo-600 font-semibold">- Lisa T., Community Member</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Be Part of Something Bigger
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Together we can build communities where everyone belongs and thrives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Seek Community Support
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