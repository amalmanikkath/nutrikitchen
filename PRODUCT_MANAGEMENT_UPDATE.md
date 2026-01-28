# Product Management System - MongoDB Integration

## Overview
Updated the product management system to store products in MongoDB instead of localStorage. This ensures data persistence across all users and devices.

## Changes Made

### Backend Changes

#### 1. Prisma Schema (`server/prisma/schema.prisma`)
- Enhanced Product model with complete fields:
  - `originalPrice`, `isComingSoon`, `hidden`, `weight`, `rating`, `reviews`
  - `amazonLink`, `features` (array), `createdAt`, `updatedAt`

#### 2. Product Routes (`server/routes/products.js`)
- Added full CRUD operations:
  - `GET /api/products` - Get all products (public)
  - `GET /api/products/:id` - Get single product (public)
  - `POST /api/products` - Create product (admin only)
  - `PUT /api/products/:id` - Update product (admin only)
  - `DELETE /api/products/:id` - Delete product (admin only)

#### 3. Database Seeding (`server/seed.js`)
- Created seed script to populate database with default products
- Run with: `npm run seed` (from server directory)

### Frontend Changes

#### 1. Admin Panel (`js/admin.js`)
- Updated `ProductManager` class to use API instead of localStorage
- All methods now async and make API calls:
  - `loadProducts()` - Fetches from API
  - `addProduct()` - POST to API
  - `updateProduct()` - PUT to API
  - `deleteProduct()` - DELETE from API
- Added proper error handling and user feedback

#### 2. Products Page (`js/products.js`)
- Updated `getActiveProducts()` to fetch from API
- Made all product functions async:
  - `renderProducts()`
  - `filterByCategory()`
  - `searchProducts()`
  - `sortProducts()`
- Falls back to default products if API unavailable

#### 3. Shopping Cart (`js/cart.js`)
- Updated `getActiveProducts()` to fetch from API
- Updated cart reconstruction to use API products
- Made `addToCart()` and `quickAddToCart()` async

#### 4. Admin Dashboard (`admin/dashboard.html`)
- Added image upload feature with file input
- Image preview functionality
- Upload button next to image path field

## Setup Instructions

### 1. Update Database Schema
```bash
cd server
npx prisma generate
npx prisma db push
```

### 2. Seed Database (Optional)
```bash
npm run seed
```

### 3. Start Server
```bash
npm run dev
```

## Features

### Admin Dashboard
- ✅ Add new products with all fields
- ✅ Upload product images (stored as base64 in localStorage for now)
- ✅ Update existing products
- ✅ Delete products
- ✅ View all products in table
- ✅ Real-time updates across all pages

### Product Display
- ✅ Products page shows database products
- ✅ Search and filter work with database products
- ✅ Cart uses database products
- ✅ Fallback to default products if API fails

## API Authentication
Admin endpoints require JWT token from user login:
```javascript
Authorization: Bearer <token>
```

Token is stored in `localStorage.nutriToken` after user login.

## Benefits
1. **Persistent Storage** - Products saved in MongoDB, not browser localStorage
2. **Multi-User** - All users see the same products
3. **Centralized** - Single source of truth for product data
4. **Scalable** - Can handle large product catalogs
5. **Secure** - Admin operations require authentication

## Next Steps (Optional Enhancements)
1. Add image upload to server (currently base64 in localStorage)
2. Add product categories management
3. Add bulk product import/export
4. Add product inventory tracking
5. Add product analytics
