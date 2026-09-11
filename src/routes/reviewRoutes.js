const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// @route   GET /api/reviews/:productId
// @desc    Get all reviews for a product with rating statistics
router.get('/:productId', async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    // Calculate rating distribution
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalScore = 0;

    reviews.forEach(r => {
      const star = Math.round(r.rating);
      if (breakdown[star] !== undefined) breakdown[star]++;
      totalScore += r.rating;
    });

    const averageRating = reviews.length > 0 ? (totalScore / reviews.length).toFixed(1) : 0;

    res.json({
      success: true,
      productId,
      totalReviews: reviews.length,
      averageRating: Number(averageRating),
      breakdown,
      reviews
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/reviews/:productId
// @desc    Submit a review and update product average rating
router.post('/:productId', auth, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { rating, title, comment } = req.body;

    if (!rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating, title, and review comment.' });
    }

    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const newReview = new Review({
      productId,
      userId: req.user.id,
      userName: req.user.name || 'Verified Shopper',
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: true
    });

    const savedReview = await newReview.save();

    // Recalculate product rating
    const allReviews = await Review.find({ productId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.rating = Number(avg.toFixed(1));
    product.reviews = allReviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: savedReview,
      productRating: product.rating,
      totalReviews: product.reviews
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
