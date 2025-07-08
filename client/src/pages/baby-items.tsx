import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Baby, 
  Shirt, 
  Milk, 
  Teddy, 
  Stroller,
  Plus,
  Search
} from "lucide-react";

export default function BabyItems() {
  const { isAuthenticated } = useAuth();

  const babyCategories = [
    { icon: Shirt, name: "Baby Clothing", description: "Onesies, sleepers, seasonal clothes, shoes" },
    { icon: Milk, name: "Feeding Essentials", description: "Formula, bottles, baby food, bibs" },
    { icon: Teddy, name: "Comfort & Play", description: "Toys, blankets, pacifiers, books" },
    { icon: Stroller, name: "Baby Gear", description: "Strollers, car seats, high chairs, carriers" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-pink-100 p-4 rounded-full">
              <Baby className="h-12 w-12 text-pink-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Baby Items Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every baby deserves a loving start in life. MyNeedfully helps new parents and 
            families with young children get essential baby items, from diapers and formula 
            to clothing and safety gear.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-pink-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-pink-600 mb-2">$15,000</div>
              <div className="text-gray-600">Average cost of baby's first year</div>
            </CardContent>
          </Card>
          <Card className="text-center border-pink-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-pink-600 mb-2">300+</div>
              <div className="text-gray-600">Diapers needed per month</div>
            </CardContent>
          </Card>
          <Card className="text-center border-pink-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-pink-600 mb-2">Every child</div>
              <div className="text-gray-600">Deserves love and care</div>
            </CardContent>
          </Card>
        </div>

        {/* How Baby Support Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Supporting Babies and Families
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-pink-600">For New Parents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    List specific baby items and sizes needed
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Share your baby's age and developmental needs
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Receive items delivered safely to your home
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Focus on bonding instead of financial stress
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-pink-600">For Baby Supporters</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Find families with babies in need
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Purchase from trusted baby retailers
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Send love and support to growing families
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Help babies thrive in their early years
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Baby Item Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Essential Baby Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {babyCategories.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-pink-200 hover:border-pink-300 transition-colors">
                  <CardContent className="py-6">
                    <div className="bg-pink-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Age-Based Needs */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Supporting Every Stage of Baby Development
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-pink-600">Newborn (0-3 months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Newborn diapers and wipes</li>
                  <li>• Onesies and sleepers</li>
                  <li>• Swaddles and receiving blankets</li>
                  <li>• Formula and bottles</li>
                  <li>• Infant car seat</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-pink-600">Infant (3-12 months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Growing size diapers</li>
                  <li>• Baby food and snacks</li>
                  <li>• Toys for development</li>
                  <li>• High chair and feeding supplies</li>
                  <li>• Baby-proofing items</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="text-pink-600">Toddler (1-3 years)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Pull-ups and potty training</li>
                  <li>• Toddler clothing and shoes</li>
                  <li>• Educational toys and books</li>
                  <li>• Toddler car seat and stroller</li>
                  <li>• Outdoor play equipment</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Safety First */}
        <Card className="bg-yellow-50 border-yellow-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <Baby className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-navy mb-4">
                Safety is Our Priority
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                All baby items shared through MyNeedfully are new and meet current safety standards. 
                We encourage supporters to purchase from reputable retailers and check for recalls. 
                Baby safety is always the top priority.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Story */}
        <Card className="bg-pink-50 border-pink-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "My baby has everything she needs thanks to this community"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "As a single mom, I worried constantly about affording diapers and formula. 
                The MyNeedfully community showed up for us with baby clothes, toys, and 
                everything my daughter needed. I'm so grateful for their kindness."
              </p>
              <p className="text-pink-600 font-semibold">- Sarah M., New Mother</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Help Babies Thrive from Day One
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Every baby deserves love, comfort, and everything they need to grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Baby Support
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Growing Families
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}