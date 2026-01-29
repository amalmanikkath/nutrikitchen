// ==========================================
// Nutri Kitchen - Product Data & Configuration
// ==========================================

// Product Catalog
const PRODUCTS = [
  {
    id: 1,
    name: 'Baby Mix',
    category: 'Baby Food',
    price: 289,
    originalPrice: 399,
    description: 'Nutritious blend specially formulated for infants. Rich in essential vitamins, minerals, and protein from premium millets and grains.',
    features: [
      ' 100% Natural Ingredients',
      'Rich in Iron & Calcium',
      'Easy to Digest',
      'No Added Sugar or Salt'
    ],
    image: 'images/BabyMixPouch.png',
    inStock: false,
    isComingSoon: true,
    weight: '250gm',
    rating: 4.8,
    reviews: 156,
    amazonLink: '#' // Disabled for coming soon
  },
  {
    id: 2,
    name: 'Health Mix',
    category: 'Health Foods',
    price: 299,
    originalPrice: 389,
    description: 'Complete health supplement packed with multi-grains, nuts, and seeds. Perfect for all age groups looking for natural nutrition.',
    features: [
      'Multi-Grain Formula',
      'High in Protein & Fiber',
      'Boosts Immunity',
      'Natural Energy Source'
    ],
    image: 'images/healthMixpouch02.png',
    inStock: true,
    weight: '400gm',
    rating: 4.9,
    reviews: 243,
    amazonLink: 'https://www.amazon.in/Nutri-Kitchen-Multi-Grain-Natural-Ingredients-400gm/dp/B0G4W6TNW3/?_encoding=UTF8&m=A3CVCYQ4VN2MYE&psc=1&pd_rd_w=cpID4&content-id=amzn1.sym.da911696-31a7-479c-9922-299ce8aee4d0&pf_rd_p=da911696-31a7-479c-9922-299ce8aee4d0&pf_rd_r=5Q68NV1QPY89V8T4Y5Q5&pd_rd_wg=r6jh1&pd_rd_r=50d3350e-c7bd-4a66-86ab-9a3e0247c2d9&ref_=lscx_w_ssf_na'
  },
  {
    id: 3,
    name: 'Jaggery Powder',
    category: 'Natural Sweeteners',
    price: 3,
    originalPrice: 249,
    description: 'Pure, unrefined jaggery made from premium sugarcane. A healthy alternative to white sugar, rich in minerals and antioxidants.',
    features: [
      'Unrefined & Natural',
      'Rich in Iron',
      'Improves Digestion',
      'Traditional Processing'
    ],
    image: 'images/jaggeryPouch.png',
    inStock: true,
    weight: '500g',
    rating: 4.7,
    reviews: 189,
    amazonLink: 'https://www.amazon.in/Nutri-Kitchen-Jaggery-Sweetener-Unrefined/dp/B0G4VM4D46/?_encoding=UTF8&m=A3CVCYQ4VN2MYE&psc=1&pd_rd_w=cpID4&content-id=amzn1.sym.da911696-31a7-479c-9922-299ce8aee4d0&pf_rd_p=da911696-31a7-479c-9922-299ce8aee4d0&pf_rd_r=5Q68NV1QPY89V8T4Y5Q5&pd_rd_wg=r6jh1&pd_rd_r=50d3350e-c7bd-4a66-86ab-9a3e0247c2d9&ref_=lscx_w_ssf_na'
  },
  {
    id: 4,
    name: 'Protein Mix',
    category: 'Protein Foods',
    price: 295,
    originalPrice: 395,
    description: 'High-protein blend combining millets, pulses, and nuts. Ideal for fitness enthusiasts and those seeking plant-based protein.',
    features: [
      '25g Protein per Serving',
      '100% Vegan Friendly',
      'Supports Muscle Growth',
      'Gluten-Free Options'
    ],
    image: 'images/nutriprotienMixPouch.png',
    inStock: true,
    isComingSoon: false,
    weight: '400gm',
    rating: 4.9,
    reviews: 312,
    amazonLink: 'https://www.amazon.in/Nutri-Kitchen-Protein-Natural-Multi-Millet/dp/B0G9RPQRDG/ref=lp_27943762031_1_3?pf_rd_p=9e034799-55e2-4ab2-b0d0-eb42f95b2d05&pf_rd_r=HRTRP2Y8QN5EM2DQ1SNV&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D'
  },
  {
    id: 5,
    name: 'Puttu',
    category: 'Traditional Foods',
    price: 249,
    originalPrice: 299,
    description: 'Traditional South Indian breakfast mix made from rice and coconut. Quick, healthy, and delicious start to your day.',
    features: [
      'Authentic Recipe',
      'Ready in Minutes',
      'Low in Calories',
      'Preservative Free'
    ],
    image: 'images/puttuPouch.png',
    inStock: true,
    weight: '500g',
    rating: 4.6,
    reviews: 128,
    amazonLink: 'https://www.amazon.in/l/27943762031?me=A3CVCYQ4VN2MYE&ref_=NSS_WELCOME_SHARESTOREFRONT',
    hidden: true
  },
  {
    id: 6,
    name: 'Vanilla Health Mix',
    category: 'Health Foods',
    price: 379,
    originalPrice: 449,
    description: 'A delicious twist on our classic health mix with natural vanilla and chocolate flavors. Kids love the taste, moms love the nutrition.',
    features: [
      'Kid-Friendly Flavor',
      'Multi-Grain Goodness',
      'Rich in Protein',
      'No Artificial Colors'
    ],
    image: 'images/vanillachocolateHealth Mix.png',
    inStock: true,
    weight: '400gm',
    rating: 4.9,
    reviews: 85,
    amazonLink: 'https://www.amazon.in/Nutri-Chocolate-Multi-Millet-Nutrition-Ingredients/dp/B0G7JLW3GC/?_encoding=UTF8&m=A3CVCYQ4VN2MYE&pd_rd_w=cpID4&content-id=amzn1.sym.da911696-31a7-479c-9922-299ce8aee4d0&pf_rd_p=da911696-31a7-479c-9922-299ce8aee4d0&pf_rd_r=5Q68NV1QPY89V8T4Y5Q5&pd_rd_wg=r6jh1&pd_rd_r=50d3350e-c7bd-4a66-86ab-9a3e0247c2d9&ref_=lscx_w_ssf_na&th=1'
  },
  {
    id: 7,
    name: 'Chocolate Health Mix',
    category: 'Health Foods',
    price: 389,
    originalPrice: 449,
    description: 'Rich chocolate flavor combined with the goodness of multi-grains. A perfect healthy treat for chocolate lovers.',
    features: [
      'Rich Chocolate Taste',
      'Multi-Grain Benefits',
      'High Protein',
      'No Preservatives'
    ],
    image: 'images/chocolateHealthMix.png',
    inStock: true,
    weight: '400gm',
    rating: 4.8,
    reviews: 92,
    amazonLink: 'https://www.amazon.in/Nutri-Chocolate-Multi-Millet-Nutrition-Ingredients/dp/B0G7JK3SKB/ref=lp_27943762031_1_4?pf_rd_p=9e034799-55e2-4ab2-b0d0-eb42f95b2d05&pf_rd_r=CH0ND5YYMCH1TFBTECJR&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D'
  }
];

// Categories
const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '🌾' },
  { id: 'baby-food', name: 'Baby Food', icon: '👶' },
  { id: 'health-foods', name: 'Health Foods', icon: '💪' },
  { id: 'protein-foods', name: 'Protein Foods', icon: '🥗' },
  { id: 'traditional-foods', name: 'Traditional Foods', icon: '🍚' },
  { id: 'natural-sweeteners', name: 'Natural Sweeteners', icon: '🍯' }
];

// Admin Configuration
const ADMIN_CONFIG = {
  username: 'admin',
  password: 'nutrikitchen123', // In production, use proper authentication
  sessionTimeout: 3600000 // 1 hour
};

// Site Configuration
const SITE_CONFIG = {
  siteName: 'Nutri Kitchen',
  tagline: 'Natural Nutrition from Nature\'s Bounty',
  currency: '₹',
  shipping: {
    freeShippingThreshold: 500,
    charges: 50
  },
  tax: 0.05, // 5% GST
  contact: {
    email: 'info@nutrikitchen.in',
    phone: '+91 7760268422',
    whatsapp: '+91 7760268422',
    address: 'Mumbai, Maharashtra, India'
  },
  social: {
    facebook: 'https://facebook.com/nutrikitchen',
    instagram: 'https://www.instagram.com/nutrikitchen_in',
    twitter: 'https://twitter.com/nutrikitchen',
    youtube: 'https://youtube.com/nutrikitchen'
  }
};

// SEO Keywords
const SEO_KEYWORDS = [
  'millet products India',
  'healthy food online',
  'premium grains',
  'natural nutrition',
  'natural baby food',
  'protein mix',
  'health mix powder',
  'jaggery online',
  'traditional Indian food',
  'gluten free products',
  'buy millet products',
  'healthy breakfast options'
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PRODUCTS,
    CATEGORIES,
    ADMIN_CONFIG,
    SITE_CONFIG,
    SEO_KEYWORDS
  };
}

// Ensure global accessibility in browser
if (typeof window !== 'undefined') {
  window.PRODUCTS = PRODUCTS;
  window.CATEGORIES = CATEGORIES;
  window.SITE_CONFIG = SITE_CONFIG;
  window.SITE_CONFIG = SITE_CONFIG;
  
  // Dynamic API URL for Localhost & Mobile Testing
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    window.API_URL = 'http://localhost:5000/api';
  } else if (hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\./)) {
    // If accessed via local IP (e.g., on mobile), point to backend on same IP
    window.API_URL = `http://${hostname}:5000/api`;
  } else {
    // Production/Deployed URL
    window.API_URL = '/api';
  }
}
