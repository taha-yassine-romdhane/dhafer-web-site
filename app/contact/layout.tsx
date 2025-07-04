import { Metadata } from "next";

export const metadata: Metadata = {
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

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
