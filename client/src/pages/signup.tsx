import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import handIcon from "@assets/hand.png";
import handsIcon from "@assets/hands.png";
import shieldIcon from "@assets/shield.png";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { SiReplit } from "react-icons/si";

export default function Signup() {
  const [userPreference, setUserPreference] = useState<string | null>(null);
  const [showAuthOptions, setShowAuthOptions] = useState(false);

  const handleContinue = () => {
    if (userPreference) {
      // Store preference in localStorage for later use
      localStorage.setItem('userPreference', userPreference);
      setShowAuthOptions(true);
    }
  };

  const handleAuthProvider = (provider: 'replit' | 'google' | 'facebook') => {
    // Store preference and redirect to the appropriate OAuth provider
    if (userPreference) {
      localStorage.setItem('userPreference', userPreference);
    }
    window.location.href = `/api/login/${provider}`;
  };

  if (showAuthOptions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Your Sign-In Method
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Select how you'd like to create your account
              </p>
            </div>

            {/* Auth Options */}
            <Card className="p-6">
              <div className="space-y-4">
                {/* Replit */}
                <Button
                  onClick={() => handleAuthProvider('replit')}
                  variant="outline"
                  className="w-full h-12 text-left justify-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <SiReplit className="w-5 h-5 text-orange-500" />
                  <span>Continue with Replit</span>
                </Button>

                {/* Google */}
                <Button
                  onClick={() => handleAuthProvider('google')}
                  variant="outline"
                  className="w-full h-12 text-left justify-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <FcGoogle className="w-5 h-5" />
                  <span>Continue with Google</span>
                </Button>

                {/* Facebook */}
                <Button
                  onClick={() => handleAuthProvider('facebook')}
                  variant="outline"
                  className="w-full h-12 text-left justify-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <FaFacebook className="w-5 h-5 text-blue-600" />
                  <span>Continue with Facebook</span>
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="text-coral-500 hover:text-coral-600">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-coral-500 hover:text-coral-600">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </Card>

            {/* Back Button */}
            <div className="text-center mt-6">
              <Button
                onClick={() => setShowAuthOptions(false)}
                variant="ghost"
                className="text-gray-600 dark:text-gray-400"
              >
                ← Back to preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join MyNeedfully
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose how you'd like to participate in our community. You can always change this later.
          </p>
        </div>

        {/* Options */}
        <div className="max-w-2xl mx-auto space-y-4 mb-8">
          {/* Create needs lists option */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              userPreference === 'creator' 
                ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => setUserPreference('creator')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-coral-100 dark:bg-coral-900/40 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={handIcon} 
                    alt="Create needs list" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    I need help with specific items
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create needs lists for items you or your organization require. Perfect for families after disasters, nonprofits, or anyone facing challenges.
                  </p>
                </div>
                {userPreference === 'creator' && (
                  <Badge variant="default" className="bg-coral-500 text-white">
                    Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Support others option */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              userPreference === 'supporter' 
                ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => setUserPreference('supporter')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-coral-100 dark:bg-coral-900/40 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={handsIcon} 
                    alt="Support others" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    I want to help others
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Browse and fulfill needs lists from families, nonprofits, and individuals. Make a real difference by providing exactly what's needed.
                  </p>
                </div>
                {userPreference === 'supporter' && (
                  <Badge variant="default" className="bg-coral-500 text-white">
                    Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Both option */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              userPreference === 'both' 
                ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
            onClick={() => setUserPreference('both')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-coral-100 dark:bg-coral-900/40 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={shieldIcon} 
                    alt="Both create and support" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Both - I want to create and support
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get the full MyNeedfully experience. Create your own needs lists when needed and support others in your community.
                  </p>
                </div>
                {userPreference === 'both' && (
                  <Badge variant="default" className="bg-coral-500 text-white">
                    Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            disabled={!userPreference}
            className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Sign Up
          </Button>
          
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/" className="text-coral-500 hover:text-coral-600 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}