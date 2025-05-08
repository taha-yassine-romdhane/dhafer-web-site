import './globals.css';

import { Inter } from 'next/font/google';
import { CartProvider } from "@/lib/context/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDropdown } from "@/components/cart-dropdown";
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dar El Koftan Al Assil | دار القفطان الأصيل ',
  description: 'Le coftan est apprécié par la plupart des femmes pour sa légèreté et sa souplesse, et son style est flexible pour permettre la liberté et la création d\'un style artistique qui correspond aux tendances et aux préférences personnelles.',
  keywords: 'coftan, vêtements traditionnels, tunisie, jemmel, sousse, tunis, mode traditionnelle, caftan, dar el koftan, al assil',
  authors: [{ name: 'Dar El Koftan Al Assil' }],
  creator: 'Dar El Koftan Al Assil',
  publisher: 'Dar El Koftan Al Assil',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://daralkoftanalassil.com',
    title: 'Dar El Koftan Al Assil |دار القفطان الأصيل',
    description: 'Découvrez notre collection de vêtements traditionnels tunisiens. Boutiques à Jemmel, Sousse et Tunis.',
    siteName: 'Dar El Koftan Al Assil',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Dar El Koftan Al Assil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dar El Koftan Al Assil | دار القفطان الأصيل',
    description: 'Découvrez notre collection de vêtements traditionnels tunisiens. Boutiques à Jemmel, Sousse et Tunis.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://daralkoftanalassil.com',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
  },
  verification: {
    google: 'verification_token',
  },
  category: 'shopping',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
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
              "image": "https://www.daralkoftanalassil.com/logo.png",
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
              },
              "sameAs": [
                "https://www.facebook.com/darelkoftanalassil",
                "https://www.instagram.com/darelkoftanalassil"
              ]
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