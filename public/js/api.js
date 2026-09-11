/**
 * ==========================================================================
 * FASHIONCART CLIENT API SERVICE & STATE MANAGEMENT
 * Unified REST API Connector, JWT Session, & MongoDB Cart/Wishlist Sync
 * ==========================================================================
 */

const FashionAPI = (() => {
  const BASE_URL = '/api';

  // Helper: Get Auth Token
  const getToken = () => localStorage.getItem('fc_token');

  // Core Fetch Wrapper
  async function request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `API Error: ${res.status} ${res.statusText}`);
      }
      return data;
    } catch (err) {
      console.error(`[API Request Error] ${endpoint}:`, err);
      throw err;
    }
  }

  // ==================== AUTH & SESSION ====================
  const auth = {
    async register(userData) {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (data.token) {
        localStorage.setItem('fc_token', data.token);
        localStorage.setItem('fc_user', JSON.stringify(data.user));
      }
      return data;
    },

    async login(email, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (data.token) {
        localStorage.setItem('fc_token', data.token);
        localStorage.setItem('fc_user', JSON.stringify(data.user));
        // Sync cart from server
        if (data.user.cart && data.user.cart.length > 0) {
          localStorage.setItem('fc_cart', JSON.stringify(data.user.cart));
        }
        if (data.user.wishlist && data.user.wishlist.length > 0) {
          localStorage.setItem('fc_wishlist', JSON.stringify(data.user.wishlist));
        }
      }
      return data;
    },

    async getProfile() {
      return request('/auth/me');
    },

    async updateProfile(profileData) {
      const data = await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      if (data.user) {
        localStorage.setItem('fc_user', JSON.stringify(data.user));
      }
      return data;
    },

    async changePassword(currentPassword, newPassword) {
      return request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
    },

    async addAddress(addressData) {
      const data = await request('/auth/address', {
        method: 'POST',
        body: JSON.stringify(addressData)
      });
      if (data.addresses) {
        const user = this.getUser();
        if (user) {
          user.addresses = data.addresses;
          localStorage.setItem('fc_user', JSON.stringify(user));
        }
      }
      return data;
    },

    async getAllUsers() {
      return request('/auth/users');
    },

    logout() {
      localStorage.removeItem('fc_token');
      localStorage.removeItem('fc_user');
      window.location.href = 'index.html';
    },

    getUser() {
      try {
        return JSON.parse(localStorage.getItem('fc_user'));
      } catch (e) {
        return null;
      }
    },

    isLoggedIn() {
      return Boolean(getToken() && localStorage.getItem('fc_user'));
    },

    isAdmin() {
      const user = this.getUser();
      return user && user.role === 'admin';
    }
  };

  // ==================== PRODUCTS & FILTERS ====================
  const products = {
    async getAll(params = {}) {
      const query = new URLSearchParams();
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          query.append(k, params[k]);
        }
      });
      return request(`/products?${query.toString()}`);
    },

    async getById(id) {
      return request(`/products/${id}`);
    },

    async getCategories() {
      return request('/products/categories');
    },

    async getFilterMeta() {
      return request('/products/filters/meta');
    },

    async create(productData) {
      return request('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
    },

    async update(id, productData) {
      return request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
    },

    async delete(id) {
      return request(`/products/${id}`, {
        method: 'DELETE'
      });
    }
  };

  // ==================== STOCK & INVENTORY ====================
  const stock = {
    async getSummary() {
      return request('/stock/summary');
    },

    async getLowStock() {
      return request('/stock/low-stock');
    },

    async adjustStock(productId, changeAmount, note) {
      return request('/stock/adjust', {
        method: 'POST',
        body: JSON.stringify({ productId, changeAmount, note })
      });
    },

    async getLogs(params = {}) {
      const query = new URLSearchParams(params);
      return request(`/stock/logs?${query.toString()}`);
    },

    async getProductStock(productId) {
      return request(`/stock/product/${productId}`);
    }
  };

  // ==================== ORDERS & CHECKOUT ====================
  const orders = {
    async create(orderPayload) {
      return request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });
    },

    async getMyOrders() {
      return request('/orders/my');
    },

    async getById(orderId) {
      return request(`/orders/${orderId}`);
    },

    async cancel(orderId) {
      return request(`/orders/${orderId}/cancel`, {
        method: 'POST'
      });
    },

    async adminGetAll(status) {
      const url = status ? `/orders?status=${status}` : '/orders';
      return request(url);
    },

    async adminUpdateStatus(orderId, status, note) {
      return request(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, note })
      });
    }
  };

  // ==================== REVIEWS & RATINGS ====================
  const reviews = {
    async getForProduct(productId) {
      return request(`/reviews/${productId}`);
    },

    async submit(productId, reviewData) {
      return request(`/reviews/${productId}`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
    }
  };

  // ==================== COUPONS & DISCOUNTS ====================
  const coupons = {
    async validate(code, cartTotal) {
      return request('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, cartTotal })
      });
    },

    async getActive() {
      return request('/coupons/active');
    }
  };

  // ==================== ADMIN ANALYTICS ====================
  const admin = {
    async getDashboardStats() {
      return request('/admin/dashboard-stats');
    }
  };

  // ==================== CART & WISHLIST STORE ====================
  const store = {
    getCart() {
      try {
        return JSON.parse(localStorage.getItem('fc_cart')) || [];
      } catch (e) {
        return [];
      }
    },

    saveCart(cart) {
      localStorage.setItem('fc_cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
      
      // Background sync with MongoDB if user is logged in
      if (auth.isLoggedIn()) {
        request('/auth/sync-cart', {
          method: 'POST',
          body: JSON.stringify({ cart })
        }).catch(err => console.warn('Cart sync deferred:', err.message));
      }
    },

    addToCart(product, quantity = 1, size = null, color = null, triggerEl = null) {
      const cart = this.getCart();
      const selectedSize = size || (product.sizes?.[0] || 'M');
      const selectedColor = color || (product.colors?.[0] || 'Default');

      const existingIndex = cart.findIndex(
        item => item.productId === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
      );

      // Check stock limit
      const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
      const totalRequested = currentQtyInCart + quantity;

      if (product.stockQuantity !== undefined && totalRequested > product.stockQuantity) {
        FashionUI.showToast(`Cannot add more. Only ${product.stockQuantity} units available in stock!`, 'error');
        return false;
      }

      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          productId: product.id,
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          selectedSize,
          selectedColor,
          quantity,
          stockQuantity: product.stockQuantity
        });
      }

      this.saveCart(cart);

      // Particle Fly animation if element provided
      if (triggerEl) {
        FashionUI.animateFlyToCart(triggerEl, product.image);
      }

      FashionUI.showToast(`"${product.name}" added to cart!`, 'success');
      return true;
    },

    removeFromCart(productId, size = null, color = null) {
      let cart = this.getCart();
      cart = cart.filter(item => {
        if (size && color) {
          return !(item.productId === productId && item.selectedSize === size && item.selectedColor === color);
        }
        return item.productId !== productId;
      });
      this.saveCart(cart);
      FashionUI.showToast('Item removed from cart', 'info');
    },

    updateCartQuantity(productId, quantity, size = null, color = null) {
      const cart = this.getCart();
      const item = cart.find(i => i.productId === productId && (!size || i.selectedSize === size) && (!color || i.selectedColor === color));
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId, size, color);
          return;
        }
        // Stock cap check
        if (item.stockQuantity !== undefined && quantity > item.stockQuantity) {
          FashionUI.showToast(`Stock limit reached! Only ${item.stockQuantity} units available.`, 'error');
          return;
        }
        item.quantity = quantity;
        this.saveCart(cart);
      }
    },

    clearCart() {
      localStorage.removeItem('fc_cart');
      this.saveCart([]);
    },

    getCartCount() {
      const cart = this.getCart();
      return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    },

    getCartSubtotal() {
      const cart = this.getCart();
      return cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    },

    // Wishlist
    getWishlist() {
      try {
        return JSON.parse(localStorage.getItem('fc_wishlist')) || [];
      } catch (e) {
        return [];
      }
    },

    saveWishlist(wishlist) {
      localStorage.setItem('fc_wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { wishlist } }));
      
      if (auth.isLoggedIn()) {
        request('/auth/sync-wishlist', {
          method: 'POST',
          body: JSON.stringify({ wishlist })
        }).catch(err => console.warn('Wishlist sync deferred:', err.message));
      }
    },

    toggleWishlist(product, triggerEl = null) {
      const wishlist = this.getWishlist();
      const index = wishlist.findIndex(item => (item.id || item.productId || item) === product.id);

      if (index === -1) {
        wishlist.push({
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          stockQuantity: product.stockQuantity,
          inStock: product.inStock
        });
        this.saveWishlist(wishlist);
        if (triggerEl) triggerEl.classList.add('heart-pop', 'active');
        FashionUI.showToast(`Added "${product.name}" to your wishlist!`, 'success');
        return true;
      } else {
        wishlist.splice(index, 1);
        this.saveWishlist(wishlist);
        if (triggerEl) triggerEl.classList.remove('active');
        FashionUI.showToast(`Removed from wishlist`, 'info');
        return false;
      }
    },

    isInWishlist(productId) {
      const wishlist = this.getWishlist();
      return wishlist.some(item => (item.id || item.productId || item) === productId);
    },

    getWishlistCount() {
      return this.getWishlist().length;
    }
  };

  return {
    auth,
    products,
    stock,
    orders,
    reviews,
    coupons,
    admin,
    store
  };
})();

// Global Expose
window.FashionAPI = FashionAPI;
