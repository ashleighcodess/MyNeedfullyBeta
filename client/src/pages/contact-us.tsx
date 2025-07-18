import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    message: ""
  });
  const { toast } = useToast();

  // Contact form mutation
  const contactMutation = useMutation({
    mutationFn: async (formData: typeof formData) => {
      return await apiRequest("POST", "/api/contact", formData);
    },
    onSuccess: (data) => {
      toast({
        title: "Message Sent!",
        description: data.message || "Thank you for contacting us. We'll respond within 24 hours.",
        duration: 5000,
      });
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        message: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // SEO Configuration
  useSEO({
    title: generatePageTitle("Contact Us - Get In Touch"),
    description: generatePageDescription("Get in touch with MyNeedfully. Send us your questions, concerns, or feedback and we'll respond within 24 hours."),
    keywords: generateKeywords([
      "contact us",
      "get in touch",
      "support",
      "customer service",
      "help",
      "feedback",
      "questions",
      "myneedfully support"
    ]),
    canonical: generateCanonicalUrl("/contact-us"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact Us - MyNeedfully",
      "description": "Get in touch with MyNeedfully support team",
      "url": "https://myneedfully.app/contact-us",
      "mainEntity": {
        "@type": "Organization",
        "name": "MyNeedfully",
        "email": "info@myneedfully.com",
        "url": "https://myneedfully.app"
      }
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    contactMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Contact Info */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Get In Touch</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              If You Have Any Questions, Concerns, Or Feedback About MyNeedfully, Please Don't Hesitate To Reach Out. We're Here To Support You.
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-coral-light rounded-lg">
                  <Mail className="h-6 w-6 text-coral" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                  <p className="text-gray-600 font-medium">info@myneedfully.com</p>
                  <p className="text-sm text-gray-500 mt-1">We Typically Respond Within 24 Hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName" className="text-white font-medium mb-2 block">
                  Full Name*
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter Your Name"
                  className="bg-white border-0 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-white font-medium mb-2 block">
                  Email*
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter Your Email"
                  className="bg-white border-0 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-white font-medium mb-2 block">
                  Phone Number*
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Your Phone Number"
                  className="bg-white border-0 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-white font-medium mb-2 block">
                  Message*
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Type Message..."
                  rows={4}
                  className="bg-white border-0 text-gray-900 placeholder-gray-500 resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={contactMutation.isPending}
                className="w-full bg-coral hover:bg-coral-dark text-white font-medium py-3 rounded-lg transition-colors"
              >
                {contactMutation.isPending ? "Sending..." : "Submit"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}