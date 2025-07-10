import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Eye, Heart, Edit, AlertCircle } from "lucide-react";

export default function WishlistDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: [`/api/wishlists/${id}`],
    enabled: !!id,
  });

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const completionPercentage = wishlist?.totalItems > 0 
    ? Math.round((wishlist.fulfilledItems / wishlist.totalItems) * 100) 
    : 0;

  const isOwner = user?.id?.toString() === wishlist?.userId?.toString();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Needs List Not Found</h3>
            <p className="text-gray-600 mb-4">The needs list you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2 leading-tight pr-4">{wishlist.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{wishlist.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Created {new Date(wishlist.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="mr-1 h-4 w-4 flex-shrink-0" />
                  <span>{wishlist.viewCount} views</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Badge className={getUrgencyColor(wishlist.urgencyLevel)}>
                {wishlist.urgencyLevel.charAt(0).toUpperCase() + wishlist.urgencyLevel.slice(1)}
              </Badge>
              <div className="flex items-center space-x-2">
                {isOwner && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/edit-wishlist/${wishlist.id}`)}>
                    <Edit className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Heart className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-coral" />
                  About This Need
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{wishlist.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items Needed ({wishlist.items?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {wishlist.items && wishlist.items.length > 0 ? (
                  <div className="space-y-4">
                    {wishlist.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">${item.price || '99.00'}</div>
                          {!item.isFulfilled && (
                            <Button size="sm" className="mt-2">
                              Support Item
                            </Button>
                          )}
                          {item.isFulfilled && (
                            <Badge className="bg-green-100 text-green-800">Fulfilled</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No items have been added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={completionPercentage} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span>{completionPercentage}% Complete</span>
                    <span>{wishlist.fulfilledItems || 0} of {wishlist.totalItems || 0} items</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Creator Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {wishlist.user?.firstName} {wishlist.user?.lastName}</p>
                  <p><strong>Location:</strong> {wishlist.location}</p>
                  <p><strong>Category:</strong> {wishlist.category}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}