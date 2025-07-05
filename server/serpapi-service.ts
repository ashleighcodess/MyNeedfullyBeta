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

  async searchTarget(query: string, location: string = '10001', limit: number = 40): Promise<SerpProduct[]> {
    try {
      console.log(`Searching Target for: "${query}"`);
      
      // Use regular Google search with specific Target search terms
      const params = {
        api_key: this.apiKey,
        engine: 'google',
        q: `"${query}" site:target.com`,
        location: 'United States',
        device: 'desktop',
        hl: 'en',                 // English language
        gl: 'us',                 // US region
        num: limit,               // Exact number needed
        no_cache: false,          // Use cache when available
        output: 'json'            // Structured format
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
          // Basic filter for Target results
          if (!result.link || !result.link.includes('target.com')) return false;
          if (!result.title || result.title.length < 5) return false;
          
          // Only exclude obvious non-product pages
          const strongExcludes = [
            '/account',    // account pages
            '/cart',       // cart pages
            '/store-locator', // store pages
            'target.com/c/organic', // specific category exclusions
            'target.com/gp/help'    // help pages
          ];
          
          for (const exclude of strongExcludes) {
            if (result.link.includes(exclude)) return false;
          }
          
          // Allow more product pages through - be very permissive
          return true;
        })
        .slice(0, limit)
        .map((result: any) => {
          // Enhanced price extraction for Target
          let extractedPrice = '$0.00';
          
          // Try multiple sources for price information
          const searchTexts = [
            result.title || '',
            result.snippet || '',
            result.rich_snippet?.top?.detected_extensions?.join(' ') || '',
            result.rich_snippet?.top?.extensions?.join(' ') || '',
            (result.sitelinks && Array.isArray(result.sitelinks)) ? result.sitelinks.map((link: any) => link.title || '').join(' ') : ''
          ].filter(Boolean);
          
          // Multiple price patterns to catch different formats
          const pricePatterns = [
            /\$[\d,]+\.?\d*/g,           // Standard $X.XX format
            /[\d,]+\.?\d*\s*dollars?/gi, // X dollars format
            /[\d,]+\.?\d*\s*usd/gi,      // X USD format
            /price:?\s*\$?[\d,]+\.?\d*/gi, // Price: $X.XX format
            /starting\s+at\s+\$[\d,]+\.?\d*/gi, // Starting at $X.XX
            /from\s+\$[\d,]+\.?\d*/gi,   // From $X.XX
            /\$[\d,]+(?:\.\d{2})?/g      // Strict $X.XX format
          ];
          
          for (const text of searchTexts) {
            for (const pattern of pricePatterns) {
              const matches = text.match(pattern);
              if (matches && matches.length > 0) {
                // Take the first valid price found
                const priceMatch = matches[0];
                // Extract just the dollar amount
                const dollarMatch = priceMatch.match(/\$[\d,]+(?:\.\d{2})?/);
                if (dollarMatch) {
                  extractedPrice = dollarMatch[0];
                  break;
                }
                // If no dollar sign, add one to pure numbers
                const numberMatch = priceMatch.match(/([\d,]+(?:\.\d{2})?)/);
                if (numberMatch && parseFloat(numberMatch[1].replace(',', '')) > 0) {
                  extractedPrice = '$' + numberMatch[1];
                  break;
                }
              }
            }
            if (extractedPrice !== '$0.00') break;
          }
          
          // If still no price found, try to extract from structured data
          if (extractedPrice === '$0.00' && result.rich_snippet) {
            const richSnippet = result.rich_snippet;
            if (richSnippet.top?.detected_extensions) {
              for (const ext of richSnippet.top.detected_extensions) {
                const priceMatch = ext.match(/\$[\d,]+(?:\.\d{2})?/);
                if (priceMatch) {
                  extractedPrice = priceMatch[0];
                  break;
                }
              }
            }
          }
          
          // If price is still $0.00, set a reasonable placeholder that indicates pricing needed
          if (extractedPrice === '$0.00') {
            extractedPrice = 'Price varies'; // More honest than $0.00
          }
          
          // Try to get better image URL - check for featured_snippet images or rich_snippets
          let imageUrl = result.thumbnail || '';
          if (!imageUrl && result.rich_snippet && result.rich_snippet.top && result.rich_snippet.top.extensions) {
            const extensions = result.rich_snippet.top.extensions;
            for (const ext of extensions) {
              if (ext.includes('http') && (ext.includes('.jpg') || ext.includes('.png') || ext.includes('.webp'))) {
                imageUrl = ext;
                break;
              }
            }
          }
          
          // No fallback images - let frontend handle missing images properly
          if (!imageUrl) {
            imageUrl = '';
          }
          
          console.log(`Target product: ${result.title.substring(0, 50)}... | Price: ${extractedPrice} | Image: ${imageUrl ? 'YES' : 'NO'}`);
          
          return {
            title: result.title || '',
            price: extractedPrice,
            rating: '',
            reviews: '',
            image_url: imageUrl,
            product_url: result.link || '',
            product_id: this.extractTargetProductId(result.link) || Math.random().toString(36).substr(2, 9),
            retailer: 'target' as const,
            brand: '',
            description: result.snippet || ''
          };
        });
      
      console.log(`Target search found ${targetResults.length} products after filtering`);
      
      // Debug: Log the first few raw results before filtering
      if (response.organic_results.length > 0) {
        console.log('Sample Target URLs found:', response.organic_results.slice(0, 3).map(r => ({
          url: r.link,
          title: r.title?.substring(0, 50)
        })));
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