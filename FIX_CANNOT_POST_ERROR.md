# Fix "Cannot POST /api/products" Error

## What This Error Means

The error "Cannot POST /api/products" means:
1. The server is not running, OR
2. The server is running but the route is not registered, OR
3. The server is running on a different port/URL

## Quick Fix (Choose Your Method)

### Method 1: Automated Setup (Recommended)

**For Windows:**
```bash
cd server
setup-and-start.bat
```

**For Mac/Linux:**
```bash
cd server
chmod +x setup-and-start.sh
./setup-and-start.sh
```

This will automatically:
- Install dependencies
- Setup .env file
- Generate Prisma client
- Push database schema
- Optionally seed data
- Start the server

### Method 2: Manual Setup

**Step 1: Navigate to server directory**
```bash
cd server
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Create .env file**
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="nutrikitchen_secret_key_2024"
PORT=5000
```

**Step 4: Setup database**
```bash
npx prisma generate
npx prisma db push
npm run seed
```

**Step 5: Start server**
```bash
npm run dev
```

You should see:
```
Registering routes...
Routes registered successfully
Server running on port 5000
```

## Verify Server is Running

### Test 1: Health Check
Open browser: `http://localhost:5000/api/health`

Should show:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "..."
}
```

### Test 2: Get Products
Open browser: `http://localhost:5000/api/products`

Should show:
```json
[
  {
    "id": "...",
    "name": "Baby Mix",
    ...
  }
]
```

### Test 3: Use Test Page
Open: `http://localhost:3000/admin/test-api.html`

Run all 5 tests - they should all pass!

## Common Issues

### Issue 1: "Cannot find module '@prisma/client'"
**Solution:**
```bash
cd server
npx prisma generate
```

### Issue 2: "Environment variable not found: DATABASE_URL"
**Solution:**
- Make sure `.env` file exists in `server` directory
- Check that it contains `DATABASE_URL="file:./prisma/dev.db"`

### Issue 3: Port 5000 already in use
**Solution:**
Change PORT in `.env` to 5001 or another available port

### Issue 4: Server starts but routes don't work
**Solution:**
Check server terminal for errors. You should see:
```
Registering routes...
Routes registered successfully
```

If you see errors about missing modules, run:
```bash
npm install
```

### Issue 5: Database errors
**Solution:**
```bash
cd server
npx prisma db push --force-reset
npm run seed
```

## After Server is Running

1. **Login as a user** at `http://localhost:3000/login.html`
2. **Go to admin dashboard** at `http://localhost:3000/admin/dashboard.html`
3. **Check the header** - should show "✓ Logged in as: your@email.com"
4. **Try adding a product** - should work now!

## Still Not Working?

### Check Server Logs
Look at the terminal where the server is running. When you click "Add Product", you should see:
```
2024-01-28T... - POST /api/products
```

If you don't see this, the request isn't reaching the server.

### Check Browser Console
Press F12 and look at:
1. **Console tab** - Check for errors
2. **Network tab** - Look for the POST request
   - Check the URL (should be http://localhost:5000/api/products)
   - Check the status code
   - Check the response

### Check API URL
In browser console, type:
```javascript
console.log(window.API_URL)
```

Should show: `http://localhost:5000/api`

If it shows something else, the frontend is pointing to the wrong URL.

## Need More Help?

1. Run the test page: `admin/test-api.html`
2. Share the results of all 5 tests
3. Share the server terminal output
4. Share the browser console errors

## Quick Checklist

- [ ] Server directory has node_modules folder
- [ ] .env file exists with DATABASE_URL and JWT_SECRET
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma db push`
- [ ] Server is running (`npm run dev`)
- [ ] Can access http://localhost:5000/api/health
- [ ] Can access http://localhost:5000/api/products
- [ ] Logged in as a user (not just admin)
- [ ] Admin dashboard shows "✓ Logged in as: ..."

If all checkboxes are checked, adding products should work!
