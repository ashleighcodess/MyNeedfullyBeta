import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Heart, 
  Pill, 
  Wheelchair, 
  Stethoscope, 
  Shield,
  Plus,
  Search
} from "lucide-react";

export default function MedicalNecessity() {
  const { isAuthenticated } = useAuth();

  const medicalItems = [
    { icon: Pill, name: "Medications & Prescriptions", description: "Essential medications, prescription refills" },
    { icon: Wheelchair, name: "Medical Equipment", description: "Wheelchairs, walkers, mobility aids" },
    { icon: Stethoscope, name: "Health Monitoring", description: "Blood pressure monitors, thermometers" },
    { icon: Shield, name: "Recovery Supplies", description: "Bandages, compression garments, therapy items" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Heart className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Medical Necessity Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When health challenges arise, financial strain shouldn't prevent access to essential medical 
            supplies. MyNeedfully connects patients and families with supporters who understand the 
            importance of medical care.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">64%</div>
              <div className="text-gray-600">Skip medications due to cost</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">$1,200</div>
              <div className="text-gray-600">Average monthly medical expenses</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Community support available</div>
            </CardContent>
          </Card>
        </div>

        {/* How It Helps */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Supporting Medical Needs Together
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600">For Patients & Families</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    List essential medical supplies and equipment
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Share your health journey respectfully and privately
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive items delivered to your recovery location
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Focus on healing instead of financial stress
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600">For Medical Supporters</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Find patients who need specific medical items
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Purchase from trusted medical supply retailers
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Support recovery with direct item delivery
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Make a meaningful impact on health outcomes
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Common Medical Needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {medicalItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-blue-200 hover:border-blue-300 transition-colors">
                  <CardContent className="py-6">
                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Privacy Notice */}
        <Card className="bg-blue-50 border-blue-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-navy mb-4">
                Your Privacy is Protected
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                We understand medical situations are sensitive. You control what information to share, 
                and all personal details are kept private. Supporters only see what you choose to include 
                in your needs list story.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Story */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "The community helped me focus on getting better"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "After my surgery, I needed expensive recovery equipment that insurance didn't cover. 
                Through MyNeedfully, caring supporters helped me get everything I needed. I could 
                focus on healing instead of worrying about costs."
              </p>
              <p className="text-blue-600 font-semibold">- Maria S., Recovery Patient</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Start Your Medical Support Journey
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect with a caring community that understands medical challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Medical Support
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Medical Needs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}