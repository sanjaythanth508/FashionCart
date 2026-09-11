const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const InventoryLog = require('../models/InventoryLog');
const { adminAuth } = require('../middleware/auth');

// @route   GET /api/admin/dashboard-stats
// @desc    Admin: Comprehensive store analytics and KPIs
router.get('/dashboard-stats', adminAuth, async (req, res) => {
  try {
    const [orders, totalUsers, products, recentLogs] = await Promise.all([
      Order.find().sort({ createdAt: -1 }),
      User.countDocuments({ role: 'customer' }),
      Product.find().select('id name price category stockQuantity stockStatus lowStockThreshold inStock'),
      InventoryLog.find().sort({ createdAt: -1 }).limit(8)
    ]);

    let totalRevenue = 0;
    const statusCounts = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0
    };

    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        totalRevenue += (order.pricing?.totalAmount || order.totalAmount || 0);
      }
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
    });

    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const categoryCounts = {};

    products.forEach(p => {
      totalStockUnits += (p.stockQuantity || 0);
      if (p.stockQuantity <= 0) {
        outOfStockCount++;
      } else if (p.stockQuantity <= (p.lowStockThreshold || 5)) {
        lowStockCount++;
      }

      const cat = p.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders: orders.length,
        totalCustomers: totalUsers,
        totalProducts: products.length,
        totalStockUnits,
        lowStockCount,
        outOfStockCount,
        statusCounts,
        categoryDistribution: categoryCounts,
        recentOrders: orders.slice(0, 6),
        recentLogs
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
