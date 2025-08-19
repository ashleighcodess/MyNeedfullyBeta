import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  Package, 
  TrendingUp, 
  Save,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PlatformStats {
  id: number;
  totalSupport: number;
  itemsFulfilled: number;
  familiesHelped: number;
  donationValue: number;
  needsListCreated: number;
  needsListFulfilled: number;
  smilesSpread: number;
  productsDelivered: number;
  updatedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminStats() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    totalSupport: '',
    itemsFulfilled: '',
    familiesHelped: '',
    donationValue: '',
    needsListCreated: '',
    needsListFulfilled: '',
    smilesSpread: '',
    productsDelivered: '',
    notes: ''
  });

  // Fetch current platform statistics
  const { data: currentStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/platform-stats'],
    retry: 1,
  });

  // Update statistics mutation
  const updateStatsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/admin/platform-stats', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Platform statistics updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/platform-stats'] });
      // Reset form
      setFormData({
        totalSupport: '',
        itemsFulfilled: '',
        familiesHelped: '',
        donationValue: '',
        needsListCreated: '',
        needsListFulfilled: '',
        smilesSpread: '',
        productsDelivered: '',
        notes: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update statistics",
        variant: "destructive",
      });
    },
  });

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.userType !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You need administrator privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string values to numbers, filtering out empty strings
    const data: any = {
      notes: formData.notes
    };
    
    // Only include numeric fields that have values
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'notes' && value.trim() !== '') {
        const numValue = parseInt(value.trim());
        if (!isNaN(numValue) && numValue >= 0) {
          data[key] = numValue;
        }
      }
    });

    // Ensure at least one field is being updated
    if (Object.keys(data).length === 1 && data.notes === '') {
      toast({
        title: "Error", 
        description: "Please provide at least one statistic to update",
        variant: "destructive",
      });
      return;
    }

    updateStatsMutation.mutate(data);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100); // Convert cents to dollars
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Platform Statistics Management
          </h1>
          <p className="text-gray-600">
            Update community impact metrics and platform statistics
          </p>
          <Badge variant="outline" className="mt-2">
            Admin Access Required
          </Badge>
        </div>

        {/* Current Statistics Display */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : currentStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Total Support</CardTitle>
                  <Users className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber((currentStats as PlatformStats).totalSupport || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Items Fulfilled</CardTitle>
                  <Package className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber((currentStats as PlatformStats).itemsFulfilled || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Families Helped</CardTitle>
                  <Heart className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber((currentStats as PlatformStats).familiesHelped || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Total Value</CardTitle>
                  <TrendingUp className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency((currentStats as PlatformStats).donationValue || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No statistics found. Use the form below to initialize platform statistics.
            </AlertDescription>
          </Alert>
        )}

        {/* Update Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Update Platform Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="totalSupport">Total Support Actions</Label>
                  <Input
                    id="totalSupport"
                    type="number"
                    min="0"
                    placeholder="e.g., 1547"
                    value={formData.totalSupport}
                    onChange={(e) => handleInputChange('totalSupport', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="itemsFulfilled">Items Fulfilled</Label>
                  <Input
                    id="itemsFulfilled"
                    type="number"
                    min="0"
                    placeholder="e.g., 892"
                    value={formData.itemsFulfilled}
                    onChange={(e) => handleInputChange('itemsFulfilled', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="familiesHelped">Families Helped</Label>
                  <Input
                    id="familiesHelped"
                    type="number"
                    min="0"
                    placeholder="e.g., 234"
                    value={formData.familiesHelped}
                    onChange={(e) => handleInputChange('familiesHelped', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="donationValue">Total Value (in cents)</Label>
                  <Input
                    id="donationValue"
                    type="number"
                    min="0"
                    placeholder="e.g., 4578000 for $45,780"
                    value={formData.donationValue}
                    onChange={(e) => handleInputChange('donationValue', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="needsListCreated">Needs Lists Created</Label>
                  <Input
                    id="needsListCreated"
                    type="number"
                    min="0"
                    placeholder="e.g., 156"
                    value={formData.needsListCreated}
                    onChange={(e) => handleInputChange('needsListCreated', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="needsListFulfilled">Needs Lists Fulfilled</Label>
                  <Input
                    id="needsListFulfilled"
                    type="number"
                    min="0"
                    placeholder="e.g., 89"
                    value={formData.needsListFulfilled}
                    onChange={(e) => handleInputChange('needsListFulfilled', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="smilesSpread">Smiles Spread</Label>
                  <Input
                    id="smilesSpread"
                    type="number"
                    min="0"
                    placeholder="e.g., 567"
                    value={formData.smilesSpread}
                    onChange={(e) => handleInputChange('smilesSpread', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="productsDelivered">Products Delivered</Label>
                  <Input
                    id="productsDelivered"
                    type="number"
                    min="0"
                    placeholder="e.g., 1245"
                    value={formData.productsDelivered}
                    onChange={(e) => handleInputChange('productsDelivered', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Update Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes about this update..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  type="submit" 
                  disabled={updateStatsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateStatsMutation.isPending ? (
                    <Activity className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {updateStatsMutation.isPending ? 'Updating...' : 'Update Statistics'}
                </Button>

                {currentStats && (
                  <div className="text-sm text-gray-600">
                    Last updated: {new Date((currentStats as PlatformStats).updatedAt).toLocaleString()}
                    {(currentStats as PlatformStats).updatedBy && ` by ${(currentStats as PlatformStats).updatedBy}`}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Only provide values for statistics you want to update</li>
              <li>• Empty fields will be ignored and keep their current values</li>
              <li>• Donation values should be entered in cents (e.g., 4578000 for $45,780)</li>
              <li>• All changes are logged and tracked for audit purposes</li>
              <li>• These statistics appear on the Community Impact page</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}