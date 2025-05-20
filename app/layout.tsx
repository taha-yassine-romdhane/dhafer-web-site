import './globals.css'
import './skeleton-loaders.css';

import { CartProvider } from "@/lib/context/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import { IOSOptimizations } from "@/components/ios-optimizations";
import { PerformanceOptimizations } from "@/components/performance-optimizations";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDropdown } from "@/components/cart-dropdown";
import Script from 'next/script';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Load Inter font with subset optimization
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});


export const metadata: Metadata = {
  metadataBase: new URL('https://www.daralkoftanalassil.com'),
  title: 'Dar El Koftan Al Assil - Vêtements traditionnels tunisiens',
  description: 'Boutique en ligne de vêtements traditionnels tunisiens de haute qualité. Découvrez notre collection de kaftans, jabadors et accessoires.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" style={{ WebkitTextSizeAdjust: 'none' }} className={inter.className}>
      <head>
        {/* Preload critical assets */}
        <link rel="preload" href="/logo.webp" as="image" />
        
        {/* Google tag (gtag.js) - deferred to improve performance */}
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Structured data for business */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            })
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {/* Performance and compatibility optimizations */}
            <IOSOptimizations />
            <PerformanceOptimizations />
            <Navbar />
            <CartDropdown />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
        {/* Performance monitoring removed to fix stability issues */}
      </body>
    </html>
  );
}