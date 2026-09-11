const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const InventoryLog = require('../models/InventoryLog');
const connectDB = require('../config/db');

const productsJsonPath = path.join(__dirname, '../../products_extracted.json');

const seedDatabase = async () => {
  try {
    console.log('--- Starting FashionCart Database Seeding ---');
    await connectDB();

    // 1. Seed Coupons
    console.log('[Seeder] Seeding Coupons...');
    await Coupon.deleteMany({});
    const initialCoupons = [
      {
        code: 'VOGUE20',
        discountPercent: 20,
        maxDiscount: 500,
        minPurchase: 999,
        description: '20% OFF on orders over ₹999 (Max discount ₹500)'
      },
      {
        code: 'FASHION50',
        discountPercent: 50,
        maxDiscount: 1000,
        minPurchase: 1999,
        description: 'Super Deal: 50% OFF on luxury orders above ₹1999'
      },
      {
        code: 'WELCOME10',
        discountPercent: 10,
        maxDiscount: 300,
        minPurchase: 499,
        description: 'Welcome perk: 10% OFF on your order'
      }
    ];
    await Coupon.insertMany(initialCoupons);
    console.log(`[Seeder] Seeded ${initialCoupons.length} promotional coupons.`);

    // 2. Seed Default Users (Admin & Customer)
    console.log('[Seeder] Seeding Demo Users...');
    await User.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const customerPassword = await bcrypt.hash('Customer@123', salt);

    const demoUsers = [
      {
        name: 'Sanjay Thanth (Admin)',
        email: 'admin@fashioncart.com',
        password: adminPassword,
        role: 'admin',
        phone: '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        addresses: [
          {
            isDefault: true,
            title: 'HQ Office',
            street: '402 Luxury Avenue, Fashion District',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India'
          }
        ]
      },
      {
        name: 'John Doe (Shopper)',
        email: 'customer@fashioncart.com',
        password: customerPassword,
        role: 'customer',
        phone: '+91 91234 56789',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        addresses: [
          {
            isDefault: true,
            title: 'Home',
            street: '12 Park Street, Green View',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India'
          }
        ]
      }
    ];
    await User.insertMany(demoUsers);
    console.log('[Seeder] Seeded Admin (admin@fashioncart.com / Admin@123) and Customer (customer@fashioncart.com / Customer@123).');

    // 3. Seed Products from products_extracted.json
    if (fs.existsSync(productsJsonPath)) {
      console.log('[Seeder] Loading extracted product catalog...');
      const raw = fs.readFileSync(productsJsonPath, 'utf8');
      const parsedProducts = JSON.parse(raw);

      await Product.deleteMany({});
      await InventoryLog.deleteMany({});

      const formattedProducts = parsedProducts.map((p, index) => {
        const id = p.id || (index + 1);
        const price = Number(p.price) || 499;
        const originalPrice = Number(p.originalPrice) || Math.round(price * 1.3);

        // Realistic stock distribution:
        // First 3 items have low stock (2 to 4) to test low-stock alerts
        // Item 10 has 0 stock to test Out-of-Stock handling
        // Others have healthy stock between 15 and 80
        let stockQuantity = 25;
        if (index === 0) stockQuantity = 3;
        else if (index === 1) stockQuantity = 4;
        else if (index === 2) stockQuantity = 2;
        else if (index === 9) stockQuantity = 0;
        else stockQuantity = 15 + ((index * 7) % 65);

        const inStock = stockQuantity > 0;
        const stockStatus = stockQuantity === 0 ? 'Out of Stock' : (stockQuantity <= 5 ? 'Low Stock' : 'In Stock');

        return {
          id,
          name: p.name || `Fashion Item #${id}`,
          sku: `FC-${(p.category || 'GEN').toUpperCase().slice(0, 3)}-${id}`,
          price,
          originalPrice,
          discount: Math.round(((originalPrice - price) / originalPrice) * 100),
          category: (p.category || 'women').toLowerCase(),
          colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : ['black', 'blue', 'white'],
          sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'],
          brand: p.brand && p.brand.trim() !== '' ? p.brand : 'FashionCart Signature',
          rating: Number(p.rating) || 4.5,
          reviews: Number(p.reviews) || (10 + (index * 3)),
          image: p.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
          images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image],
          description: p.description || `${p.name} crafted with the finest luxury fabrics and contemporary silhouette. Perfect for elevated everyday styling.`,
          stockQuantity,
          lowStockThreshold: 5,
          stockStatus,
          inStock,
          isNew: index % 4 === 0,
          isSale: originalPrice > price,
          isFeatured: index < 8
        };
      });

      console.log(`[Seeder] Inserting ${formattedProducts.length} rich fashion products...`);
      await Product.insertMany(formattedProducts);

      // Create initial stock audit logs
      const initialLogs = formattedProducts.slice(0, 10).map(p => ({
        productId: p.id,
        productName: p.name,
        changeType: 'restock',
        changeAmount: p.stockQuantity,
        previousStock: 0,
        newStock: p.stockQuantity,
        performedBy: 'Database Seeder',
        note: 'Initial catalog stock populated'
      }));
      await InventoryLog.insertMany(initialLogs);

      console.log(`[Seeder] Seeded ${formattedProducts.length} products with stock and inventory details!`);
    } else {
      console.warn(`[Seeder] products_extracted.json not found at ${productsJsonPath}`);
    }

    console.log('--- Database Seeding Completed Successfully! ---');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
