// Intercept functions to inject API calls without breaking original UI logic
setTimeout(() => {
    // Analytics/Interaction intercepts
    if (typeof window.addToCart === 'function') {
        const origAddToCart = window.addToCart;
        window.addToCart = async function(productId, button) {
            origAddToCart(productId, button);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                try {
                    await fetch('http://localhost:5002/api/products/interactions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUser.id, type: 'cart', productId: productId })
                    });
                } catch(err) { console.error('Cart tracking failed', err); }
            }
        };
    }

    if (typeof window.toggleWishlist === 'function') {
        const origToggleWishlist = window.toggleWishlist;
        window.toggleWishlist = async function(productId, element) {
            origToggleWishlist(productId, element);
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                try {
                    await fetch('http://localhost:5002/api/products/interactions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUser.id, type: 'wishlist', productId: productId })
                    });
                } catch(err) { console.error('Wishlist tracking failed', err); }
            }
        };
    }
    
    // Auth Form Overrides
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            try {
                const res = await fetch('http://localhost:5001/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: data.user.id,
                        firstName: data.user.name,
                        role: data.user.role,
                        token: data.token
                    }));
                    window.location.href = 'index.html';
                } else {
                    alert('Login failed: ' + data.message);
                }
            } catch(err) {
                alert('Backend error: Could not reach auth service.');
            }
        });
    }

    // Dynamic Product Fetching (NO recommendations)
    async function loadDynamicProducts() {
        const gridId = document.getElementById('featuredProductsGrid') ? 'featuredProductsGrid' : 
                       (document.getElementById('shopProductsGrid') ? 'shopProductsGrid' : null);
                       
        if (!gridId) return; // We are not on a page that renders products
        
        try {
            const grid = document.getElementById(gridId);
            grid.innerHTML = '<div class="text-center w-100 py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">Loading products...</p></div>';

            // 1. Fetch all products from Product Service
            const prodRes = await fetch('http://localhost:5002/api/products');
            let products = await prodRes.json();
            
            // 2. Determine Category Filter (if on shop.html)
            const urlParams = new URLSearchParams(window.location.search);
            const categoryFilter = urlParams.get('category');
            
            if (categoryFilter) {
                // Filter products by category (case insensitive partial match or exact)
                products = products.filter(p => p.category && p.category.toLowerCase().includes(categoryFilter.toLowerCase()));
            }

            // 3. Render
            // We use the existing createProductHTML function if it exists on the window object
            if (typeof window.createProductHTML === 'function') {
                grid.innerHTML = '';
                if (products.length === 0) {
                    grid.innerHTML = '<div class="text-center w-100 py-5"><h3>No products found</h3></div>';
                    return;
                }
                
                products.forEach((product, index) => {
                    let html = window.createProductHTML(product);
                    
                    if (gridId === 'featuredProductsGrid') {
                        grid.innerHTML += `<div class="col-lg-3 col-md-4 col-sm-6 mb-4">${html}</div>`;
                    } else {
                        grid.innerHTML += html; // shop grid handles classes differently in createProductHTML
                    }
                });
                
                if (typeof window.setupProductInteractions === 'function') window.setupProductInteractions();
                if (typeof window.updateAllCartButtons === 'function') window.updateAllCartButtons();
                
            } else {
                console.error('createProductHTML function not found on page.');
            }
            
            // Update page titles if category exists
            if (categoryFilter) {
                const titles = document.querySelectorAll('.section-title h2, .breadcrumb-item.active');
                titles.forEach(t => t.textContent = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1) + " Fashion");
            }
            
        } catch (err) {
            console.error(err);
        }
    }
    
    // Execute dynamic load
    loadDynamicProducts();

}, 100);
