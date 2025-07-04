import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Commandes | Aichic Couture ',
  description: 'Le  est apprécié par la plupart des femmes pour sa légèreté et sa souplesse, et son style est flexible pour permettre la liberté et la création d\'un style artistique qui correspond aux tendances et aux préférences personnelles.',
  keywords: ', vêtements professionnels, tunisie , sousse , Aichic Couture',
  authors: [{ name: 'Aichic Couture' }],
  creator: 'Aichic Couture',
  publisher: 'Aichic Couture',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://aichic.tn',
    title: 'Commandes | Aichic Couture',
    description: 'Découvrez notre collection de vêtements professionnels tunisiens. Boutiques à Jemmel, Sousse et Tunis.',
    siteName: 'Aichic Couture',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Aichic Couture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commandes | Aichic Couture',
    description: 'Découvrez notre collection de vêtements professionnels tunisiens. Boutiques à Jemmel, Sousse et Tunis.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://aichic.tn',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/FAVICON AICHIC.ico',
  },
  verification: {
    google: 'verification_token',
  },
  category: 'shopping',
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
