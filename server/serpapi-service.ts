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
        sort: 'best_match'        // Fastest processing
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
      
      // Try approach that was working earlier - using google engine with target.com site filter
      const params = {
        api_key: this.apiKey,
        engine: 'google',
        q: `${query} site:target.com`,
        location: location,
        google_domain: 'google.com',
        gl: 'us',
        hl: 'en',
        num: Math.min(limit, 60).toString(),
        start: '0',
        device: 'desktop',
        safe: 'off',
        lr: 'lang_en'
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
        console.log(`Target SerpAPI responded with ${response.status}`);
        return [];
      }

      const data = await response.json();
      console.log('Target SerpAPI response structure:', Object.keys(data));

      // Check for error messages
      if (data.error) {
        console.log('Target SerpAPI error:', data.error);
        return [];
      }

      // Check for shopping_results first, fallback to organic_results
      let resultsArray = [];
      let resultType = '';
      
      if (data.shopping_results && Array.isArray(data.shopping_results) && data.shopping_results.length > 0) {
        resultsArray = data.shopping_results;
        resultType = 'shopping_results';
        console.log(`Target shopping_results found: ${data.shopping_results.length}`);
      } else if (data.organic_results && Array.isArray(data.organic_results) && data.organic_results.length > 0) {
        resultsArray = data.organic_results;
        resultType = 'organic_results';
        console.log(`Target organic_results found: ${data.organic_results.length}`);
      } else {
        console.log('No shopping_results or organic_results found in Target response');
        console.log('Available response keys:', Object.keys(data));
        return [];
      }

      const targetResults = resultsArray
        .filter((result: any) => {
          const resultLink = result.link || '';
          const resultTitle = result.title || '';
          
          // Must have title and be from Target
          if (!resultTitle || resultTitle.length < 3) return false;
          if (!resultLink.includes('target.com')) return false;
          
          return true;
        })
        .slice(0, limit)
        .map((result: any, index: number) => {
          // Debug logging for Target image data structure
          if (index === 0) {
            console.log('=== TARGET RESULT DEBUG ===');
            console.log('Result keys:', Object.keys(result));
            console.log('Has thumbnail:', !!result.thumbnail);
            console.log('Has image:', !!result.image);
            console.log('Has favicon:', !!result.favicon);
            console.log('Has serpapi_thumbnail:', !!result.serpapi_thumbnail);
            console.log('Rich snippet available:', !!result.rich_snippet);
            if (result.rich_snippet) {
              console.log('Rich snippet keys:', Object.keys(result.rich_snippet));
            }
            console.log('=== END DEBUG ===');
          }
          const resultTitle = result.title || '';
          const resultLink = result.link || '';
          
          // Extract price based on result type
          let extractedPrice = 'Price varies';
          let imageUrl = '';
          
          if (resultType === 'shopping_results') {
            // Shopping results have structured price data
            extractedPrice = result.price || result.extracted_price || 'Price varies';
            imageUrl = result.thumbnail || result.image || '';
          } else {
            // Organic results need price extraction from snippets
            if (result.rich_snippet && result.rich_snippet.top && result.rich_snippet.top.detected_extensions) {
              const priceExt = result.rich_snippet.top.detected_extensions.find((ext: string) => 
                ext.match(/\$[\d,]+\.?\d*/));
              if (priceExt) {
                const priceMatch = priceExt.match(/\$[\d,]+\.?\d*/);
                if (priceMatch) extractedPrice = priceMatch[0];
              }
            }
            
            // Fallback: look for price in snippet
            if (extractedPrice === 'Price varies' && result.snippet) {
              const priceMatch = result.snippet.match(/\$[\d,]+\.?\d*/);
              if (priceMatch) extractedPrice = priceMatch[0];
            }
            
            // Target-specific image handling for organic results
            if (resultLink.includes('target.com')) {
              // Check for any available image data in the result
              imageUrl = result.thumbnail || result.image || result.favicon || '';
              
              // For organic results, SerpAPI sometimes provides images in different fields
              if (!imageUrl && result.serpapi_thumbnail) {
                imageUrl = result.serpapi_thumbnail;
              }
              
              // Extract additional image sources from rich snippets if available
              if (!imageUrl && result.rich_snippet && result.rich_snippet.top && result.rich_snippet.top.extensions) {
                const extensions = result.rich_snippet.top.extensions;
                // Look for image URLs in extensions
                for (const ext of extensions) {
                  if (typeof ext === 'string' && (ext.includes('http') && (ext.includes('.jpg') || ext.includes('.png') || ext.includes('.jpeg')))) {
                    imageUrl = ext;
                    break;
                  }
                }
              }
            }
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
            brand: result.brand || undefined,
            description: result.snippet || undefined,
          };
        });

      console.log(`Target search found ${targetResults.length} products`);
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