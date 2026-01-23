// ==========================================
// Nutri Kitchen - Main JavaScript
// Parallax, Lazy Loading, Menu Animations
// ==========================================

// ===== Navigation Menu =====
class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.menuToggle = document.querySelector('.menu-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    
    this.init();
  }
  
  init() {
    if (!this.navbar) return;
    
    // Attach event listeners
    this.handleScroll();
    window.addEventListener('scroll', () => this.handleScroll());
    
    if (this.menuToggle && this.navMenu) {
      this.menuToggle.addEventListener('click', () => this.toggleMenu());
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!this.navMenu.contains(e.target) && !this.menuToggle.contains(e.target)) {
          this.closeMenu();
        }
      });
      
      // Close menu when clicking nav links
      this.navLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });
    }
    
    // Set active link based on current page
    this.setActiveLink();
  }
  
  handleScroll() {
    if (window.scrollY > 100) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }
  
  toggleMenu() {
    this.menuToggle.classList.toggle('active');
    this.navMenu.classList.toggle('active');
    
    // Animate menu items
    if (this.navMenu.classList.contains('active')) {
      this.animateMenuItems();
    }
  }
  
  closeMenu() {
    this.menuToggle.classList.remove('active');
    this.navMenu.classList.remove('active');
  }
  
  animateMenuItems() {
    const menuItems = this.navMenu.querySelectorAll('li');
    menuItems.forEach((item, index) => {
      item.style.animation = 'none';
      setTimeout(() => {
        item.style.animation = `fadeInLeft 0.5s ease-out ${index * 0.1}s forwards`;
      }, 10);
    });
  }
  
  setActiveLink() {
    const currentPath = window.location.pathname;
    this.navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath.split('/').pop() || 
          (currentPath.includes(link.getAttribute('href')) && link.getAttribute('href') !== '#')) {
        link.classList.add('active');
      }
    });
  }
}

// ===== Parallax Scrolling =====
class ParallaxEffect {
  constructor() {
    this.parallaxElements = document.querySelectorAll('.parallax');
    this.init();
  }
  
  init() {
    if (this.parallaxElements.length === 0) return;
    
    window.addEventListener('scroll', () => this.handleScroll());
    this.handleScroll(); // Initial call
  }
  
  handleScroll() {
    const scrolled = window.pageYOffset;
    
    this.parallaxElements.forEach(element => {
      const speed = element.dataset.speed || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
    
    // Hero parallax effect
    const hero = document.querySelector('.hero');
    if (hero) {
      const heroContent = hero.querySelector('.hero-content');
      if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
      }
    }
  }
}

// ===== Lazy Loading Images =====
class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src], .lazy-image');
    this.init();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.01
      });
      
      this.images.forEach(img => this.observer.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      this.images.forEach(img => this.loadImage(img));
    }
  }
  
  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
    
    img.classList.add('loaded');
    if (this.observer) {
      this.observer.unobserve(img);
    }
  }
  
  reload() {
    this.images = document.querySelectorAll('img[data-src], .lazy-image:not(.loaded)');
    this.images.forEach(img => this.observer.observe(img));
  }
}

// ===== Scroll Reveal Animations =====
class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    this.init();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });
      
      this.elements.forEach(el => this.observer.observe(el));
    } else {
      // Fallback: make all elements visible
      this.elements.forEach(el => el.classList.add('active'));
    }
  }
  
  reload() {
    this.elements = document.querySelectorAll('.reveal:not(.active), .reveal-left:not(.active), .reveal-right:not(.active), .reveal-scale:not(.active)');
    this.elements.forEach(el => this.observer.observe(el));
  }
}

// ===== Smooth Scrolling =====
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 80; // Account for fixed navbar
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== Scroll Progress Bar =====
class ScrollProgress {
  constructor() {
    this.progressBar = this.createProgressBar();
    this.init();
  }
  
  createProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    return bar;
  }
  
  init() {
    window.addEventListener('scroll', () => this.updateProgress());
    this.updateProgress();
  }
  
  updateProgress() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.pageYOffset / scrollHeight) * 100;
    this.progressBar.style.width = `${scrolled}%`;
  }
}

// ===== Back to Top Button =====
function createBackToTop() {
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="white"/>
    </svg>
  `;
  button.setAttribute('aria-label', 'Back to top');
  button.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-green), var(--primary-dark));
    color: white;
    border: none;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    transition: all var(--transition-base);
  `;
  
  document.body.appendChild(button);
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      button.style.display = 'flex';
    } else {
      button.style.display = 'none';
    }
  });
  
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
  });
}

// ===== Loading Animation =====
function showPageLoader() {
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = `
    <div class="spinner"></div>
  `;
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  
  document.body.appendChild(loader);
  
  const fadeOut = (source) => {
    if (loader.getAttribute('data-fading')) return;
    loader.setAttribute('data-fading', 'true');
    console.log(`Fading out page loader (Trigger: ${source})`);
    
    loader.style.transition = 'opacity 0.4s ease-out';
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.remove();
      console.log('Page loader removed from DOM');
    }, 450);
  };

  // Multiple triggers for reliability
  window.addEventListener('load', () => fadeOut('window.load'));
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => fadeOut('domContentLoaded'), 1000));
  
  // High-speed fallback
  if (document.readyState === 'complete') {
    fadeOut('immediate');
  } else {
    // Ensuring it always disappears after 2 seconds max
    setTimeout(() => fadeOut('timeout_fallback'), 2000);
  }
}

// ===== Toast Notification Styles =====
function addToastStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .toast {
      position: fixed;
      top: 100px;
      right: 20px;
      background: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 250px;
    }
    
    .toast-success { border-left: 4px solid var(--success); }
    .toast-error { border-left: 4px solid var(--error); }
    .toast-info { border-left: 4px solid var(--info); }
    
    .toast-icon {
      font-size: 20px;
      font-weight: bold;
    }
    
    .toast-success .toast-icon { color: var(--success); }
    .toast-error .toast-icon { color: var(--error); }
    .toast-info .toast-icon { color: var(--info); }
    
    .toast-message {
      color: var(--black);
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .toast {
        right: 10px;
        left: 10px;
        min-width: auto;
      }
    }
  `;
  document.head.appendChild(style);
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
  // Show loading animation
  showPageLoader();
  
  // Initialize components
  window.navigation = new Navigation();
  window.parallax = new ParallaxEffect();
  window.lazyLoader = new LazyLoader();
  window.scrollReveal = new ScrollReveal();
  window.scrollProgress = new ScrollProgress();
  
  // Initialize smooth scrolling
  initSmoothScrolling();
  
  // Create back to top button
  createBackToTop();
  
  // Add toast styles
  addToastStyles();
  
  // Track page view
  if (window.Analytics) {
    Analytics.trackPageView(window.location.pathname, document.title);
  }
  
  console.log('Nutri Kitchen initialized successfully');
});

// Export for global use
if (typeof window !== 'undefined') {
  window.LazyLoader = LazyLoader;
  window.ScrollReveal = ScrollReveal;
}

// Handle dynamic content loading
function reloadDynamicFeatures() {
  if (window.lazyLoader) window.lazyLoader.reload();
  if (window.scrollReveal) window.scrollReveal.reload();
}

window.reloadDynamicFeatures = reloadDynamicFeatures;
