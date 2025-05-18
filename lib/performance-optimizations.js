/**
 * Performance optimizations for Dar-koftan
 * This file contains utilities to improve LCP and TBT metrics
 * 
 * Enhanced version with additional optimizations for:
 * - Font loading optimization
 * - Script execution deferral
 * - Image loading prioritization
 * - Resource hints
 * - Long task splitting
 */

// Detect if the browser is idle to run non-critical tasks
export const runWhenIdle = (callback, timeout = 2000) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(callback, 1);
};

// Lazy load non-critical resources
export const lazyLoadResource = (url, type = 'script') => {
  runWhenIdle(() => {
    if (type === 'script') {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      document.body.appendChild(script);
    } else if (type === 'style') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
  });
};

// Preconnect to critical domains
export const preconnectToDomains = (domains) => {
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Optimize LCP by prioritizing the main image and other critical elements
export const optimizeLCP = () => {
  // Find the largest image on the page (likely the LCP element)
  const images = Array.from(document.querySelectorAll('img'));
  if (images.length === 0) return;
  
  // Sort by visible area and position (approximation of importance)
  const sortedImages = images
    .filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight;
    })
    .sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      // Consider both size and position (higher up elements are more important)
      const scoreA = (rectA.width * rectA.height) / (rectA.top + 1);
      const scoreB = (rectB.width * rectB.height) / (rectB.top + 1);
      return scoreB - scoreA;
    });
  
  // Prioritize the top 2-3 visible images
  const criticalImages = sortedImages.slice(0, 3);
  criticalImages.forEach(img => {
    img.fetchPriority = 'high';
    img.loading = 'eager';
    
    // Add decoded="sync" to critical images
    img.decoding = 'sync';
    
    // If it's a Next.js image with priority prop available
    if ('priority' in img) {
      img.priority = true;
    }
    
    // For images with srcset, ensure the right size loads first
    if (img.srcset) {
      // Create a temporary preload link for the most appropriate image
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = img.currentSrc || img.src;
      preloadLink.fetchPriority = 'high';
      document.head.appendChild(preloadLink);
    }
  });
  
  // Also prioritize hero text elements that might be part of LCP
  const headings = Array.from(document.querySelectorAll('h1, h2'));
  headings.forEach(heading => {
    // Mark important headings for the browser
    if (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes.includes('element')) {
      heading.setAttribute('elementtiming', 'important-heading');
    }
  });
};

// Split long tasks to improve TBT
export const splitLongTasks = (tasks, timeSlice = 5) => {
  return new Promise(resolve => {
    const results = [];
    let index = 0;
    
    function processNextTask() {
      // Process current task
      if (index < tasks.length) {
        const startTime = performance.now();
        const result = tasks[index]();
        results.push(result);
        index++;
        
        const elapsed = performance.now() - startTime;
        
        // If we've used our time budget, yield to the main thread
        if (elapsed > timeSlice) {
          setTimeout(processNextTask, 0);
        } else {
          // Otherwise continue processing
          processNextTask();
        }
      } else {
        // All tasks complete
        resolve(results);
      }
    }
    
    processNextTask();
  });
};

// Optimize font loading
export const optimizeFonts = () => {
  // Check if the browser supports the font loading API
  if ('fonts' in document) {
    // Prioritize display fonts
    document.fonts.ready.then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
    
    // Optionally preload critical fonts if not already handled by Next.js
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-var-italic.woff2'
    ];
    
    criticalFonts.forEach(fontUrl => {
      // Only preload if not already in the document
      if (!document.querySelector(`link[rel="preload"][href="${fontUrl}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontUrl;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupOptimizations);
  } else {
    setupOptimizations();
  }
  
  function setupOptimizations() {
    // Optimize fonts immediately
    optimizeFonts();
    
    // Preconnect to critical domains
    preconnectToDomains([
      'https://ik.imagekit.io',
      'https://images.daralkoftanalassil.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ]);
    
    // Add DNS prefetch for additional domains
    ['https://www.google-analytics.com', 'https://www.googletagmanager.com'].forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
    
    // Optimize the LCP element
    optimizeLCP();
    
    // Defer non-critical scripts
    runWhenIdle(() => {
      // Add any third-party scripts that aren't critical here
      // Example: Analytics, tag managers, etc.
      lazyLoadResource('https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX', 'script');
    }, 3000);
    
    // Monitor performance
    if (window.PerformanceObserver) {
      // Monitor LCP
      if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          // Log LCP for debugging
          console.debug('LCP:', lastEntry.startTime);
          // If LCP is poor, try to optimize further
          if (lastEntry.startTime > 2500) {
            // Further optimize the page
            console.debug('LCP needs improvement, applying additional optimizations');
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      }
      
      // Monitor long tasks to identify TBT issues
      if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
        const tbtObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            console.debug('Long task detected:', entry.duration, 'ms');
          });
        });
        tbtObserver.observe({ type: 'longtask', buffered: true });
      }
    }
  }
};
