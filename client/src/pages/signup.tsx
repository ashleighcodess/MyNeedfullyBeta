import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { Link } from "wouter";

// Custom SVG Icons matching the provided designs
const HandIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
    <path d="M13 2.05V6.41L15.5 4.91C16.3 4.41 17.35 4.7 17.85 5.5C18.35 6.3 18.06 7.35 17.26 7.85L13 10.29V14C13 15.1 12.1 16 11 16S9 15.1 9 14V6C9 3.79 10.79 2 13 2.05M9 13H5C3.9 13 3 13.9 3 15V19C3 20.1 3.9 21 5 21H9C10.1 21 11 20.1 11 19V15C11 13.9 10.1 13 9 13M19 13H15C13.9 13 13 13.9 13 15V19C13 20.1 13.9 21 15 21H19C20.1 21 21 20.1 21 19V15C21 13.9 20.1 13 19 13Z"/>
  </svg>
);

const HandsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
    <path d="M12 6C9.79 6 8 7.79 8 10V12C8 13.1 8.9 14 10 14S12 13.1 12 12V10C12 8.9 12.9 8 14 8S16 8.9 16 10V12C16 14.21 14.21 16 12 16S8 14.21 8 12V10C8 6.69 10.69 4 14 4S20 6.69 20 10V14C20 17.31 17.31 20 14 20H10C6.69 20 4 17.31 4 14V10C4 6.69 6.69 4 10 4H14C17.31 4 20 6.69 20 10"/>
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 8.5L16.5 13L15.09 14.41L12 11.33L8.91 14.41L7.5 13L12 8.5Z"/>
  </svg>
);

export default function Signup() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    {
      id: "create",
      title: "I Want To Make A Needslist",
      description: "A Simple Process To Connect People In Need With Those Who Want To Help.",
      icon: HandIcon,
      color: "text-coral",
      bgColor: "bg-coral/10"
    },
    {
      id: "fulfill",
      title: "I Want To Fulfill Someone's Needs List",
      description: "A Simple Process To Connect People In Need With Those Who Want To Help.",
      icon: HandsIcon,
      color: "text-coral",
      bgColor: "bg-coral/10"
    },
    {
      id: "join",
      title: "Other, I Just Want To Join The Platform",
      description: "A Simple Process To Connect People In Need With Those Who Want To Help.",
      icon: ShieldIcon,
      color: "text-coral",
      bgColor: "bg-coral/10"
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
        <div className="space-y-4 mb-8">
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
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`w-12 h-12 ${option.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <div className={`h-6 w-6 ${option.color}`}>
                      <IconComponent />
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-navy mb-1">
                      {option.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <div className="flex-shrink-0">
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