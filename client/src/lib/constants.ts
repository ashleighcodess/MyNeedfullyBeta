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
  { value: "electronics", label: "Electronics", icon: "Smartphone" },
  { value: "clothing", label: "Clothing", icon: "ShirtIcon" },
  { value: "food_grocery", label: "Food & Grocery", icon: "ShoppingCart" },
  { value: "health_beauty", label: "Health & Beauty", icon: "Heart" },
  { value: "sports_outdoors", label: "Sports & Outdoors", icon: "Bike" },
  { value: "toys_games", label: "Toys & Games", icon: "Gamepad2" },
  { value: "automotive", label: "Automotive", icon: "Car" },
  { value: "books", label: "Books", icon: "BookOpen" },
  { value: "all", label: "All Categories", icon: "Grid3X3" },
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
