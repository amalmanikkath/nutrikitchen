@echo off
REM Image Optimization Script for Nutri Kitchen (Windows)
REM This script converts PNG/JPG images to WebP format

echo Starting Image Optimization...

REM Check if cwebp is available
where cwebp >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo cwebp not found. Please download from:
    echo https://developers.google.com/speed/webp/download
    echo Extract cwebp.exe to a folder in your PATH
    pause
    exit /b 1
)

REM Create webp directory
if not exist "images\webp" mkdir "images\webp"

REM Product images - High quality (85%%)
echo Converting product images...
cwebp -q 85 images\BabyMixPouch.png -o images\webp\BabyMixPouch.webp
cwebp -q 85 images\healthMixpouch02.png -o images\webp\healthMixpouch02.webp
cwebp -q 85 images\jaggeryPouch.png -o images\webp\jaggeryPouch.webp
cwebp -q 85 images\nutriprotienMixPouch.png -o images\webp\nutriprotienMixPouch.webp
cwebp -q 85 images\chocolateHealthMix.png -o images\webp\chocolateHealthMix.webp
cwebp -q 85 images\doshpouch.png -o images\webp\doshpouch.webp
cwebp -q 85 images\puttuPouch.jpg -o images\webp\puttuPouch.webp
cwebp -q 85 "images\vanillachocolateHealth Mix.png" -o "images\webp\vanillachocolateHealth Mix.webp"

REM Hero and banner images
echo Converting hero/banner images...
cwebp -q 80 images\nutriKitchenHerobanner.png -o images\webp\nutriKitchenHerobanner.webp
cwebp -q 80 images\nutrikitchenLogo.png -o images\webp\nutrikitchenLogo.webp

REM Infographic images
echo Converting infographic images...
cwebp -q 75 images\grains_ingredients_infographic.png -o images\webp\grains_ingredients_infographic.webp
cwebp -q 75 images\health_benefits_infographic.png -o images\webp\health_benefits_infographic.webp
cwebp -q 75 images\preparation_steps_infographic.png -o images\webp\preparation_steps_infographic.webp

REM About section images
echo Converting about section images...
cwebp -q 80 images\about-millet.png -o images\webp\about-millet.webp
cwebp -q 80 images\about-oil.png -o images\webp\about-oil.webp
cwebp -q 80 images\about-restaurant.png -o images\webp\about-restaurant.webp

echo.
echo Image optimization complete!
echo WebP images saved to: images\webp\
echo.
echo Next steps:
echo 1. Update HTML to use WebP images with PNG/JPG fallback
echo 2. Test images on your website
echo 3. Deploy optimized images to production
pause
