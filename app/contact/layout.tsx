import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Contact | دار القفطان الأصيل ',
  description: 'Le coftan est apprécié par la plupart des femmes pour sa légèreté et sa souplesse, et son style est flexible pour permettre la liberté et la création d\'un style artistique qui correspond aux tendances et aux préférences personnelles.',
  keywords: 'coftan, vêtements traditionnels, tunisie, jemmel, sousse, tunis, mode traditionnelle, caftan, dar el koftan, al assil',
  authors: [{ name: 'Dar El Koftan Al Assil' }],
  creator: 'Dar El Koftan Al Assil',
  publisher: 'Dar El Koftan Al Assil',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://daralkoftanalassil.com',
    title: 'Contact | دار القفطان الأصيل',
    description: 'Découvrez notre collection de vêtements traditionnels tunisiens. Boutiques à Jemmel, Sousse et Tunis.',
    siteName: 'Dar El Koftan Al Assil',
    images: [
      {
        url: '/logo.webp',
        width: 1200,
        height: 630,
        alt: 'Dar El Koftan Al Assil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | دار القفطان الأصيل',
    description: 'Découvrez notre collection de vêtements traditionnels tunisiens. Boutiques à Jemmel, Sousse et Tunis.',
    images: ['/logo.webp'],
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

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
