import { Metadata, ResolvingMetadata } from 'next';
import { prisma } from "@/lib/prisma";
import ProductErrorBoundary from "./product-error-boundary";

// Generate dynamic metadata for the product page
export async function generateMetadata(
  { params }: { params: { productId: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch the product data
  const productId = parseInt(params.productId);
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  // Use the product name in the title if available, or fallback to generic title
  const productName = product?.name || 'Produit';
  const title = `${productName} | دار القفطان الأصيل`;
  const description = product?.description || 'Le coftan est apprécié par la plupart des femmes pour sa légèreté et sa souplesse, et son style est flexible pour permettre la liberté et la création d\'un style artistique qui correspond aux tendances et aux préférences personnelles.';
  
  // Default image for OpenGraph
  const ogImage = '/logo.webp';

  return {
    title: title,
    description: description,
    keywords: 'coftan, vêtements traditionnels, tunisie, jemmel, sousse, tunis, mode traditionnelle, caftan, dar el koftan, al assil',
    authors: [{ name: 'Dar El Koftan Al Assil' }],
    creator: 'Dar El Koftan Al Assil',
    publisher: 'Dar El Koftan Al Assil',
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      url: `https://daralkoftanalassil.com/product/${productId}`,
      title: title,
      description: description,
      siteName: 'Dar El Koftan Al Assil',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: productName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://daralkoftanalassil.com/product/${productId}`,
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
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProductErrorBoundary>
      {children}
    </ProductErrorBoundary>
  );
}
