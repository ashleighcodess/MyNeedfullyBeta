import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import AddressAutocomplete from "@/components/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Upload, X, MapPin, AlertCircle } from "lucide-react";

export default function EditWishlist() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    location: '',
    urgencyLevel: '',
    category: '',
    shippingAddress: {
      fullAddress: '',
      streetNumber: '',
      route: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const [storyImages, setStoryImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Fetch existing wishlist data
  const { data: wishlist, isLoading } = useQuery({
    queryKey: [`/api/wishlists/${id}`],
    enabled: !!id,
  });

  // Populate form when wishlist data is loaded
  useEffect(() => {
    if (wishlist) {
      setFormData({
        title: wishlist.title || '',
        description: wishlist.description || '',
        story: wishlist.story || '',
        location: wishlist.location || '',
        urgencyLevel: wishlist.urgencyLevel || '',
        category: wishlist.category || '',
        shippingAddress: wishlist.shippingAddress || {
          fullAddress: '',
          streetNumber: '',
          route: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
      // Parse storyImages properly
      const storyImages = wishlist.storyImages;
      if (Array.isArray(storyImages)) {
        setExistingImages(storyImages);
      } else if (typeof storyImages === 'string' && storyImages.startsWith('{') && storyImages.endsWith('}')) {
        const innerString = storyImages.slice(1, -1);
        setExistingImages(innerString ? innerString.split(',').map(img => img.trim().replace(/"/g, '')) : []);
      } else {
        setExistingImages([]);
      }
    }
  }, [wishlist]);

  // Check if user is owner
  const isOwner = user?.id?.toString() === wishlist?.userId?.toString();

  // Update wishlist mutation
  const updateWishlistMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/wishlists/${id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your needs list has been updated!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wishlists', id] });
      navigate(`/wishlist/${id}`);
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
        description: "Failed to update needs list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location || 
        !formData.urgencyLevel || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('story', formData.story);
    submitData.append('location', formData.location);
    submitData.append('urgencyLevel', formData.urgencyLevel);
    submitData.append('category', formData.category);
    submitData.append('shippingAddress', JSON.stringify(formData.shippingAddress));

    // Add new images
    storyImages.forEach((file) => {
      submitData.append('storyImages', file);
    });

    // Add existing images to keep
    submitData.append('existingImages', JSON.stringify(existingImages));

    updateWishlistMutation.mutate(submitData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + storyImages.length + files.length;
    
    if (totalImages > 5) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 5 images total.",
        variant: "destructive",
      });
      return;
    }

    setStoryImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setStoryImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddressSelect = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: addressData
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist || !isOwner) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">You can only edit your own needs lists.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/wishlist/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Needs List
          </Button>
          <h1 className="text-3xl font-bold text-navy mb-2">Edit Needs List</h1>
          <p className="text-gray-600">Update your needs list details, story, and images.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief, descriptive title for your needs list"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide a clear description of your situation and needs"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="urgencyLevel">Urgency Level *</Label>
                  <Select value={formData.urgencyLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, urgencyLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Not time sensitive</SelectItem>
                      <SelectItem value="medium">Medium - Helpful within a month</SelectItem>
                      <SelectItem value="high">High - Needed within a week</SelectItem>
                      <SelectItem value="urgent">Urgent - Immediate need</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="housing">Housing & Shelter</SelectItem>
                    <SelectItem value="food">Food & Nutrition</SelectItem>
                    <SelectItem value="clothing">Clothing & Accessories</SelectItem>
                    <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                    <SelectItem value="education">Education & Learning</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="employment">Employment & Work</SelectItem>
                    <SelectItem value="childcare">Childcare & Family</SelectItem>
                    <SelectItem value="household">Household Items</SelectItem>
                    <SelectItem value="technology">Technology & Electronics</SelectItem>
                    <SelectItem value="legal">Legal & Financial</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Story Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Story</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="story">Tell Your Story</Label>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                  placeholder="Share your story to help people understand your situation and connect with your needs..."
                  rows={6}
                />
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Story image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {storyImages.length > 0 && (
                <div>
                  <Label>New Images to Add</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {storyImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New story image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload new images */}
              {existingImages.length + storyImages.length < 5 && (
                <div>
                  <Label htmlFor="images">Add Images ({existingImages.length + storyImages.length}/5)</Label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-coral transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="images"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-coral hover:text-coral-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-coral"
                        >
                          <span>Upload images</span>
                          <input
                            id="images"
                            name="images"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 25MB each</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This information will be shared with supporters when they fulfill items so they know where to send them.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address Line 1 *</Label>
                  <AddressAutocomplete
                    value={formData.shippingAddress.fullAddress}
                    onChange={(value) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, fullAddress: value }
                    }))}
                    onAddressSelect={handleAddressSelect}
                    placeholder="Start typing your address..."
                  />
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.shippingAddress.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.shippingAddress.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.shippingAddress.zipCode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, zipCode: e.target.value }
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.shippingAddress.country}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingAddress: { ...prev.shippingAddress, country: e.target.value }
                    }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/wishlist/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateWishlistMutation.isPending}
            >
              {updateWishlistMutation.isPending ? 'Updating...' : 'Update Needs List'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}