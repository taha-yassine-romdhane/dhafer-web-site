'use client';

import { isIOS } from './device-detection';

// Memory thresholds in MB
const WARNING_THRESHOLD = 150; // MB
const CRITICAL_THRESHOLD = 200; // MB

/**
 * Utility class to monitor and manage memory usage
 */
export class MemoryManager {
  private static instance: MemoryManager;
  private warningCallbacks: (() => void)[] = [];
  private criticalCallbacks: (() => void)[] = [];
  private isMonitoring = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }
  
  /**
   * Private constructor (use getInstance)
   */
  private constructor() {}
  
  /**
   * Start monitoring memory usage
   * @param intervalMs How often to check memory (default: 10000ms)
   */
  public startMonitoring(intervalMs = 10000): void {
    // Only monitor on iOS devices
    if (!isIOS() || typeof window === 'undefined' || this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = true;
    
    this.monitorInterval = setInterval(() => {
      this.checkMemory();
    }, intervalMs);
    
    // Also check on visibility change (when tab becomes visible again)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkMemory();
      }
    });
  }
  
  /**
   * Stop monitoring memory usage
   */
  public stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
  }
  
  /**
   * Register a callback for when memory usage exceeds warning threshold
   * @param callback Function to call when warning threshold is exceeded
   */
  public onWarningThreshold(callback: () => void): void {
    this.warningCallbacks.push(callback);
  }
  
  /**
   * Register a callback for when memory usage exceeds critical threshold
   * @param callback Function to call when critical threshold is exceeded
   */
  public onCriticalThreshold(callback: () => void): void {
    this.criticalCallbacks.push(callback);
  }
  
  /**
   * Check current memory usage and trigger callbacks if thresholds are exceeded
   */
  private checkMemory(): void {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }
    
    // Use performance.memory if available (Chrome)
    // @ts-ignore - TypeScript doesn't know about this non-standard API
    if (window.performance && window.performance.memory) {
      // @ts-ignore
      const usedHeapSize = window.performance.memory.usedJSHeapSize / (1024 * 1024);
      
      if (usedHeapSize > CRITICAL_THRESHOLD) {
        this.triggerCriticalCallbacks();
      } else if (usedHeapSize > WARNING_THRESHOLD) {
        this.triggerWarningCallbacks();
      }
    } else {
      // Fallback for browsers without performance.memory
      // This is less accurate but can still help
      if (isIOS()) {
        // On iOS, we'll use a heuristic based on DOM size
        const domSize = document.documentElement.innerHTML.length / (1024 * 1024);
        if (domSize > 5) { // If DOM is larger than ~5MB
          this.triggerWarningCallbacks();
        }
      }
    }
  }
  
  /**
   * Trigger all warning threshold callbacks
   */
  private triggerWarningCallbacks(): void {
    this.warningCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in warning threshold callback:', error);
      }
    });
  }
  
  /**
   * Trigger all critical threshold callbacks
   */
  private triggerCriticalCallbacks(): void {
    this.criticalCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in critical threshold callback:', error);
      }
    });
  }
  
  /**
   * Force garbage collection (where possible)
   * Note: This is not guaranteed to work in all browsers
   */
  public forceCleanup(): void {
    // Clear image caches
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!isElementInViewport(img)) {
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 transparent GIF
      }
    });
    
    // Remove unused event listeners
    this.cleanupEventListeners();
    
    // Suggest garbage collection
    if (typeof window.gc === 'function') {
      try {
        // @ts-ignore - gc is not standard
        window.gc();
      } catch (e) {
        // Ignore errors
      }
    }
  }
  
  /**
   * Clean up event listeners that might be causing memory leaks
   */
  private cleanupEventListeners(): void {
    // This is a simplified approach - in a real app you'd need to be more specific
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      if (!isElementInViewport(el)) {
        // Clone and replace to remove event listeners
        // Only do this for elements that are not in viewport
        const parent = el.parentNode;
        if (parent && el.nodeName !== 'BODY' && el.nodeName !== 'HTML') {
          const clone = el.cloneNode(true);
          parent.replaceChild(clone, el);
        }
      }
    });
  }
}

/**
 * Check if an element is in the viewport
 * @param element The element to check
 * @returns boolean indicating if element is in viewport
 */
function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Hook to use memory manager in components
 */
export function useMemoryManager() {
  return MemoryManager.getInstance();
}
