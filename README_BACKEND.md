# Nutri Kitchen Backend Setup

This project now includes a Node.js backend to handle user authentication, past purchases, and Razorpay payment integration.

## Prerequisites
- Node.js (v18 or higher recommended)
- npm

## Setup Instructions

1. **Environment Variables**:
   Open `server/.env` and update the following values:
   - `JWT_SECRET`: A secure random string for token encryption.
   - `RAZORPAY_KEY_ID`: Your Razorpay API Key ID.
   - `RAZORPAY_KEY_SECRET`: Your Razorpay API Key Secret.

2. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Database Initialization**:
   The project uses SQLite for simplicity. To initialize the database:
   ```bash
   npx prisma db push
   ```

4. **Start the Server**:
   ```bash
   npm run dev
   # OR
   npx nodemon index.js
   ```

## Frontend Integration
The frontend is already configured to connect to `http://localhost:5000`. 
- **Login/Signup**: New pages `login.html` and `signup.html` are added.
- **Profile**: `profile.html` shows order history.
- **Checkout**: `js/checkout.js` handles Razorpay flow.

**Note**: You must replace `YOUR_RAZORPAY_KEY_ID` in `js/checkout.js` with your actual Razorpay Key ID for the frontend to launch the payment modal.
