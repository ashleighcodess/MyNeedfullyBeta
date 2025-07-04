import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Star, ShoppingCart, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";

export default function ProductSearchSimple() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Simple product search query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/products/search', debouncedQuery, page],
    enabled: debouncedQuery.length > 2,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('query', debouncedQuery);
      params.append('limit', '10');
      if (page > 1) params.append('page', page.toString());
      
      const response = await fetch(`/api/products/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 2) {
      setPage(1);
      toast({
        title: "Searching products...",
        description: "This may take 5-10 seconds for real-time data.",
      });
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const products = searchResults?.products || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Search
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search for products to add to your needs lists. We'll find real-time pricing and availability.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-coral-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for products...</p>
          </div>
        )}

        {/* Search Results */}
        {products.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                Search Results ({searchResults?.total || products.length})
              </h2>
              <Badge variant="secondary">
                Showing {products.length} results
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any, index: number) => (
                <Card key={product.asin || index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-48 object-contain rounded-lg bg-gray-50"
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {product.title}
                    </CardTitle>
                    
                    <div className="space-y-2 mb-4">
                      {product.price && (
                        <div className="text-2xl font-bold text-coral-600">
                          ${typeof product.price === 'object' ? product.price.value : product.price}
                        </div>
                      )}
                      
                      {product.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to List
                      </Button>
                      {product.link && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={product.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {searchResults?.hasMore && (
              <div className="text-center mt-8">
                <Button onClick={loadMore} size="lg" variant="outline">
                  Show More Results
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {debouncedQuery.length > 2 && !isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products found for "{debouncedQuery}"</p>
            <p className="text-sm text-gray-500">Try searching with different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}