"use client";

import React, { useEffect, useState } from 'react';

interface ChunkErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ChunkErrorBoundary({ 
  children, 
  fallback = <div className="p-8 text-center">Chargement du contenu...</div> 
}: ChunkErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Handle chunk loading errors globally
    const handleChunkError = (event: ErrorEvent) => {
      // Check if this is a chunk loading error
      if (
        event.error && 
        (
          (event.error.message && event.error.message.includes('ChunkLoadError')) ||
          (event.error.name === 'ChunkLoadError') ||
          (event.message && event.message.includes('Loading chunk'))
        )
      ) {
        console.error('Chunk loading error detected:', event.error || event);
        
        // Prevent the default error handling
        event.preventDefault();
        
        // Set error state to show fallback
        setHasError(true);
        
        // Clear cache and reload the page after a delay
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName);
            });
          });
        }
        
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    };

    // Add event listeners for both error types
    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && 
          ((typeof event.reason.message === 'string' && event.reason.message.includes('ChunkLoadError')) ||
           (event.reason.name === 'ChunkLoadError'))) {
        handleChunkError(new ErrorEvent('error', { error: event.reason }));
        event.preventDefault();
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError as any);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="text-xl font-medium mb-4">Chargement en cours...</div>
        <div className="text-sm text-gray-600 mb-6">
          La page va se recharger automatiquement dans quelques secondes.
        </div>
        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
