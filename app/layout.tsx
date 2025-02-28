import './globals.css';

import { Inter } from 'next/font/google';
import { CartProvider } from "@/lib/context/cart-context";
import { AuthProvider } from "@/contexts/auth-context";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/react";
import { CartDropdown } from "@/components/cart-dropdown";


const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDropdown />
            <main className="min-h-screen">
              {children}
              <Analytics />
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}