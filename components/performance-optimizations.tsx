'use client';

import { useEffect } from 'react';
import { initPerformanceOptimizations } from '@/lib/performance-optimizations';

export function PerformanceOptimizations() {
  useEffect(() => {
    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    // Clean up function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
