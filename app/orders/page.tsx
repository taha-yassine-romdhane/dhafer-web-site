'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiGet } from '@/lib/api-client';

interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  isMain: boolean;
  position: string;
  colorVariantId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ColorVariant {
  id: number;
  color: string;
  images: ProductImage[];
  productId: number;
  stocks: Stock[];
  createdAt: Date;
  updatedAt: Date;
}

interface Stock {
  id: number;
  location: 'monastir' | 'tunis' | 'sfax' | 'online';
  quantity: number;
  productId: number;
  size: string;
  colorId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  category: string;
  sizes: string[];
  collaborateur: string | null;
  colorVariants: ColorVariant[];
  stocks: Stock[];
  showInHome: boolean;
  showInPromo: boolean;
  showInTopSales: boolean;
  priority: number;
  viewCount: number; 
  orderCount: number; 
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
  colorVariant: ColorVariant;
}

interface Order {
  id: number;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isLoggedIn, isLoading: authLoading, user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Wait for auth to be ready
        if (authLoading) return;
        
        // Check if user is logged in
        if (!isLoggedIn || !user) {
          setError('Please log in to view your orders');
          setLoading(false);
          return;
        }
        
        // Use the apiGet helper which automatically adds the auth token
        const data = await apiGet('/api/users/orders');
        setOrders(data);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        
        if (err.message?.includes('Authentication required')) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Error loading orders. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please log in to view your orders</p>
          <Link 
            href="/login?redirect=/orders"
            className="mt-4 inline-block rounded-md bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white hover:bg-[#B59851] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link 
            href="/collections"
            className="mt-4 inline-block rounded-md bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white hover:bg-[#B59851] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track your orders
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <h3 className="text-lg font-medium text-gray-900">
                No orders found
              </h3>
              <p className="mt-2 text-gray-600">
                You have not placed any orders yet.
              </p>
              <Link
                href="/collections"
                className="mt-4 inline-block rounded-md bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white hover:bg-[#B59851] transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-lg bg-white shadow"
                >
                  <div className="border-b border-gray-200 bg-[#D4AF37]/5 px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Placed on{' '}
                          {format(new Date(order.createdAt), 'PPP')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center rounded-full bg-[#D4AF37]/10 px-3 py-1 text-sm font-medium text-[#D4AF37]">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-4 sm:px-6">
                    <div className="flow-root">
                      <ul className="-my-5 divide-y divide-gray-200">
                        {order.items.map((item) => (
                          <li key={item.id} className="py-5">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="relative h-20 w-20">
                                  {item.colorVariant && item.colorVariant.images && item.colorVariant.images.length > 0 ? (
                                    <Image
                                      src={item.colorVariant.images.find((img: ProductImage) => img.url)?.url || '/default-product.jpg'}
                                      alt={item.colorVariant.images.find((img: ProductImage) => img.url)?.alt || item.product.name}
                                      fill
                                      className="rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="h-20 w-20 flex items-center justify-center bg-gray-200 text-gray-500">
                                      No Image
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {item.product ? item.product.name : 'Unknown Product'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Price: TND{item.product ? item.product.price.toFixed(2) : '0.00'}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <span className="text-base font-medium text-gray-900">
                          Total
                        </span>
                        <span className="text-base font-medium text-[#D4AF37]">
                          TND{order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}