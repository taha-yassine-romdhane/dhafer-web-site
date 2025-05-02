import { Product, ProductImage, ColorVariant, Stock } from "@prisma/client";

type ProductWithSizes = Product & {
  colorVariants: (ColorVariant & {
    images: ProductImage[];
    stocks: Stock[];
  })[];
  sizes: string[];
};

export function transformProductForMobileCard(product: any): ProductWithSizes {
  return {
    ...product,
    sizes: product.sizes || [],
    colorVariants: (product.colorVariants || []).map((variant: any) => ({
      ...variant,
      images: variant.images || [],
      stocks: variant.stocks || []
    }))
  };
}

export function isProductValidForMobileCard(product: any): product is ProductWithSizes {
  return (
    product &&
    typeof product === 'object' &&
    Array.isArray(product.sizes) &&
    Array.isArray(product.colorVariants) &&
    product.colorVariants.every((v: any) => 
      Array.isArray(v.images) && Array.isArray(v.stocks)
    )
  );
}
