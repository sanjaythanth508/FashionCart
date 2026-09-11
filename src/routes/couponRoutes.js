const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { adminAuth } = require('../middleware/auth');

// @route   POST /api/coupons/validate
// @desc    Validate coupon code and return discount calculation
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const subtotal = Number(cartTotal) || 0;
    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'This coupon code has expired.' });
    }

    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ₹${coupon.minPurchase} required for code ${coupon.code}.`
      });
    }

    // Calculate discount
    let discount = Math.round((subtotal * coupon.discountPercent) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discount}.`,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: discount,
        newTotal: Math.max(0, subtotal - discount)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/coupons/active
// @desc    Get currently active promotional coupons
router.get('/active', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true }).select('code discountPercent minPurchase description maxDiscount');
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/coupons
// @desc    Admin: Create promo coupon
router.post('/', adminAuth, async (req, res) => {
  try {
    const { code, discountPercent, maxDiscount, minPurchase, description } = req.body;
    const coupon = new Coupon({
      code,
      discountPercent,
      maxDiscount,
      minPurchase,
      description
    });
    const saved = await coupon.save();
    res.status(201).json({ success: true, coupon: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
