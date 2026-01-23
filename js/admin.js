// ==========================================
// Nutri Kitchen - Admin Panel Functionality
// ==========================================

// Admin Authentication
class AdminAuth {
  constructor() {
    this.checkAuth();
  }
  
  checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginTime = sessionStorage.getItem('adminLoginTime');
    
    // Check if on login page
    if (window.location.pathname.includes('login.html')) {
      if (isLoggedIn && this.isSessionValid(loginTime)) {
        window.location.href = 'dashboard.html';
      }
      return;
    }
    
    // Redirect to login if not authenticated or session expired
    if (!isLoggedIn || !this.isSessionValid(loginTime)) {
      window.location.href = 'login.html';
    }
  }
  
  isSessionValid(loginTime) {
    if (!loginTime) return false;
    const elapsed = Date.now() - parseInt(loginTime);
    return elapsed < ADMIN_CONFIG.sessionTimeout;
  }
  
  login(username, password) {
    if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
      sessionStorage.setItem('adminLoggedIn', 'true');
      sessionStorage.setItem('adminLoginTime', Date.now().toString());
      return true;
    }
    return false;
  }
  
  logout() {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoginTime');
    window.location.href = 'login.html';
  }
}

// Product Management
class ProductManager {
  constructor() {
    this.products = this.loadProducts();
  }
  
  loadProducts() {
    const saved = localStorage.getItem('adminProducts');
    return saved ? JSON.parse(saved) : [...PRODUCTS];
  }
  
  saveProducts() {
    localStorage.setItem('adminProducts', JSON.stringify(this.products));
  }
  
  addProduct(productData) {
    // Generate ID based on max existing ID to avoid duplicates
    const maxId = this.products.reduce((max, p) => Math.max(max, p.id), 0);
    
    const newProduct = {
      id: maxId + 1,
      ...productData,
      inStock: true,
      rating: 0,
      reviews: 0
    };
    
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }
  
  updateProduct(id, productData) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...productData };
      this.saveProducts();
      return true;
    }
    return false;
  }
  
  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveProducts();
      return true;
    }
    return false;
  }
  
  getProducts() {
    return this.products;
  }
  
  getProduct(id) {
    return this.products.find(p => p.id === id);
  }
}

// Initialize admin
const adminAuth = new AdminAuth();
const productManager = new ProductManager();

// Login form handler
function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (adminAuth.login(username, password)) {
    window.location.href = 'dashboard.html';
  } else {
    showError('Invalid username or password');
  }
  
  return false;
}

// Render products table
function renderProductsTable() {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;
  
  const products = productManager.getProducts();
  
  tbody.innerHTML = products.map(product => `
    <tr>
      <td>${product.id}</td>
      <td><img src="../${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>₹${product.price}</td>
      <td>
        <span style="color: ${product.inStock ? 'green' : 'red'};">
          ${product.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm" onclick="editProduct(${product.id})" style="margin-right: 8px;">Edit</button>
        <button class="btn btn-sm" onclick="deleteProductConfirm(${product.id})" style="background: var(--error);">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Handle add product form
function handleAddProduct(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  const productData = {
    name: formData.get('name'),
    category: formData.get('category'),
    price: parseFloat(formData.get('price')),
    originalPrice: parseFloat(formData.get('originalPrice')),
    description: formData.get('description'),
    features: formData.get('features').split('\n').filter(f => f.trim()),
    image: formData.get('image') || 'images/nutrikitchen.jpg',
    weight: formData.get('weight')
  };
  
  productManager.addProduct(productData);
  showSuccess('Product added successfully!');
  form.reset();
  renderProductsTable();
  
  return false;
}

// Delete product with confirmation
function deleteProductConfirm(id) {
  const product = productManager.getProduct(id);
  if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    productManager.deleteProduct(id);
    showSuccess('Product deleted successfully!');
    renderProductsTable();
  }
}

// Show success message
function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">✓</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Show error message
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">✕</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('products-table-body')) {
    renderProductsTable();
  }
  
  // Setup form handlers
  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', handleAddProduct);
  }
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Setup logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => adminAuth.logout());
  }
});

// Export for global use
if (typeof window !== 'undefined') {
  window.adminAuth = adminAuth;
  window.productManager = productManager;
  window.handleLogin = handleLogin;
  window.deleteProductConfirm = deleteProductConfirm;
}

console.log('Admin panel initialized');
console.log('Default credentials - Username: admin, Password: nutrikitchen123');
