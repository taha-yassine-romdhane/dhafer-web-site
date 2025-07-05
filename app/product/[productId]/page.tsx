

import { ProductDetails } from "@/components/product-details";

async function getProduct(productId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  return response.json();
}

export default async function ProductPage({ params }: { params: { productId: string } }) {
  const product = await getProduct(params.productId);

  return <ProductDetails product={product} />;
}