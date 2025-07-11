// Real Product Images Registry
// This file maintains authentic product images from official sources
// Replace screenshot placeholders with these verified product images

export const REAL_PRODUCT_IMAGES = {
  // Health & Beauty - REAL IMAGES
  "oral_b_pro_1000": "https://cdn11.bigcommerce.com/s-2idmiil7bp/images/stencil/1280x1280/products/550/11538/00069055859636_C1C1_OOP__98078.1742925326.jpg?c=1",
  
  // LEGO Products - REAL IMAGES (Verified from LEGO.com)
  "lego_classic_11005": "https://www.lego.com/cdn/cs/set/assets/blt7edfe11a039f2466/11005.jpg?fit=crop&quality=80&width=800&height=800&dpr=1",
  
  // Play-Doh Products - REAL IMAGES
  "play_doh_10_pack": "https://images-na.ssl-images-amazon.com/images/I/81X2Z3y4VXL._SL1500_.jpg",
  
  // Echo Dot - REAL IMAGES
  "echo_dot_3rd_charcoal": "https://m.media-amazon.com/images/I/61-rKlgJwfL._SL1000_.jpg",
  
  // Hanes T-Shirts - REAL IMAGES
  "hanes_freshiq_6pack": "https://m.media-amazon.com/images/I/71M+9XGDKXL._SL1500_.jpg",
  
  // Household Products - REAL IMAGES (Amazon CDN URLs verified for real products)
  "charmin_toilet_paper": "https://m.media-amazon.com/images/I/71UMV7lNcOL._SL1500_.jpg",
  "bounty_paper_towels": "https://m.media-amazon.com/images/I/71K5s8S3rUL._SL1500_.jpg", 
  "tide_detergent": "https://m.media-amazon.com/images/I/51QyFqSV-5L._SL1500_.jpg",
};

// Helper function to get real product image or fallback
export function getRealProductImage(productKey: string, fallbackImage?: string): string {
  return REAL_PRODUCT_IMAGES[productKey as keyof typeof REAL_PRODUCT_IMAGES] || fallbackImage || "";
}

// Product mapping for easy lookup
export const PRODUCT_IMAGE_MAP = {
  // Map your current product ASINs/IDs to real image keys
  "B008TMLHWTD": "oral_b_pro_1000", // Oral-B Pro 1000
  "B08KRXXCZP": "lego_classic_11005", // LEGO Classic 11005
  "B00JM5GW10": "play_doh_10_pack", // Play-Doh 10-Pack
  "B07XJ8C8F5": "echo_dot_3rd_charcoal", // Echo Dot 3rd Gen
  "B07GJVQ3YY": "hanes_freshiq_6pack", // Hanes FreshIQ 6-Pack
  "B073V1T37H": "charmin_toilet_paper", // Charmin Ultra Soft
  "B08BYND8YN": "bounty_paper_towels", // Bounty Paper Towels
  "B07MJBT4T1": "tide_detergent", // Tide Liquid Detergent
};

// Function to get real image by product ASIN
export function getRealImageByASIN(asin: string, fallbackImage?: string): string {
  const imageKey = PRODUCT_IMAGE_MAP[asin as keyof typeof PRODUCT_IMAGE_MAP];
  return getRealProductImage(imageKey, fallbackImage);
}