import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import handIcon from "@assets/hand.png";
import handsIcon from "@assets/hands.png";
import shieldIcon from "@assets/shield.png";
import logoIcon from "@assets/Logo_5_1751660244282.png";

export default function Signup() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const options = [
    {
      id: "create",
      title: "I Want To Make A Needs List",
      description: "A Simple Process To Connect People In Need With Those Who Want To Help.",
      iconSrc: handIcon,
      bgColor: "bg-coral/10"
    },
    {
      id: "fulfill",
      title: "I Want To Fulfill Someone's Needs List",
      description: "Browse and support others by purchasing items they need. Make a direct impact in your community.",
      iconSrc: handsIcon,
      bgColor: "bg-coral/10"
    },
    {
      id: "join",
      title: "Other, I Just Want To Join The Platform",
      description: "",
      iconSrc: shieldIcon,
      bgColor: "bg-coral/10"
    }
  ];

  const handleContinue = () => {
    if (selectedOption) {
      // Store preference in localStorage for later use
      localStorage.setItem('userPreference', selectedOption);
      // Redirect to the unified auth page
      setLocation('/login');
    }
  };



  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header with Logo */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <img 
                src={logoIcon} 
                alt="MyNeedfully Logo" 
                className="w-16 h-16 mr-4"
              />
              <h1 className="text-4xl font-bold text-gray-900">
                MyNeedfully
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose Your Path Below
            </p>
          </div>

          {/* Cards - Vertically Stacked */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {options.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  selectedOption === option.id
                    ? "border-coral shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <CardContent className="p-8">
                  <div className="flex items-center space-x-6">
                    <div className={`w-20 h-20 rounded-full ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <img 
                        src={option.iconSrc} 
                        alt={option.title}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                        {option.title}
                      </h3>
                      {option.description && (
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {option.description}
                        </p>
                      )}
                    </div>
                    {selectedOption === option.id && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-coral rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          <div className="text-center mt-12">
            <Button
              onClick={handleContinue}
              disabled={!selectedOption}
              className="bg-coral hover:bg-coral/90 text-white px-12 py-4 text-lg font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-coral hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}