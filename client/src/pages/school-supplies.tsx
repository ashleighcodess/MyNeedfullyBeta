import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  GraduationCap, 
  BookOpen, 
  Pencil, 
  Laptop, 
  Backpack,
  Plus,
  Search
} from "lucide-react";

export default function SchoolSupplies() {
  const { isAuthenticated } = useAuth();

  const schoolCategories = [
    { icon: Pencil, name: "Writing & Art Supplies", description: "Pencils, pens, crayons, notebooks" },
    { icon: BookOpen, name: "Books & Learning", description: "Textbooks, workbooks, educational materials" },
    { icon: Laptop, name: "Technology Needs", description: "Laptops, tablets, calculators, headphones" },
    { icon: Backpack, name: "School Gear", description: "Backpacks, lunch boxes, uniforms, shoes" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-purple-100 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            School Supplies Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every child deserves the tools they need to succeed in school. MyNeedfully helps 
            students get essential school supplies, technology, and educational materials to 
            support their learning journey.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-purple-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">$600+</div>
              <div className="text-gray-600">Average annual school supply cost per student</div>
            </CardContent>
          </Card>
          <Card className="text-center border-purple-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">94%</div>
              <div className="text-gray-600">Of teachers spend their own money on supplies</div>
            </CardContent>
          </Card>
          <Card className="text-center border-purple-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">16 million</div>
              <div className="text-gray-600">Students lack basic school supplies</div>
            </CardContent>
          </Card>
        </div>

        {/* How School Support Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Supporting Educational Success
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-600">For Students & Families</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    List specific school supplies and grade-level needs
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Include technology requirements for digital learning
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive supplies delivered before school starts
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Focus on learning instead of supply stress
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-600">For Education Supporters</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Find students who need educational support
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Purchase from trusted educational retailers
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Invest directly in student success
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Help break down educational barriers
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* School Supply Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Essential School Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolCategories.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-purple-200 hover:border-purple-300 transition-colors">
                  <CardContent className="py-6">
                    <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Grade Level Needs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Supporting Every Grade Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-600">Elementary (K-5)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Crayons, markers, and colored pencils</li>
                  <li>• Glue sticks and safety scissors</li>
                  <li>• Composition notebooks</li>
                  <li>• Educational games and manipulatives</li>
                  <li>• Art supplies and construction paper</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-600">Middle School (6-8)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Binders and dividers</li>
                  <li>• Scientific calculator</li>
                  <li>• Highlighters and pens</li>
                  <li>• Index cards and sticky notes</li>
                  <li>• Basic technology accessories</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-600">High School (9-12)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Graphing calculator</li>
                  <li>• Laptop or tablet for digital work</li>
                  <li>• AP exam prep materials</li>
                  <li>• Professional presentation supplies</li>
                  <li>• College application resources</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Story */}
        <Card className="bg-purple-50 border-purple-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "Having the right supplies changed my daughter's confidence"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "When we couldn't afford the laptop required for high school, I worried my daughter 
                would fall behind. Through MyNeedfully, a supporter provided everything she needed. 
                Now she's thriving in her AP classes and planning for college."
              </p>
              <p className="text-purple-600 font-semibold">- Carmen L., Parent</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Invest in Educational Success
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every student deserves the tools they need to learn and grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request School Supplies
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Student Success
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}