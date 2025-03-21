import Link from "next/link";
import { BsFacebook, BsInstagram, BsYoutube, BsTiktok } from "react-icons/bs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#7c3f61]/20">
      <div className="container mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#7c3f61]">Aichic Couture</h3>
            <p className="text-sm text-gray-600">
            Mode féminine chic, moderne et de qualité. Soyez élégante chaque jour !
            </p>
            {/* Social Links */}
            <div className="flex justify-center space-x-6">
              <Link 
                href="https://www.facebook.com/profile.php?id=61573119575107&mibextid=wwXIfr&mibextid=wwXIfr" 
                className="text-gray-400 hover:text-[#7c3f61] transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsFacebook className="h-6 w-6" />
              </Link>
              <Link 
                href="https://www.instagram.com/aichic.couture?igsh=ZmNhZThsbHc4NDFt" 
                className="text-gray-400 hover:text-[#7c3f61] transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsInstagram className="h-6 w-6" />
              </Link>
              <Link 
                href="https://www.tiktok.com/@aichic.couture?_t=ZM-8ujv4qmSFvD&_r=1" 
                className="text-gray-400 hover:text-[#7c3f61] transition-colors transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsTiktok className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[#7c3f61]">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/collections" className="text-gray-600 hover:text-[#7c3f61] transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-gray-600 hover:text-[#7c3f61] transition-colors">
                  Femme
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-gray-600 hover:text-[#7c3f61] transition-colors">
                  Enfant
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-[#7c3f61] transition-colors">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-[#7c3f61] transition-colors">
                  TOP Vente
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4 text-[#7c3f61]">Service Client</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-[#7c3f61] transition-colors">
                  A propos de <span className="font-semibold">Aichic</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-[#7c3f61] transition-colors">
                  Contactez Nous
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 hover:text-[#7c3f61] transition-colors hidden">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-600 hover:text-[#7c3f61] transition-colors">
                  Politique de remboursement
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4 text-[#7c3f61]">Restez informé</h3>
            <p className="text-sm text-gray-600 mb-4">
              Abonnez-vous à notre newsletter pour rester informé des dernières tendances et des offres exclusives.
            </p>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="border-[#7c3f61]/20 focus:ring-[#7c3f61] focus:border-[#7c3f61]"
              />
              <Button className="w-full bg-[#7c3f61] text-white hover:bg-[#7c3f61]/90">
                S&#39;abonner
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#7c3f61]/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              {new Date().getFullYear()} <span className="font-semibold">Aichic</span>  Tous droits reservés .
            </p>
            <div className="flex space-x-6">
              
              <Link href="/policy" className="text-sm text-gray-600 hover:text-[#7c3f61] transition-colors">
                Politique de confidentialité
              </Link>
             
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}