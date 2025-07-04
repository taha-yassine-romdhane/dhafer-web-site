import './globals.css';

import { Inter } from 'next/font/google';
import { CartProvider } from "@/lib/context/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDropdown } from "@/components/cart-dropdown";
import Script from "next/script";

const inter = Inter({ subsets: ['latin'] });
const GA_TRACKING_ID = "G-QD0XSX38KE"; // Google Analytics Measurement ID
const FB_PIXEL_ID = "739233504686068"; // Facebook Pixel ID

export const metadata = {
  title: 'AICHIC COUTURE | Mode Féminine Chic & Tendance',
  description: 'Découvrez la collection exclusive de vêtements AICHIC COUTURE. Élégance, modernité et qualité pour toutes les femmes.',
  keywords: 'AICHIC COUTURE, vêtements, mode, femme, collection, qualité, élégance, tendance',
  authors: [{ name: 'AICHIC COUTURE' }],
  creator: 'AICHIC COUTURE',
  publisher: 'AICHIC COUTURE',
  formatDetection: {
    email: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.aichic.tn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AICHIC COUTURE | Mode Féminine Chic & Tendance',
    description: 'Découvrez la collection exclusive de vêtements AICHIC COUTURE. Élégance, modernité et qualité pour toutes les femmes.',
    url: 'https://www.aichic.tn',
    siteName: 'AICHIC COUTURE',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AICHIC COUTURE Collection',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AICHIC COUTURE | Mode Féminine Chic & Tendance',
    description: 'Découvrez la collection exclusive de vêtements AICHIC COUTURE. Élégance, modernité et qualité pour toutes les femmes.',
    images: ['/twitter-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/FAVICON AICHIC.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#5bbad5'
      },
    ],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Google Analytics Script */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* Meta Pixel Code */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* Meta Pixel noscript fallback */}
        <noscript>
          <img height="1" width="1" style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`} 
          />
        </noscript>
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