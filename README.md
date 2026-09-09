# 🛍️ FashionCart - Premium Online Fashion Store

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Font Awesome](https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=font-awesome&logoColor=white)](https://fontawesome.com/)

**FashionCart** is a modern, responsive, and feature-rich front-end e-commerce web platform designed for fashion and apparel retail. It offers a shopping experience across desktop, tablet, and mobile devices, complete with animated UI elements, interactive product filtering, shopping cart workflows, wishlist capabilities, and checkout simulation.

---

## 🌟 Key Features

- 📱 **Fully Responsive Design**: Fluid mobile-first layouts crafted using Bootstrap 5 and custom CSS media queries.
- 🎨 **Modern Visual Aesthetics**: Glassmorphism navbar, smooth hover transitions, Playfair Display & Poppins typography, and AOS (Animate on Scroll) animations.
- 🛒 **Dynamic Shopping Cart**: Real-time price calculations, quantity increments/decrements, item removal, and subtotal updates stored persistently via browser `localStorage`.
- ❤️ **Wishlist Integration**: Save favorite garments and accessories with instant one-click toggle and quick add-to-cart.
- 🏷️ **Categorized Product Catalog**:
  - **Men's Fashion (`mens.html`)**: Formal, casual, and street style wear.
  - **Women's Fashion (`womens.html`)**: Dresses, western wear, kurtis, and ethnic sarees.
  - **Kids' Collection (`kids.html`)**: Tailored collections for both boys and girls.
  - **Footwear (`footwear.html`)**: Sneakers, formal shoes, sports shoes, and ethnic footwear.
- 💳 **Checkout Flow (`checkout.html`)**: Simulated multi-step checkout with address validation, order review, and payment option selection.
- 📦 **Order Tracking (`my-orders.html`)**: View recent purchases, order statuses, and delivery timelines.
- 👤 **User Accounts & Profiles (`profile.html`, `login.html`)**: Authentication interfaces for user login, signup, and profile editing.

---

## 📂 Project Architecture & File Organization

```text
FashionCart/
├── kids_boys/               # Media assets for boys' clothing
├── kids_girls/              # Media assets for girls' clothing
├── kurti_photos/            # Gallery assets for ethnic kurtis
├── products/                # Catalog product thumbnails and details
├── saree_photos/            # Gallery assets for saree collection
│
├── index.html               # Storefront homepage featuring hero banner, trending items & newsletter
├── shop.html                # Main product catalogue with search and filter controls
├── mens.html                # Men's clothing showcase
├── womens.html              # Women's fashion collection
├── kids.html                # Children's fashion apparel
├── footwear.html            # Shoes, sneakers, and footwear catalog
├── cart.html                # Interactive shopping cart view
├── wishlist.html            # User saved wishlist page
├── checkout.html            # Billing details, order summary & simulated payment
├── my-orders.html           # Historical order view and tracking status
├── profile.html             # Customer profile management
├── login.html               # Sign In / Sign Up portal
│
├── logo1.png                # Primary brand logo
├── logo2.png                # High-resolution emblem/favicon
└── README.md                # Project documentation
```

---

## 💻 Tech Stack & Libraries

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure and page layouts |
| **CSS3 & Flexbox/Grid** | Custom styling, gradients, and micro-interactions |
| **Bootstrap 5.3** | Grid system, responsive utility classes, and components |
| **Vanilla JavaScript** | DOM manipulation, cart arithmetic, and state persistence via `localStorage` |
| **AOS (Animate On Scroll)** | Scroll-triggered entrance animations |
| **Font Awesome 6** | E-commerce iconography |
| **Google Fonts** | *Playfair Display* (Headings) & *Poppins* (Body text) |

---

## 🚀 Getting Started

No build tools, bundlers, or package managers required! You can run FashionCart directly in any web browser.

### Option 1: Direct File Launch
1. Clone this repository:
   ```bash
   git clone https://github.com/sanjaythanth508/FashionCart.git
   cd FashionCart
   ```
2. Double-click `index.html` or open it in your favorite browser (Chrome, Edge, Firefox, Safari).

### Option 2: Run via a Local Static Server
For optimal asset loading and performance:

- **Using Python 3**:
  ```bash
  python -m http.server 8000
  ```
  Then navigate to [http://localhost:8000](http://localhost:8000).

- **Using VS Code Live Server**:
  Right-click `index.html` inside VS Code and select **Open with Live Server**.

---

## 👤 Author

- **Sanjay Thanth** ([@sanjaythanth508](https://github.com/sanjaythanth508))
