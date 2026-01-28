# Backend Setup Instructions

## Database Migration & Seeding

After updating the Prisma schema to include the new Product model fields, follow these steps:

### 1. Generate Prisma Client
```bash
cd server
npx prisma generate
```

### 2. Push Schema to Database
```bash
npx prisma db push
```

This will update your MongoDB database with the new Product schema.

### 3. Seed the Database (Optional)
If you want to populate the database with default products:

```bash
npm run seed
```

This will add all the default products from `js/data.js` to your MongoDB database.

### 4. Start the Server
```bash
npm run dev
```

## API Endpoints

### Products (Public)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Products (Admin - Requires Authentication)
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Authentication
Admin endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

The token is obtained from user login and stored in localStorage as `nutriToken`.

## Notes
- Products are now stored in MongoDB instead of localStorage
- All product updates from the admin dashboard are persisted to the database
- The frontend automatically fetches products from the API
- If the API is unavailable, the frontend falls back to the default products in `js/data.js`
