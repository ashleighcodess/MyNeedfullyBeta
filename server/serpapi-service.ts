import { getJson } from 'serpapi';

export interface SerpProduct {
  title: string;
  price: string;
  rating?: string;
  reviews?: string;
  image_url?: string;
  product_url: string;
  product_id: string;
  retailer: 'walmart' | 'target';
  brand?: string;
  description?: string;
}

export class SerpAPIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchWalmart(query: string, location: string = '60602', limit: number = 40): Promise<SerpProduct[]> {
    try {
      console.log(`Searching Walmart for: "${query}"`);
      
      const params = {
        api_key: this.apiKey,
        engine: 'walmart',
        query: query,
        location: location,
        device: 'desktop',
        store_id: '2280',         // Specific store for fastest response
        page: 1,                  // First page only
        no_cache: false,          // Use cache when available (1hr)
        output: 'json',           // Structured format
        sort: 'best_match',       // Fastest processing
        max_page: 1,              // Only get first page
        safe: 'off'               // Faster processing
      };

      const response = await getJson(params);
      console.log(`Walmart search response status: ${response ? 'success' : 'no response'}`);
      console.log('Walmart response keys:', response ? Object.keys(response) : 'no response');
      
      // Check for different possible result structures
      const results = response.organic_results || response.search_results || response.products || [];
      console.log(`Walmart results structure found: ${results.length} items`);
      
      if (!results || results.length === 0) {
        console.log('No Walmart results found in any structure');
        console.log('Sample response:', JSON.stringify(response).substring(0, 500));
        return [];
      }

      const walmartResults = results.slice(0, limit).map((product: any) => {
        // Format price properly - SerpAPI returns price as number in primary_offer
        const priceValue = product.primary_offer?.offer_price || product.price || 0;
        const formattedPrice = typeof priceValue === 'number' && priceValue > 0 ? `$${priceValue.toFixed(2)}` : (priceValue?.toString() || 'Price varies');
        
        console.log(`Walmart product: ${product.title?.substring(0, 30)}... | Price: ${formattedPrice}`);
        
        return {
          // Match RainforestAPI structure
          position: product.position || Math.floor(Math.random() * 100),
          title: product.title || '',
          price: formattedPrice,
          rating: product.rating || 0,
          reviews_count: product.reviews || 0,
          image: product.thumbnail || product.image || '',
          link: product.product_page_url || product.link || '',
          asin: product.us_item_id || product.product_id || Math.random().toString(36).substr(2, 9),
          
          // SerpAPI-specific fields mapped to expected structure
          product_id: product.us_item_id || product.product_id,
          product_url: product.product_page_url || product.link || '',
          retailer: 'walmart' as const,
          retailer_name: 'Walmart',
          brand: product.brand || '',
          description: product.description || product.short_description || '',
          
          // Additional fields for compatibility
          thumbnail: product.thumbnail || product.image || '',
          image_url: product.thumbnail || product.image || ''
        };
      });
      
      console.log(`Walmart search found ${walmartResults.length} products`);
      return walmartResults;
    } catch (error) {
      console.error('Error searching Walmart:', error);
      return [];
    }
  }

  async searchTarget(query: string, location: string = '10001', limit: number = 40): Promise<SerpProduct[]> {
    try {
      console.log(`Searching Target with SerpAPI for: "${query}"`);
      
      // Strategy: Optimized Target shopping search with only required fields
      const params = {
        api_key: this.apiKey,
        engine: 'google_shopping',
        q: `${query} Target`,
        location: location,
        google_domain: 'google.com',
        gl: 'us',
        hl: 'en',
        num: Math.min(limit, 10).toString(), // Ultra speed - max 10 results

        output: 'json',
        no_cache: false, // Use cache when available
        safe: 'off', // Faster processing
        filter: '0' // Include all results for speed
      };

      const url = `https://serpapi.com/search.json`;
      const searchParams = new URLSearchParams(params);
      
      const response = await fetch(`${url}?${searchParams}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Target SerpAPI responded with ${response.status}: ${errorText}`);
        return [];
      }

      const data = await response.json();
      console.log('Target SerpAPI response structure:', Object.keys(data));
      console.log('Target shopping_results exists:', !!data.shopping_results);

      // Check for error messages
      if (data.error) {
        console.log('Target SerpAPI error:', data.error);
        return [];
      }

      // Process Google Shopping results for Target products
      if (!data.shopping_results || !Array.isArray(data.shopping_results) || data.shopping_results.length === 0) {
        console.log('No shopping_results found in Target Google Shopping search response');
        console.log('Available response keys:', Object.keys(data));
        return [];
      }

      const resultsArray = data.shopping_results;
      console.log(`Target shopping results found: ${data.shopping_results.length}`);
      
      // Debug: Show first result structure  
      if (data.shopping_results[0]) {
        console.log(`Target first shopping result: "${data.shopping_results[0]?.title}" | Price: ${data.shopping_results[0]?.price}`);
        console.log('🔍 Target shopping result fields:', Object.keys(data.shopping_results[0]).join(', '));
      }

      // Target product processing optimized for authentic results

      console.log(`🔍 Target: Processing ${resultsArray.length} shopping results`);
      
      const targetResults = resultsArray
        .slice(0, 20) // Take first 20 results
        .filter((result: any) => {
          // Very basic filtering - just check for essential fields
          return result.title && result.price && result.product_link;
        })
        .slice(0, limit)
        .map((result: any, index: number) => {
          const resultTitle = result.title || '';
          const resultLink = result.product_link || result.link || '';
          
          // Extract price from Google Shopping results
          let extractedPrice = result.price || result.extracted_price || 'Price varies';
          
          // Enhanced image extraction for Google Shopping results
          let imageUrl = result.thumbnail || result.image || '';
          
          // Extract snippet for description
          const snippet = result.snippet || '';
          
          // Minimal debug logging for performance
          if (index === 0) {
            console.log(`🔗 Target first product: ${resultTitle.substring(0, 50)}... | ${extractedPrice}`);
          }

          return {
            title: resultTitle,
            price: extractedPrice,
            rating: result.rating || undefined,
            reviews: result.reviews || undefined,
            image_url: imageUrl || undefined,
            product_url: resultLink,
            product_id: this.extractTargetProductId(resultLink),
            retailer: 'target' as const,
            retailer_name: 'Target',
            brand: result.brand || undefined,
            description: result.snippet || undefined,
          };
        });

      console.log(`Target search found ${targetResults.length} products`);
      
      // Debug: Show first Target product URL
      if (targetResults.length > 0) {
        console.log(`🔗 First Target product URL: ${targetResults[0].product_url}`);
      }
      
      return targetResults;
    } catch (error) {
      console.error('Error searching Target:', error);
      return [];
    }
  }

  private extractTargetProductId(url: string): string {
    if (!url) return Math.random().toString(36).substr(2, 9);
    
    // Try to extract TCIN from various Target URL formats
    const patterns = [
      /\/A-(\d+)/,           // /A-12345678
      /\/p\/.*?\/A-(\d+)/,   // /p/product-name/A-12345678
      /tcin[=:](\d+)/i,      // tcin=12345678 or tcin:12345678
      /target\.com.*?(\d{8,})/  // Any 8+ digit number in target.com URL
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Generate consistent ID based on URL
    return url.replace(/[^a-zA-Z0-9]/g, '').substr(-8) || Math.random().toString(36).substr(2, 9);
  }

  async searchBothStores(query: string, location: string = '60602', limit: number = 30): Promise<SerpProduct[]> {
    try {
      const [walmartResults, targetResults] = await Promise.all([
        this.searchWalmart(query, location, limit),
        this.searchTarget(query, location, limit)
      ]);

      // Combine and shuffle results
      const combined = [...walmartResults, ...targetResults];
      return this.shuffleArray(combined);
    } catch (error) {
      console.error('Error searching both stores:', error);
      return [];
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async getProductDetails(productId: string, retailer: 'walmart' | 'target'): Promise<any> {
    try {
      if (retailer === 'walmart') {
        const params = {
          api_key: this.apiKey,
          engine: 'walmart_product',
          product_id: productId,
          device: 'desktop'
        };

        const response = await getJson(params);
        return response.product_result;
      } else {
        // For Target, we'd need to use a different approach or API
        // This is a placeholder for now
        return null;
      }
    } catch (error) {
      console.error(`Error getting ${retailer} product details:`, error);
      return null;
    }
  }
}

// Create a singleton instance
let serpAPIService: SerpAPIService | null = null;

export function getSerpAPIService(): SerpAPIService | null {
  if (!process.env.SERPAPI_KEY) {
    console.warn('SERPAPI_KEY not found in environment variables');
    return null;
  }

  if (!serpAPIService) {
    serpAPIService = new SerpAPIService(process.env.SERPAPI_KEY);
  }

  return serpAPIService;
}