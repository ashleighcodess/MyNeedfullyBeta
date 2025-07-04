import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { Link } from "wouter";
import { Hand, Users, Shield } from "lucide-react";

export default function Signup() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    {
      id: "create",
      title: "I Want To Make A Needslist",
      description: "A Simple Process To Connect People In Need With Those Who Want To Help.",
      icon: Hand,
      color: "text-coral",
      bgColor: "bg-coral/10"
    },
    {
      id: "fulfill",
      title: "I Want To Fulfill Someone's Needs List",
      description: "A Simple Process To Connect People In Need With Those Who Want To Help.",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "join",
      title: "Other, I Just Want To Join The Platform",
      description: "A Simple Process To Connect People In Need With Those Who Want To Help.",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  const handleNext = () => {
    if (selectedOption) {
      // Store the preference in localStorage to use after login
      const preferenceMap = {
        create: 'creator',
        fulfill: 'supporter', 
        join: 'supporter'
      };
      localStorage.setItem('userPreference', preferenceMap[selectedOption as keyof typeof preferenceMap]);
      
      // Redirect to login for all options since we use Replit Auth
      window.location.href = "/api/login";
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-coral text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="ml-2 text-sm text-gray-600">Let's Begin Your MyNeedfully Journey</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="ml-2 text-sm text-gray-600">Personal Information</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span className="ml-2 text-sm text-gray-600">Finish Up</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy mb-4">Welcome!</h1>
          <h2 className="text-xl text-gray-700 mb-8">Select Preference:</h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {options.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedOption === option.id;
            
            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected 
                    ? 'border-coral border-2 shadow-lg' 
                    : 'border-gray-200 hover:border-coral/50'
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${option.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`h-8 w-8 ${option.color}`} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-navy mb-3">
                    {option.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {option.description}
                  </p>
                  
                  {isSelected && (
                    <div className="mt-4 flex justify-center">
                      <div className="w-6 h-6 bg-coral rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Next Button */}
        <div className="text-center mb-8">
          <Button 
            size="lg" 
            className={`px-12 py-3 ${
              selectedOption 
                ? 'bg-coral hover:bg-coral/90' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            onClick={handleNext}
            disabled={!selectedOption}
          >
            Next
          </Button>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already A Member?{" "}
            <Link href="/api/login" className="text-coral hover:text-coral/80 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}