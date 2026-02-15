// Service Worker Registration
// Registers the service worker for offline support and caching

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
  
  // Handle service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Message from Service Worker:', event.data);
  });
}

// Show update notification
function showUpdateNotification() {
  if (window.showAlert) {
    showAlert('A new version is available! Refresh to update.', 'info');
  } else {
    console.log('New version available. Please refresh the page.');
  }
}

// Request notification permission (for future use)
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      console.log('Notification permission:', permission);
    });
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.requestNotificationPermission = requestNotificationPermission;
}
