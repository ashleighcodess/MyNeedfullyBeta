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

  async searchWalmart(query: string, location: string = '60602', limit: number = 20): Promise<SerpProduct[]> {
    try {
      console.log(`Searching Walmart for: "${query}"`);
      
      const params = {
        api_key: this.apiKey,
        engine: 'walmart',
        query: query,
        location: location,
        device: 'desktop'
      };

      const response = await getJson(params);
      console.log(`Walmart search response status: ${response ? 'success' : 'no response'}`);
      
      if (!response.organic_results) {
        console.log('No Walmart organic_results found');
        return [];
      }

      const walmartResults = response.organic_results.slice(0, limit).map((product: any) => ({
        title: product.title || '',
        price: product.primary_offer?.offer_price || product.price || '0',
        rating: product.rating?.toString() || '',
        reviews: product.reviews?.toString() || '',
        image_url: product.thumbnail || product.image || '',
        product_url: product.product_page_url || product.link || '',
        product_id: product.product_id || product.us_item_id || Math.random().toString(36).substr(2, 9),
        retailer: 'walmart' as const,
        brand: product.brand || '',
        description: product.description || product.short_description || ''
      }));
      
      console.log(`Walmart search found ${walmartResults.length} products`);
      return walmartResults;
    } catch (error) {
      console.error('Error searching Walmart:', error);
      return [];
    }
  }

  async searchTarget(query: string, location: string = '10001', limit: number = 20): Promise<SerpProduct[]> {
    try {
      console.log(`Searching Target for: "${query}"`);
      
      // Use regular Google search with specific Target search terms
      const params = {
        api_key: this.apiKey,
        engine: 'google',
        q: `"${query}" site:target.com`,
        location: location,
        device: 'desktop',
        num: limit * 2 // Request more to have options after filtering
      };

      const response = await getJson(params);
      console.log(`Target search response status: ${response ? 'success' : 'no response'}`);
      
      if (!response || !response.organic_results) {
        console.log('No Target organic_results found');
        return [];
      }

      console.log(`Target organic_results found: ${response.organic_results.length}`);

      const targetResults = response.organic_results
        .filter((result: any) => {
          // Filter for actual Target product pages - be more flexible with URL patterns
          return result.link && 
                 result.link.includes('target.com') && 
                 (result.link.includes('/p/') || 
                  result.link.includes('/product/') ||
                  result.link.includes('/A-') ||  // Target TCIN format
                  (result.link.includes('target.com') && result.title && result.title.length > 10));
        })
        .slice(0, limit)
        .map((result: any) => ({
          title: result.title || '',
          price: '0', // Regular search doesn't have price info, we'll get this from product detail API
          rating: '',
          reviews: '',
          image_url: result.thumbnail || '',
          product_url: result.link || '',
          product_id: this.extractTargetProductId(result.link) || Math.random().toString(36).substr(2, 9),
          retailer: 'target' as const,
          brand: '',
          description: result.snippet || ''
        }));
      
      console.log(`Target search found ${targetResults.length} products after filtering`);
      return targetResults;
    } catch (error) {
      console.error('Error searching Target:', error);
      return [];
    }
  }

  private extractTargetProductId(url: string): string {
    // Extract TCIN or product ID from Target URL
    const matches = url.match(/\/p\/[^\/]+\/A-(\d+)/);
    return matches ? matches[1] : '';
  }

  async searchBothStores(query: string, location: string = '60602', limit: number = 10): Promise<SerpProduct[]> {
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