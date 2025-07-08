import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShoppingCart, 
  Apple, 
  Milk, 
  Bread, 
  Baby,
  Plus,
  Search
} from "lucide-react";

export default function GroceriesFood() {
  const { isAuthenticated } = useAuth();

  const foodCategories = [
    { icon: Apple, name: "Fresh Produce", description: "Fruits, vegetables, healthy snacks" },
    { icon: Milk, name: "Dairy & Proteins", description: "Milk, eggs, meat, plant-based proteins" },
    { icon: Bread, name: "Pantry Staples", description: "Bread, rice, pasta, canned goods" },
    { icon: Baby, name: "Family Nutrition", description: "Baby food, formula, children's vitamins" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full">
              <ShoppingCart className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Groceries & Food Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            No one should go hungry. MyNeedfully connects families facing food insecurity 
            with community supporters who can help ensure everyone has access to nutritious 
            meals and grocery essentials.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-orange-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">38 million</div>
              <div className="text-gray-600">Americans face food insecurity</div>
            </CardContent>
          </Card>
          <Card className="text-center border-orange-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">12 million</div>
              <div className="text-gray-600">Children don't know where their next meal will come from</div>
            </CardContent>
          </Card>
          <Card className="text-center border-orange-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">$4,000</div>
              <div className="text-gray-600">Average annual food cost per person</div>
            </CardContent>
          </Card>
        </div>

        {/* How Food Support Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Ending Hunger Together
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">For Families in Need</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Create grocery lists with specific food needs
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Include dietary restrictions and preferences
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive groceries delivered to your door
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Focus on family instead of food stress
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">For Food Heroes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Find families who need grocery support
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Purchase from major grocery retailers
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Ensure fresh food reaches families
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Make an immediate impact on nutrition
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Food Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Essential Food Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {foodCategories.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-orange-200 hover:border-orange-300 transition-colors">
                  <CardContent className="py-6">
                    <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Nutrition Focus */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Supporting Healthy Nutrition
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">Growing Families</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Fresh fruits and vegetables</li>
                  <li>• Whole grains and healthy proteins</li>
                  <li>• Milk and dairy products</li>
                  <li>• Baby formula and baby food</li>
                  <li>• Children's vitamins and snacks</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">Special Diets</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Gluten-free and allergen-free foods</li>
                  <li>• Diabetic-friendly options</li>
                  <li>• Plant-based and vegan items</li>
                  <li>• Low-sodium and heart-healthy foods</li>
                  <li>• Cultural and ethnic foods</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600">Emergency Food</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Non-perishable meal kits</li>
                  <li>• Canned proteins and vegetables</li>
                  <li>• Instant meals and soups</li>
                  <li>• Shelf-stable milk and snacks</li>
                  <li>• Emergency water and beverages</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Impact Story */}
        <Card className="bg-orange-50 border-orange-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "Fresh groceries changed everything for our family"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "Between job loss and medical bills, we were choosing between rent and groceries. 
                MyNeedfully supporters sent us fresh produce, proteins, and pantry staples. 
                My kids are eating healthy meals again, and that means everything to me."
              </p>
              <p className="text-orange-600 font-semibold">- David R., Father of Three</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Join the Fight Against Hunger
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every meal matters. Every family deserves food security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Food Support
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Feed Families in Need
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}