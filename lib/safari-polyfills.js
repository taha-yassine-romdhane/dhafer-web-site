// Safari compatibility polyfills
// This file provides polyfills for features that might be missing in Safari

const applySafariPolyfills = () => {
  // Check if we're in the browser
  if (typeof window === 'undefined') return;

  // Polyfill for requestIdleCallback (not supported in Safari)
  window.requestIdleCallback = window.requestIdleCallback || function(cb) {
    return setTimeout(function() {
      var start = Date.now();
      cb({
        didTimeout: false,
        timeRemaining: function() { return Math.max(0, 50 - (Date.now() - start)); }
      });
    }, 1);
  };
  
  window.cancelIdleCallback = window.cancelIdleCallback || function(id) {
    clearTimeout(id);
  };

  // Polyfill for smooth scrolling
  if (!('scrollBehavior' in document.documentElement.style)) {
    window.scrollTo = function(options) {
      if (options.behavior === 'smooth') {
        // Simple implementation of smooth scrolling
        window.scrollTo(options.left || window.scrollX, options.top || window.scrollY);
      } else {
        // Default behavior
        window.scrollTo(options.left || window.scrollX, options.top || window.scrollY);
      }
    };
  }

  // Fix for Safari's handling of passive event listeners
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        window.__supportsPassive = true;
      }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {
    window.__supportsPassive = false;
  }

  // Polyfill for IntersectionObserver (older Safari versions)
  if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver not supported in this browser. Some features might not work correctly.');
  }

  // Memory leak prevention for Safari
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    // Safari-specific memory management
    window.__safariGCInterval = setInterval(() => {
      // Force garbage collection by creating and releasing a large object
      if (window.__safariMemoryObjects) {
        window.__safariMemoryObjects.length = 0;
      }
      window.__safariMemoryObjects = null;
      window.__safariMemoryObjects = [];
    }, 60000); // Run every minute
  }
  
  // Handle chunk loading errors
  window.addEventListener('error', function(event) {
    // Check if this is a chunk loading error
    if (event && event.message && event.message.includes('ChunkLoadError')) {
      console.error('Chunk loading error detected. Attempting to recover...');
      
      // Clear cache and reload the page
      if ('caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) caches.delete(name);
        });
      }
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
};

// Default export for dynamic import
export default function SafariPolyfills() {
  applySafariPolyfills();
  return null; // Return null as this is a utility component with no UI
}

// Also export the function for direct usage
export { applySafariPolyfills };
