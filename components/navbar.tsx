"use client";

import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Subcategory {
  name: string;
  query?: string;
  href?: string;
}

interface Category {
  label: string;
  subcategories?: Subcategory[];
  url?: string;
}

const collectionCategories: Category[] = [
  {
    label: "Femme",
    subcategories: [
      { name: "ABAYA", query: "abaya" },
      { name: "CAFTAN", query: "caftan" },
      { name: "ROBE SOIRE", query: "robe-soire" },
      { name: "JEBBA", query: "jebba" },
    ],
  },
  {
    label: "Enfants",
    subcategories: [
      { name: "CAFTAN", query: "enfants-caftan" },
      { name: "ROBE SOIRE", query: "enfants-robe-soire" },
      { name: "TABDILA", query: "tabdila" },
    ],
  },
  {
    label: "Accessoires",
    subcategories: [
      { name: "CHACHIA", query: "chachia" },
      { name: "POCHETTE", query: "pochette" },
      { name: "EVENTAILLE", query: "eventaille" },
      { name: "FOULARD", query: "foulard" },
    ],
  },
  {
    label: "Promo",
    url: "/promo",
  },
  {
    label: "Top Vente",
    url: "/top-vente",
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const router = useRouter();
  const { items } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setOpenCategory(null);
  };

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="border-b">
      <Container>
        <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between bg-white">
          <div className="flex items-center">
            <Button
              onClick={toggleMenu}
              className="p-2 lg:hidden text-[#D4AF37] hover:bg-[#D4AF37]/10"
              variant="ghost"
              aria-label="Toggle Menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            <Link href="/" className="ml-4 lg:ml-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={70}
                height={70}
                className="object-contain"
              />
            </Link>
          </div>

          <nav
            ref={menuRef}
            className={`${
              isOpen
                ? "absolute top-full left-0 right-0 bg-white border-b border-[#D4AF37]/20"
                : "hidden lg:flex"
            } lg:relative lg:left-auto lg:top-auto lg:bg-transparent lg:border-none z-50`}
          >
            <ul className="px-4 py-2 lg:flex lg:space-x-8">
              {collectionCategories.map((category) => (
                <li
                  key={category.label}
                  className="relative group py-2 lg:py-0"
                >
                  {category.url ? (
                    <Link
                      href={category.url}
                      className="text-gray-800 hover:text-[#D4AF37] transition-colors"
                    >
                      {category.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleCategory(category.label)}
                        className="flex items-center space-x-1 text-gray-800 hover:text-[#D4AF37] transition-colors"
                        aria-expanded={openCategory === category.label}
                      >
                        <span>{category.label}</span>
                      </button>

                      {category.subcategories && (
                        <div
                          className={`${
                            openCategory === category.label
                              ? "block"
                              : "hidden lg:group-hover:block"
                          } lg:absolute lg:left-0 lg:top-full lg:w-48 lg:bg-white lg:shadow-lg lg:rounded-md lg:mt-1 border border-[#D4AF37]/20`}
                        >
                          <ul className="py-2">
                            {category.subcategories.map((subcategory) => (
                              <li key={subcategory.name}>
                                <Link
                                  href={
                                    subcategory.href ||
                                    `/collections?category=${subcategory.query}`
                                  }
                                  className="block px-4 py-2 hover:bg-gray-100"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {subcategory.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border-[#D4AF37]/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            <Link
              href="/cart"
              className="relative text-gray-800 hover:text-[#D4AF37] transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-[#D4AF37] text-white text-xs flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;