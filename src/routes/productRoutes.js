const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { adminAuth } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get products with search, multi-filters, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      category,
      brand,
      color,
      size,
      minPrice,
      maxPrice,
      rating,
      inStockOnly,
      search,
      sort,
      isFeatured,
      isSale,
      isNew,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // 1. Category Filter (supports single or comma-separated)
    if (category && category !== 'all') {
      const catList = category.split(',').map(c => c.trim().toLowerCase());
      query.category = { $in: catList.map(c => new RegExp(`^${c}$`, 'i')) };
    }

    // 2. Brand Filter
    if (brand && brand !== 'all') {
      const brandList = brand.split(',').map(b => b.trim());
      query.brand = { $in: brandList.map(b => new RegExp(`^${b}$`, 'i')) };
    }

    // 3. Color Filter
    if (color && color !== 'all') {
      const colorList = color.split(',').map(c => c.trim().toLowerCase());
      query.colors = { $in: colorList };
    }

    // 4. Size Filter
    if (size && size !== 'all') {
      const sizeList = size.split(',').map(s => s.trim().toLowerCase());
      query.sizes = { $in: sizeList };
    }

    // 5. Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 6. Minimum Rating Filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // 7. In-Stock Only Filter
    if (inStockOnly === 'true' || inStockOnly === true) {
      query.stockQuantity = { $gt: 0 };
    }

    // 8. Boolean Badges
    if (isFeatured === 'true') query.isFeatured = true;
    if (isSale === 'true') query.isSale = true;
    if (isNew === 'true') query.isNew = true;

    // 9. Full-Text Search
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex }
      ];
    }

    // 10. Sorting Options
    let sortObj = {};
    switch (sort) {
      case 'price-asc':
      case 'price-low':
        sortObj = { price: 1 };
        break;
      case 'price-desc':
      case 'price-high':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { rating: -1, reviews: -1 };
        break;
      case 'popular':
        sortObj = { reviews: -1, rating: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { id: 1 };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 12);
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      products,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalProducts / limitNum) || 1,
      totalProducts
    });
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/products/categories
// @desc    Get all distinct categories with product count
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, sampleImage: { $first: '$image' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/products/filters/meta
// @desc    Get metadata for filter sidebars (min/max price, colors, sizes, brands)
router.get('/filters/meta', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    const colors = await Product.distinct('colors');
    const sizes = await Product.distinct('sizes');
    const priceStats = await Product.aggregate([
      { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
    ]);

    res.json({
      success: true,
      brands: brands.filter(Boolean).sort(),
      colors: colors.filter(Boolean).sort(),
      sizes: sizes.filter(Boolean).sort(),
      minPrice: priceStats[0]?.minPrice || 0,
      maxPrice: priceStats[0]?.maxPrice || 5000
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID with related products
router.get('/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Fetch up to 4 related products from the same category
    const relatedProducts = await Product.find({
      category: product.category,
      id: { $ne: product.id }
    }).limit(4);

    res.json({
      success: true,
      product,
      relatedProducts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/products
// @desc    Admin: Create new product
router.post('/', adminAuth, async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const nextId = lastProduct ? lastProduct.id + 1 : 1;

    const stockQty = Number(req.body.stockQuantity) || 25;
    const newProduct = new Product({
      ...req.body,
      id: nextId,
      stockQuantity: stockQty
    });

    const saved = await newProduct.save();

    // Log initial stock creation
    await InventoryLog.create({
      productId: saved.id,
      productName: saved.name,
      changeType: 'restock',
      changeAmount: stockQty,
      previousStock: 0,
      newStock: stockQty,
      performedBy: req.user.email,
      note: 'Initial product stock created.'
    });

    res.status(201).json({ success: true, product: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Admin: Update product details
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const existing = await Product.findOne({ id: productId });
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

    const previousStock = existing.stockQuantity;
    Object.assign(existing, req.body);
    const updated = await existing.save();

    // If stock changed directly via product edit
    if (req.body.stockQuantity !== undefined && req.body.stockQuantity !== previousStock) {
      const diff = updated.stockQuantity - previousStock;
      await InventoryLog.create({
        productId: updated.id,
        productName: updated.name,
        changeType: diff > 0 ? 'restock' : 'manual_adjustment',
        changeAmount: diff,
        previousStock,
        newStock: updated.stockQuantity,
        performedBy: req.user.email,
        note: `Product edit adjustment.`
      });
    }

    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Admin: Delete product
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const deleted = await Product.findOneAndDelete({ id: productId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Product not found.' });

    res.json({ success: true, message: 'Product removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
