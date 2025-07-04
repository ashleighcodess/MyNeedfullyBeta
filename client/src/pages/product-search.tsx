import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  ExternalLink,
  Heart,
  DollarSign,
  Package
} from "lucide-react";

export default function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [activeSearch, setActiveSearch] = useState("");

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['/api/products/search', { query: activeSearch, category, min_price: minPrice, max_price: maxPrice, page }],
    enabled: !!activeSearch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
      setPage(1);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    if (activeSearch) {
      setPage(1);
    }
  };

  const formatPrice = (price: any) => {
    if (!price || price.raw === undefined) return 'Price not available';
    return `$${price.raw.toFixed(2)}`;
  };

  const formatRating = (rating: any) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-warm-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Product Search</h1>
          <p className="text-gray-600">Find products from trusted retailers to add to your wishlist</p>
        </div>

        {/* Search Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5 text-coral" />
              Search Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search for products (e.g., baby formula, school supplies, groceries)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-3"
                  />
                </div>
                <Button type="submit" className="bg-coral hover:bg-coral/90 px-8 whitespace-nowrap">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center space-x-2">
                          <i className={`${cat.icon} text-coral`}></i>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Min Price"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />

                <Input
                  placeholder="Max Price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setCategory("");
                    setMinPrice("");
                    setMaxPrice("");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        {!activeSearch && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {CATEGORIES.slice(0, 6).map((category) => (
                  <div
                    key={category.value}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer text-center"
                    onClick={() => {
                      setSearchQuery(category.label);
                      setActiveSearch(category.label);
                      setCategory(category.value);
                    }}
                  >
                    <i className={`${category.icon} text-coral text-2xl mb-2`}></i>
                    <div className="text-sm font-medium">{category.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {activeSearch && (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                {isLoading ? (
                  'Searching...'
                ) : error ? (
                  'Search failed'
                ) : searchResults?.search_results ? (
                  `Found ${searchResults.search_results.length} results for "${activeSearch}"`
                ) : (
                  'No results found'
                )}
              </div>
              {searchResults?.pagination && (
                <div className="text-sm text-gray-500">
                  Page {page} of {Math.ceil((searchResults.pagination.total_results || 0) / 16)}
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-6 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search Error</h3>
                <p className="text-gray-600 mb-4">
                  There was an error searching for products. Please try again.
                </p>
                <Button onClick={() => setActiveSearch("")} variant="outline">
                  Clear Search
                </Button>
              </Card>
            )}

            {/* Results Grid */}
            {searchResults?.search_results && searchResults.search_results.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.search_results.map((product: any, index: number) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {product.image && (
                        <div className="relative">
                          <img 
                            src={product.image}
                            alt={product.title}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.png';
                            }}
                          />
                          {product.is_prime && (
                            <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                              Prime
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-navy mb-2 line-clamp-2 text-sm">
                          {product.title}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-2">
                          {product.price && (
                            <div className="font-bold text-lg text-coral">
                              {formatPrice(product.price)}
                            </div>
                          )}
                          {product.rating && formatRating(product.rating)}
                        </div>

                        {product.delivery && (
                          <p className="text-xs text-gray-600 mb-3">
                            {product.delivery}
                          </p>
                        )}

                        <div className="space-y-2">
                          <Button 
                            className="w-full bg-coral hover:bg-coral/90"
                            onClick={() => {
                              if (product.link) {
                                window.open(product.link, '_blank');
                              }
                            }}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Buy on Amazon
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="w-full border-coral text-coral hover:bg-coral/10"
                            onClick={() => {
                              // TODO: Add to wishlist functionality
                              console.log('Add to wishlist:', product);
                            }}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            Add to Wishlist
                          </Button>
                        </div>

                        {product.link && (
                          <div className="mt-2 text-center">
                            <a 
                              href={product.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-500 hover:text-coral inline-flex items-center"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View Details
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {searchResults.pagination && searchResults.pagination.total_results > 16 && (
                  <div className="mt-8 flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center px-4 py-2 text-sm text-gray-600">
                      Page {page}
                    </div>
                    
                    <Button
                      variant="outline"
                      disabled={!searchResults.pagination.next_page}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {searchResults?.search_results && searchResults.search_results.length === 0 && (
              <Card className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveSearch("");
                    setCategory("");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
