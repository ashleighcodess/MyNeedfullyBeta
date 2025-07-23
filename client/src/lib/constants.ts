// Import asset images
import uberEatsLogo from "../../../attached_assets/Screenshot 2025-07-23 at 1.01.53 PM_1753290117208.png";

// NEEDS LIST CATEGORIES (for crisis-related needs lists)
export const NEEDS_LIST_CATEGORIES = [
  { value: "disaster_recovery", label: "Disaster Recovery", icon: "fas fa-home" },
  { value: "medical_emergency", label: "Medical Emergency", icon: "fas fa-heartbeat" },
  { value: "family_crisis", label: "Family Crisis", icon: "fas fa-users" },
  { value: "fire_flood_damage", label: "Fire/Flood Damage", icon: "fas fa-fire" },
  { value: "job_loss_financial", label: "Job Loss/Financial Crisis", icon: "fas fa-dollar-sign" },
  { value: "domestic_violence", label: "Domestic Violence Support", icon: "fas fa-shield-alt" },
  { value: "homeless_housing", label: "Homeless/Housing Crisis", icon: "fas fa-home" },
  { value: "elderly_care", label: "Elderly Care Crisis", icon: "fas fa-user-circle" },
  { value: "mental_health", label: "Mental Health Crisis", icon: "fas fa-brain" },
  { value: "refugee_immigrant", label: "Refugee/Immigrant Support", icon: "fas fa-globe" },
  { value: "other", label: "Other Crisis", icon: "fas fa-ellipsis-h" },
];

// PRODUCT SEARCH CATEGORIES (for shopping/retailers) - Using Lucide React icons
export const PRODUCT_CATEGORIES = [
  { value: "baby_kids", label: "Baby & Kids", icon: "Baby" },
  { value: "household", label: "Household", icon: "Home" },
  { value: "gift_cards", label: "Gift Cards", icon: "Gift" },
  { value: "clothing", label: "Clothing", icon: "ShirtIcon" },
  { value: "food_grocery", label: "Food & Grocery", icon: "ShoppingCart" },
  { value: "health_beauty", label: "Health & Beauty", icon: "Heart" },
  { value: "sports_outdoors", label: "Sports & Outdoors", icon: "Bike" },
  { value: "toys_games", label: "Toys & Games", icon: "Gamepad2" },
  { value: "automotive", label: "Automotive", icon: "Car" },
  { value: "books", label: "Books", icon: "BookOpen" },
  { value: "all", label: "All Categories", icon: "Grid3X3" },
];

// GIFT CARDS DATA
export const GIFT_CARDS = [
  {
    id: "uber-eats",
    name: "Uber Eats",
    retailer: "Uber Eats",
    image: uberEatsLogo,
    url: "https://gifts.uber.com/?uclick_id=cac951b6-fd24-438a-93b3-ee520da16515",
    description: "Food delivery gift cards for meals from local restaurants"
  },
  {
    id: "walmart",
    name: "Walmart Gift Card", 
    retailer: "Walmart",
    image: "/api/placeholder/300/200",
    url: "https://www.walmart.com/ip/Basic-Blue-Yellow-Spark-Walmart-Gift-Card/654950389?classType=REGULAR&athbdg=L1200",
    description: "General merchandise gift cards for everyday essentials"
  },
  {
    id: "goldbelly",
    name: "Goldbelly Gift Card",
    retailer: "Goldbelly", 
    image: "/api/placeholder/300/200",
    url: "https://www.goldbelly.com/restaurants/goldbelly-gift-cards/gift-card?ref=merchant&ref-id=492",
    description: "Gourmet food delivery from America's best restaurants"
  },
  {
    id: "lowes",
    name: "Lowe's Gift Card",
    retailer: "Lowe's",
    image: "/api/placeholder/300/200", 
    url: "https://www.buyatab.com/custom/lowes/?page=egift",
    description: "Home improvement and hardware store gift cards"
  },
  {
    id: "instacart",
    name: "Instacart Gift Card",
    retailer: "Instacart",
    image: "/api/placeholder/300/200",
    url: "https://instacart.launchgiftcards.com/?utm_campaign=launch&utm_source=instacart&utm_medium=gift_card_landing_page_us&utm_term=95C5A1B4-6ec9-48fd-902a-a0ce307268e9",
    description: "Grocery delivery gift cards for fresh food and essentials"
  },
  {
    id: "home-depot", 
    name: "Home Depot Gift Card",
    retailer: "Home Depot",
    image: "/api/placeholder/300/200",
    url: "https://www.homedepot.com/gift-cards/p/Home-Depot-Crate-Gift-Card/53L1QLAXWKVF06WJ8DLHBYT6S8/RH6VN7060A1LR3FWD0WJKNVBV8?price=15",
    description: "Home improvement and building supplies gift cards"
  },
  {
    id: "amazon",
    name: "Amazon Gift Card",
    retailer: "Amazon", 
    image: "/api/placeholder/300/200",
    url: "https://www.amazon.com/Amazon-eGift-Card-Bright-Balloons-Animated/dp/B09LQTPHSG?pf_rd_p=99fab157-bf8f-49e0-bf0d-b6c3011af88f&pf_rd_r=WESJEPWBQM9BD1CP9RV5&ref_=US_GC_AGC_P1_25_STND_B09LQTPHSG&th=1",
    description: "Universal gift cards for millions of products online"
  },
  {
    id: "doordash",
    name: "DoorDash Gift Card",
    retailer: "DoorDash",
    image: "/api/placeholder/300/200", 
    url: "https://www.doordash.com/gift-cards",
    description: "Food delivery gift cards from thousands of restaurants"
  }
];

// Keep CATEGORIES for backward compatibility (pointing to needs list categories)
export const CATEGORIES = NEEDS_LIST_CATEGORIES;

export const URGENCY_LEVELS = [
  { value: "low", label: "Low", color: "green" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "high", label: "High", color: "orange" },
  { value: "urgent", label: "Urgent", color: "red" },
];

export const WISHLIST_STATUS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

export const SAMPLE_LOCATIONS = [
  "Austin, TX",
  "Denver, CO", 
  "Seattle, WA",
  "Miami, FL",
  "Chicago, IL",
  "Phoenix, AZ",
  "Portland, OR",
  "Atlanta, GA",
];
