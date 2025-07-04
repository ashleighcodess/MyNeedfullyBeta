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
      const params = {
        api_key: this.apiKey,
        engine: 'walmart',
        query: query,
        location: location,
        device: 'desktop'
      };

      const response = await getJson(params);
      
      if (!response.organic_results) {
        return [];
      }

      return response.organic_results.slice(0, limit).map((product: any) => ({
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
    } catch (error) {
      console.error('Error searching Walmart:', error);
      return [];
    }
  }

  async searchTarget(query: string, location: string = '10001', limit: number = 20): Promise<SerpProduct[]> {
    try {
      // For Target, we'll use Google Shopping with site:target.com filter
      const params = {
        api_key: this.apiKey,
        engine: 'google_shopping',
        q: `${query} site:target.com`,
        location: location,
        device: 'desktop'
      };

      const response = await getJson(params);
      
      if (!response.shopping_results) {
        return [];
      }

      return response.shopping_results.slice(0, limit)
        .filter((product: any) => product.link && product.link.includes('target.com'))
        .map((product: any) => ({
          title: product.title || '',
          price: product.price || product.extracted_price || '0',
          rating: product.rating?.toString() || '',
          reviews: product.reviews?.toString() || '',
          image_url: product.thumbnail || product.image || '',
          product_url: product.link || '',
          product_id: this.extractTargetProductId(product.link) || Math.random().toString(36).substr(2, 9),
          retailer: 'target' as const,
          brand: product.brand || '',
          description: product.description || product.snippet || ''
        }));
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