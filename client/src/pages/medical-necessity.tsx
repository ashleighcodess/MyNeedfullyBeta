import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Stethoscope, 
  Pill, 
  Heart, 
  Shield, 
  Plus,
  Search
} from "lucide-react";

export default function MedicalNecessity() {
  const { isAuthenticated } = useAuth();

  const essentialItems = [
    { icon: Pill, name: "Medications", description: "Prescription drugs, over-the-counter medicines, supplements" },
    { icon: Stethoscope, name: "Medical Equipment", description: "Wheelchairs, walkers, oxygen, medical devices" },
    { icon: Heart, name: "Health Monitoring", description: "Blood pressure monitors, diabetic supplies, testing kits" },
    { icon: Shield, name: "Emergency Medical", description: "First aid supplies, emergency medications, safety equipment" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <Stethoscope className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Medical Necessity Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Healthcare is a fundamental right. MyNeedfully connects people with medical needs 
            to community supporters who provide essential medical supplies and equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-emerald-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-emerald-600 mb-2">28M+</div>
              <div className="text-gray-600">Americans without health insurance</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">$1,400+</div>
              <div className="text-gray-600">Average monthly medical costs</div>
            </CardContent>
          </Card>
          <Card className="text-center border-red-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-red-600 mb-2">45%</div>
              <div className="text-gray-600">People skip medical care due to cost</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Needed Medical Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {essentialItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="py-6">
                    <div className="bg-emerald-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Get Medical Support Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Your health matters. Connect with caring community members who can help.
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