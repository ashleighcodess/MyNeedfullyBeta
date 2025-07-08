import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  Phone, 
  Heart, 
  Home, 
  Users,
  Plus,
  Search
} from "lucide-react";

export default function CrisisReliefSupport() {
  const { isAuthenticated } = useAuth();

  const crisisTypes = [
    { icon: Shield, name: "Emergency Response", description: "Immediate crisis intervention and safety" },
    { icon: Phone, name: "Crisis Communication", description: "Emergency phones, communication devices" },
    { icon: Heart, name: "Emotional Recovery", description: "Comfort items, therapeutic supplies" },
    { icon: Home, name: "Temporary Shelter", description: "Emergency housing, safety supplies" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Crisis Relief Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When crisis strikes, immediate support can be life-changing. MyNeedfully connects 
            people in crisis situations with community supporters who can provide emergency 
            supplies, safety items, and critical support during urgent times.
          </p>
        </div>

        {/* Crisis Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">24 hours</div>
              <div className="text-gray-600">Critical response window for crisis support</div>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">immediate</div>
              <div className="text-gray-600">Community response to urgent needs</div>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">hope</div>
              <div className="text-gray-600">Restored through rapid community support</div>
            </CardContent>
          </Card>
        </div>

        {/* How Crisis Support Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Rapid Response Community Support
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">For Crisis Situations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Request urgent items needed for safety and stability
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Share only what feels safe and necessary
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive immediate community response
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Focus on safety and next steps
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">For Crisis Responders</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Identify urgent needs in your community
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Provide immediate practical support
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Respect privacy and dignity
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Help stabilize crisis situations
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Crisis Support Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Types of Crisis Support
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {crisisTypes.map((item, index) => {
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

        {/* Common Crisis Needs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Urgent Crisis Needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Immediate Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Emergency shelter supplies</li>
                  <li>• Safety and security items</li>
                  <li>• Emergency communication devices</li>
                  <li>• Transportation assistance</li>
                  <li>• Legal and document protection</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Basic Survival</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Emergency food and water</li>
                  <li>• Clothing and weather protection</li>
                  <li>• Personal hygiene essentials</li>
                  <li>• Medical and first aid supplies</li>
                  <li>• Emergency cash assistance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Emotional Recovery</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Comfort and stress relief items</li>
                  <li>• Children's comfort objects</li>
                  <li>• Therapeutic and calming supplies</li>
                  <li>• Books and positive materials</li>
                  <li>• Connection and communication tools</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Privacy & Safety Notice */}
        <Card className="bg-yellow-50 border-yellow-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-navy mb-4">
                Your Safety is Our Priority
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                We understand crisis situations require extreme privacy and caution. Share only 
                what feels safe. Our community respects anonymity and focuses on immediate practical 
                support without questions or judgment.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Story */}
        <Card className="bg-red-50 border-red-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "The community responded when I needed help most"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "During the most difficult time of my life, strangers became my lifeline. 
                Through MyNeedfully, I received immediate help with essentials that allowed 
                me to focus on getting to safety. Their response gave me hope when I had none."
              </p>
              <p className="text-red-600 font-semibold">- Anonymous Crisis Survivor</p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Resources */}
        <Card className="bg-blue-50 border-blue-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-navy mb-4">
                Emergency Resources
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                If you're in immediate danger, please contact emergency services:
                <br />
                <strong>911</strong> - Emergency Services
                <br />
                <strong>988</strong> - Suicide & Crisis Lifeline
                <br />
                <strong>1-800-799-7233</strong> - National Domestic Violence Hotline
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Crisis Support Network
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            When crisis hits, community support can be life-saving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Crisis Support
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Help Crisis Situations
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}