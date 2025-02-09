'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button'; // Import shadcn Button
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay'; // For auto-sliding

const TopVentSection: React.FC = () => {
  const imagesTop1 = ['/compressed/img1.JPG', '/compressed/img2.JPG', '/compressed/img3.JPG']; // First carousel (slides up)
  const imagesBottom = ['/compressed/img4.JPG', '/compressed/img5.JPG', '/compressed/img6.JPG']; // Second carousel (slides down, reversed order)

  // Initialize Embla Carousels with Autoplay
  const [emblaRefTop1, emblaApiTop1] = useEmblaCarousel(
    { loop: true, axis: 'y' }, // Slides up
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );
  const [emblaRefBottom, emblaApiBottom] = useEmblaCarousel(
    { loop: true, axis: 'y' }, // Slides down
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );
 

  return (
    <section className="container mx-auto px-4 py-16 relative bg-white rounded-lg overflow-hidden min-h-[600px]">
      {/* Mixed Carousels */}
      <div className="absolute top-0 right-0 w-1/2 h-full z-0 flex gap-4">
        {/* First Carousel (Slides Up) */}
        <div className="embla w-1/3 h-full" ref={emblaRefTop1}>
          <div className="embla__container h-full flex flex-col">
            {imagesTop1.map((src, index) => (
              <div className="embla__slide flex-[0_0_100%] min-h-0 relative" key={index}>
                <div className="w-full h-full relative aspect-[2/3]">
                  <Image
                    src={src}
                    alt={`Top Ventes Image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Carousel (Slides Down) */}
        <div className="embla w-1/3 h-full" ref={emblaRefBottom}>
          <div className="embla__container h-full flex flex-col">
            {imagesBottom.map((src, index) => (
              <div className="embla__slide flex-[0_0_100%] min-h-0 relative" key={index}>
                <div className="w-full h-full relative aspect-[2/3]">
                  <Image
                    src={src}
                    alt={`Top Ventes Image ${index + 4}`}
                    fill
                    className="object-cover rounded-lg"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

       
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[50%] h-full flex flex-col justify-center items-start pl-8">
        <h1 className="text-[40px] font-bold mb-6 text-gray-800">
          Découvrez nos Top Ventes
        </h1>
        <p className="text-gray-700 text-xl mb-8 max-w-[80%]">
          Explorez nos produits les plus populaires et profitez des meilleures offres.
        </p>
        <Link href="/top-vente" passHref>
          <Button className="inline-flex items-center justify-center px-10 py-4 text-xl font-semibold text-white bg-[#D4AF37] rounded-full hover:bg-[#D4AF37]/90 transition-colors shadow-lg hover:shadow-xl">
            Voir les Top Ventes
          </Button>
        </Link>
      </div>

      {/* Custom CSS for Embla Carousel */}
      <style jsx>{`
        .embla {
          overflow: hidden;
          height: 100%;
        }
        .embla__container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .embla__slide {
          flex: 0 0 100%;
          min-height: 0;
          position: relative;
        }
      `}</style>
    </section>
  );
};

export default TopVentSection;