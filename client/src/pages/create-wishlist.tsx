import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { CATEGORIES, URGENCY_LEVELS, SAMPLE_LOCATIONS } from "@/lib/constants";
import { Plus, Save, MapPin, AlertCircle, Heart } from "lucide-react";

const createWishlistSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description too long"),
  story: z.string().min(50, "Please share more details about your situation").max(2000, "Story too long"),
  category: z.string().min(1, "Please select a category"),
  urgencyLevel: z.enum(["low", "medium", "high", "urgent"]),
  location: z.string().min(3, "Please enter your location"),
  shippingAddress: z.object({
    fullName: z.string().min(1, "Full name is required"),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(5, "Valid ZIP code required"),
    country: z.string().default("US"),
  }),
});

type CreateWishlistForm = z.infer<typeof createWishlistSchema>;

export default function CreateWishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);

  const form = useForm<CreateWishlistForm>({
    resolver: zodResolver(createWishlistSchema),
    defaultValues: {
      title: "",
      description: "",
      story: "",
      category: "",
      urgencyLevel: "medium",
      location: "",
      shippingAddress: {
        fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
    },
  });

  const createWishlistMutation = useMutation({
    mutationFn: async (data: CreateWishlistForm) => {
      return await apiRequest("POST", "/api/wishlists", data);
    },
    onSuccess: async (response) => {
      const wishlist = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/wishlists'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/wishlists`] });
      
      toast({
        title: "Wishlist Created!",
        description: "Your wishlist has been created successfully. You can now add items to it.",
      });
      
      navigate(`/wishlist/${wishlist.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to create wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateWishlistForm) => {
    createWishlistMutation.mutate(data);
  };

  const nextStep = async () => {
    const isValid = await form.trigger(step === 1 ? ["title", "description", "story", "category", "urgencyLevel", "location"] : ["shippingAddress"]);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const getCategoryIcon = (value: string) => {
    const category = CATEGORIES.find(c => c.value === value);
    return category?.icon || "fas fa-ellipsis-h";
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "urgent": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-green-600 bg-green-50 border-green-200";
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Create Your Wishlist</h1>
          <p className="text-gray-600">Share your needs with our caring community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-coral' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-coral bg-coral text-white' : 'border-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Basic Information</span>
            </div>
            <div className={`h-px flex-1 ${step >= 2 ? 'bg-coral' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-coral' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-coral bg-coral text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Shipping Details</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-coral" />
                    Tell Your Story
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wishlist Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Help Our Family After House Fire"
                            {...field}
                            className="text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brief Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a brief overview of what you need and why..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Story */}
                  <FormField
                    control={form.control}
                    name="story"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Story *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share more details about your situation. Being open and honest helps build trust with potential donors..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  <div className="flex items-center space-x-2">
                                    <i className={`${category.icon} text-coral`}></i>
                                    <span>{category.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Urgency Level */}
                    <FormField
                      control={form.control}
                      name="urgencyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency Level *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {URGENCY_LEVELS.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  <div className={`flex items-center space-x-2 px-2 py-1 rounded ${getUrgencyColor(level.value)}`}>
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{level.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input 
                              placeholder="e.g., Austin, TX"
                              {...field}
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {SAMPLE_LOCATIONS.map((location) => (
                            <Button
                              key={location}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.onChange(location)}
                              className="text-xs"
                            >
                              {location}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="button" onClick={nextStep} className="bg-coral hover:bg-coral/90">
                      Next: Shipping Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-coral" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="shippingAddress.fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address Line 1 */}
                  <FormField
                    control={form.control}
                    name="shippingAddress.addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1 *</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address Line 2 */}
                  <FormField
                    control={form.control}
                    name="shippingAddress.addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apartment, suite, unit, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* City */}
                    <FormField
                      control={form.control}
                      name="shippingAddress.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Austin" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="shippingAddress.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input placeholder="TX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ZIP Code */}
                    <FormField
                      control={form.control}
                      name="shippingAddress.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="78701" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createWishlistMutation.isPending}
                      className="bg-coral hover:bg-coral/90"
                    >
                      {createWishlistMutation.isPending ? (
                        <>Creating...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Wishlist
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>

        {/* Help Tips */}
        <Card className="mt-8 bg-coral/5 border-coral/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-navy mb-4">💡 Tips for Success</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <p>• Be specific and honest about your needs</p>
                <p>• Include photos when adding items later</p>
                <p>• Share your story authentically</p>
              </div>
              <div className="space-y-2">
                <p>• Keep item descriptions detailed</p>
                <p>• Update your wishlist regularly</p>
                <p>• Thank your donors personally</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
