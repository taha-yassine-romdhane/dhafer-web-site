import './globals.css';

import { Inter } from 'next/font/google';
import Script from 'next/script';
import { CartProvider } from "@/lib/context/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDropdown } from "@/components/cart-dropdown";
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0" />
        <meta name="theme-color" content="#D4AF37" />
        
        {/* Structured data for business - using Next.js Script component */}
        <Script
          id="schema-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ClothingStore",
            "name": "Dar El Koftan Al Assil",
            "image": "https://www.daralkoftanalassil.com/logo.webp",
            "@id": "https://www.daralkoftanalassil.com",
            "url": "https://www.daralkoftanalassil.com",
            "telephone": "+216 56 047 691",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "105 Av. Habib Bourguiba",
              "addressLocality": "Jemmel",
              "addressRegion": "Monastir",
              "postalCode": "5020",
              "addressCountry": "TN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 35.624614,
              "longitude": 10.776341
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "09:00",
              "closes": "20:00"
            }
          })}
        </Script>
      </head>
      <body className={inter.className}>
        {/* Safari Error Handler */}
        <Script id="safari-error-handler" strategy="beforeInteractive">
          {`
            window.onerror = function(message, source, lineno, colno, error) {
              console.error('Global error caught:', { message, source, lineno, colno, error });
              return false;
            };
            
            // Safari-specific polyfill for any missing features
            if (typeof window !== 'undefined') {
              // Prevent Safari from crashing on certain operations
              window.requestIdleCallback = window.requestIdleCallback || function(cb) {
                return setTimeout(function() {
                  var start = Date.now();
                  cb({
                    didTimeout: false,
                    timeRemaining: function() { return Math.max(0, 50 - (Date.now() - start)); }
                  });
                }, 1);
              };
              
              window.cancelIdleCallback = window.cancelIdleCallback || function(id) {
                clearTimeout(id);
              };
            }
          `}
        </Script>
        
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
              <Navbar />
              <CartDropdown />
              <main className="min-h-screen">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement du contenu...</div>}>
                  {children}
                </Suspense>
              </main>
              <Footer />
            </Suspense>
          </CartProvider>
        </AuthProvider>
        
        {/* Google Analytics - using Next.js Script component with proper strategy */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-K62LW3ZTXY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-K62LW3ZTXY');
          `}
        </Script>
      </body>
    </html>
  );
}