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
      <div className="container mx-auto px-4 py-4 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 font-just-sans">
              MyNeedfully
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Choose Your Path Below
            </p>
          </div>

          {/* Cards - Vertically Stacked with Compact Mobile Layout */}
          <div className="space-y-2 md:space-y-6 max-w-2xl mx-auto">
            {options.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-xl border-2 ${
                  selectedOption === option.id
                    ? "border-coral shadow-xl scale-105 bg-coral/5"
                    : "border-gray-200 hover:border-coral/50"
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <CardContent className="p-3 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                    <div className={`w-12 h-12 md:w-20 md:h-20 rounded-full ${option.bgColor} flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0`}>
                      <img 
                        src={option.iconSrc} 
                        alt={option.title}
                        className="w-6 h-6 md:w-10 md:h-10 object-contain"
                      />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg md:text-2xl font-semibold text-gray-900 mb-1 md:mb-3">
                        {option.title}
                      </h3>
                      {option.description && (
                        <p className="text-gray-600 text-sm md:text-lg leading-relaxed">
                          {option.description}
                        </p>
                      )}
                    </div>
                    {selectedOption === option.id && (
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-coral rounded-full flex items-center justify-center transition-all duration-300 ease-out">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full transform scale-110"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          <div className="text-center mt-4 md:mt-12 px-4">
            <Button
              onClick={handleContinue}
              disabled={!selectedOption}
              className="bg-coral hover:bg-coral/90 text-white px-6 md:px-12 py-2.5 md:py-4 text-sm md:text-lg font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg active:scale-95 font-just-sans"
            >
              Continue
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-3 md:mt-8 px-4">
            <p className="text-gray-500 text-xs md:text-base">
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