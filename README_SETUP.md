# Complete Setup Guide - Nutri Kitchen Admin Panel

## Overview

This guide will help you set up the complete system to manage products through the admin panel.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A code editor
- A web browser

## Quick Start (5 Minutes)

### 1. Setup Backend Server

**Windows Users:**
```bash
cd server
setup-and-start.bat
```

**Mac/Linux Users:**
```bash
cd server
chmod +x setup-and-start.sh
./setup-and-start.sh
```

Follow the prompts. The script will:
- Install all dependencies
- Create .env file
- Setup database
- Seed default products
- Start the server

### 2. Open the Application

Open your browser and go to:
```
http://localhost:3000/index.html
```

Or if using a different port, adjust accordingly.

### 3. Create User Account

1. Go to: `http://localhost:3000/signup.html`
2. Create an account with email/password
3. Login after signup

### 4. Access Admin Panel

1. Go to: `http://localhost:3000/admin/login.html`
2. Login with admin credentials:
   - Username: `admin`
   - Password: `nutrikitchen123`

### 5. Verify Everything Works

Check the admin dashboard header:
- Should show: "✓ Logged in as: your@email.com" (green)
- If shows warning, click the login link

Now you can add/edit/delete products!

## Detailed Setup (If Quick Start Fails)

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Configure Environment

Create `.env` file in `server` directory:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="nutrikitchen_secret_key_2024_change_this"
PORT=5000

# Optional: Email configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional: SMS configuration
FAST2SMS_API_KEY=your_api_key
```

### Step 3: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# Seed with default products
npm run seed
```

### Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
Registering routes...
Routes registered successfully
Server running on port 5000
```

### Step 5: Test Backend

Open browser: `http://localhost:5000/api/health`

Should return:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-01-28T..."
}
```

### Step 6: Open Frontend

Open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js http-server
npx http-server -p 3000

# Or just open index.html directly
```

## Testing the System

### Use the Test Page

Open: `http://localhost:3000/admin/test-api.html`

Run all 5 tests:
1. ✓ Check API URL
2. ✓ Check Server Health
3. ✓ Check User Login Status
4. ✓ Test Get Products
5. ✓ Test Add Product

All should pass!

## Understanding the Two Login Systems

### 1. Admin Panel Login
- **URL:** `/admin/login.html`
- **Credentials:** Username: `admin`, Password: `nutrikitchen123`
- **Purpose:** Access to admin pages
- **Storage:** sessionStorage
- **Does NOT:** Give API access

### 2. User Login
- **URL:** `/login.html`
- **Credentials:** Your email/password or phone/OTP
- **Purpose:** API authentication
- **Storage:** localStorage (JWT token)
- **Required for:** Adding/editing/deleting products

**Important:** You need BOTH logins to manage products!

## Common Workflows

### Adding a Product

1. Make sure server is running
2. Login as user (if not already)
3. Go to admin dashboard
4. Fill in product form
5. Optionally upload an image
6. Click "Add Product"
7. Product appears in table below

### Editing a Product

1. Click "Edit" button on product row
2. Modify fields in form
3. Click "Update Product"
4. Changes saved to database

### Deleting a Product

1. Click "Delete" button on product row
2. Confirm deletion
3. Product removed from database

### Viewing Products

1. Go to `/products.html`
2. All products from database are displayed
3. Use filters and search
4. Add to cart

## File Structure

```
nutrikitchen/
├── admin/
│   ├── dashboard.html      # Main admin panel
│   ├── login.html          # Admin login
│   ├── orders.html         # Order management
│   └── test-api.html       # API testing tool
├── js/
│   ├── admin.js            # Admin functionality
│   ├── products.js         # Product display
│   ├── cart.js             # Shopping cart
│   └── data.js             # Default data
├── server/
│   ├── routes/
│   │   ├── products.js     # Product API routes
│   │   ├── auth.js         # Authentication
│   │   └── ...
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── index.js            # Server entry point
│   ├── seed.js             # Database seeding
│   └── .env                # Environment config
└── index.html              # Homepage
```

## Troubleshooting

### "Cannot POST /api/products"
→ See `FIX_CANNOT_POST_ERROR.md`

### "Failed to add product"
→ See `QUICK_FIX_GUIDE.md`

### General issues
→ See `TROUBLESHOOTING.md`

## Documentation Files

- `FIX_CANNOT_POST_ERROR.md` - Fix the POST error
- `QUICK_FIX_GUIDE.md` - Quick solutions
- `TROUBLESHOOTING.md` - Comprehensive troubleshooting
- `PRODUCT_MANAGEMENT_UPDATE.md` - System overview
- `server/START_SERVER.md` - Server setup details
- `server/SETUP_INSTRUCTIONS.md` - Database setup

## Support

If you're still having issues:

1. Run the test page: `admin/test-api.html`
2. Check server logs in terminal
3. Check browser console (F12)
4. Review the troubleshooting guides
5. Make sure both logins are active

## Next Steps

Once everything is working:

1. Change admin password in `js/data.js`
2. Change JWT_SECRET in `.env`
3. Add your own products
4. Customize the design
5. Deploy to production

## Production Deployment

For production:

1. Use MongoDB instead of SQLite
2. Set strong JWT_SECRET
3. Enable HTTPS
4. Set proper CORS origins
5. Use environment variables
6. Enable rate limiting
7. Add proper error logging

Enjoy managing your products! 🎉
