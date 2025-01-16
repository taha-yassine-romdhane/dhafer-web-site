import Image from 'next/image'

export default function AProposSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="relative h-[500px] overflow-hidden rounded-lg">
            <Image
              src="https://images.unsplash.com/photo-1503863627916-deb1706f5b79?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="À Propos de Dar Koftan"
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex flex-col justify-center">
            <h2 className="mb-6 text-3xl font-bold">
              À Propos de Dar Koftan
            </h2>
            
            <p className="mb-6 text-lg text-gray-600">
              Dar Koftan est votre destination de choix pour des caftans traditionnels de haute qualité. 
              Nous sommes fiers de perpétuer l&apos;héritage de l&apos;artisanat tunisien tout en apportant 
              une touche moderne à nos créations.
            </p>
            
            <p className="mb-8 text-lg text-gray-600">
              Chaque pièce est soigneusement confectionnée par nos artisans qualifiés, 
              utilisant les meilleurs tissus et techniques traditionnelles pour créer 
              des vêtements qui allient élégance, confort et authenticité.
            </p>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-white p-4 shadow">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Artisanal</h3>
                <p className="text-gray-600">Fait main avec soin</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Qualité</h3>
                <p className="text-gray-600">Matériaux premium</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow">
                <h3 className="mb-2 text-xl font-bold text-gray-900">Tradition</h3>
                <p className="text-gray-600">Savoir-faire ancestral</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
