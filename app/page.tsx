import HeroSection from './components/HeroSection'
import TopProduitsSection from './components/TopProduitsSection'
import AProposSection from './components/AProposSection'

export default async function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <TopProduitsSection />
      <AProposSection />
    </main>
  )
}