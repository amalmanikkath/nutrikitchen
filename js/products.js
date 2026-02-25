// ==========================================
// Nutri Kitchen - Products Page JavaScript
// ==========================================

// Render all products
function renderProducts(productsToShow) {
  // Default to all products if not provided
  if (!productsToShow) {
    productsToShow = window.PRODUCTS || [];
  }
  // Filter out hidden products
  productsToShow = productsToShow.filter(p => !p.hidden);
  
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  
  if (productsToShow.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: var(--space-3xl);">
        <h3>No products found</h3>
        <p>Try adjusting your filters</p>
      </div>
    `;
    return;
  }
  
  productGrid.innerHTML = productsToShow.map(product => `
    <article class="product-card reveal-scale ${product.isComingSoon ? 'coming-soon' : ''}" itemscope itemtype="https://schema.org/Product">
      <div class="product-image-container">
        ${product.isComingSoon ? '<span class="coming-soon-badge">Coming Soon</span>' : ''}
        <img src="${product.image}" 
             alt="${product.name} - ${product.category}" 
             class="product-image lazy-image"
             width="300" 
             height="300"
             loading="lazy"
             decoding="async"
             itemprop="image">
      </div>
      
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name" itemprop="name">${product.name}</h3>
        <p class="product-description" itemprop="description">
          <span class="description-short">${product.description.substring(0, 100)}...</span>
          <span class="description-full">${product.description}</span>
          <span class="description-hover-tooltip">${product.description}</span>
        </p>
        
        <div class="product-footer">
          <div class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <span itemprop="price" content="${product.price}">₹${product.price}</span>
            <span class="price-weight-label">(${product.weight})</span>
            <meta itemprop="priceCurrency" content="INR">
            <link itemprop="availability" href="https://schema.org/${product.isComingSoon ? 'OutOfStock' : (product.inStock ? 'InStock' : 'OutOfStock')}">
          </div>
          <div class="shipping-free-badge">🚚 Free Shipping</div>
          ${product.isComingSoon ? 
    `<button class="btn btn-coming-soon btn-sm" onclick="showAlert('This product is coming soon! Stay tuned.', 'info'); return false;">Coming Soon</button>` :
    `<button onclick="quickAddToCart(this, '${product.id}')" class="btn btn-primary btn-sm">Add to Cart</button>`
          }
        </div>
        
        <!-- Structured Data -->
        <meta itemprop="sku" content="NK-${product.id}">
        <span itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating" style="display:none;">
          <meta itemprop="ratingValue" content="${product.rating}">
          <meta itemprop="reviewCount" content="${product.reviews}">
        </span>
      </div>
    </article>
  `).join('');
  
  // Reload lazy loading
  if (window.reloadDynamicFeatures) {
    window.reloadDynamicFeatures();
  }
}

// Filter products by category
function filterByCategory(category) {
  // Ensure PRODUCTS is available and filter out hidden products
  const allProducts = (window.PRODUCTS || []).filter(p => !p.hidden);
  
  console.log('Filtering by:', category);
  
  let filtered;
  if (category === 'all') {
    filtered = allProducts;
  } else {
    filtered = allProducts.filter(p => {
      if (!p.category) return false;
      return p.category.toLowerCase().replace(/\s+/g, '-') === category;
    });
  }
  
  console.log('Found products:', filtered.length);
  renderProducts(filtered);
  
  // Track analytics
  if (window.Analytics) {
    Analytics.trackCategoryView(category);
  }
  
  // Update active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

// Search products
function searchProducts(query) {
  const searchTerm = query.toLowerCase();
  const filtered = PRODUCTS.filter(p => 
    !p.hidden &&
    (p.name.toLowerCase().includes(searchTerm) ||
    p.description.toLowerCase().includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm))
  );
  
  renderProducts(filtered);
  
  // Track analytics
  if (window.Analytics && query) {
    Analytics.trackSearch(query);
  }
}

// Sort products
function sortProducts(sortBy) {
  let sorted = [...PRODUCTS].filter(p => !p.hidden);
  
  switch(sortBy) {
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // Default order
      break;
  }
  
  renderProducts(sorted);
}

// Initialize products page
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('product-grid')) return;
  
  // Render all products initially
  renderProducts();
  
  // Setup search
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchProducts(e.target.value);
    });
  }
  
  // Setup sort
  const sortSelect = document.getElementById('product-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortProducts(e.target.value);
    });
  }
  
  // Setup filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.currentTarget.dataset.category;
      console.log('Filter clicked:', category);
      filterByCategory(category);
    });
  });
  
  console.log('Products page initialized');
});

// Export functions
if (typeof window !== 'undefined') {
  window.renderProducts = renderProducts;
  window.filterByCategory = filterByCategory;
  window.searchProducts = searchProducts;
  window.sortProducts = sortProducts;
}

// Show description overlay (desktop only)
function showDescriptionOverlay(productName, description) {
  // Check if mobile - if so, do nothing (CSS will handle showing full text)
  if (window.innerWidth <= 768) return;
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'description-overlay';
  overlay.innerHTML = `
    <div class="description-overlay-content">
      <h3>${productName}</h3>
      <p>${description}</p>
      <button class="btn btn-primary btn-sm" onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  
  // Close on overlay click
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  document.body.appendChild(overlay);
  
  // Trigger animation
  setTimeout(() => overlay.classList.add('active'), 10);
}

if (typeof window !== 'undefined') {
  window.showDescriptionOverlay = showDescriptionOverlay;
}
