const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to authenticate admin
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

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Create product (admin only)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      inStock,
      isComingSoon,
      hidden,
      weight,
      rating,
      reviews,
      amazonLink,
      features
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        image: image || 'images/nutrikitchen.jpg',
        category,
        inStock: inStock !== undefined ? inStock : true,
        isComingSoon: isComingSoon || false,
        hidden: hidden || false,
        weight: weight || null,
        rating: rating || 0,
        reviews: reviews || 0,
        amazonLink: amazonLink || null,
        features: features || []
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product (admin only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      category,
      inStock,
      isComingSoon,
      hidden,
      weight,
      rating,
      reviews,
      amazonLink,
      features
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    if (image !== undefined) updateData.image = image;
    if (category !== undefined) updateData.category = category;
    if (inStock !== undefined) updateData.inStock = inStock;
    if (isComingSoon !== undefined) updateData.isComingSoon = isComingSoon;
    if (hidden !== undefined) updateData.hidden = hidden;
    if (weight !== undefined) updateData.weight = weight;
    if (rating !== undefined) updateData.rating = rating;
    if (reviews !== undefined) updateData.reviews = reviews;
    if (amazonLink !== undefined) updateData.amazonLink = amazonLink;
    if (features !== undefined) updateData.features = features;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
