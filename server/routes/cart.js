const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = String(decoded.userId);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Sync cart (POST) - Saves current cart state to DB
router.post('/sync', authenticate, async (req, res) => {
  try {
    const { items } = req.body; // Array of { productId, quantity }
    
    // Delete existing
    await prisma.cartItem.deleteMany({
      where: { userId: String(req.userId) }
    });
    
    // Create new
    if (items && items.length > 0) {
      await prisma.cartItem.createMany({
        data: items.map(item => ({
          userId: String(req.userId),
          productId: String(item.productId),
          quantity: item.quantity
        }))
      });
    }
    
    res.json({ message: 'Cart synchronized successfully' });
  } catch (error) {
    console.error('Cart sync error:', error);
    res.status(500).json({ message: 'Error syncing cart', error });
  }
});

// Get cart (GET) - Fetches cart items from DB
router.get('/', authenticate, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: String(req.userId) }
    });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error });
  }
});

module.exports = router;
