import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Shield, 
  Users, 
  Gift 
} from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "getting-started" | "supporters" | "recipients";
}

const faqData: FAQItem[] = [
  // General Questions
  {
    question: "What is MyNeedfully?",
    answer: "MyNeedfully is a compassionate platform that connects people in crisis with community supporters. We help individuals and families create needs lists for essential items, while allowing generous supporters to fulfill these needs directly.",
    category: "general"
  },
  {
    question: "How does MyNeedfully work?",
    answer: "People in need create detailed needs lists with specific items they require. Community supporters browse these lists and can purchase items directly from retailers like Amazon, Walmart, and Target. Items are shipped directly to recipients, creating a transparent and efficient way to help those in crisis.",
    category: "general"
  },
  {
    question: "Is MyNeedfully free to use?",
    answer: "Yes! MyNeedfully is completely free for both recipients and supporters. We don't charge any fees for creating needs lists or supporting others in the community.",
    category: "general"
  },
  
  // Getting Started
  {
    question: "How do I create my first needs list?",
    answer: "Start by signing up for an account, then click 'Create Needs List' from your dashboard. Add a meaningful title, tell your story, upload photos if helpful, and add specific items you need. The more detailed your list, the better supporters can understand your situation.",
    category: "getting-started"
  },
  {
    question: "What information should I include in my needs list?",
    answer: "Include a clear title, your story explaining your situation, your location (city/state), and specific items with descriptions. Photos can help supporters connect with your needs. Always be honest and specific about your circumstances.",
    category: "getting-started"
  },
  {
    question: "How do I verify my email address?",
    answer: "After creating your account, check your email for a verification message from MyNeedfully. Click the verification link to confirm your email address. This helps build trust with supporters and ensures you receive important notifications.",
    category: "getting-started"
  },
  
  // For Supporters
  {
    question: "How do I help someone in need?",
    answer: "Browse needs lists to find people you'd like to support. Click on any list to see detailed information and specific items needed. You can purchase items directly through our integrated retailer links - items ship directly to recipients.",
    category: "supporters"
  },
  {
    question: "Where do purchased items get shipped?",
    answer: "Items are shipped directly to the recipient's address. You never need to handle the physical delivery - everything is managed through the retailer's shipping system for privacy and convenience.",
    category: "supporters"
  },
  {
    question: "Can I send a message with my purchase?",
    answer: "Yes! After purchasing an item, you can send an encouraging thank you note to the recipient. Many supporters find this to be the most rewarding part of helping others.",
    category: "supporters"
  },
  
  // For Recipients
  {
    question: "Who can see my needs list?",
    answer: "Your needs list is visible to the community of supporters on MyNeedfully. We only display the information you choose to share - your full address is kept private and only used for shipping purposes.",
    category: "recipients"
  },
  {
    question: "What happens when someone purchases an item for me?",
    answer: "You'll receive a notification that an item has been purchased, and the item will be shipped directly to your address. You can also send a thank you note to express your gratitude to the supporter.",
    category: "recipients"
  },
  {
    question: "How do I update or remove my needs list?",
    answer: "Go to your dashboard and click on 'My Needs Lists'. You can edit details, add or remove items, or archive completed lists. Keep your list updated so supporters know what you still need.",
    category: "recipients"
  }
];

const categoryLabels = {
  general: "General Questions",
  "getting-started": "Getting Started", 
  supporters: "For Supporters",
  recipients: "For Recipients"
};

const categoryIcons = {
  general: Heart,
  "getting-started": Users,
  supporters: Gift,
  recipients: Shield
};

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("general");

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = faqData.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about using MyNeedfully to give and receive community support.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const IconComponent = categoryIcons[key as keyof typeof categoryIcons];
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
                    activeCategory === key
                      ? 'bg-coral text-white border-coral'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-coral hover:text-coral'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item, index) => {
            const isOpen = openItems.includes(index);
            return (
              <Card key={index} className="border border-gray-200">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleItem(index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-navy">
                      {item.question}
                    </CardTitle>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-coral" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-coral" />
                    )}
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center">
          <Card className="bg-coral/5 border-coral/20">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold text-navy mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-4">
                We're here to help! Reach out to our support team for personalized assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@myneedfully.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-coral text-white rounded-lg hover:bg-coral/90 transition-colors"
                >
                  Contact Support
                </a>
                <a 
                  href="/resources"
                  className="inline-flex items-center justify-center px-6 py-3 border border-coral text-coral rounded-lg hover:bg-coral/5 transition-colors"
                >
                  Browse Resources
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}