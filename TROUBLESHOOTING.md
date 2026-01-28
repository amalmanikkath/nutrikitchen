# Troubleshooting Guide - "Failed to Add Product" Error

## Common Issues and Solutions

### Issue 1: Not Logged In as User
**Symptom:** Alert message "Failed to add product" or "Please login as a user first"

**Cause:** The admin panel requires a JWT token from user login to access the API.

**Solution:**
1. Click the login link in the admin dashboard header (yellow warning message)
2. Login with your user account (or signup if you don't have one)
3. You'll be redirected back to the admin dashboard
4. Now you can add/edit/delete products

**Why?** The API uses JWT authentication to verify requests. The admin panel login (username/password) is separate from the user authentication system.

---

### Issue 2: Server Not Running
**Symptom:** Network error, "Failed to fetch", or connection refused

**Solution:**
1. Open a terminal in the `server` directory
2. Make sure you have a `.env` file (copy from `.env.example`)
3. Run: `npm run dev`
4. Check that the server starts on port 5000
5. Verify you see: "Server running on port 5000"

---

### Issue 3: Database Not Initialized
**Symptom:** Prisma errors, "Table does not exist", or database connection errors

**Solution:**
```bash
cd server
npx prisma generate
npx prisma db push
npm run seed  # Optional: adds default products
```

---

### Issue 4: CORS Issues
**Symptom:** CORS policy error in browser console

**Solution:**
- The server already has CORS enabled
- If testing locally, make sure you're accessing via `localhost` or `127.0.0.1`
- Check that the API_URL in the frontend matches your server URL

---

### Issue 5: Invalid JWT Token
**Symptom:** "Invalid token" or "Unauthorized" error

**Solution:**
1. Logout from user account
2. Login again to get a fresh token
3. Try adding the product again

---

## Debugging Steps

### 1. Check Browser Console
Open Developer Tools (F12) and check the Console tab for errors:
- Look for network errors
- Check the API URL being called
- Verify the token is present

### 2. Check Network Tab
In Developer Tools, go to Network tab:
- Look for the POST request to `/api/products`
- Check the request headers (Authorization should have Bearer token)
- Check the response status code and body

### 3. Check Server Logs
In the terminal where the server is running:
- Look for incoming requests
- Check for any error messages
- Verify the route is being hit

### 4. Verify Environment Variables
Check `server/.env` file has:
```
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_secret_key"
PORT=5000
```

---

## Quick Test

### Test 1: Check if Server is Running
Open browser and go to: `http://localhost:5000/api/products`
- Should return a JSON array of products (might be empty)
- If you get an error, the server isn't running properly

### Test 2: Check User Login
1. Go to the main site login page
2. Login with your credentials
3. Open browser console and type: `localStorage.getItem('nutriToken')`
4. Should return a long string (JWT token)
5. If null, login didn't work properly

### Test 3: Check Admin Access
1. Go to admin dashboard
2. Check the header for user login status
3. Should show "✓ Logged in as: your@email.com"
4. If shows warning, click the login link

---

## Still Having Issues?

### Enable Detailed Logging
The admin.js file now has detailed console logging. Check the browser console for:
- "ProductManager initialized with API URL: ..."
- "Adding product with token: Present/Missing"
- "Product data: {...}"
- "Add product response status: ..."
- "Add product response data: ..."

### Common Error Messages

**"Please login as a user first to manage products"**
→ Click the login link in the admin header

**"Failed to fetch"**
→ Server is not running or wrong API URL

**"Unauthorized" or "Invalid token"**
→ Token expired or invalid, login again

**"Error creating product"**
→ Check server logs for database errors

---

## Contact Support
If none of these solutions work, provide:
1. Browser console errors (screenshot)
2. Network tab request/response (screenshot)
3. Server terminal output (screenshot)
4. Your .env configuration (without sensitive data)
