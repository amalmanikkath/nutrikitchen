const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to authenticate admin (you can add admin role check later)
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

// Get all orders with user details and order items
router.get('/orders', authenticate, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        },
        orderItems: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Get all users with their order count
router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        phone: true,
        orders: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Add computed fields
    const usersWithStats = users.map(user => ({
      ...user,
      orderCount: user.orders.length,
      paidOrderCount: user.orders.filter(o => o.status === 'PAID').length,
      totalSpent: user.orders
        .filter(o => o.status === 'PAID')
        .reduce((sum, order) => sum + order.totalAmount, 0)
    }));
    
    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get single order details
router.get('/orders/:orderId', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: true
      }
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// Get single user details with all orders
router.get('/users/:userId', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          include: {
            orderItems: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;

    // First delete user's cart items
    await prisma.cartItem.deleteMany({ where: { userId } });

    // Note: Due to foreign key constraints, we might want to handle orders
    // Option 1: Delete everything (aggressive)
    // Option 2: Keep orders but remove user link (set userId to null or a ghost user)
    // For now, we'll try to delete related order items and orders first to be clean
    const orders = await prisma.order.findMany({ where: { userId } });
    const orderIds = orders.map(o => o.id);

    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { userId } });

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User and all related data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Get dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const paidOrders = await prisma.order.count({ where: { status: 'PAID' } });
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const totalUsers = await prisma.user.count();
    
    const revenueData = await prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    });
    
    const totalRevenue = revenueData._sum.totalAmount || 0;
    
    res.json({
      totalOrders,
      paidOrders,
      pendingOrders,
      totalUsers,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;
