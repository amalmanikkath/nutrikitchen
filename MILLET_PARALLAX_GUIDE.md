# Millet Plant Parallax Background - Implementation Guide

## ✅ What Has Been Done

I've successfully added a **millet plant parallax background** to your Featured Products section with the following changes:

### 1. HTML Structure (index.html)
- Added a parallax background div (`<div class="millet-parallax-bg parallax" data-speed="0.3"></div>`) to the Featured Products section
- The section now has the class `parallax-section` for proper styling
- The parallax effect will automatically work with your existing JavaScript

### 2. CSS Styling (style.css)
- Created `.parallax-section` styles for proper positioning
- Added `.millet-parallax-bg` with:
  - Full-width background coverage
  - 120% height for smooth parallax scrolling
  - Low opacity (0.08) for subtle effect
  - Positioned behind the content (z-index: 0)
- The parallax effect uses `data-speed="0.3"` for a smooth, subtle movement

### 3. Parallax JavaScript
- Your existing parallax JavaScript in `main.js` will automatically handle the effect
- No additional JavaScript changes were needed!

---

## 🎨 Next Step: Add the Millet Plant Image

You need to add a millet plant image to make the background visible. Here's how:

### Option 1: Download a Free Stock Image (Recommended)

1. Visit one of these free stock photo websites:
   - **Unsplash**: https://unsplash.com/s/photos/millet-plant
   - **Pexels**: https://www.pexels.com/search/millet/
   - **Pixabay**: https://pixabay.com/images/search/millet/

2. Search for keywords like:
   - "millet plant"
   - "pearl millet" / "bajra"
   - "finger millet" / "ragi"
   - "millet field"
   - "millet grain stalks"

3. Look for images with:
   ✓ High resolution (at least 1920px wide)
   ✓ Natural, earthy tones
   ✓ Good depth/dimension for parallax effect
   ✓ Clean background or field setting

4. Download the image and save it as `millet-plant-bg.jpg` in your `images` folder:
   ```
   c:\Users\Amal\Desktop\nutriKitchen\website\images\millet-plant-bg.jpg
   ```

### Option 2: Use AI Image Generation (Alternative)

If you have access to AI image generators (Midjourney, DALL-E, etc.), use this prompt:

```
A beautiful millet plant (Bajra/Pearl Millet) with golden grain heads on tall green stems, 
natural agricultural field background, soft sunlight, realistic botanical photography, 
warm earthy tones, organic farming aesthetic, clean background suitable for web design, 
high quality, natural depth
```

### Option 3: Temporary Placeholder

If you want to test the parallax effect immediately, you can temporarily use one of your existing product images:

1. Copy any existing image from your images folder
2. Rename it to `millet-plant-bg.jpg`
3. This will show the parallax working (you can replace it later with a proper millet plant image)

---

## 🎛️ Customization Options

After adding the image, you can adjust these CSS properties in `style.css`:

### Adjust Background Opacity
```css
.millet-parallax-bg {
  opacity: 0.08; /* Change to 0.05 (lighter) or 0.15 (darker) */
}
```

### Adjust Parallax Speed
In `index.html`, change the `data-speed` attribute:
```html
<div class="millet-parallax-bg parallax" data-speed="0.3"></div>
<!-- 0.2 = slower, 0.5 = faster -->
```

### Change Background Size/Position
```css
.millet-parallax-bg {
  background-size: cover; /* Try 'contain' or '150%' */
  background-position: center; /* Try 'top', 'bottom', etc. */
}
```

---

## 📱 Mobile Responsiveness

The parallax effect works on all devices. If you want to disable it on mobile for performance, add this to your CSS:

```css
@media (max-width: 768px) {
  .millet-parallax-bg {
    background-attachment: scroll;
    opacity: 0.05; /* Even lighter on mobile */
  }
}
```

---

## 🧪 Testing

1. Add the image file as instructed above
2. Open `index.html` in your browser
3. Scroll to the "Featured Products" section
4. You should see:
   - A subtle millet plant background
   - The background moves slower than the content (parallax effect)
   - Content remains fully visible and readable

---

## ❓ Troubleshooting

**Problem**: Background not showing
- ✓ Check the image file exists at `images/millet-plant-bg.jpg`
- ✓ Verify the filename is exactly correct (case-sensitive)
- ✓ Try increasing opacity to 0.2 temporarily to see if it appears

**Problem**: Parallax not working
- ✓ Check browser console for JavaScript errors
- ✓ Ensure `main.js` is loading correctly
- ✓ Try hard-refreshing the page (Ctrl+F5)

**Problem**: Background too strong/weak
- ✓ Adjust the `opacity` value in CSS (range: 0.05 to 0.2 recommended)
- ✓ Try different images with varying contrast

---

## 📧 Need Help?

If you encounter any issues:
1. Check the browser console for errors (F12 → Console tab)
2. Verify all file paths are correct
3. Make sure the image file is in the correct format (JPG or PNG)

Enjoy your new millet plant parallax background! 🌾
