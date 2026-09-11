const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/config/db');
const Product = require('./src/models/Product');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (MongoDB Atlas / Fallback)
connectDB().then(async (conn) => {
  if (conn) {
    try {
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('[System] Database is empty. Auto-seeding catalog and demo users...');
        require('child_process').fork(path.join(__dirname, 'src/utils/seeder.js'));
      } else {
        console.log(`[System] Store active with ${productCount} products in MongoDB.`);
      }
    } catch (countErr) {
      console.warn('[System] Could not verify product count:', countErr.message);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/stock', require('./src/routes/stockRoutes'));
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/coupons', require('./src/routes/couponRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'FashionCart Unified E-Commerce Backend',
    version: '2.0.0'
  });
});

// Friendly fallback for direct page access
app.get('*', (req, res, next) => {
  // If requesting an API route that didn't match, return JSON 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 FashionCart Platform Live at: http://localhost:${PORT}`);
  console.log(`🛍️  Frontend UI:  http://localhost:${PORT}/index.html`);
  console.log(`⚙️  Admin Panel:  http://localhost:${PORT}/admin.html`);
  console.log(`📡 API Gateway:  http://localhost:${PORT}/api/products`);
  console.log(`=======================================================`);
});

module.exports = app;
