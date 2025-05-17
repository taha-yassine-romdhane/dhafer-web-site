'use client';

import { useEffect } from 'react';
import { isIOS, isIOSSafari } from '@/lib/device-detection';
import { MemoryManager } from '@/lib/memory-management';

/**
 * Component that initializes iOS optimizations and memory management
 * This should be included in your layout
 */
export function IOSOptimizations() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if we're on iOS
    if (isIOS()) {
      console.log('iOS device detected, applying optimizations');
      
      // Add iOS class to html element
      document.documentElement.classList.add('ios');
      
      // If on iOS Safari, add specific class
      if (isIOSSafari()) {
        document.documentElement.classList.add('ios-safari');
        
        // Start memory monitoring
        const memoryManager = MemoryManager.getInstance();
        memoryManager.startMonitoring(15000); // Check every 15 seconds
        
        // Register warning threshold callback
        memoryManager.onWarningThreshold(() => {
          console.warn('Memory usage high, cleaning up resources');
          // Clean up resources when memory usage is high
          cleanupUnusedResources();
        });
        
        // Register critical threshold callback
        memoryManager.onCriticalThreshold(() => {
          console.warn('Memory usage critical, forcing cleanup');
          // Force cleanup when memory usage is critical
          memoryManager.forceCleanup();
          
          // Remove animations and transitions
          document.documentElement.classList.add('ios-critical');
        });
      }
      
      // Apply iOS-specific optimizations
      applyIOSOptimizations();
    }
    
    // Cleanup function
    return () => {
      // Stop memory monitoring when component unmounts
      if (isIOSSafari()) {
        MemoryManager.getInstance().stopMonitoring();
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
}

/**
 * Apply iOS-specific optimizations
 */
function applyIOSOptimizations() {
  // Reduce the number of elements that can be rendered at once
  limitElementRendering();
  
  // Optimize scrolling
  optimizeScrolling();
  
  // Monitor for layout shifts
  monitorLayoutShifts();
}

/**
 * Limit the number of elements that can be rendered at once
 */
function limitElementRendering() {
  // Add IntersectionObserver to mark offscreen content
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          entry.target.classList.add('offscreen-content');
        } else {
          entry.target.classList.remove('offscreen-content');
        }
      });
    },
    { rootMargin: '200px' }
  );
  
  // Observe sections and large containers
  setTimeout(() => {
    document.querySelectorAll('section, [class*="container"]').forEach(el => {
      observer.observe(el);
    });
  }, 1000);
}

/**
 * Optimize scrolling performance
 */
function optimizeScrolling() {
  // Use passive event listeners for scroll events
  const supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        return true;
      }
    });
    window.addEventListener('test', null as any, opts);
  } catch (e) {}
  
  // Apply passive scrolling
  window.addEventListener('scroll', function() {
    // This is just to ensure we have a passive scroll listener
  }, supportsPassive ? { passive: true } : false);
}

/**
 * Monitor for layout shifts that could cause performance issues
 */
function monitorLayoutShifts() {
  if ('PerformanceObserver' in window) {
    try {
      // Create a performance observer
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // @ts-ignore - LayoutShift is not in the types
          if (entry.hadRecentInput) continue;
          
          // @ts-ignore - LayoutShift is not in the types
          if (entry.value > 0.1) {
            console.warn('Large layout shift detected:', entry);
          }
        }
      });
      
      // Start observing layout shifts
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error('Error setting up layout shift observer:', e);
    }
  }
}

/**
 * Clean up unused resources to free memory
 */
function cleanupUnusedResources() {
  // Clear image sources for offscreen images
  document.querySelectorAll('img.offscreen-content').forEach(img => {
    const imgElement = img as HTMLImageElement;
    if (imgElement.dataset.originalSrc) return; // Already processed
    
    // Store original src
    imgElement.dataset.originalSrc = imgElement.src;
    // Replace with tiny transparent gif
    imgElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  });
  
  // Remove complex styles from offscreen elements
  document.querySelectorAll('.offscreen-content').forEach(el => {
    el.classList.add('ios-simplified');
  });
}
