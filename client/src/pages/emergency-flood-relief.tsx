import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  CloudRain, 
  Home, 
  Droplets, 
  Package2, 
  Truck,
  Plus,
  Search
} from "lucide-react";

export default function EmergencyFloodRelief() {
  const { isAuthenticated } = useAuth();

  const floodItems = [
    { icon: Home, name: "Housing Essentials", description: "Air mattresses, blankets, temporary shelter" },
    { icon: Droplets, name: "Clean Water & Food", description: "Bottled water, non-perishable food, filters" },
    { icon: Package2, name: "Cleanup Supplies", description: "Bleach, gloves, pumps, dehumidifiers" },
    { icon: Truck, name: "Replacement Items", description: "Clothing, furniture, appliances, documents" }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <CloudRain className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-navy mb-4">
            Emergency Flood Relief
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Floods can devastate communities in hours, leaving families with nothing. MyNeedfully 
            provides immediate connection to supporters who can help with emergency supplies, 
            cleanup materials, and essential replacements.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">90%</div>
              <div className="text-gray-600">Of flood damage not covered by insurance</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">6 million</div>
              <div className="text-gray-600">Americans at risk for flooding annually</div>
            </CardContent>
          </Card>
          <Card className="text-center border-blue-200">
            <CardContent className="py-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">48 hours</div>
              <div className="text-gray-600">Critical window for mold prevention</div>
            </CardContent>
          </Card>
        </div>

        {/* Flood Stages Help */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Support Through Every Stage of Recovery
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600 text-center">Immediate Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Emergency shelter supplies
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Clean water and food
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    First aid and medications
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Communication devices
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600 text-center">Cleanup Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Water pumps and vacuums
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Dehumidifiers and fans
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Cleaning supplies and bleach
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Protective gear and tools
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600 text-center">Recovery & Rebuild</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Replacement furniture
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Appliances and electronics
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Clothing and personal items
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Children's items and comfort objects
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Essential Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-navy text-center mb-8">
            Most Requested Flood Recovery Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {floodItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center border-blue-200 hover:border-blue-300 transition-colors">
                  <CardContent className="py-6">
                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-navy mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Urgency Notice */}
        <Card className="bg-yellow-50 border-yellow-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <CloudRain className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-navy mb-4">
                Time is Critical After Flooding
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                Mold can begin growing within 24-48 hours of flooding. Quick access to cleanup supplies 
                and dehumidification equipment can save homes and prevent health hazards. Our community 
                responds rapidly to help flood victims get back on their feet.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Story */}
        <Card className="bg-blue-50 border-blue-200 mb-12">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-navy mb-4">
                "Our community rallied when the river rose"
              </h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                "When flash flooding hit our neighborhood, we lost everything on the first floor. 
                Within hours of posting on MyNeedfully, supporters sent pumps, dehumidifiers, and 
                cleaning supplies. Their quick response saved our home from total loss."
              </p>
              <p className="text-blue-600 font-semibold">- The Martinez Family, Texas</p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Join the Flood Recovery Network
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Whether you need help after flooding or want to support recovery efforts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/create" : "/signup"}>
              <Button size="lg" className="bg-coral hover:bg-coral/90 text-white px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Request Flood Help
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="border-coral text-coral hover:bg-coral/5 px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Support Flood Victims
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}