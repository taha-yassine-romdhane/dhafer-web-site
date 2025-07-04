import { Metadata } from 'next'
import HeroSection from './components/HeroSection'
import TopProduitsSection from './components/TopProduitsSection'
import TopVentesSection from './components/TopVentSection'
import AProposSection from './components/AProposSection'
import Testimonials from './components/testimonials'


export const metadata: Metadata = {
  title: 'Aichic Couture | Aichic Couture ',
  description: 'Découvrez Dar Al Koftan Al Assil : une collection élégante de vêtements professionnels et modernes pour femmes et enfants.',
  keywords: ', vêtements professionnels, tunisie , sousse , Aichic Couture',
  viewport: 'width=device-width, initial-scale=1',
  authors: [{ name: 'Aichic Couture' }],
  creator: 'Aichic Couture',
  publisher: 'Aichic Couture',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://aichic.tn',
    title: 'Aichic Couture |Aichic Couture',
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
    title: 'Aichic Couture | Aichic Couture',
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

export default async function Home() {
  return (
    <main>
      <HeroSection />
      <TopProduitsSection />
      <TopVentesSection />
      <AProposSection />
      <Testimonials />
    </main>
  )
}