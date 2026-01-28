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
    this.products = [];
    this.apiUrl = this.getApiUrl();
    console.log('ProductManager initialized with API URL:', this.apiUrl);
    this.loadProducts();
  }
  
  getApiUrl() {
    // Use the global API_URL if available
    if (window.API_URL) {
      return window.API_URL;
    }
    
    // Fallback logic
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    } else if (hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\./)) {
      return `http://${hostname}:5000/api`;
    } else {
      return '/api';
    }
  }
  
  async loadProducts() {
    try {
      console.log('Loading products from:', `${this.apiUrl}/products`);
      const response = await fetch(`${this.apiUrl}/products`);
      console.log('Products response status:', response.status);
      
      if (response.ok) {
        this.products = await response.json();
        console.log('Loaded products:', this.products.length);
      } else {
        console.warn('Failed to load products from API, using fallback');
        // Fallback to default products if API fails
        this.products = [...PRODUCTS];
      }
    } catch (error) {
      console.error('Error loading products from API:', error);
      // Fallback to default products
      this.products = [...PRODUCTS];
    }
    
    // Render products table if on dashboard
    if (document.getElementById('products-table-body')) {
      renderProductsTable();
    }
  }
  
  async addProduct(productData) {
    try {
      const token = localStorage.getItem('nutriToken');
      console.log('Adding product with token:', token ? 'Present' : 'Missing');
      console.log('Product data:', productData);
      console.log('API URL:', `${this.apiUrl}/products`);
      
      if (!token) {
        // Show a more helpful error message
        showError('Please login as a user first to manage products');
        console.error('No JWT token found. Admin must login as a user to get API access.');
        
        // Show a dialog with login link
        if (confirm('You need to login as a user to manage products. Would you like to login now?')) {
          window.location.href = '../login.html?redirect=admin/dashboard.html';
        }
        return null;
      }

      const response = await fetch(`${this.apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      console.log('Add product response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        
        let errorMessage = 'Failed to add product';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        showError(errorMessage);
        return null;
      }
      
      const responseData = await response.json();
      console.log('Add product response data:', responseData);
      this.products.push(responseData);
      return responseData;
      
    } catch (error) {
      console.error('Error adding product:', error);
      showError('Failed to add product: ' + error.message);
      return null;
    }
  }
  
  async updateProduct(id, productData) {
    try {
      const token = localStorage.getItem('nutriToken');
      if (!token) {
        showError('Please login to update products');
        return false;
      }

      const response = await fetch(`${window.API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        return true;
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to update product');
        return false;
      }
    } catch (error) {
      console.error('Error updating product:', error);
      showError('Failed to update product');
      return false;
    }
  }
  
  async deleteProduct(id) {
    try {
      const token = localStorage.getItem('nutriToken');
      if (!token) {
        showError('Please login to delete products');
        return false;
      }

      const response = await fetch(`${window.API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products.splice(index, 1);
        }
        return true;
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to delete product');
        return false;
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showError('Failed to delete product');
      return false;
    }
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
async function handleAddProduct(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  let imagePath = formData.get('image') || 'images/nutrikitchen.jpg';
  
  // Check if there's an uploaded image file
  if (window.uploadedImageFile) {
    try {
      // Convert image to base64 and store it
      const base64Image = await fileToBase64(window.uploadedImageFile);
      
      // Store the base64 image in localStorage with the filename as key
      const imageKey = `product_image_${window.uploadedImageFile.name}`;
      localStorage.setItem(imageKey, base64Image);
      
      // Use the image path that was set during upload
      imagePath = formData.get('image');
      
      showSuccess('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Failed to upload image. Using default path.');
    }
  }
  
  const productData = {
    name: formData.get('name'),
    category: formData.get('category'),
    price: parseFloat(formData.get('price')),
    originalPrice: parseFloat(formData.get('originalPrice')),
    description: formData.get('description'),
    features: formData.get('features').split('\n').filter(f => f.trim()),
    image: imagePath,
    weight: formData.get('weight'),
    inStock: true,
    rating: 0,
    reviews: 0
  };
  
  const newProduct = await productManager.addProduct(productData);
  
  if (newProduct) {
    showSuccess('Product added successfully!');
    
    // Reset form and clear uploaded image
    form.reset();
    window.uploadedImageFile = null;
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('preview-img').src = '';
    
    renderProductsTable();
    
    // Update total products count
    document.getElementById('total-products').textContent = productManager.getProducts().length;
  }
  
  return false;
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Delete product with confirmation
async function deleteProductConfirm(id) {
  const product = productManager.getProduct(id);
  const confirmed = await showConfirm(`Are you sure you want to delete "${product.name}"?`);
  if (confirmed) {
    const success = await productManager.deleteProduct(id);
    if (success) {
      showSuccess('Product deleted successfully!');
      renderProductsTable();
      
      // Update total products count
      document.getElementById('total-products').textContent = productManager.getProducts().length;
    }
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
