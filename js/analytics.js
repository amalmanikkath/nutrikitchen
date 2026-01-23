// ==========================================
// Nutri Kitchen - Google Analytics Integration
// ==========================================

// Google Analytics 4 Configuration
const GA_MEASUREMENT_ID = 'G-XKZGYNL1HN'; // Replace with your actual GA4 Measurement ID

// Initialize Google Analytics
(function() {
  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  
  // Configure GA4
  gtag('config', GA_MEASUREMENT_ID, {
    'send_page_view': true,
    'cookie_flags': 'SameSite=None;Secure'
  });

  // Make gtag globally available
  window.gtag = gtag;
})();

// Analytics Event Tracking Functions

// Track page views
function trackPageView(pagePath, pageTitle) {
  if (window.gtag) {
    gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle
    });
  }
}

// Track product views
function trackProductView(product) {
  if (window.gtag) {
    gtag('event', 'view_item', {
      currency: 'INR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: 1
      }]
    });
  }
}

// Track add to cart
function trackAddToCart(product, quantity = 1) {
  if (window.gtag) {
    gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: quantity
      }]
    });
  }
  
  console.log('Analytics: Add to cart tracked', product.name);
}

// Track remove from cart
function trackRemoveFromCart(product, quantity = 1) {
  if (window.gtag) {
    gtag('event', 'remove_from_cart', {
      currency: 'INR',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: quantity
      }]
    });
  }
}

// Track begin checkout
function trackBeginCheckout(cartItems, totalValue) {
  if (window.gtag) {
    const items = cartItems.map(item => ({
      item_id: item.product.id,
      item_name: item.product.name,
      item_category: item.product.category,
      price: item.product.price,
      quantity: item.quantity
    }));
    
    gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: totalValue,
      items: items
    });
  }
}

// Track purchase
function trackPurchase(orderId, cartItems, totalValue, tax, shipping) {
  if (window.gtag) {
    const items = cartItems.map(item => ({
      item_id: item.product.id,
      item_name: item.product.name,
      item_category: item.product.category,
      price: item.product.price,
      quantity: item.quantity
    }));
    
    gtag('event', 'purchase', {
      transaction_id: orderId,
      currency: 'INR',
      value: totalValue,
      tax: tax,
      shipping: shipping,
      items: items
    });
  }
  
  console.log('Analytics: Purchase tracked', orderId);
}

// Track search
function trackSearch(searchTerm) {
  if (window.gtag) {
    gtag('event', 'search', {
      search_term: searchTerm
    });
  }
}

// Track category view
function trackCategoryView(categoryName) {
  if (window.gtag) {
    gtag('event', 'view_item_list', {
      item_list_name: categoryName
    });
  }
}

// Track user interactions
function trackUserInteraction(action, category, label, value) {
  if (window.gtag) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
}

// Track carousel interactions
function trackCarouselSlide(slideNumber, productName) {
  trackUserInteraction('carousel_slide', 'Engagement', productName, slideNumber);
}

// Track button clicks
function trackButtonClick(buttonName, location) {
  trackUserInteraction('button_click', 'Engagement', `${buttonName} - ${location}`, null);
}

// Track scroll depth
(function() {
  let maxScroll = 0;
  let tracked25 = false;
  let tracked50 = false;
  let tracked75 = false;
  let tracked100 = false;

  window.addEventListener('scroll', function() {
    const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    
    if (scrollPercentage > maxScroll) {
      maxScroll = scrollPercentage;
      
      if (maxScroll >= 25 && !tracked25) {
        trackUserInteraction('scroll_depth', 'Engagement', '25%', 25);
        tracked25 = true;
      }
      if (maxScroll >= 50 && !tracked50) {
        trackUserInteraction('scroll_depth', 'Engagement', '50%', 50);
        tracked50 = true;
      }
      if (maxScroll >= 75 && !tracked75) {
        trackUserInteraction('scroll_depth', 'Engagement', '75%', 75);
        tracked75 = true;
      }
      if (maxScroll >= 95 && !tracked100) {
        trackUserInteraction('scroll_depth', 'Engagement', '100%', 100);
        tracked100 = true;
      }
    }
  });
})();

// Track time on page
(function() {
  let startTime = Date.now();
  
  window.addEventListener('beforeunload', function() {
    const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
    trackUserInteraction('time_on_page', 'Engagement', document.title, timeOnPage);
  });
})();

// Track external links
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.hostname !== window.location.hostname) {
    trackUserInteraction('outbound_click', 'Navigation', link.href, null);
  }
});

// Track form submissions
function trackFormSubmission(formName, success = true) {
  trackUserInteraction('form_submission', 'Conversion', formName, success ? 1 : 0);
}

// Track newsletter signup
function trackNewsletterSignup(email) {
  if (window.gtag) {
    gtag('event', 'sign_up', {
      method: 'Newsletter'
    });
  }
}

// Track social shares
function trackSocialShare(platform, url) {
  trackUserInteraction('social_share', 'Engagement', platform, null);
}

// Track video plays (if you add product videos later)
function trackVideoPlay(videoName) {
  trackUserInteraction('video_play', 'Engagement', videoName, null);
}

// Track error events
function trackError(errorMessage, errorType) {
  trackUserInteraction('error', 'Technical', `${errorType}: ${errorMessage}`, null);
}

// E-commerce Enhanced Events
const AnalyticsEcommerce = {
  viewItem: trackProductView,
  addToCart: trackAddToCart,
  removeFromCart: trackRemoveFromCart,
  beginCheckout: trackBeginCheckout,
  purchase: trackPurchase,
  search: trackSearch
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.Analytics = {
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase,
    trackSearch,
    trackCategoryView,
    trackUserInteraction,
    trackCarouselSlide,
    trackButtonClick,
    trackFormSubmission,
    trackNewsletterSignup,
    trackSocialShare,
    trackVideoPlay,
    trackError
  };
  
  window.AnalyticsEcommerce = AnalyticsEcommerce;
}

console.log('Google Analytics initialized. Replace GA_MEASUREMENT_ID with your actual ID.');
