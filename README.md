# 💎 FashionCart - Full-Stack Luxury E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Mongoose%208.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![JWT Authentication](https://img.shields.io/badge/Auth-JWT%20%26%20Bcrypt-FF4B72?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-MIT-3B82F6?style=for-the-badge)](LICENSE)

**FashionCart** is an enterprise-grade, full-stack luxury e-commerce platform built with **Node.js, Express.js, MongoDB Atlas (Mongoose), and Vanilla ES6+ JavaScript**. Engineered with ultra-modern glassmorphism aesthetics, a dynamic dual-theme engine (Dark & Light mode), over 50 custom micro-interactions, real-time cloud stock tracking, and a comprehensive executive administration dashboard.

---

## ✨ Key Platform Features

### 🚀 Backend & Database Architecture
- **Express.js REST API Gateway**: Modular route architecture powering `/api/auth`, `/api/products`, `/api/orders`, `/api/stock`, `/api/reviews`, `/api/coupons`, and `/api/admin`.
- **MongoDB Atlas Cloud Database**: Production schemas for Products, Users, Orders, Stock Logs, Reviews, and Coupons with index optimization.
- **Smart Catalog Auto-Seeder**: Automatic initial seeding of 82 luxury fashion products across 6 major departments on first server boot.
- **Strict Real-Time Stock Engine**: Automated inventory deductions upon order placement, low-stock threshold monitoring, and automatic stock restoration upon order cancellation.
- **JWT & Role-Based Authorization**: Secure session handling with Bcrypt password hashing and role protection (`customer` vs. `admin`).

### 🎨 Design System & Visual Aesthetics
- **Dual Luxury Theme Switcher**: Global toggle between **Onyx Glassmorphism (Dark Mode)** and **Champagne Ivory & Rose Gold (Light Mode)** with persistent local storage.
- **50+ Custom Micro-Animations**:
  - Interactive **3D perspective card tilting** that responds dynamically to cursor position.
  - **Flying particle physics** that transport items smoothly into the shopping bag on click.
  - **Animated number counters** for real-time inventory statistics and revenue KPIs.
  - **Celebration confetti bursts** on order checkout and order milestones.
  - Fluid ripple wave click feedback on buttons and action icons.
- **Universal Multi-Device Responsiveness**: Fluid layouts supporting mobile phones (320px–480px), tablets (768px–1024px), laptops, desktops, and 4K ultra-wide monitors. Includes an offcanvas mobile navigation drawer with zero horizontal overflow.

### 🛍️ Shopper Experience & Workflows
- **Curated Multi-Filter Catalog (`shop.html`)**: Real-time category filtering (Men, Women, Kids, Ethnic, Footwear), price range sliders, size filters, live text search, and sorting.
- **Comprehensive Product Specifications (`product.html`)**:
  - Multi-angle high-resolution image gallery with thumbnail reel.
  - Interactive star review submission and community rating breakdowns.
  - Real-time stock status progress bar.
  - 6-digit Pincode delivery estimator with express delivery verification.
  - Instant **"Buy Now"** one-click checkout shortcut.
- **Synchronized Saved Wishlist (`wishlist.html`)**: Instant heart toggles with cloud persistence to MongoDB Atlas, bulk "Move All to Bag", and quick removal.
- **Interactive Shopping Bag (`cart.html`)**:
  - Live **Free Express Delivery Progress Meter** (unlocks at ₹999).
  - Quantity steppers with instant subtotal and tax calculation.
  - Coupon redemption engine (e.g. promo code **`VOGUE20`** for 20% off).
- **Simulated 3D Checkout (`checkout.html`)**:
  - Interactive **3D rotating credit card** with live mirror typing for card number, cardholder name, expiry, and CVV.
  - Multiple payment pathways: Credit/Debit Card, Instant UPI QR Code, and Cash on Delivery (COD).
- **Live Order Tracking (`my-orders.html`)**:
  - 4-stage visual delivery progress timeline: *Order Placed → Processing → Shipped → Delivered*.
  - Printable tax invoice generator.
  - Instant self-service order cancellation with automatic stock replenishment.
- **Customer Profile (`profile.html`)**: Address book management, personal details editing, and password updating.

### ⚙️ Executive Admin Dashboard (`admin.html`)
- **Live Business KPIs**: Real-time cards displaying Total Store Revenue, Active Orders, Total Stock Units, and Critical Low-Stock Alerts.
- **Interactive Inventory Management**: Direct stock adjustment controls (`+10 Restock`, `-5 Writeoff`, or custom numbers) with instant status badge updates.
- **Customer Order Fulfillment**: Filter and update order states (*Pending → Processing → Shipped → Delivered → Cancelled*).
- **Stock Audit Trail**: Immutable ledger recording every inventory change, change initiator, event type, and timestamp.
- **Registered Shoppers Directory**: Live MongoDB user account list showing contact profiles, saved addresses, and registration dates.

---

## 📂 Architecture & Directory Structure

```text
FashionCart/
├── public/                     # Client-Facing Storefront Assets
│   ├── index.html              # Main storefront homepage with hero & deals
│   ├── shop.html               # Product catalog with multi-axis filtering
│   ├── product.html            # Deep product detail view & reviews
│   ├── cart.html               # Shopping bag with free delivery meter
│   ├── checkout.html           # 3D credit card & multi-method checkout
│   ├── wishlist.html           # Saved items wishlist view
│   ├── my-orders.html          # Order tracking timeline & invoices
│   ├── profile.html            # Customer profile & address management
│   ├── login.html              # Authentication portal (Login & Register)
│   ├── admin.html              # Executive management & inventory suite
│   │
│   ├── css/
│   │   ├── theme.css           # Design tokens, themes, layout & responsive engine
│   │   └── animations.css      # Keyframes, 3D tilts, glassmorphism & transitions
│   │
│   ├── js/
│   │   ├── api.js              # Unified REST API client, JWT session & cloud sync
│   │   ├── main.js             # Global UI interactions, toasts, cart & mobile nav
│   │   └── animations.js       # 3D tilt engine, number counters & confetti
│   │
│   └── products/               # High-resolution fashion catalog media
│
├── src/                        # Backend Node.js & Express Application
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection manager & fallback
│   ├── middleware/
│   │   └── auth.js             # JWT authentication & admin authorization guards
│   ├── models/
│   │   ├── Product.js          # Product catalog & inventory schema
│   │   ├── User.js             # User accounts, addresses, cart & wishlist schema
│   │   ├── Order.js            # Customer orders, pricing & timeline schema
│   │   ├── InventoryLog.js     # Inventory audit trail schema
│   │   ├── Review.js           # Verified customer reviews schema
│   │   └── Coupon.js           # Promotional discounts schema
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication & user profile endpoints
│   │   ├── productRoutes.js    # Product search, filter & detail endpoints
│   │   ├── orderRoutes.js      # Order placement, history & cancellation
│   │   ├── stockRoutes.js      # Admin inventory management & audit logs
│   │   ├── reviewRoutes.js     # Product rating & review submission
│   │   ├── couponRoutes.js     # Promo code verification & discount logic
│   │   └── adminRoutes.js      # Dashboard KPI statistics & analytics
│   └── utils/
│       └── seeder.js           # Automated catalog & demo user database seeder
│
├── .env.example                # Template for environment configuration
├── .gitignore                  # Git exclusion rules
├── package.json                # Project dependencies and npm scripts
├── server.js                   # Main application entry point & API gateway
└── README.md                   # Comprehensive documentation
```

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technologies & Packages |
| :--- | :--- |
| **Backend Runtime** | Node.js (v18+ or v20+) |
| **Web Framework** | Express.js 4.18+ |
| **Database & ODM** | MongoDB Atlas / Local MongoDB, Mongoose 8.x |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS |
| **Frontend Core** | HTML5 Semantic Markup, Vanilla Modern JavaScript (ES6+ Modules) |
| **Styling & Layout** | Vanilla CSS3, CSS Custom Properties, Bootstrap 5.3 (Grid & Utilities) |
| **Icons & Fonts** | Font Awesome 6 Pro/Free, Google Fonts (*Playfair Display*, *Plus Jakarta Sans*, *Cinzel*) |
| **Animation Libraries** | Canvas Confetti, Animate on Scroll (AOS), Native RequestAnimationFrame |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js** (v18.0 or later installed): [Download Node.js](https://nodejs.org/)
- **MongoDB**: Either a free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas) or a local MongoDB instance running on port 27017.

### 2. Clone the Repository
```bash
git clone https://github.com/sanjaythanth508/FashionCart.git
cd FashionCart
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example environment file and configure your database URI and secrets:
```bash
cp .env.example .env
```

Edit `.env`:
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fashioncart
# Or your MongoDB Atlas URI:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fashioncart?retryWrites=true&w=majority
JWT_SECRET=fashioncart_luxury_super_secret_jwt_key_2026
NODE_ENV=development
```

### 5. Launch the Application
```bash
# Start the server (auto-seeds 82 products on first run)
npm start

# Or with nodemon for development:
npm run dev
```

The application will now be live:
- 🛍️ **Storefront**: [http://localhost:5000](http://localhost:5000)
- ⚙️ **Admin Control Panel**: [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
- 📡 **REST API Gateway**: [http://localhost:5000/api/products](http://localhost:5000/api/products)

---

## 🔑 Pre-Configured Test Credentials

| Account Type | Email | Password | Role & Permissions |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `admin@fashioncart.com` | `Admin@123` | Full access to Admin Portal, stock edits, order fulfillment & customer directory |
| **Customer Shopper** | `customer@fashioncart.com` | `Customer@123` | Standard shopper account with saved orders, wishlist, and shipping addresses |

*(Quick-login buttons for both accounts are conveniently available on the [Login Page](http://localhost:5000/login.html).)*

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | User | Get current logged-in user profile |
| `POST` | `/api/auth/sync-cart` | User | Synchronize client bag state to MongoDB |
| `POST` | `/api/auth/sync-wishlist` | User | Synchronize saved wishlist items to MongoDB |
| `GET` | `/api/products` | Public | Query products with multi-filters, sort & pagination |
| `GET` | `/api/products/:id` | Public | Fetch product details and related recommendations |
| `GET` | `/api/products/categories` | Public | Get category list with live inventory counts |
| `POST` | `/api/products` | Admin | Create a new product in the catalog |
| `POST` | `/api/orders` | User | Place order, validate stock, and deduct inventory |
| `GET` | `/api/orders/my` | User | Retrieve current user's order history |
| `POST` | `/api/orders/:id/cancel` | User/Admin | Cancel order and restore reserved stock |
| `POST` | `/api/coupons/apply` | Public | Validate promotional code and calculate discount |
| `PUT` | `/api/stock/:id` | Admin | Adjust product stock quantity and write audit log |
| `GET` | `/api/stock/logs` | Admin | Fetch chronological inventory change audit trail |
| `GET` | `/api/admin/stats` | Admin | Aggregate dashboard KPIs (Revenue, Orders, Low Stock) |

---

## 👤 Author & Maintainer

**Sanjay Thanth**  
- GitHub: [@sanjaythanth508](https://github.com/sanjaythanth508)  
- Project Repository: [https://github.com/sanjaythanth508/FashionCart](https://github.com/sanjaythanth508/FashionCart)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
