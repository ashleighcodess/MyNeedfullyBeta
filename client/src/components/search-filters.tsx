import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES, URGENCY_LEVELS, WISHLIST_STATUS, SAMPLE_LOCATIONS } from "@/lib/constants";
import { Filter, X, MapPin } from "lucide-react";

interface SearchFiltersProps {
  filters: {
    category: string;
    urgencyLevel: string;
    location: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: "",
      urgencyLevel: "",
      location: "",
      status: "active",
    });
  };

  const hasActiveFilters = filters.category || filters.urgencyLevel || filters.location || filters.status !== "active";

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5 text-coral" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-coral hover:text-coral/80"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category
          </Label>
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center space-x-2">
                    <i className={`${category.icon} text-coral text-sm`}></i>
                    <span>{category.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Urgency Level Filter */}
        <div className="space-y-2">
          <Label htmlFor="urgency" className="text-sm font-medium">
            Urgency Level
          </Label>
          <Select value={filters.urgencyLevel} onValueChange={(value) => updateFilter('urgencyLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All urgency levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Urgency Levels</SelectItem>
              {URGENCY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded text-sm`}>
                    <div className={`w-2 h-2 rounded-full bg-${level.color}-500`}></div>
                    <span>{level.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Location Filter */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Enter city, state..."
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Quick Location Buttons */}
          <div className="grid grid-cols-2 gap-1 mt-2">
            {SAMPLE_LOCATIONS.slice(0, 6).map((location) => (
              <Button
                key={location}
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('location', location)}
                className="text-xs h-8 justify-start px-2 hover:bg-coral/10 hover:text-coral"
              >
                {location}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {WISHLIST_STATUS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Quick Filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter('urgencyLevel', 'urgent')}
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              🚨 Urgent Needs
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onFiltersChange({
                  ...filters,
                  category: 'baby_kids',
                  urgencyLevel: '',
                });
              }}
              className="w-full justify-start text-pink-600 hover:bg-pink-50 hover:text-pink-700"
            >
              👶 Baby & Kids
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onFiltersChange({
                  ...filters,
                  category: 'food_groceries',
                  urgencyLevel: '',
                });
              }}
              className="w-full justify-start text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              🍽️ Food & Groceries
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onFiltersChange({
                  ...filters,
                  category: 'medical_supplies',
                  urgencyLevel: '',
                });
              }}
              className="w-full justify-start text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              🏥 Medical Supplies
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
