import HeroSection from './components/HeroSection'
import TopProduitsSection from './components/TopProduitsSection'
import AProposSection from './components/AProposSection'
import TopVentesSection from './components/TopVentSection'

export default async function Home() {
  return (
    <main className="gray-50 flex-1">
      <HeroSection />
      <TopProduitsSection />
      <TopVentesSection />
      <AProposSection />
    </main>
  )
}