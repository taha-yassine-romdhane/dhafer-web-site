/**
 * Performance monitoring utility for tracking API calls, component renders, and overall page performance
 */
import React from 'react';

export const performanceMonitor = {
  startTime: 0,
  apiCalls: [] as {url: string, duration: number, size?: number}[],
  componentRenders: [] as {component: string, duration: number}[],
  resourceLoads: [] as {url: string, type: string, duration: number, size: number}[],
  
  startTracking() {
    if (typeof window === 'undefined') return this;
    
    this.startTime = performance.now();
    this.apiCalls = [];
    this.componentRenders = [];
    this.resourceLoads = [];
    
    // Monkey patch fetch to track API calls
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const start = performance.now();
      try {
        const response = await originalFetch(input, init);
        const end = performance.now();
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        
        // Clone the response to read its size
        const clone = response.clone();
        const blob = await clone.blob();
        
        this.apiCalls.push({
          url, 
          duration: end - start,
          size: blob.size
        });
        
        return response;
      } catch (error) {
        const end = performance.now();
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        this.apiCalls.push({url, duration: end - start});
        throw error;
      }
    };
    
    // Track resource loading (images, scripts, etc.)
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.resourceLoads.push({
              url: resourceEntry.name,
              type: resourceEntry.initiatorType,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize || 0
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
    
    return this;
  },
  
  trackComponent(componentName: string, callback: () => void) {
    const start = performance.now();
    callback();
    const end = performance.now();
    this.componentRenders.push({component: componentName, duration: end - start});
  },
  
  getResults() {
    const totalTime = performance.now() - this.startTime;
    const apiCallsTotal = this.apiCalls.reduce((acc, call) => acc + call.duration, 0);
    const apiSizeTotal = this.apiCalls.reduce((acc, call) => acc + (call.size || 0), 0);
    const resourceLoadTotal = this.resourceLoads.reduce((acc, load) => acc + load.duration, 0);
    const resourceSizeTotal = this.resourceLoads.reduce((acc, load) => acc + load.size, 0);
    
    return {
      totalTime,
      apiCalls: this.apiCalls,
      apiCallsTotal,
      apiSizeTotal,
      componentRenders: this.componentRenders,
      componentRendersTotal: this.componentRenders.reduce((acc, render) => acc + render.duration, 0),
      resourceLoads: this.resourceLoads,
      resourceLoadTotal,
      resourceSizeTotal
    };
  },
  
  logResults() {
    const results = this.getResults();
    console.log('=== PERFORMANCE REPORT ===');
    console.log(`Total page load time: ${results.totalTime.toFixed(2)}ms`);
    
    console.log(`\nAPI Calls (${this.apiCalls.length}):`);
    this.apiCalls.forEach(call => {
      const size = call.size ? ` - Size: ${(call.size / 1024).toFixed(2)}KB` : '';
      console.log(`  - ${call.url}: ${call.duration.toFixed(2)}ms${size}`);
    });
    console.log(`Total API time: ${results.apiCallsTotal.toFixed(2)}ms`);
    console.log(`Total API data: ${(results.apiSizeTotal / 1024).toFixed(2)}KB`);
    
    console.log(`\nComponent renders (${this.componentRenders.length}):`);
    this.componentRenders.forEach(render => {
      console.log(`  - ${render.component}: ${render.duration.toFixed(2)}ms`);
    });
    
    console.log(`\nResource loads (${this.resourceLoads.length}):`);
    const imageLoads = this.resourceLoads.filter(r => r.type === 'img');
    const scriptLoads = this.resourceLoads.filter(r => r.type === 'script');
    const cssLoads = this.resourceLoads.filter(r => r.type === 'css' || r.type === 'link');
    
    console.log(`  Images (${imageLoads.length}): ${(imageLoads.reduce((acc, img) => acc + img.size, 0) / 1024).toFixed(2)}KB`);
    console.log(`  Scripts (${scriptLoads.length}): ${(scriptLoads.reduce((acc, s) => acc + s.size, 0) / 1024).toFixed(2)}KB`);
    console.log(`  CSS (${cssLoads.length}): ${(cssLoads.reduce((acc, css) => acc + css.size, 0) / 1024).toFixed(2)}KB`);
    
    console.log(`\nTotal resource size: ${(results.resourceSizeTotal / 1024 / 1024).toFixed(2)}MB`);
    
    return results;
  }
};

// Helper function to wrap a component with performance tracking
export function withPerformanceTracking<P extends object>(Component: React.ComponentType<P>, componentName: string) {
  return function WrappedComponent(props: P) {
    const start = performance.now();
    
    // Use useEffect for cleanup and timing
    React.useEffect(() => {
      const end = performance.now();
      performanceMonitor.componentRenders.push({
        component: componentName,
        duration: end - start
      });
      
      return () => {
        // Cleanup if needed
      };
    }, []);
    
    return React.createElement(Component, props);
  };
}
