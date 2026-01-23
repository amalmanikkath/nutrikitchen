# Order Management & Purchase History System

## Overview
The NutriKitchen application now has a complete order management system that tracks user purchases and makes them accessible to admin users.

## How It Works

### 1. **User Places Order**
When a user completes the checkout process:

1. User adds products to cart on the website
2. User navigates to checkout page (`checkout.html`)
3. User clicks "Place Order" button
4. Frontend creates an order via API: `POST /api/orders/create`
   - Order is saved to database with status "PENDING"
   - Razorpay order is created
   - Order items are saved with product details

### 2. **Payment Processing**
1. Razorpay payment dialog opens
2. User completes payment
3. Razorpay returns payment details to frontend
4. Frontend verifies payment via API: `POST /api/orders/verify`
   - Order status updated to "PAID" in database
   - Payment ID and signature are saved
   - User's cart is cleared from database

### 3. **Database Storage**

#### Orders Table
- `id`: Order ID
- `userId`: Reference to user who placed the order
- `razorpayOrderId`: Razorpay order ID
- `razorpayPaymentId`: Razorpay payment ID (after verification)
- `razorpaySignature`: Payment signature (for verification)
- `totalAmount`: Total order amount
- `status`: Order status (PENDING or PAID)
- `createdAt`: Order creation timestamp

#### OrderItems Table
- `id`: Order item ID
- `orderId`: Reference to parent order
- `productId`: Product ID
- `productName`: Product name (stored for historical reference)
- `quantity`: Quantity ordered
- `price`: Price at time of order

#### Users Table
- `id`: User ID
- `email`: User email
- `password`: Hashed password
- `name`: User full name
- `createdAt`: Registration timestamp

## Admin Access

### Admin Dashboard Pages

#### 1. **Products Dashboard** (`/admin/dashboard.html`)
- Manage products
- Add new products
- View product inventory

#### 2. **Orders & Customers Dashboard** (`/admin/orders.html`)
- View all orders with customer details
- View all registered customers
- See purchase statistics

### Admin API Endpoints

All admin endpoints require authentication token in header:
```
Authorization: Bearer <token>
```

#### Statistics
```
GET /api/admin/stats
```
Returns:
- Total orders
- Paid orders count
- Pending orders count  
- Total users
- Total revenue

#### All Orders
```
GET /api/admin/orders
```
Returns list of all orders with:
- Order details
- Customer information
- Order items
- Payment status

#### Single Order
```
GET /api/admin/orders/:orderId
```
Returns detailed information for a specific order

#### All Users
```
GET /api/admin/users
```
Returns list of all customers with:
- Basic user information
- Order count
- Paid order count
- Total amount spent

#### Single User
```
GET /api/admin/users/:userId
```
Returns detailed user information including full order history

## Features

### ✅ Completed Features

1. **Order Creation & Storage**
   - Orders are created when user clicks "Place Order"
   - Order details saved immediately with PENDING status
   
2. **Payment Verification**
   - Razorpay payment verification
   - Order status updated to PAID after successful payment
   
3. **Purchase History**
   - All orders stored in database
   - Product details captured at time of order
   - Historical data preserved even if product is modified later
   
4. **User Management**
   - User registration and authentication
   - User details stored and accessible to admin
   
5. **Admin Dashboard**
   - Comprehensive statistics
   - View all orders
   - View all customers
   - Detailed order and customer views
   - Real-time data updates

## Access Instructions

### For Admin Users:

1. **Login to Admin Panel**
   - Navigate to: `http://127.0.0.1:3000/admin/login.html`
   - Use admin credentials (any registered user can access for now)

2. **View Orders**
   - Navigate to: `http://127.0.0.1:3000/admin/orders.html`
   - Click "All Orders" tab
   - Click "View" button on any order to see details

3. **View Customers**
   - Navigate to: `http://127.0.0.1:3000/admin/orders.html`
   - Click "All Customers" tab
   - Click "View" button to see customer's full order history

4. **Dashboard Statistics**
   - View real-time statistics on the dashboard
   - See total orders, revenue, and customer count

## Database Schema

```
User
├── id (Primary Key)
├── email (Unique)
├── password
├── name
├── createdAt
└── orders[] → Order relationship

Order
├── id (Primary Key)
├── userId → User
├── razorpayOrderId (Unique)
├── razorpayPaymentId (Unique, nullable)
├── razorpaySignature (nullable)
├── totalAmount
├── status (PENDING | PAID)
├── createdAt
└── orderItems[] → OrderItem relationship

OrderItem
├── id (Primary Key)
├── orderId → Order
├── productId
├── productName
├── quantity
└── price
```

## Test Data

Based on current database:
- **Total Orders**: 7
- **Paid Orders**: 1
- **Pending Orders**: 6
- **Total Customers**: 2
- **Total Revenue**: ₹942

Test user credentials:
- **Email**: test@example.com
- **Password**: test123

## Notes

- Orders are immediately saved to database when user clicks "Place Order"
- Payment verification occurs after Razorpay payment completion
- Order status changes from PENDING to PAID after successful payment
- Cart is automatically cleared after successful payment
- Product details are stored in OrderItems to preserve historical data
- Admin has full visibility into all orders and customer data
