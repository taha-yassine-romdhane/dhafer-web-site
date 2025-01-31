export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isMain: boolean;
  position: string;
  colorVariantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorVariant {
  id: number;
  color: string;
  images: ProductImage[];
  productId: number;
  stocks: Stock[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Stock {
  id: number;
  location: 'monastir' | 'tunis' | 'sfax' | 'online';
  quantity: number;
  productId: number;
  size: string;
  colorId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  category: string;
  sizes: string[];
  collaborateur?: string | null;
  colorVariants: ColorVariant[];
  stocks: Stock[];
  showInHome: boolean;
  showInPromo: boolean;
  showInTopSales: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}
export type ProductDisplayUpdate = {
  showInHome?: boolean;
  showInPromo?: boolean;
  showInTopSales?: boolean;
  priority?: number;
}