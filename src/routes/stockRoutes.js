const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { adminAuth } = require('../middleware/auth');

// @route   GET /api/stock/summary
// @desc    Admin: Get inventory health summary and KPIs
router.get('/summary', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().select('id name price stockQuantity lowStockThreshold stockStatus inStock');
    
    let totalStockUnits = 0;
    let inventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(p => {
      const qty = p.stockQuantity || 0;
      totalStockUnits += qty;
      inventoryValue += (qty * (p.price || 0));

      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty <= (p.lowStockThreshold || 5)) {
        lowStockCount++;
      }
    });

    res.json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalStockUnits,
        inventoryValue: Math.round(inventoryValue),
        inStockCount: products.length - outOfStockCount,
        lowStockCount,
        outOfStockCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/stock/low-stock
// @desc    Admin: Get products that require restocking (stock <= threshold)
router.get('/low-stock', adminAuth, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $or: [
        { stockQuantity: { $lte: 5 } },
        { stockStatus: { $in: ['Low Stock', 'Out of Stock'] } }
      ]
    }).sort({ stockQuantity: 1 });

    res.json({
      success: true,
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/stock/adjust
// @desc    Admin: Restock or adjust inventory for a product
router.post('/adjust', adminAuth, async (req, res) => {
  try {
    const { productId, changeAmount, note } = req.body;

    if (!productId || changeAmount === undefined || isNaN(changeAmount)) {
      return res.status(400).json({ success: false, message: 'Valid productId and changeAmount are required.' });
    }

    const product = await Product.findOne({ id: Number(productId) });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const previousStock = product.stockQuantity;
    const amount = Number(changeAmount);
    const newStock = Math.max(0, previousStock + amount);

    product.stockQuantity = newStock;
    await product.save(); // pre-save hook updates stockStatus & inStock

    // Log the change
    const log = await InventoryLog.create({
      productId: product.id,
      productName: product.name,
      changeType: amount >= 0 ? 'restock' : 'manual_adjustment',
      changeAmount: amount,
      previousStock,
      newStock,
      performedBy: req.user.email || 'Admin',
      note: note || (amount >= 0 ? `Restocked ${amount} units` : `Deducted ${Math.abs(amount)} units`)
    });

    res.json({
      success: true,
      message: `Stock updated for "${product.name}". New Stock: ${newStock}`,
      product: {
        id: product.id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        stockStatus: product.stockStatus,
        inStock: product.inStock
      },
      log
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/stock/logs
// @desc    Admin: Get stock audit history logs
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const { productId, changeType, limit = 50 } = req.query;
    const query = {};

    if (productId) query.productId = Number(productId);
    if (changeType) query.changeType = changeType;

    const logs = await InventoryLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/stock/product/:id
// @desc    Get stock history and details for a specific product
router.get('/product/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const product = await Product.findOne({ id: productId }).select('id name stockQuantity stockStatus inStock lowStockThreshold variantStock');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const history = await InventoryLog.find({ productId }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      product,
      history
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
