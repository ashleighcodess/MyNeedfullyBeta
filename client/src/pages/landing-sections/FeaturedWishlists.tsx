import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Clock } from "lucide-react";
import { Link } from "wouter";

interface Wishlist {
  id: number;
  title: string;
  description: string;
  location: string;
  urgencyLevel: string;
  completionPercentage: number;
  totalItems: number;
  imageUrl?: string;
}

interface FeaturedWishlistsProps {
  wishlists: Wishlist[];
}

const getUrgencyColor = (level: string) => {
  switch (level) {
    case "urgent": return "bg-red-100 text-red-800";
    case "high": return "bg-orange-100 text-orange-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    default: return "bg-green-100 text-green-800";
  }
};

const FeaturedWishlists: React.FC<FeaturedWishlistsProps> = ({ wishlists }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Featured Needs Lists</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real families and individuals in our community who need your support right now.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlists.slice(0, 6).map((wishlist) => (
            <div key={wishlist.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              {wishlist.imageUrl && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={wishlist.imageUrl} 
                    alt={wishlist.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getUrgencyColor(wishlist.urgencyLevel)}>
                    {wishlist.urgencyLevel}
                  </Badge>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    2 days ago
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-navy mb-2 line-clamp-2">
                  {wishlist.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {wishlist.description}
                </p>
                
                <div className="flex items-center mb-4 text-gray-500 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {wishlist.location}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-semibold text-coral">
                      {wishlist.completionPercentage}%
                    </span>
                  </div>
                  <Progress value={wishlist.completionPercentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((wishlist.completionPercentage / 100) * wishlist.totalItems)} of {wishlist.totalItems} items fulfilled
                  </p>
                </div>
                
                <Link href={`/wishlist/${wishlist.id}`}>
                  <button className="w-full bg-coral text-white py-2 px-4 rounded-full hover:bg-coral/90 transition-colors duration-200 font-semibold">
                    View & Support
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedWishlists;