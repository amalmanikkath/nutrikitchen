// Service Worker for Nutri Kitchen
// Provides offline support and caching for better performance

const CACHE_NAME = 'nutrikitchen-v1.0.0';
const RUNTIME_CACHE = 'nutrikitchen-runtime';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/products.html',
  '/cart.html',
  '/css/style.css',
  '/css/animations.css',
  '/css/carousel.css',
  '/js/main.js',
  '/js/cart.js',
  '/js/data.js',
  '/images/nutrikitchenLogo.png',
  '/images/nutriKitchenHerobanner.png'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests (always fetch fresh)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update in background
        fetchAndCache(request);
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetchAndCache(request);
    })
  );
});

// Helper function to fetch and cache
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    
    // Only cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    
    // Return offline page if available
    const cache = await caches.open(CACHE_NAME);
    return cache.match('/offline.html') || new Response('Offline');
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  // Sync cart data when back online
  console.log('[Service Worker] Syncing cart data...');
  // Implementation depends on your cart sync logic
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New update from Nutri Kitchen',
    icon: '/images/nutrikitchenLogo.png',
    badge: '/images/nutrikitchenLogo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nutri Kitchen', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
