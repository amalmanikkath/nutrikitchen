// ==========================================
// Password Field Toggle Functionality
// ==========================================

/**
 * Initialize password toggle for all password fields
 * Wraps password inputs with toggle buttons
 */
function initPasswordToggle() {
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  
  passwordInputs.forEach((input) => {
    // Skip if already wrapped
    if (input.parentElement.classList.contains('password-field-wrapper')) {
      return;
    }
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'password-field-wrapper';
    
    // Insert wrapper before input
    input.parentElement.insertBefore(wrapper, input);
    
    // Move input into wrapper
    wrapper.appendChild(input);
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'password-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
    toggleBtn.innerHTML = getEyeIcon('hidden');
    
    // Add to wrapper
    wrapper.appendChild(toggleBtn);
    
    // Toggle functionality
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggleBtn.innerHTML = getEyeIcon(isPassword ? 'visible' : 'hidden');
    });
  });
}

/**
 * Get eye icon SVG based on visibility state
 */
function getEyeIcon(state) {
  if (state === 'visible') {
    // Eye open icon
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`;
  } else {
    // Eye closed icon
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`;
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPasswordToggle);
} else {
  initPasswordToggle();
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.initPasswordToggle = initPasswordToggle;
}
