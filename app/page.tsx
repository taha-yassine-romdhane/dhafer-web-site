import { Metadata } from 'next'
import HeroSection from './components/HeroSection'
import TopProduitsSection from './components/TopProduitsSection'
import TopVentesSection from './components/TopVentSection'
import AProposSection from './components/AProposSection'

// We'll revert to static imports for now to ensure stability
// Dynamic imports can be re-added once the core functionality is stable

export const metadata: Metadata = {
  title: 'Dar El Koftan Al Assil | دار القفطان الأصيل ',
  description: 'Découvrez Dar Al Koftan Al Assil : une collection élégante de vêtements traditionnels et modernes pour femmes et enfants.',
  keywords: 'coftan, vêtements traditionnels, tunisie, jemmel, sousse, tunis, mode traditionnelle, caftan, dar el koftan, al assil',
  viewport: 'width=device-width, initial-scale=1',
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
        url: '/logo.webp',
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

export default async function Home() {
  return (
    <main>
      <HeroSection />
      <TopProduitsSection />
      <TopVentesSection />
      <AProposSection />
    </main>
  )
}