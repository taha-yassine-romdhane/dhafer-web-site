"use client"
import Link from "next/link";
import { useState } from "react";
import { BsFacebook, BsInstagram, BsYoutube, BsTiktok } from "react-icons/bs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export function Footer() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subscriptionResult, setSubscriptionResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setSubscriptionResult({
        success: false,
        message: 'Veuillez entrer un numéro de téléphone'
      });
      setDialogOpen(true);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get auth token from localStorage if it exists
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization token if available
      if (typeof window !== 'undefined') {
        // Try both possible token keys
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers,
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      
      setSubscriptionResult({
        success: data.success,
        message: data.message || data.error || 'Une erreur est survenue'
      });
      
      if (data.success) {
        setPhoneNumber('');
      }
      
      setDialogOpen(true);
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscriptionResult({
        success: false,
        message: 'Une erreur est survenue lors de l\'abonnement'
      });
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <footer className="bg-white border-t border-[#D4AF37]/20">
      <div className="container mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#D4AF37]">DAR AL KOFTAN AL ASIL</h3>
            <p className="text-sm text-gray-600">
              Dar Al Koftan Al Assil est votre destination de choix pour des caftans traditionnels de haute qualité.
            </p>
            {/* Social Links */}
            <div className="flex space-x-6">
              <Link 
                href="https://www.facebook.com/profile.php?id=100064931580253" 
                className="text-gray-400 hover:text-[#D4AF37] transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsFacebook className="h-6 w-6" />
              </Link>
              <Link 
                href="https://www.instagram.com/dar_koftan_alasil/" 
                className="text-gray-400 hover:text-[#D4AF37] transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsInstagram className="h-6 w-6" />
              </Link>
              <Link 
                href="https://www.youtube.com/@darelkoftanalassildarelkoftana" 
                className="text-gray-400 hover:text-[#D4AF37] transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsYoutube className="h-6 w-6" />
              </Link>
              <Link 
                href="https://www.tiktok.com/@dar.koftane.al.asil" 
                className="text-gray-400 hover:text-[#D4AF37] transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsTiktok className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[#D4AF37]">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/collections" className="text-gray-600 hover:text-[#D4AF37] transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/collections?category=koftan&group=FEMME" className="text-gray-600 hover:text-[#D4AF37] transition-colors">
                  Koftan Femme
                </Link>
              </li>
              <li>
                <Link href="/collections?category=robe&group=ENFANT" className="text-gray-600 hover:text-[#D4AF37] transition-colors">
                  Robe Enfant
                </Link>
              </li>
              <li>
                <Link href="/promo" className="text-gray-600 hover:text-[#D4AF37] transition-colors">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/top-vente" className="text-gray-600 hover:text-[#D4AF37] transition-colors">
                  Top Vente
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4 text-[#D4AF37]">Service Client</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-[#D4AF37] transition-colors">
                  Dar Koftan al assil
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-[#D4AF37] transition-colors">
                  Contactez Nous
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 hover:text-[#D4AF37] transition-colors hidden">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-600 hover:text-[#D4AF37] transition-colors">
                  Politique de remboursement
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4 text-[#D4AF37]">Restez informé</h3>
            <p className="text-sm text-gray-600 mb-4">
              Abonnez-vous à notre newsletter pour rester informé des dernières tendances et des offres exclusives.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+216 00 00 00 00"
                className="border-[#D4AF37]/20 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                disabled={loading}
              />
              <Button 
                type="submit"
                className="w-full bg-[#D4AF37] text-white hover:bg-[#D4AF37]/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "S'abonner"
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#D4AF37]/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              {new Date().getFullYear()} <span className="font-semibold">DAR KOFTAN EL ASIL</span>  Tous droits reservés .
            </p>
            <div className="flex space-x-6">
              <Link href="/policy" className="text-sm text-gray-600 hover:text-[#D4AF37] transition-colors">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success/Error Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {subscriptionResult?.success ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Abonnement réussi
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  Erreur
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-4 text-center">
              {subscriptionResult?.message}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </footer>
  );
}