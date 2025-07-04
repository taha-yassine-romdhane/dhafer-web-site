import { Metadata, ResolvingMetadata } from 'next';
import { prisma } from "@/lib/prisma";

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
  const title = `${productName} | Aichic Couture`;
  const description = product?.description || 'Le  est apprécié par la plupart des femmes pour sa légèreté et sa souplesse, et son style est flexible pour permettre la liberté et la création d\'un style artistique qui correspond aux tendances et aux préférences personnelles.';
  
  // Default image for OpenGraph
  const ogImage = '/logo.png';

  return {
    title: title,
    description: description,
    keywords: ', vêtements professionnels, tunisie , sousse , Aichic Couture',
    authors: [{ name: 'Aichic Couture' }],
    creator: 'Aichic Couture',
    publisher: 'Aichic Couture',
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      url: `https://aichic.tn/product/${productId}`,
      title: title,
      description: description,
      siteName: 'Aichic Couture',
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
      canonical: `https://aichic.tn/product/${productId}`,
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
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
