// Quick test for SerpAPI Target search
import { getSerpAPIService } from './server/serpapi-service.ts';

async function testTargetSearch() {
  console.log('Testing Target search...');
  
  const serpService = getSerpAPIService();
  if (!serpService) {
    console.log('❌ SerpAPI service not available');
    return;
  }
  
  console.log('✅ SerpAPI service initialized');
  
  try {
    console.log('🔍 Searching Target for "baby food"...');
    const targetResults = await serpService.searchTarget('baby food', '10001', 5);
    console.log(`📦 Target results: ${targetResults.length} products`);
    
    if (targetResults.length > 0) {
      console.log('First Target product:', {
        title: targetResults[0].title,
        price: targetResults[0].price,
        retailer: targetResults[0].retailer
      });
    }
    
    console.log('🔍 Searching Walmart for "baby food"...');
    const walmartResults = await serpService.searchWalmart('baby food', '60602', 5);
    console.log(`📦 Walmart results: ${walmartResults.length} products`);
    
    if (walmartResults.length > 0) {
      console.log('First Walmart product:', {
        title: walmartResults[0].title,
        price: walmartResults[0].price,
        retailer: walmartResults[0].retailer
      });
    }
    
    console.log('🔍 Testing combined search...');
    const bothResults = await serpService.searchBothStores('baby food', '60602', 10);
    console.log(`📦 Combined results: ${bothResults.length} products`);
    
    const breakdown = bothResults.reduce((acc, product) => {
      acc[product.retailer] = (acc[product.retailer] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Retailer breakdown:', breakdown);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTargetSearch();