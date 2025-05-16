import './globals.css';

import { Inter } from 'next/font/google';
import { CartProvider } from "@/lib/context/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDropdown } from "@/components/cart-dropdown";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" style={{ WebkitTextSizeAdjust: 'none' }}>
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-K62LW3ZTXY"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-K62LW3ZTXY');
            `
          }}
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#D4AF37" />
        
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
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDropdown />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}