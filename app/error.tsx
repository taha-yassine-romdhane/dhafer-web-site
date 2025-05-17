'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Quelque chose s'est mal passé</h2>
      <p className="mb-6 text-gray-600 max-w-md">
        Nous sommes désolés, une erreur s'est produite. Veuillez réessayer ou revenir à la page d'accueil.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
        >
          Réessayer
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
        >
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
