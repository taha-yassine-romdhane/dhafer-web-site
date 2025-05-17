'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Une erreur est survenue</h2>
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
      </body>
    </html>
  );
}
