import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Search, Package, Heart, ChevronLeft } from "lucide-react";

const PRODUCT_CATEGORIES = [
  { value: "baby_kids", label: "Baby & Kids" },
  { value: "household", label: "Household" },
  { value: "food_grocery", label: "Food & Grocery" },
  { value: "health_beauty", label: "Health & Beauty" },
  { value: "clothing", label: "Clothing" },
];

export default function ProductSearchSimple() {
  const [navigate] = useNavigate();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple search function without React Query
  const performSearch = async (searchTerm: string, searchCategory?: string) => {
    if (!searchTerm || searchTerm.length < 3) return;
    
    setIsLoading(true);
    setError(null);
    console.log('Simple Search: Starting search for:', searchTerm);
    
    try {
      const params = new URLSearchParams();
      params.append('query', searchTerm);
      if (searchCategory && searchCategory !== 'all') {
        params.append('category', searchCategory);
      }
      
      const searchUrl = `/api/search?${params.toString()}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }
      
      const data = await response.json();
      console.log('Simple Search: Success with', data?.data?.length || 0, 'products');
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Simple Search: Error:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchQuery.trim().length > 2) {
      performSearch(searchQuery.trim(), category);
    }
  };

  const handleCategoryClick = (categoryValue: string, categoryLabel: string) => {
    setCategory(categoryValue);
    setSearchQuery(categoryLabel);
    performSearch(categoryLabel, categoryValue);
  };

  const formatPrice = (price: any) => {
    if (!price) return 'Price not available';
    
    if (typeof price === 'object' && price.value !== undefined) {
      return `$${price.value.toFixed(2)}`;
    }
    
    if (typeof price === 'string') {
      return price.startsWith('$') ? price : `$${price}`;
    }
    
    return 'Price not available';
  };

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-navy mb-1 md:mb-2">
            Product Search
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Search for products from trusted retailers
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3"
              />
            </div>
            <Button type="submit" className="bg-coral hover:bg-coral/90 px-8">
              Search
            </Button>
          </form>
        </div>

        {/* Category Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-navy mb-4">Popular Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant="outline"
                className="h-auto p-4 border-2 border-gray-200 hover:border-coral/60 hover:bg-coral/5"
                onClick={() => handleCategoryClick(cat.value, cat.label)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-lg mb-6">
              <Package className="h-12 w-12 animate-spin text-coral" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Searching products...</p>
            <p className="text-sm text-gray-600">This may take 7-14 seconds</p>
          </div>
        )}

        {error && (
          <Card className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Search Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => setError(null)} variant="outline">
              Try Again
            </Button>
          </Card>
        )}

        {searchResults && searchResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-navy mb-4">
              Found {searchResults.length} products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((product: any, index: number) => (
                <Card key={`${product.asin || product.product_id || index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {product.image || product.image_url ? (
                      <img 
                        src={product.image || product.image_url}
                        alt={product.title}
                        className="w-full h-48 object-contain bg-gray-50"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-50 text-gray-500">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    {product.retailer && (
                      <Badge className="absolute top-2 right-2 bg-white text-navy">
                        {product.retailer}
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-navy mb-2 line-clamp-2 text-sm">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      {product.price && (
                        <div className="font-bold text-lg text-coral">
                          {formatPrice(product.price)}
                        </div>
                      )}
                      {product.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-coral hover:bg-coral/90"
                      size="sm"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Add to Needs List
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && searchResults.length === 0 && searchQuery && (
          <Card className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              variant="outline"
            >
              Clear Search
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}