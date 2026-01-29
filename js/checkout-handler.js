// ==========================================
// Nutri Kitchen - Checkout Functionality (Razorpay Integrated)
// ==========================================

console.log('--- checkout.js file loaded ---');

var API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api'; // Use relative path for production

// Show loading overlay
function showLoadingOverlay(message = 'Processing your order...') {
  const overlay = document.createElement('div');
  overlay.id = 'checkout-loading-overlay';
  overlay.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
      <div style="background: white; padding: 40px 60px; border-radius: 16px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-width: 500px; animation: fadeInScale 0.3s ease-out;">
        <div style="width: 60px; height: 60px; border: 4px solid #f3f3f3; border-top: 4px solid #4CAF50; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
        <h3 style="color: #333; margin-bottom: 10px; font-size: 1.5rem;">${message}</h3>
        <p style="color: #666; font-size: 0.95rem;">Please wait while we confirm your payment...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    </style>
  `;
  document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoadingOverlay() {
  const overlay = document.getElementById('checkout-loading-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => overlay.remove(), 300);
  }
}

// Process checkout
async function processCheckout(event) {
  event.preventDefault();
  
  if (!window.auth.isLoggedIn()) {
    await showAlert('Please login to place an order', 'warning');
    window.location.href = 'login.html';
    return false;
  }

  const form = event.target;
  const formData = new FormData(form);
  
  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }
  
  // Get cart info  
  if (!window.cart) {
    await showAlert('Cart not found. Please refresh the page.', 'error');
    return false;
  }

  const cartItems = window.cart.getItems();
  const total = window.cart.getTotal();
  
  if (cartItems.length === 0) {
    await showAlert('Your cart is empty!', 'warning');
    window.location.href = 'products.html';
    return false;
  }
  
  // Show loading overlay
  showLoadingOverlay('Creating your order...');
  
  try {
    // 1. Create Order in Backend
    const orderResponse = await fetch(`${API_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('nutriToken')}`
      },
      body: JSON.stringify({
        amount: total,
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingDetails: {
          fullName: formData.get('fullName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          city: formData.get('city'),
          state: formData.get('state'),
          pincode: formData.get('pincode')
        }
      })
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      hideLoadingOverlay();
      throw new Error(orderData.message || 'Failed to create order');
    }

    // Update loading message
    hideLoadingOverlay();
    showLoadingOverlay('Opening payment gateway...');

    // 2. Open Razorpay Checkout
    const options = {
      key: "rzp_live_S66SCmE0sBs0xF", // Live Razorpay Key ID
      amount: orderData.amount,
      currency: "INR",
      name: "Nutri Kitchen",
      description: "Organic Millet Products",
      order_id: orderData.orderId,
      handler: async function (response) {
        // Update loading message for verification
        hideLoadingOverlay();
        showLoadingOverlay('Verifying your payment...');
        
        // 3. Verify Payment
        const verifyResponse = await fetch(`${API_URL}/orders/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok) {
          // Update loading message for final step
          hideLoadingOverlay();
          showLoadingOverlay('Sending confirmation email...');
          
          // Small delay to show the message
          setTimeout(() => {
            hideLoadingOverlay();
            showSuccessMessage(orderData.orderId, formData);
            window.cart.clearCart();
          }, 1500);
        } else {
          hideLoadingOverlay();
          showAlert('Payment verification failed: ' + verifyData.message, 'error');
        }
      },
      prefill: {
        name: formData.get('fullName'),
        email: formData.get('email'),
        contact: formData.get('phone')
      },
      theme: {
        color: "#4CAF50"
      },
      modal: {
        ondismiss: function() {
          hideLoadingOverlay();
        }
      }
    };

    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function (response){
      hideLoadingOverlay();
      showAlert("Payment Failed: " + response.error.description, 'error');
    });
    
    // Hide loading before opening Razorpay
    hideLoadingOverlay();
    rzp.open();

  } catch (error) {
    console.error('Checkout error:', error);
    hideLoadingOverlay();
    showAlert('Checkout error: ' + error.message, 'error');
  }
  
  return false;
}

// Show success message
function showSuccessMessage(orderId, formData) {
  const customerName = formData.get('fullName');
  const email = formData.get('email');
  
  const successHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 60vh;">
      <div style="text-align: center; padding: var(--space-3xl); max-width: 800px; margin: 0 auto;">
        <div style="font-size: 5rem; margin-bottom: var(--space-lg);">✅</div>
        <h2 style="color: var(--success); margin-bottom: var(--space-md);">Order Placed Successfully!</h2>
        <p style="font-size: var(--text-lg); margin-bottom: var(--space-lg);">
          Thank you, <strong>${customerName}</strong>!<br>
          Your order <strong>#${orderId}</strong> has been confirmed.
        </p>
        <p style="margin-bottom: var(--space-xl);">
          A confirmation email has been sent to <strong>${email}</strong>
        </p>
        <div style="display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
          <a href="profile.html" class="btn btn-primary btn-lg">View My Orders</a>
          <a href="index.html" class="btn btn-outline btn-lg">Go to Home</a>
        </div>
      </div>
    </div>
  `;
  
  const container = document.querySelector('.checkout-container');
  if (container) {
    container.innerHTML = successHTML;
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
  }
  
  // Keep checkout header/banner visible - don't hide it
  // const header = document.querySelector('.checkout-header');
  // if (header) header.style.display = 'none';

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update order summary on checkout page
window.updateCheckoutSummary = function updateCheckoutSummary() {
  console.log('--- updateCheckoutSummary execution started ---');
  
  try {
    // 1. Ensure Cart is available and loaded
    if (!window.cart) {
      if (window.ShoppingCart) {
        console.log('Cart object missing, creating new one...');
        window.cart = new ShoppingCart();
      } else {
        console.error('CRITICAL: ShoppingCart class not found');
        return;
      }
    }

    // Force a fresh load from storage to ensure we have the absolute latest
    window.cart.loadCart();

    const items = window.cart.getItems() || [];
    const itemCount = window.cart.getItemCount();
    console.log(`Syncing summary: Found ${items.length} unique items, Total quantity: ${itemCount}`);
    
    // 2. Identify and Validate DOM Elements
    const summaryList = document.getElementById('checkout-summary-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');

    if (!summaryList) {
      console.warn('summaryList element missing from DOM');
    }
    
    const currency = (window.SITE_CONFIG && window.SITE_CONFIG.currency) || '₹';

    // 3. Render Items List
    if (items.length === 0) {
      if (summaryList) {
        summaryList.innerHTML = `
          <div style="padding: 20px; background: #fff5f5; color: #c53030; border-radius: 8px; text-align: center; border: 1px dashed #feb2b2;">
            <p style="margin-bottom: 10px; font-weight: 600;">Your cart is currently empty.</p>
            <a href="products.html" class="btn btn-sm btn-outline" style="text-transform: none;">Return to Shop</a>
          </div>
        `;
      }
    } else {
      let itemsHTML = '';
      items.forEach(item => {
        if (!item || !item.product) return;
        const sub = (Number(item.product.price) || 0) * (Number(item.quantity) || 0);
        itemsHTML += `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #edf2f7; animation: fadeIn 0.3s ease-out;">
            <div style="flex: 1; padding-right: 15px;">
              <div style="font-weight: 700; color: #2d3748; font-size: 0.95rem;">${item.product.name}</div>
              <div style="font-size: 0.85rem; color: #718096; margin-top: 2px;">
                ${item.quantity} × ${currency}${item.product.price}
                ${item.product.weight ? `<span style="margin-left: 8px; padding: 2px 6px; background: #f7fafc; border-radius: 4px; font-size: 0.8em;">${item.product.weight}</span>` : ''}
              </div>
            </div>
            <div style="font-weight: 800; color: #2d3748; white-space: nowrap;">${currency}${sub}</div>
          </div>
        `;
      });
      if (summaryList) summaryList.innerHTML = itemsHTML;
    }
    
    // 4. Update Totals with Defensive Calculation
    let subtotal = 0;
    try {
      subtotal = window.cart.getSubtotal();
    } catch (e) {
      console.error('Error calling getSubtotal:', e);
    }
    
    const shipping = window.cart.getShipping();
    const tax = window.cart.getTax();
    const total = window.cart.getTotal();

    console.log(`[UI UPDATE] Values to write: Sub=${subtotal}, Ship=${shipping}, Tax=${tax}, Total=${total}`);
    
    // Detailed Item Log
    items.forEach((item, idx) => {
       console.log(`Item ${idx}: ${item.product.name}, Price=${item.product.price}, Qty=${item.quantity}, Sub=${item.product.price * item.quantity}`);
    });

    if (subtotalEl) {
      const formattedSubtotal = `${currency}${Math.round(subtotal)}`;
      subtotalEl.innerHTML = formattedSubtotal;
      console.log('Successfully updated subtotalEl to:', subtotalEl.innerHTML);
    }
    if (shippingEl) {
      shippingEl.innerHTML = (shipping === 0 ? 'FREE' : `${currency}${Math.round(shipping)}`);
      if (shipping === 0) shippingEl.style.color = '#27ae60'; 
      else shippingEl.style.color = '#2d3748';
    }
    if (taxEl) taxEl.innerHTML = `${currency}${Math.round(tax)}`;
    if (totalEl) {
      totalEl.innerHTML = `${currency}${Math.round(total)}`;
      console.log('Successfully updated totalEl to:', totalEl.innerHTML);
    }
    
    // Safety check for logic
    if (subtotal === 0 && items.length > 0) {
      console.warn('CRITICAL: Items present but subtotal is 0');
    }

    console.log('--- updateCheckoutSummary successful ---');
  } catch (err) {
    console.error('FATAL Error in updateCheckoutSummary:', err);
  }
}

// Initialize checkout page
window.initCheckoutPage = function initCheckoutPage() {
  console.log('--- initCheckoutPage called ---');
  
  const form = document.getElementById('checkout-form');
  if (!form) {
    if (typeof initAttempts !== 'undefined' && initAttempts < 5) {
      console.log('Checkout form not found yet, retrying...');
    }
    return;
  }

  // Ensure cart is available
  if (!window.cart && window.ShoppingCart) {
    console.log('Cart object missing, re-initializing...');
    window.cart = new ShoppingCart();
  } else if (!window.cart && !window.ShoppingCart) {
    console.error('CRITICAL: Cart and ShoppingCart class both missing');
    return;
  }

  // Initial Summary Update
  window.updateCheckoutSummary();
  
  // Setup form submission if not already done
  if (!form.hasAttribute('data-initialized')) {
    form.addEventListener('submit', processCheckout);
    form.setAttribute('data-initialized', 'true');
    console.log('Form submission handler attached');
  }

  // Prefill user details if available
  if (window.auth && window.auth.isLoggedIn()) {
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    if (nameInput && !nameInput.value) nameInput.value = (window.auth.user && window.auth.user.name) || '';
    if (emailInput && !emailInput.value) emailInput.value = (window.auth.user && window.auth.user.email) || '';
  }
}

// Run initialization on multiple events to be safe
const initEvents = ['DOMContentLoaded', 'load', 'pageshow'];
initEvents.forEach(event => {
  window.addEventListener(event, window.initCheckoutPage);
});

// Immediate execution check
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  console.log('Document ready, running initCheckoutPage immediately');
  window.initCheckoutPage();
  // Also run updateCheckoutSummary immediately
  setTimeout(() => window.updateCheckoutSummary(), 100);
}

// Periodic check for cart readiness and UI sync
let initAttempts = 0;
const intervalId = setInterval(() => {
  initAttempts++;
  
  const subtotalEl = document.getElementById('checkout-subtotal');
  // Safer check: only consider it zero if the innerText is literally ₹0 or 0
  const currentVal = subtotalEl ? subtotalEl.innerText.trim() : '';
  const isZero = !subtotalEl || currentVal === '₹0' || currentVal === '0' || currentVal === '';
  
  if (initAttempts % 2 === 0) {
    const rawStorage = localStorage.getItem('nutriKitchenCart');
    const storageCount = rawStorage ? JSON.parse(rawStorage).length : 0;
    const cartCount = window.cart ? window.cart.getItems().length : 'N/A';
    console.log(`Debug Sync [Atmp ${initAttempts}]: Cart Items=${cartCount}, Storage Items=${storageCount}, UI Zero=${isZero}`);
    
    if (cartCount === 0 && storageCount > 0 && window.cart) {
      console.log('Detected mismatch! Forcing cart reload from storage');
      window.cart.loadCart();
    }
  }

  if (window.cart && window.cart.getItems().length > 0) {
    if (isZero || initAttempts < 3) {
      console.log(`Syncing Checkout Summary: Attempt ${initAttempts}, UI was ${isZero ? 'zero' : 'partially loaded'}`);
      window.updateCheckoutSummary();
    }
    // Stop if we have a valid summary and have tried enough times
    if (!isZero && initAttempts > 8) {
      console.log('Summary populated and stable, clearing interval');
      clearInterval(intervalId);
    }
  }
  
  if (initAttempts > 20) {
    console.log('Maximum sync attempts reached, clearing interval');
    clearInterval(intervalId);
  }
}, 500);

// Observer for dynamic cart changes if any
window.addEventListener('storage', (e) => {
  if (e.key === 'nutriKitchenCart') {
    console.log('Syncing checkout summary due to storage change');
    window.updateCheckoutSummary();
  }
});


