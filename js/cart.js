// ==========================================
// Nutri Kitchen - Shopping Cart Functionality
// ==========================================

var API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api'; // Use relative path for production

class ShoppingCart {
  constructor() {
    this.items = [];
    this.loadCart();
    
    // Save the current local item count before server sync
    const localItemCount = this.items.length;
    console.log(`Cart initialized with ${localItemCount} items from localStorage`);
    
    // If logged in, try to fetch the latest cart from server
    // BUT don't let it clear a valid local cart
    if (this.isLoggedIn()) {
      this.loadFromServer(localItemCount);
    }
    
    this.updateCartUI();
  }

  isLoggedIn() {
    return !!localStorage.getItem('nutriToken');
  }
  
  // Load cart from localStorage
  loadCart() {
    const savedCart = localStorage.getItem('nutriKitchenCart');
    if (savedCart) {
      try {
        const loadedItems = JSON.parse(savedCart);

        // Sync with latest product data (prices, etc)
        if (typeof window.PRODUCTS !== 'undefined' && Array.isArray(window.PRODUCTS)) {
          this.items = loadedItems.map(item => {
            const freshProduct = window.PRODUCTS.find(p => p.id === item.product.id);
            if (freshProduct) {
              // Update product data but keep quantity
              return { ...item, product: freshProduct };
            }
            return item;
          });
          console.log('Cart items synced with latest product data');
          // Save back to storage to persist updates
          localStorage.setItem('nutriKitchenCart', JSON.stringify(this.items));
        } else {
          this.items = loadedItems;
        }

        console.log('Cart items loaded from storage:', this.items.length);
      } catch (e) {
        console.error('Error parsing cart from storage:', e);
        this.items = [];
      }
    } else {
      this.items = [];
    }
  }
  
  // Save cart and sync
  saveCart() {
    localStorage.setItem('nutriKitchenCart', JSON.stringify(this.items));
    this.updateCartUI();
    this.syncWithServer();
  }

  // Sync current cart to backend
  async syncWithServer() {
    if (!this.isLoggedIn()) return;
    
    try {
      const token = localStorage.getItem('nutriToken');
      const syncData = {
        items: this.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      await fetch(`${API_URL}/cart/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(syncData)
      });
    } catch (error) {
      console.error('Failed to sync cart with server:', error);
    }
  }

  // Load cart from backend
  async loadFromServer(localItemCount = 0) {
    if (!this.isLoggedIn()) return;

    try {
      console.log('Loading cart from server...');
      const token = localStorage.getItem('nutriToken');
      const response = await fetch(`${API_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.warn('Server cart fetch failed, keeping local cart');
        return; // Keep local cart on error
      }
      
      const serverItems = await response.json();
      console.log('Server cart items received:', serverItems);
      
      // CRITICAL FIX: Only sync from server if server has data OR local was empty
      if (serverItems && serverItems.length > 0) {
        const products = window.PRODUCTS || [];
        console.log(`Reconstructing cart with ${products.length} known products`);
        
        const reconstructedItems = serverItems.map(si => {
          const product = products.find(p => p.id === Number(si.productId));
          if (product) {
            return { product: { ...product }, quantity: Number(si.quantity) };
          }
          console.warn(`Product ID ${si.productId} not found during server sync`);
          return null;
        }).filter(item => item !== null);

        if (reconstructedItems.length > 0) {
          console.log(`Syncing server cart: ${reconstructedItems.length} items successfully reconstructed`);
          this.items = reconstructedItems;
          localStorage.setItem('nutriKitchenCart', JSON.stringify(this.items));
          this.updateCartUI();
        } else {
          console.warn('Server items were found but none could be reconstructed');
        }
      } else if (localItemCount === 0) {
        console.log('Server cart is empty and local cart was empty - staying empty');
      } else {
        console.log(`Server cart is empty but local has ${localItemCount} items - KEEPING LOCAL CART`);
        // Don't clear the cart! Keep what we have locally
      }
    } catch (error) {
      console.error('Error loading cart from server:', error);
      console.log('Keeping local cart due to server error');
      // Keep local cart on error
    }
  }
  
  // Add item to cart
  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        product: { ...product },
        quantity: quantity
      });
    }
    
    this.saveCart();
    this.showNotification(`${product.name} added to cart!`, 'success');
    
    // Track with analytics
    if (window.Analytics) {
      Analytics.trackAddToCart(product, quantity);
    }
    
    return true;
  }
  
  // Remove item from cart
  removeItem(productId) {
    const index = this.items.findIndex(item => item.product.id === productId);
    if (index !== -1) {
      const removedItem = this.items[index];
      
      // Track with analytics
      if (window.Analytics) {
        Analytics.trackRemoveFromCart(removedItem.product, removedItem.quantity);
      }
      
      this.items.splice(index, 1);
      this.saveCart();
      this.showNotification('Item removed from cart', 'info');
      return true;
    }
    return false;
  }
  
  // Update item quantity
  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
      return true;
    }
    return false;
  }
  
  // Get cart items
  getItems() {
    return this.items;
  }
  
  // Get cart count
  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
  
  // Get cart gross total (Sum of Price * Quantity)
  getGrossTotal() {
    if (!this.items || this.items.length === 0) return 0;
    
    return this.items.reduce((total, item) => {
      const price = Number(item.product.price) || 0;
      const qty = Number(item.quantity) || 0;
      return total + (price * qty);
    }, 0);
  }

  // Get cart subtotal (Base Price excluding Tax)
  getSubtotal() {
    const grossTotal = this.getGrossTotal();
    // Assuming 5% GST is INCLUSIVE in the product price
    // Base = Gross / 1.05
    return Math.round(grossTotal / 1.05);
  }
  
  // Calculate shipping
  getShipping() {
    // Shipping is free as per new requirement
    return 0;
  }
  
  // Calculate tax
  getTax() {
    const grossTotal = this.getGrossTotal();
    const subtotal = this.getSubtotal();
    // Tax is the difference between Gross and Base
    return grossTotal - subtotal;
  }
  
  // Get total
  getTotal() {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }
  
  // Clear cart
  clearCart(showNotif = true) {
    this.items = [];
    this.saveCart();
    if (showNotif) {
      this.showNotification('Cart cleared', 'info');
    }
  }
  
  // Update cart UI elements
  updateCartUI() {
    // Update cart count badge
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = this.getItemCount();
    
    cartCountElements.forEach(element => {
      element.textContent = count;
      element.style.display = count > 0 ? 'flex' : 'none';
    });

    // Update floating cart button visibility
    const floatingCartBtn = document.querySelector('.floating-cart-btn');
    if (floatingCartBtn) {
      if (count > 0) floatingCartBtn.classList.add('active');
      else floatingCartBtn.classList.remove('active');
    }
    
    // Update cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
      this.renderCartPage();
      
      // Fix: Reload dynamic features (lazy loading) after re-rendering
      if (window.reloadDynamicFeatures) {
        window.reloadDynamicFeatures();
      }
    }
  }
  
  // Render cart page
  renderCartPage() {
    const cartContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    if (this.items.length === 0) {
      if (emptyCartMessage) emptyCartMessage.style.display = 'block';
      if (cartSummary) cartSummary.style.display = 'none';
      cartContainer.innerHTML = '';
      return;
    }
    
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    // Render cart items
    cartContainer.innerHTML = this.items.map(item => `
      <div class="cart-item" data-product-id="${item.product.id}">
        <div class="cart-item-image">
          <img src="${item.product.image}" 
               alt="${item.product.name}" 
               width="100" 
               height="100" 
               loading="lazy"
               decoding="async"
               style="object-fit: contain;">
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.product.name}</h3>
          <p class="cart-item-category">${item.product.category}</p>
          <p class="cart-item-price">${SITE_CONFIG.currency}${item.product.price}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn minus" onclick="window.cart.updateQuantity('${item.product.id}', ${item.quantity - 1})">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 13H5v-2h14v2z"/></svg>
          </button>
          <input type="number" value="${item.quantity}" min="1" max="99" 
                 onchange="window.cart.updateQuantity('${item.product.id}', parseInt(this.value))">
          <button class="quantity-btn plus" onclick="window.cart.updateQuantity('${item.product.id}', ${item.quantity + 1})">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </button>
        </div>
        <div class="cart-item-total">
          <p>${SITE_CONFIG.currency}${item.product.price * item.quantity}</p>
        </div>
        <button class="cart-item-remove" onclick="window.cart.removeItem('${item.product.id}')" aria-label="Remove item">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    `).join('');
    
    // Update summary
    this.updateCartSummary();
  }
  
  // Update cart summary
  updateCartSummary() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingElement = document.getElementById('cart-shipping');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement) subtotalElement.textContent = `${SITE_CONFIG.currency}${this.getSubtotal()}`;
    if (shippingElement) {
      const shipping = this.getShipping();
      shippingElement.textContent = shipping === 0 ? 'FREE' : `${SITE_CONFIG.currency}${shipping}`;
    }
    if (taxElement) taxElement.textContent = `${SITE_CONFIG.currency}${this.getTax()}`;
    if (totalElement) totalElement.textContent = `${SITE_CONFIG.currency}${this.getTotal()}`;
  }
  
  // Show notification toast
  showNotification(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">
          ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize cart
const cart = new ShoppingCart();

// Make cart globally available
if (typeof window !== 'undefined') {
  window.cart = cart;
}

// Add to cart function for buttons
function addToCart(productId, quantity = 1) {
  const normalizedId = Number(productId);
  const product = PRODUCTS.find(p => p.id === normalizedId);
  if (product) {
    cart.addItem(product, quantity);
  }
}

// Quick add to cart with animation
function quickAddToCart(button, productId) {
  console.log(`quickAddToCart called for product ID: ${productId}`);
  try {
    const normalizedId = Number(productId);
    const product = PRODUCTS.find(p => p.id === normalizedId);
    if (!product) {
      console.error(`Product with ID ${productId} not found in PRODUCTS array`);
      return;
    }
    
    console.log('Adding product to cart object...', product);
    // Add to cart
    cart.addItem(product, 1);
    
    // Animate button
    console.log('Animating button...');
    const originalText = button.innerHTML;
    button.innerHTML = '<span>✓ Added!</span>';
    button.classList.add('added');
    button.disabled = true;
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('added');
      button.disabled = false;
    }, 2000);
    console.log('Product added successfully!');
  } catch (error) {
    console.error('Error in quickAddToCart:', error);
    showAlert('Error adding to cart: ' + error.message, 'error');
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.ShoppingCart = ShoppingCart;
  window.addToCart = addToCart;
  window.quickAddToCart = quickAddToCart;
}

console.log('Shopping cart initialized');
