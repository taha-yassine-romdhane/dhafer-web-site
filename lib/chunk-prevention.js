/**
 * This module provides preventative measures for chunk loading errors
 * by implementing script preloading and dynamic import handling
 */

// Detect Safari browser
const isSafari = () => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Detect iOS device
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Preload critical chunks
const preloadCriticalChunks = () => {
  if (typeof window === 'undefined') return;
  
  // List of critical chunks to preload
  const criticalChunks = [
    '/_next/static/chunks/webpack.js',
    '/_next/static/chunks/main.js',
    '/_next/static/chunks/pages/_app.js',
    '/_next/static/chunks/vendor.js',
    '/_next/static/chunks/framework.js'
  ];
  
  // Create preload links
  criticalChunks.forEach(chunk => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = chunk;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Patch the dynamic import function to handle errors better
const patchDynamicImport = () => {
  if (typeof window === 'undefined') return;
  
  // Store the original import function
  const originalImport = window.__NEXT_P || [];
  
  // Create a new array with the same prototype
  window.__NEXT_P = new Proxy(originalImport, {
    get(target, prop) {
      return target[prop];
    },
    set(target, prop, value) {
      // If this is a push operation to add a new chunk
      if (prop === 'push') {
        // The original push function
        const originalPush = target.push;
        
        // Return a wrapped push function
        return function(...chunks) {
          // Process each chunk being pushed
          chunks.forEach(chunk => {
            if (Array.isArray(chunk) && chunk.length >= 2) {
              const chunkPath = chunk[0];
              const originalCallback = chunk[1];
              
              // Replace the callback with our wrapped version
              chunk[1] = function() {
                try {
                  return originalCallback.apply(this, arguments);
                } catch (error) {
                  console.error(`Error loading chunk ${chunkPath}:`, error);
                  
                  // Attempt recovery for this specific chunk
                  setTimeout(() => {
                    const script = document.createElement('script');
                    script.src = `/_next/static/chunks/pages${chunkPath}.js`;
                    script.onerror = () => {
                      console.error(`Failed to manually load ${chunkPath}`);
                      // Last resort: reload the page
                      if (isSafari() || isIOS()) {
                        window.location.reload();
                      }
                    };
                    document.head.appendChild(script);
                  }, 100);
                  
                  // Return an empty module to prevent further errors
                  return {};
                }
              };
            }
          });
          
          // Call the original push with our modified chunks
          return originalPush.apply(target, chunks);
        };
      }
      
      // Default behavior for other properties
      target[prop] = value;
      return true;
    }
  });
};

// Initialize all preventative measures
const initChunkPrevention = () => {
  if (typeof window === 'undefined') return;
  
  // Apply all preventative measures
  preloadCriticalChunks();
  patchDynamicImport();
  
  // Additional Safari-specific optimizations
  if (isSafari() || isIOS()) {
    // Limit concurrent requests in Safari
    if (navigator.connection) {
      navigator.connection.downlinkMax = 2;
    }
    
    // Disable animations during page load to reduce CPU usage
    document.documentElement.classList.add('safari-optimized');
    
    // Remove the class after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.documentElement.classList.remove('safari-optimized');
      }, 1000);
    });
  }
};

export { initChunkPrevention, isSafari, isIOS };
