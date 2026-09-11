const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    default: function() {
      return `FC-${this.category ? this.category.toUpperCase().slice(0, 3) : 'GEN'}-${this.id}`;
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: function() {
      if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
      }
      return 0;
    }
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  subcategory: {
    type: String,
    default: 'general'
  },
  colors: [String],
  sizes: [String],
  brand: {
    type: String,
    default: 'FashionCart',
    trim: true
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    required: true
  },
  images: [String],
  description: {
    type: String,
    default: ''
  },
  // ============ INVENTORY & STOCK MANAGEMENT ============
  stockQuantity: {
    type: Number,
    required: true,
    default: 25,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  stockStatus: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  variantStock: [
    {
      size: String,
      color: String,
      quantity: { type: Number, default: 10 }
    }
  ],
  isNew: {
    type: Boolean,
    default: false
  },
  isSale: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { suppressReservedKeysWarning: true });

// Middleware to automatically compute inStock and stockStatus on save
ProductSchema.pre('save', function () {
  if (this.stockQuantity <= 0) {
    this.inStock = false;
    this.stockStatus = 'Out of Stock';
    this.stockQuantity = 0;
  } else if (this.stockQuantity <= this.lowStockThreshold) {
    this.inStock = true;
    this.stockStatus = 'Low Stock';
  } else {
    this.inStock = true;
    this.stockStatus = 'In Stock';
  }
});

module.exports = mongoose.model('Product', ProductSchema);
