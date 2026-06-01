const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRODUCTS = [
  {
    name: 'Baby Mix',
    category: 'Baby Food',
    price: 289,
    originalPrice: 399,
    description: 'Nutritious blend specially formulated for infants. Rich in essential vitamins, minerals, and protein from premium millets and grains.',
    features: [
      '100% Natural Ingredients',
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
    amazonLink: '#'
  },
  {
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
    name: 'Mooringa Avarampoo Soup',
    category: 'Health Foods',
    price: 249,
    originalPrice: 299,
    description: 'Mooringa Avarampoo Soup in a convenient 100gm pouch. A natural herbal soup blend to support immunity and wellbeing with traditional ingredients.',
    features: [
      '100gm Herbal Soup Pouch',
      'Boosts Immunity',
      'Rich in Antioxidants',
      'Easy to Prepare'
    ],
    image: 'images/Mooringa.jpeg',
    inStock: true,
    weight: '100gm',
    rating: 4.7,
    reviews: 32,
    amazonLink: '#'
  },
  {
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

async function main() {
  console.log('Starting seed...');
  
  // Check if products already exist
  const existingProducts = await prisma.product.count();
  
  if (existingProducts > 0) {
    console.log(`Database already has ${existingProducts} products. Skipping seed.`);
    console.log('To re-seed, delete all products first.');
    return;
  }
  
  // Seed products
  for (const product of PRODUCTS) {
    await prisma.product.create({
      data: product
    });
    console.log(`Created product: ${product.name}`);
  }
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
