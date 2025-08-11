import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useSEO, generatePageTitle, generatePageDescription, generateKeywords, generateCanonicalUrl } from "@/lib/seo";
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
import { Plus, Save, MapPin, AlertCircle, Heart, Upload, X, Camera } from "lucide-react";
import AddressAutocomplete from "@/components/address-autocomplete";

const createNeedsListSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description too long"),
  story: z.string().min(50, "Please share more details about your situation").max(2000, "Story too long"),
  category: z.string().min(1, "Please select a category"),
  urgencyLevel: z.enum(["low", "medium", "high", "urgent"]),
  location: z.string().min(3, "Please enter your location"),
  isForSelf: z.boolean().default(true),
  beneficiaryName: z.string().optional(),
  relationshipToBeneficiary: z.string().optional(),
  beneficiaryContext: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string().min(1, "Full name is required"),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(5, "Valid ZIP code required"),
    country: z.string().default("US"),
  }),
}).refine((data) => {
  if (!data.isForSelf) {
    return data.beneficiaryName && data.relationshipToBeneficiary && data.beneficiaryContext;
  }
  return true;
}, {
  message: "When creating a list for someone else, please provide their name, your relationship, and context.",
  path: ["beneficiaryName"],
});

type CreateNeedsListForm = z.infer<typeof createNeedsListSchema>;

export default function CreateNeedsList() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Sign up required",
        description: "Please sign up to create a needs list",
        variant: "default",
      });
      navigate("/signup");
      return;
    }
  }, [isAuthenticated, isLoading, navigate, toast]);
  
  // SEO Configuration
  useSEO({
    title: generatePageTitle("Create Needs List - Get Help During Crisis"),
    description: generatePageDescription("Create a needs list to get help during crisis situations. Share your story with our community and receive support from generous donors who want to help families in need."),
    keywords: generateKeywords([
      "create needs list",
      "crisis help",
      "disaster relief request",
      "emergency assistance",
      "community support"
    ]),
    canonical: generateCanonicalUrl("/create"),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Create Needs List",
      "description": "Create a needs list to get help during crisis situations",
      "url": "https://myneedfully.app/create",
      "isPartOf": {
        "@type": "WebSite",
        "name": "MyNeedfully",
        "url": "https://myneedfully.app"
      },
      "potentialAction": {
        "@type": "CreateAction",
        "name": "Create Needs List",
        "description": "Create a needs list for crisis support"
      }
    }
  });

  const [step, setStep] = useState(1);
  const [storyImages, setStoryImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const form = useForm<CreateNeedsListForm>({
    resolver: zodResolver(createNeedsListSchema),
    defaultValues: {
      title: "",
      description: "",
      story: "",
      category: "",
      urgencyLevel: "medium",
      location: "",
      isForSelf: true,
      beneficiaryName: "",
      relationshipToBeneficiary: "",
      beneficiaryContext: "",
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

  // Image upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images total
    const remainingSlots = 5 - storyImages.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    filesToAdd.forEach((file) => {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit to match server
        toast({
          title: "File too large",
          description: "Please select images smaller than 25MB",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select only image files",
          variant: "destructive",
        });
        return;
      }
    });

    setStoryImages(prev => [...prev, ...filesToAdd]);
    
    // Create preview URLs
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setStoryImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const createNeedsListMutation = useMutation({
    mutationFn: async (data: CreateNeedsListForm) => {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('needsListData', JSON.stringify(data));
      
      // Add images to formData
      storyImages.forEach((image) => {
        formData.append('storyImage', image);
      });

      const response = await fetch("/api/wishlists", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (wishlist) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlists'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/wishlists`] });
      
      toast({
        title: "Needs List Created!",
        description: "Your needs list has been created successfully. You can now add items to it.",
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
        description: "Failed to create needs list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateNeedsListForm) => {
    createNeedsListMutation.mutate(data);
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

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (useEffect will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Create Your Needs List</h1>
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
                  {/* Who is this for? */}
                  <FormField
                    control={form.control}
                    name="isForSelf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Who is this needs list for? *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="for-self"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                                className="text-coral focus:ring-coral"
                              />
                              <label htmlFor="for-self" className="text-sm font-medium">
                                For myself
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="for-other"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                                className="text-coral focus:ring-coral"
                              />
                              <label htmlFor="for-other" className="text-sm font-medium">
                                For someone else
                              </label>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Beneficiary Details - Show only when "for someone else" is selected */}
                  {!form.watch("isForSelf") && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900">Tell us about who you're helping</h4>
                      
                      <FormField
                        control={form.control}
                        name="beneficiaryName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Their name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Jennifer Smith"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="relationshipToBeneficiary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your relationship to them *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Sister, Friend, Neighbor, Coworker"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="beneficiaryContext"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Why are you creating this list for them? *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="e.g., Her house burned down last week and she lost everything. She's staying with family but needs basic essentials to get back on her feet."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Needs List Title *</FormLabel>
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

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Camera className="inline h-4 w-4 mr-1" />
                        Add Photos to Tell Your Story
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload images that provide insight or proof of your situation. Photos help build trust and tell your story more effectively. (Optional, up to 5 images)
                      </p>
                      
                      {/* Image Upload Button */}
                      <div className="mb-4">
                        <input
                          type="file"
                          id="story-images"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="story-images"
                          className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral cursor-pointer ${
                            storyImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {storyImages.length === 0 ? 'Upload Photos' : `Add More Photos (${storyImages.length}/5)`}
                        </label>
                      </div>

                      {/* Image Previews */}
                      {imagePreviewUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Story image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

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

                  {/* Address Line 1 with Autocomplete */}
                  <FormField
                    control={form.control}
                    name="shippingAddress.addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1 * (Start typing for suggestions)</FormLabel>
                        <AddressAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          onAddressSelect={(addressData) => {
                            // Auto-populate fields when an address is selected
                            const streetAddress = addressData.streetNumber && addressData.route 
                              ? `${addressData.streetNumber} ${addressData.route}`
                              : addressData.route || field.value;
                            
                            form.setValue("shippingAddress.addressLine1", streetAddress);
                            form.setValue("shippingAddress.city", addressData.city);
                            form.setValue("shippingAddress.state", addressData.state);
                            form.setValue("shippingAddress.zipCode", addressData.zipCode);
                            form.setValue("shippingAddress.country", addressData.country || "US");
                          }}
                          placeholder="123 Main Street"
                        />
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
                      disabled={createNeedsListMutation.isPending}
                      className="bg-coral hover:bg-coral/90"
                    >
                      {createNeedsListMutation.isPending ? (
                        <>Creating...</>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Needs List
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
                <p>• Update your needs list regularly</p>
                <p>• Thank your donors personally</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
