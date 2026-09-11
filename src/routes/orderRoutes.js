const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Place a new order with stock validation and inventory deduction
router.post('/', auth, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'card',
      pricing,
      couponApplied
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your order must contain at least one item.' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ success: false, message: 'Please provide a valid shipping address.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Step 1: Validate stock for all items
    const stockChecks = [];
    for (const item of items) {
      const prodId = Number(item.productId || item.id);
      const product = await Product.findOne({ id: prodId });
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" is no longer available in our store.`
        });
      }

      const requestedQty = Number(item.quantity) || 1;
      if (product.stockQuantity < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} remaining.`
        });
      }

      stockChecks.push({ product, requestedQty, item });
    }

    // Step 2: Calculate pricing securely
    let subtotal = 0;
    const formattedItems = [];

    for (const { product, requestedQty, item } of stockChecks) {
      const itemPrice = product.price;
      subtotal += (itemPrice * requestedQty);

      formattedItems.push({
        productId: product.id,
        name: product.name,
        price: itemPrice,
        quantity: requestedQty,
        selectedColor: item.selectedColor || item.color || (product.colors?.[0] || 'Default'),
        selectedSize: item.selectedSize || item.size || (product.sizes?.[0] || 'M'),
        image: item.image || product.image
      });
    }

    const shippingFee = subtotal >= 999 ? 0 : 99; // Free shipping over 999
    const tax = Math.round(subtotal * 0.05); // 5% GST
    let discount = 0;

    if (couponApplied && couponApplied.discountAmount) {
      discount = Number(couponApplied.discountAmount);
    }

    const totalAmount = Math.max(0, subtotal + shippingFee + tax - discount);

    // Step 3: Deduct stock and write audit logs
    const orderId = `FC-ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    for (const { product, requestedQty } of stockChecks) {
      const previousStock = product.stockQuantity;
      const newStock = Math.max(0, previousStock - requestedQty);

      product.stockQuantity = newStock;
      await product.save(); // Automatically updates inStock & stockStatus

      await InventoryLog.create({
        productId: product.id,
        productName: product.name,
        changeType: 'order_sale',
        changeAmount: -requestedQty,
        previousStock,
        newStock,
        orderId,
        performedBy: user.email,
        note: `Purchased in order ${orderId}`
      });
    }

    // Step 4: Create Order document
    const newOrder = new Order({
      orderId,
      userId: user._id,
      customerName: shippingAddress.fullName || user.name,
      customerEmail: user.email,
      items: formattedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName || user.name,
        phone: shippingAddress.phone || user.phone || '9876543210',
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || 'State',
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India'
      },
      paymentDetails: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        paidAt: paymentMethod === 'cod' ? null : new Date()
      },
      pricing: {
        subtotal,
        shippingFee,
        tax,
        discount,
        totalAmount
      },
      couponApplied: couponApplied?.code ? {
        code: couponApplied.code,
        discountAmount: discount
      } : undefined,
      status: 'Pending',
      trackingTimeline: [
        {
          status: 'Order Placed',
          message: 'Your order has been received and is being verified.',
          timestamp: new Date()
        }
      ]
    });

    const savedOrder = await newOrder.save();

    // Step 5: Clear user cart in database
    user.cart = [];
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: savedOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: 'Server error while placing order.', error: err.message });
  }
});

// @route   GET /api/orders/my
// @desc    Get current user's order history
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/orders/:orderId
// @desc    Get single order details by orderId
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check ownership or admin
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/orders/:orderId/cancel
// @desc    Cancel order and automatically restore stock to inventory
router.post('/:orderId/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Authorization
    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
    }

    if (order.status === 'Delivered' || order.status === 'Shipped') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled as it is already ${order.status.toLowerCase()}.`
      });
    }

    // Restore stock for all items
    for (const item of order.items) {
      const product = await Product.findOne({ id: item.productId });
      if (product) {
        const previousStock = product.stockQuantity;
        const newStock = previousStock + item.quantity;
        product.stockQuantity = newStock;
        await product.save();

        await InventoryLog.create({
          productId: product.id,
          productName: product.name,
          changeType: 'cancellation_restock',
          changeAmount: item.quantity,
          previousStock,
          newStock,
          orderId: order.orderId,
          performedBy: req.user.email || 'Customer',
          note: `Restored stock due to cancelled order ${order.orderId}`
        });
      }
    }

    order.status = 'Cancelled';
    order.trackingTimeline.push({
      status: 'Order Cancelled',
      message: 'Order was cancelled by the customer.',
      timestamp: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully and stock restored to inventory.',
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/orders/:orderId/status
// @desc    Admin: Update order status & add timeline entry
router.put('/:orderId/status', adminAuth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    order.trackingTimeline.push({
      status: `Status changed to ${status}`,
      message: note || `Order updated to ${status} by administrator.`,
      timestamp: new Date()
    });

    if (status === 'Delivered') {
      order.paymentDetails.status = 'Paid';
    }

    await order.save();
    res.json({ success: true, message: `Order status updated to ${status}.`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/orders
// @desc    Admin: Get all orders across the platform
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
