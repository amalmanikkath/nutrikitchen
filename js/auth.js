// ==========================================
// Nutri Kitchen - Auth Functionality
// ==========================================

var API_URL = window.API_URL || '/api';

class Auth {
  constructor() {
    this.user = this.loadUser();
    this.init();
  }

  loadUser() {
    const user = localStorage.getItem('nutriUser');
    return user ? JSON.parse(user) : null;
  }

  saveUser(user, token) {
    localStorage.setItem('nutriUser', JSON.stringify(user));
    localStorage.setItem('nutriToken', token);
    this.user = user;
  }

  logout() {
    localStorage.removeItem('nutriUser');
    localStorage.removeItem('nutriToken');
    
    // Clear LOCAL cart only (don't sync empty state to server)
    localStorage.removeItem('nutriKitchenCart');
    if (window.cart) {
      window.cart.items = [];
      if (typeof window.cart.updateCartUI === 'function') {
        window.cart.updateCartUI();
      }
    }

    this.user = null;
    window.location.href = 'index.html';
  }

  isLoggedIn() {
    return !!this.user;
  }

  init() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      // Handle OTP send button
      const sendOtpBtn = document.getElementById('send-otp-btn');
      if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', () => this.handleSendOtp());
      }

      // Handle form submission (verify OTP)
      signupForm.addEventListener('submit', (e) => this.handleVerifyOtp(e));

      // Handle resend OTP
      const resendOtpBtn = document.getElementById('resend-otp-btn');
      if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', () => this.handleResendOtp());
      }

      // Handle back button
      const backBtn = document.getElementById('back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => this.showStep1());
      }
      
      // Auto-fill City & State on Pincode entry
      const pincodeInput = document.getElementById('pincode');
      if (pincodeInput) {
        pincodeInput.addEventListener('input', (e) => this.handlePincodeInput(e));
      }

      // Real-time validation check on typing
      const inputs = signupForm.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        ['input', 'change'].forEach(eventType => {
          input.addEventListener(eventType, () => {
            if (input.classList.contains('input-error')) {
              // Only remove error if the input is now valid
              if (this.validateInput(input)) {
                input.classList.remove('input-error');
                const errorText = input.parentNode.querySelector('.error-text');
                if (errorText) errorText.remove();
              }
            }
          });
        });
      });
    }

    this.updateNavbar();
  }

  showMessage(message, type = 'error') {
    const msgDiv = document.getElementById('auth-message');
    if (msgDiv) {
      msgDiv.style.display = 'block';
      msgDiv.textContent = message;
      msgDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
      msgDiv.style.color = type === 'success' ? '#155724' : '#721c24';
      msgDiv.style.borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';
      
      // Scroll to message
      msgDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      alert(message);
    }
  }

  // Clear all previous inline errors
  clearErrors() {
    const errorInputs = document.querySelectorAll('.input-error');
    errorInputs.forEach(input => input.classList.remove('input-error'));
    
    const errorTexts = document.querySelectorAll('.error-text');
    errorTexts.forEach(text => text.remove());
    
    const msgDiv = document.getElementById('auth-message');
    if (msgDiv) msgDiv.style.display = 'none';
  }

  // Show inline error for a specific field
  showFieldError(inputId, message, shouldScroll = false) {
    const input = document.getElementById(inputId);
    if (!input) {
      if (shouldScroll) this.showMessage(message, 'error');
      return;
    }
    
    input.classList.add('input-error');
    
    // For phone field, append error to parent's parent (form-group) to show below flex container
    let errorContainer;
    if (inputId === 'user-phone') {
      // The phone input is inside a flex div, so go up two levels to form-group
      errorContainer = input.parentNode.parentNode;
    } else {
      errorContainer = input.parentNode;
    }
    
    // Check if error text already exists
    let errorText = errorContainer.querySelector('.error-text');
    if (!errorText) {
      errorText = document.createElement('small');
      errorText.className = 'error-text';
      errorContainer.appendChild(errorText);
    }
    errorText.textContent = message;
    
    // Smooth scroll to the error if requested
    if (shouldScroll) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  async handlePincodeInput(e) {
    const pincode = e.target.value;
    if (pincode.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        
        if (data && data[0].Status === 'Success') {
          const details = data[0].PostOffice[0];
          
          // Auto-fill City
          const cityInput = document.getElementById('city');
          if (cityInput) {
            cityInput.removeAttribute('readonly'); // Temporarily enable
            cityInput.value = details.District;
            // Manually trigger input event to clear validation errors
            cityInput.dispatchEvent(new Event('input', { bubbles: true }));
            cityInput.setAttribute('readonly', 'true'); // Re-disable
          }
          
          // Auto-fill State
          const stateSelect = document.getElementById('state');
          if (stateSelect) {
            stateSelect.removeAttribute('disabled'); // Temporarily enable
            const apiState = details.State;
            // Try to match API state with select options
            let matched = false;
            for(let i=0; i<stateSelect.options.length; i++) {
              if (stateSelect.options[i].value.toLowerCase() === apiState.toLowerCase()) {
                stateSelect.selectedIndex = i;
                matched = true;
                break;
              }
            }
            // If direct match fails, handle specific cases or set to Others
            if (!matched) {
              if (apiState === 'Odisha') {
                // If distinct naming needed
              }
              // Select 'Others' or keep as is if not found
            }
            // Manually trigger change event to clear validation errors
            stateSelect.dispatchEvent(new Event('change', { bubbles: true }));
            stateSelect.setAttribute('disabled', 'true'); // Re-disable
          }
        }
      } catch (error) {
        console.error('Error fetching pincode details:', error);
      }
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        this.saveUser(data.user, data.token);
        
        // Load the server-stored cart immediately
        if (window.cart && typeof window.cart.loadFromServer === 'function') {
          await window.cart.loadFromServer();
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        window.location.href = redirect || 'index.html';
      } else {
        if (response.status === 404) {
          if (confirm(data.message || 'Email not found. Would you like to create a new account?')) {
            window.location.href = 'signup.html';
          }
        } else {
          alert(data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error connecting to server');
    }
  }

  validateInput(input) {
    const value = input.value.trim();
    const id = input.id;
    
    switch(id) {
      case 'name':
        return value.length > 0;
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'user-phone':
        return value.length >= 10;
      case 'address':
        return value.length > 0;
      case 'city':
        return value.length > 0;
      case 'pincode':
        return value.length === 6;
      case 'state':
        return value !== '';
      case 'password':
        return value.length >= 6;
      case 'otp':
        return value.length === 6;
      default:
        return true;
    }
  }

  async handleSendOtp() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const userPhone = document.getElementById('user-phone').value;
    const phone = userPhone ? '+91' + userPhone : '';
    document.getElementById('phone').value = phone; // Store full number in hidden field
    
    // New fields
    const address = document.getElementById('address').value;
    const pincode = document.getElementById('pincode').value;
    const state = document.getElementById('state').value;
    
    const password = document.getElementById('password').value;

    // Clear previous errors
    this.clearErrors();

    // Field-specific validation
    // Field-specific validation
    let isValid = true;
    let firstErrorId = null;

    if (!name.trim()) { 
      isValid = false; 
      this.showFieldError('name', 'Please enter your Full Name', false);
      if (!firstErrorId) firstErrorId = 'name';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) { 
      isValid = false; 
      this.showFieldError('email', 'Please enter a valid Email Address', false);
      if (!firstErrorId) firstErrorId = 'email';
    }

    if (!userPhone.trim() || userPhone.length < 10) { 
      isValid = false; 
      this.showFieldError('user-phone', 'Please enter a valid Phone Number', false);
      if (!firstErrorId) firstErrorId = 'user-phone';
    }

    if (!address.trim()) { 
      isValid = false; 
      this.showFieldError('address', 'Please enter your Address', false);
      if (!firstErrorId) firstErrorId = 'address';
    }
    
    // Check for City input if it exists
    const cityInput = document.getElementById('city');
    if (cityInput && !cityInput.value.trim()) { 
      isValid = false; 
      this.showFieldError('city', 'Please enter your City', false);
      if (!firstErrorId) firstErrorId = 'city';
    }
      
    if (!pincode.trim() || pincode.length !== 6) { 
      isValid = false; 
      this.showFieldError('pincode', 'Please enter a valid 6-digit Pincode', false);
      if (!firstErrorId) firstErrorId = 'pincode';
    }

    if (!state) { 
      isValid = false; 
      this.showFieldError('state', 'Please select your State', false);
      if (!firstErrorId) firstErrorId = 'state';
    }

    if (!password) { 
      isValid = false; 
      this.showFieldError('password', 'Please enter a Password', false);
      if (!firstErrorId) firstErrorId = 'password';
    } else if (password.length < 6) { 
      isValid = false; 
      this.showFieldError('password', 'Password must be at least 6 characters', false);
      if (!firstErrorId) firstErrorId = 'password';
    }

    if (!isValid) {
      // Scroll to the first error found
      if (firstErrorId) {
        const firstInput = document.getElementById(firstErrorId);
        if (firstInput) firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const sendOtpBtn = document.getElementById('send-otp-btn');
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Sending...';

    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, name })
      });

      const data = await response.json();
      if (response.ok) {
        this.showStep2(email);
        this.showMessage(data.message || 'OTP sent successfully!', 'success');
      } else {
        this.showMessage(data.message || 'Failed to send OTP', 'error');
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Send OTP';
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      this.showMessage('Error connecting to server', 'error');
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = 'Send OTP';
    }
  }

  async handleVerifyOtp(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value; // Get from hidden field
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const pincode = document.getElementById('pincode').value;
    const state = document.getElementById('state').value;
    const password = document.getElementById('password').value;
    const otp = document.getElementById('otp').value;

    if (!otp || otp.length !== 6) {
      this.showMessage('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, otp, address, city, pincode, state })
      });

      const data = await response.json();
      if (response.ok) {
        this.saveUser(data.user, data.token);
        this.showMessage('Registration successful!', 'success');
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            window.location.href = redirect || 'index.html';
        }, 1500);
      } else {
        this.showMessage(data.message || 'OTP verification failed', 'error');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      this.showMessage('Error connecting to server', 'error');
    }
  }

  async handleResendOtp() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    const resendOtpBtn = document.getElementById('resend-otp-btn');
    resendOtpBtn.disabled = true;
    resendOtpBtn.textContent = 'Sending...';

    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, name })
      });

      const data = await response.json();
      if (response.ok) {
        this.showMessage(data.message || 'OTP resent successfully!', 'success');
      } else {
        this.showMessage(data.message || 'Failed to resend OTP', 'error');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      this.showMessage('Error connecting to server', 'error');
    } finally {
      resendOtpBtn.disabled = false;
      resendOtpBtn.textContent = 'Resend OTP';
    }
  }

  showStep1() {
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('send-otp-btn').disabled = false;
    document.getElementById('send-otp-btn').textContent = 'Send OTP';
    document.getElementById('otp').value = '';
  }

  showStep2(identifier) {
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
    document.getElementById('verification-display').textContent = identifier;
    document.getElementById('otp').focus();
  }

  updateNavbar() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    // 1. Manage Auth/Profile Link
    let authContainer = document.getElementById('nav-auth-container');
    if (!authContainer) {
      authContainer = document.createElement('li');
      authContainer.id = 'nav-auth-container';
      // Insert before cart icon
      const cartLi = Array.from(navMenu.querySelectorAll('li')).find(li => li.querySelector('.cart-icon'));
      if (cartLi) {
        navMenu.insertBefore(authContainer, cartLi);
      } else {
        navMenu.appendChild(authContainer);
      }
    }

    if (this.isLoggedIn()) {
      const firstName = this.user.name.split(' ')[0];
      authContainer.innerHTML = `
        <a href="profile.html" class="nav-link auth-link" title="My Profile">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="nav-text">Hi, ${firstName}</span>
        </a>
      `;

      // 2. Manage Logout
      let logoutContainer = document.getElementById('nav-logout-container');
      if (!logoutContainer) {
        logoutContainer = document.createElement('li');
        logoutContainer.id = 'nav-logout-container';
        navMenu.appendChild(logoutContainer);
      }
      logoutContainer.innerHTML = `
        <a href="#" class="nav-link logout-link" title="Sign Out">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </a>
      `;
      logoutContainer.querySelector('.logout-link').onclick = (e) => {
        e.preventDefault();
        this.logout();
      };
    } else {
      authContainer.innerHTML = `
        <a href="login.html" class="nav-link auth-link" title="Member Login">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="nav-icon">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span class="nav-text">Sign In</span>
        </a>
      `;
      const logoutContainer = document.getElementById('nav-logout-container');
      if (logoutContainer) logoutContainer.remove();
    }
  }
}

const auth = new Auth();
window.auth = auth;
