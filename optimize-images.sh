#!/bin/bash

# Image Optimization Script for Nutri Kitchen
# This script converts PNG/JPG images to WebP format and compresses them

echo "🖼️  Starting Image Optimization..."

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found. Please install it first:"
    echo "   - Ubuntu/Debian: sudo apt-get install webp"
    echo "   - macOS: brew install webp"
    echo "   - Windows: Download from https://developers.google.com/speed/webp/download"
    exit 1
fi

# Create webp directory if it doesn't exist
mkdir -p images/webp

# Product images - High quality (85%)
echo "Converting product images..."
cwebp -q 85 images/BabyMixPouch.png -o images/webp/BabyMixPouch.webp
cwebp -q 85 images/healthMixpouch02.png -o images/webp/healthMixpouch02.webp
cwebp -q 85 images/jaggeryPouch.png -o images/webp/jaggeryPouch.webp
cwebp -q 85 images/nutriprotienMixPouch.png -o images/webp/nutriprotienMixPouch.webp
cwebp -q 85 images/chocolateHealthMix.png -o images/webp/chocolateHealthMix.webp
cwebp -q 85 images/doshpouch.png -o images/webp/doshpouch.webp
cwebp -q 85 images/puttuPouch.jpg -o images/webp/puttuPouch.webp
cwebp -q 85 "images/vanillachocolateHealth Mix.png" -o "images/webp/vanillachocolateHealth Mix.webp"

# Hero and banner images - Medium quality (80%)
echo "Converting hero/banner images..."
cwebp -q 80 images/nutriKitchenHerobanner.png -o images/webp/nutriKitchenHerobanner.webp
cwebp -q 80 images/nutrikitchenLogo.png -o images/webp/nutrikitchenLogo.webp

# Infographic images - Medium quality (75%)
echo "Converting infographic images..."
cwebp -q 75 images/grains_ingredients_infographic.png -o images/webp/grains_ingredients_infographic.webp
cwebp -q 75 images/health_benefits_infographic.png -o images/webp/health_benefits_infographic.webp
cwebp -q 75 images/preparation_steps_infographic.png -o images/webp/preparation_steps_infographic.webp
cwebp -q 75 images/baby_mix_benefits.png -o images/webp/baby_mix_benefits.webp
cwebp -q 75 images/baby_mix_nutrition.png -o images/webp/baby_mix_nutrition.webp
cwebp -q 75 images/sprouted_baby_mix_benefits.png -o images/webp/sprouted_baby_mix_benefits.webp
cwebp -q 75 images/sprouted_baby_mix_ingredients.png -o images/webp/sprouted_baby_mix_ingredients.webp
cwebp -q 75 images/sprouted_baby_mix_preparation.png -o images/webp/sprouted_baby_mix_preparation.webp

# About section images - Medium quality (80%)
echo "Converting about section images..."
cwebp -q 80 images/about-millet.png -o images/webp/about-millet.webp
cwebp -q 80 images/about-oil.png -o images/webp/about-oil.webp
cwebp -q 80 images/about-restaurant.png -o images/webp/about-restaurant.webp

echo "✅ Image optimization complete!"
echo "📊 WebP images saved to: images/webp/"
echo ""
echo "Next steps:"
echo "1. Update HTML to use WebP images with PNG/JPG fallback"
echo "2. Test images on your website"
echo "3. Deploy optimized images to production"
