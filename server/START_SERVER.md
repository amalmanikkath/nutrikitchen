# Start Server - Step by Step

## Before Starting

Make sure you have:
- Node.js installed
- MongoDB connection string (or using SQLite)

## Step 1: Install Dependencies

```bash
cd server
npm install
```

## Step 2: Setup Environment Variables

Create a `.env` file in the `server` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and set:
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your_secret_key_here_change_this_to_something_random"
PORT=5000
```

For MongoDB, use:
```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/nutrikitchen?retryWrites=true&w=majority"
```

## Step 3: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with default products (optional)
npm run seed
```

## Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
Server running on port 5000
```

## Step 5: Test the Server

Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-01-28T..."
}
```

## Step 6: Test Products Endpoint

```
http://localhost:5000/api/products
```

Should return an array (might be empty if not seeded):
```json
[]
```

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: "Environment variable not found: DATABASE_URL"
- Make sure `.env` file exists in `server` directory
- Check that `DATABASE_URL` is set

### Error: "Table does not exist"
```bash
npx prisma db push
```

### Port 5000 already in use
Change PORT in `.env` to another port like 5001

### Still getting "Cannot POST /api/products"
1. Make sure server is running (check terminal)
2. Check server logs for errors
3. Verify the route is registered (should see no errors on startup)
4. Test with the health endpoint first

## Quick Test Script

Run this in your terminal to test everything:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test get products
curl http://localhost:5000/api/products

# Test add product (replace TOKEN with your JWT)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "price": 99,
    "originalPrice": 149,
    "category": "Health Foods",
    "image": "images/test.png",
    "weight": "100g",
    "features": ["Feature 1", "Feature 2"]
  }'
```
