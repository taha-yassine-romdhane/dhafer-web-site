'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
    
    // Check if this is a chunk loading error
    if (error.message && (
      error.message.includes('ChunkLoadError') || 
      error.message.includes('Loading chunk') ||
      error.message.includes('vendors-')
    )) {
      console.error('Chunk loading error detected. Attempting to recover...');
      
      // Clear cache and reload the page
      if ('caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) caches.delete(name);
        });
      }
      
      // Clear localStorage cache for Next.js
      try {
        const keys = Object.keys(localStorage);
        for (let key of keys) {
          if (key.startsWith('next-')) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error('Failed to clear localStorage:', e);
      }
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <h2 className="text-2xl font-semibold mb-4">Une erreur s'est produite</h2>
      <p className="mb-6 text-center max-w-md">
        Nous rencontrons des difficultés techniques. Veuillez patienter pendant que nous résolvons le problème.
      </p>
      <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-6"></div>
      <button
        onClick={reset}
        className="px-6 py-3 bg-[#D4AF37] text-white rounded-md hover:bg-[#C09A2C] transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}
