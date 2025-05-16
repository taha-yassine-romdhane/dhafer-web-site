"use client";

import ChunkErrorBoundary from "@/app/components/ChunkErrorBoundary";

export default function ProductErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChunkErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
          <div className="text-xl font-medium mb-4">Chargement du produit...</div>
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      {children}
    </ChunkErrorBoundary>
  );
}
