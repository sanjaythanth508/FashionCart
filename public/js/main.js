/**
 * ==========================================================================
 * FASHIONCART GLOBAL UI INTERACTIONS & RENDERING ENGINE
 * Navbar, 3D Tilt, Flying Cart Particles, Toasts, & Quick View Modal
 * ==========================================================================
 */

const FashionUI = (() => {
  // ==================== TOAST NOTIFICATION ====================
  function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'info') icon = 'fa-info-circle';

    toast.innerHTML = `
      <i class="fas ${icon}" style="font-size: 1.2rem; color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'}"></i>
      <span style="flex-grow: 1; font-size: 0.92rem; font-weight: 500;">${message}</span>
      <i class="fas fa-times" style="cursor: pointer; opacity: 0.6;" onclick="this.parentElement.remove()"></i>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // ==================== FLY TO CART ANIMATION ====================
  function animateFlyToCart(triggerEl, imgSrc) {
    const cartBtn = document.getElementById('navCartBtn') || document.querySelector('.nav-cart-link');
    if (!cartBtn || !triggerEl) return;

    const startRect = triggerEl.getBoundingClientRect();
    const endRect = cartBtn.getBoundingClientRect();

    const particle = document.createElement('img');
    particle.src = imgSrc || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100';
    particle.className = 'flying-particle';
    particle.style.left = `${startRect.left + startRect.width / 2 - 25}px`;
    particle.style.top = `${startRect.top + startRect.height / 2 - 25}px`;
    document.body.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.left = `${endRect.left + endRect.width / 2 - 20}px`;
      particle.style.top = `${endRect.top + endRect.height / 2 - 20}px`;
      particle.style.transform = 'scale(0.3)';
      particle.style.opacity = '0.7';
    });

    setTimeout(() => {
      particle.remove();
      const badge = document.getElementById('cartBadge');
      if (badge) {
        badge.classList.remove('badge-bounce');
        void badge.offsetWidth; // reflow
        badge.classList.add('badge-bounce');
      }
    }, 750);
  }

  // ==================== UPDATE BADGES ====================
  function updateBadges() {
    const cartCount = FashionAPI.store.getCartCount();
    const wishlistCount = FashionAPI.store.getWishlistCount();

    document.querySelectorAll('.cart-count-badge, #cartBadge, #mobileCartBadge').forEach(badge => {
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? 'inline-flex' : 'none';
    });

    document.querySelectorAll('.wishlist-count-badge, #wishlistBadge, #mobileWishlistBadge').forEach(badge => {
      badge.textContent = wishlistCount;
      badge.style.display = wishlistCount > 0 ? 'inline-flex' : 'none';
    });
  }

  // ==================== 3D TILT EFFECT ====================
  function initTilt3D() {
    const cards = document.querySelectorAll('.tilt-card, .product-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.015)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
      });
    });

    if (window.FashionAnimations) {
      window.FashionAnimations.refresh();
    }
  }

  // ==================== PRODUCT CARD HTML GENERATOR ====================
  function createProductCardHTML(p) {
    const isWish = FashionAPI.store.isInWishlist(p.id);
    const inStock = p.stockQuantity > 0;
    const isLowStock = inStock && p.stockQuantity <= (p.lowStockThreshold || 5);
    
    let stockBadgeHTML = '';
    if (!inStock) {
      stockBadgeHTML = `<span class="stock-pill out-of-stock"><span class="stock-dot"></span>Sold Out</span>`;
    } else if (isLowStock) {
      stockBadgeHTML = `<span class="stock-pill low-stock"><span class="stock-dot"></span>Only ${p.stockQuantity} Left!</span>`;
    } else {
      stockBadgeHTML = `<span class="stock-pill in-stock"><span class="stock-dot"></span>In Stock (${p.stockQuantity})</span>`;
    }

    return `
      <div class="product-card tilt-card" data-id="${p.id}">
        <div class="product-card-img-wrap">
          <a href="product.html?id=${p.id}" class="product-card-img-link" title="View details of ${p.name}">
            <img src="${p.image}" alt="${p.name}" class="product-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'">
          </a>
          
          <div class="product-badge-container">
            ${p.isSale ? '<span class="product-badge badge-sale badge-jiggle">SALE</span>' : ''}
            ${p.isNew ? '<span class="product-badge badge-new badge-jiggle">NEW</span>' : ''}
          </div>

          <div class="product-card-actions">
            <button class="action-icon-btn ${isWish ? 'active' : ''}" title="Add to Wishlist" onclick="FashionUI.handleWishlistClick(${p.id}, this)">
              <i class="${isWish ? 'fas fa-heart heart-pop' : 'far fa-heart'}"></i>
            </button>
          </div>
        </div>

        <div class="product-card-body">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="product-category">${p.category || 'Apparel'}</span>
            ${stockBadgeHTML}
          </div>

          <a href="product.html?id=${p.id}" class="product-title" title="${p.name}">${p.name}</a>

          <div class="product-rating-stars">
            ${renderStars(p.rating || 4.5)}
            <span class="product-rating-count">(${p.reviews || 12})</span>
          </div>

          <div class="product-card-price-row">
            <span class="product-price">₹${p.price}</span>
            ${p.originalPrice ? `<span class="product-original-price">₹${p.originalPrice}</span>` : ''}
            ${p.discount ? `<span class="product-discount-pill">${p.discount}% OFF</span>` : ''}
          </div>

          <button class="btn-card-cart ${!inStock ? 'disabled' : ''}" ${!inStock ? 'disabled' : ''} onclick="FashionUI.handleAddToCartClick(${p.id}, this)">
            <i class="fas ${inStock ? 'fa-shopping-bag' : 'fa-ban'}"></i>
            ${inStock ? 'Add to Bag' : 'Out of Stock'}
          </button>
        </div>
      </div>
    `;
  }

  function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    let html = '';
    for (let i = 0; i < fullStars; i++) html += '<i class="fas fa-star"></i>';
    if (hasHalf) html += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) html += '<i class="far fa-star"></i>';
    return html;
  }

  // ==================== GLOBAL HANDLERS ====================
  async function handleWishlistClick(productId, btn) {
    try {
      const res = await FashionAPI.products.getById(productId);
      if (res.product) {
        FashionAPI.store.toggleWishlist(res.product, btn);
        const icon = btn.querySelector('i');
        if (icon) {
          const isWished = FashionAPI.store.isInWishlist(productId);
          icon.className = isWished ? 'fas fa-heart heart-pop' : 'far fa-heart';
          if (isWished) {
            setTimeout(() => icon.classList.remove('heart-pop'), 600);
          }
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  }

  async function handleAddToCartClick(productId, btn) {
    try {
      const res = await FashionAPI.products.getById(productId);
      if (res.product) {
        const img = btn.closest('.product-card')?.querySelector('.product-card-img');
        FashionAPI.store.addToCart(res.product, 1, null, null, img);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  }

  // Direct Navigation to Product Details Page
  function openQuickView(productId) {
    window.location.href = `product.html?id=${productId}`;
  }

  // ==================== THEME CONTROLLER ====================
  function getTheme() {
    return localStorage.getItem('fc_theme') || 'dark';
  }

  function initTheme() {
    const currentTheme = getTheme();
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeToggleIcon(currentTheme);
  }

  function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('fc_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeToggleIcon(newTheme);
    showToast(`Switched to ${newTheme === 'light' ? 'Light Theme ☀️' : 'Luxury Dark Theme 🌙'}`, 'info');
  }

  function updateThemeToggleIcon(theme) {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    btns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.remove('spin-active');
        void icon.offsetWidth; // Trigger reflow for re-animation
        icon.className = theme === 'light' ? 'fas fa-moon text-indigo spin-active' : 'fas fa-sun text-warning spin-active';
      }
      btn.setAttribute('title', theme === 'light' ? 'Switch to Dark Mode 🌙' : 'Switch to Light Mode ☀️');
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    });
  }

  // ==================== INIT NAVBAR & USER DROPDOWN ====================
  function initNavbar() {
    initTheme();
    updateBadges();

    // Auto-inject Theme Toggle button into Navbar if not already in markup
    const actionBars = document.querySelectorAll('.luxury-navbar .d-flex.align-items-center.gap-3');
    actionBars.forEach(bar => {
      if (!bar.querySelector('.theme-toggle-btn')) {
        const themeBtn = document.createElement('button');
        themeBtn.className = 'nav-action-btn theme-toggle-btn';
        themeBtn.setAttribute('type', 'button');
        themeBtn.setAttribute('title', getTheme() === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        themeBtn.innerHTML = `<i class="fas ${getTheme() === 'light' ? 'fa-moon' : 'fa-sun text-warning'}"></i>`;
        themeBtn.onclick = () => FashionUI.toggleTheme();
        bar.insertBefore(themeBtn, bar.firstChild);
      }
    });

    // Listen to store updates
    window.addEventListener('cartUpdated', updateBadges);
    window.addEventListener('wishlistUpdated', updateBadges);

    // Scroll effect
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.luxury-navbar');
      if (navbar) {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    });

    // Check user auth state and update profile button
    const user = FashionAPI.auth.getUser();
    const userContainer = document.getElementById('navUserContainer');
    if (userContainer) {
      if (user) {
        userContainer.innerHTML = `
          <div class="dropdown">
            <button class="nav-action-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="${user.name}">
              <i class="fas fa-user-circle"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-lg" style="background: var(--bg-dropdown); backdrop-filter: blur(14px); border: 1px solid var(--border-glass); border-radius: var(--radius-md);">
              <li class="px-3 py-2 border-bottom border-secondary mb-1">
                <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${user.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${user.email}</div>
                ${user.role === 'admin' ? '<span class="badge bg-danger mt-1">ADMINISTRATOR</span>' : '<span class="badge bg-primary mt-1">MEMBER</span>'}
              </li>
              <li><a class="dropdown-item py-2" href="profile.html"><i class="fas fa-id-badge me-2"></i>My Profile</a></li>
              <li><a class="dropdown-item py-2" href="my-orders.html"><i class="fas fa-box me-2"></i>My Orders</a></li>
              <li><a class="dropdown-item py-2" href="wishlist.html"><i class="fas fa-heart me-2"></i>Wishlist</a></li>
              ${user.role === 'admin' ? '<li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-warning py-2" href="admin.html"><i class="fas fa-shield-alt me-2"></i>Admin Dashboard</a></li>' : ''}
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item text-danger py-2" onclick="FashionAPI.auth.logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</button></li>
            </ul>
          </div>
        `;
      } else {
        userContainer.innerHTML = `
          <a href="login.html" class="nav-action-btn" title="Sign In / Register">
            <i class="fas fa-user"></i>
          </a>
        `;
      }
    }

    // Header Search Input (auto-suggest on enter)
    const searchInputs = document.querySelectorAll('.header-search input, #globalSearchInput');
    searchInputs.forEach(input => {
      input.addEventListener('keypress', e => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
          window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
        }
      });
    });

    initTilt3D();
    initMobileNav();
  }

  // ==================== MOBILE NAVIGATION DRAWER ====================
  function initMobileNav() {
    // 1. Inject Hamburger Button into navbar if not present
    const actionBars = document.querySelectorAll('.luxury-navbar .d-flex.align-items-center.gap-3');
    actionBars.forEach(bar => {
      if (!bar.querySelector('.mobile-menu-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'nav-action-btn mobile-menu-toggle d-lg-none';
        toggleBtn.setAttribute('type', 'button');
        toggleBtn.setAttribute('title', 'Open Navigation Menu');
        toggleBtn.setAttribute('aria-label', 'Open Navigation Menu');
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        toggleBtn.onclick = () => openMobileDrawer();
        bar.appendChild(toggleBtn);
      }
    });

    // 2. Inject Drawer and Backdrop if not present
    if (!document.getElementById('mobileNavDrawer')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'mobileNavBackdrop';
      backdrop.className = 'mobile-nav-backdrop';
      backdrop.onclick = closeMobileDrawer;

      const user = FashionAPI.auth.getUser();
      const drawer = document.createElement('aside');
      drawer.id = 'mobileNavDrawer';
      drawer.className = 'mobile-nav-drawer';
      drawer.innerHTML = `
        <div class="mobile-nav-header">
          <a href="index.html" class="navbar-brand-luxury">
            <i class="fas fa-gem gradient-text me-1"></i>Fashion<span>Cart</span>
          </a>
          <button id="mobileNavCloseBtn" class="mobile-nav-close" aria-label="Close Menu">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="mobile-nav-search">
          <div class="header-search">
            <i class="fas fa-search"></i>
            <input type="text" id="mobileDrawerSearch" placeholder="Search luxury apparel...">
          </div>
        </div>

        <ul class="mobile-nav-links">
          <li><a href="index.html" class="mobile-nav-link" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-home"></i> Home</a></li>
          <li><a href="shop.html" class="mobile-nav-link" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-compass"></i> All Collections</a></li>
          <li><a href="shop.html?category=men" class="mobile-nav-link" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-male"></i> Men's Apparel</a></li>
          <li><a href="shop.html?category=women" class="mobile-nav-link" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-female"></i> Women's Haute Couture</a></li>
          <li><a href="shop.html?category=kids" class="mobile-nav-link" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-child"></i> Kids Collection</a></li>
          <li><a href="shop.html?category=ethnic" class="mobile-nav-link" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-crown"></i> Royal Ethnic</a></li>
          <li><a href="my-orders.html" class="mobile-nav-link" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-box"></i> My Orders</a></li>
          <li><a href="wishlist.html" class="mobile-nav-link" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-heart"></i> Saved Wishlist <span class="badge bg-danger rounded-pill ms-auto" id="mobileWishlistBadge" style="display: none;">0</span></a></li>
          <li><a href="cart.html" class="mobile-nav-link" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-shopping-bag"></i> Shopping Bag <span class="badge bg-danger rounded-pill ms-auto" id="mobileCartBadge" style="display: none;">0</span></a></li>
          ${user && user.role === 'admin' ? '<li><a href="admin.html" class="mobile-nav-link text-warning" onclick="FashionUI.closeMobileDrawer()"><i class="fas fa-shield-alt text-warning"></i> Admin Dashboard</a></li>' : ''}
        </ul>

        <div class="mt-auto pt-3 border-top border-secondary">
          ${user ? `
            <div class="d-flex align-items-center justify-content-between mb-3 p-2 rounded" style="background: rgba(255,255,255,0.05);">
              <div>
                <div class="fw-bold text-white small">${user.name}</div>
                <div class="text-muted" style="font-size: 0.75rem;">${user.email}</div>
              </div>
              <button class="btn btn-sm btn-outline-danger" onclick="FashionAPI.auth.logout()">Sign Out</button>
            </div>
          ` : `
            <div class="d-grid gap-2 mb-3">
              <a href="login.html" class="btn-luxury text-center py-2">Sign In / Register</a>
            </div>
          `}
          <button class="btn btn-glass w-100 justify-content-center" onclick="FashionUI.toggleTheme()">
            <i class="fas ${getTheme() === 'light' ? 'fa-moon' : 'fa-sun text-warning'} me-2"></i>
            Switch Theme
          </button>
        </div>
      `;

      document.body.appendChild(backdrop);
      document.body.appendChild(drawer);

      const closeBtn = drawer.querySelector('#mobileNavCloseBtn');
      if (closeBtn) closeBtn.onclick = closeMobileDrawer;

      const searchInput = drawer.querySelector('#mobileDrawerSearch');
      if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            window.location.href = `shop.html?search=${encodeURIComponent(searchInput.value.trim())}`;
          }
        });
      }
    }
  }

  function openMobileDrawer() {
    const drawer = document.getElementById('mobileNavDrawer');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    const drawer = document.getElementById('mobileNavDrawer');
    const backdrop = document.getElementById('mobileNavBackdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  return {
    showToast,
    animateFlyToCart,
    updateBadges,
    initTilt3D,
    createProductCardHTML,
    renderStars,
    handleWishlistClick,
    handleAddToCartClick,
    openQuickView,
    initNavbar,
    initTheme,
    toggleTheme,
    getTheme,
    openMobileDrawer,
    closeMobileDrawer
  };
})();

// Immediate initial execution to prevent flash of wrong theme
(() => {
  const saved = localStorage.getItem('fc_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  FashionUI.initNavbar();
});

window.FashionUI = FashionUI;
