"use client";

import Link from "next/link";
import {  Menu, X, LogOut, ShoppingBag, Settings } from "lucide-react";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import SearchBar from "@/components/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

interface Subcategory {
  name: string;
  query?: string;
  href?: string;
  group?: string;
}

interface Category {
  label: string;
  subcategories?: Subcategory[];
  url?: string;
}

// Static categories that will always be shown
const staticCategories: Category[] = [
  {
    label: "Promo",
    url: "/promo",
  },
  {
    label: "Top Vente",
    url: "/top-vente",
  },
];

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { items = [] } = useCart?.() || {}; // Safely handle missing cart context
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(staticCategories);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set isClient to true after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Safe access to window object
  const isBrowser = typeof window !== 'undefined';

  // Function to disable body scroll
  const disableBodyScroll = () => {
    if (!isBrowser) return;
    
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  };

  // Function to enable body scroll
  const enableBodyScroll = () => {
    if (!isBrowser) return;
    
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  };

  const toggleMenu = () => {
    // Prevent body scroll when menu is open
    if (!isOpen) {
      disableBodyScroll();
    } else {
      enableBodyScroll();
    }
    
    setIsOpen(!isOpen);
    setOpenCategory(null);
  };

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  // Track if component is mounted for memory safety
  const isMountedRef = useRef(true);

  // Effect to reset body styles when navigating away or unmounting
  useEffect(() => {
    return () => {
      // Reset body styles when component unmounts or before navigation
      if (document.body.style.position === 'fixed') {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, []);

  // Fetch categories from the API with caching
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    // Check if we have cached categories in localStorage
    const fetchCategories = async () => {
      if (!isMounted) return;
      
      // Try to get categories from localStorage first
      const cachedCategories = localStorage.getItem('navbarCategories');
      const cacheTimestamp = localStorage.getItem('navbarCategoriesTimestamp');
      const currentTime = new Date().getTime();
      
      // Use cache if it exists and is less than 1 hour old
      if (cachedCategories && cacheTimestamp && 
          (currentTime - parseInt(cacheTimestamp)) < 3600000) {
        try {
          const parsedCategories = JSON.parse(cachedCategories);
          if (isMounted) {
            setCategories([...parsedCategories, ...staticCategories]);
            setLoading(false);
            return; // Use cache and skip API call
          }
        } catch (e) {
          console.error('Error parsing cached categories:', e);
          // Continue with API call if cache parsing fails
        }
      }
      
      try {
        setLoading(true);
        const response = await fetch('/api/categories', {
          signal: controller.signal,
          cache: 'force-cache' // Use Next.js cache
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
        if (!isMounted) return;
        
        // Ensure data.categories exists and is an array
        if (!data.categories || !Array.isArray(data.categories)) {
          console.error('Invalid categories data format:', data);
          return;
        }
        
        // Group categories by their group (FEMME, ENFANT, ACCESSOIRE)
        const categoryGroups: Record<string, any[]> = {};
        
        data.categories.forEach((category: any) => {
          const group = category.group || 'FEMME';
          
          if (!categoryGroups[group]) {
            categoryGroups[group] = [];
          }
          
          categoryGroups[group].push(category);
        });
        
        const getGroupDisplayName = (technicalName: string): string => ({
          'FEMME': 'Femme',
          'ENFANT': 'Enfants',
          'ACCESSOIRE': 'Accessoires'
        }[technicalName] || technicalName);
        
        const groupOrder = ['FEMME', 'ENFANT', 'ACCESSOIRE'];
        
        const groupedCategories = groupOrder
          .filter(group => categoryGroups[group]?.length > 0)
          .map(groupName => ({
            label: getGroupDisplayName(groupName),
            subcategories: categoryGroups[groupName].map(category => ({
              name: category.name,
              query: category.name.toLowerCase().replace(/\s+/g, '-'),
              group: category.group,
            })),
          }));
        
        if (isMounted) {
          // Save to localStorage for future use
          try {
            localStorage.setItem('navbarCategories', JSON.stringify(groupedCategories));
            localStorage.setItem('navbarCategoriesTimestamp', new Date().getTime().toString());
          } catch (e) {
            console.error('Error caching categories:', e);
            // Continue even if caching fails
          }
          
          setCategories([...groupedCategories, ...staticCategories]);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching categories:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchCategories();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Handle click outside to close menu
  useEffect(() => {
    if (!isBrowser || !isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        enableBodyScroll();
        setIsOpen(false);
        setOpenCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as any);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
      enableBodyScroll();
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="border-b relative z-50">
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

            <Link href="/" className="ml-4 lg:ml-0 ">
              <div className="relative h-12 w-32">
                <Image
                  src="/logo.webp"
                  alt="Logo"
                  fill
                  sizes="(max-width: 768px) 8rem, 10rem"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 h-full">
            <ul className="flex space-x-8 h-full">
              {categories.map((category) => (
                <li key={category.label} className="relative group h-16 flex items-center">
                  {category.url ? (
                    <Link
                      href={category.url}
                      className="text-gray-800 hover:text-[#D4AF37] transition-colors py-2 block"
                    >
                      {category.label}
                    </Link>
                  ) : (
                    <div className="relative">
                      <button
                        className="text-gray-800 hover:text-[#D4AF37] transition-colors py-2 flex items-center"
                        onClick={() => toggleCategory(category.label)}
                        onMouseEnter={() => toggleCategory(category.label)}
                      >
                        {category.label}
                      </button>
                      {category.subcategories && (
                        <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-56 bg-white shadow-lg rounded-md border border-[#D4AF37]/20 z-50 overflow-y-auto max-h-[70vh]">
                          <div className="sticky top-0 bg-white border-b border-[#D4AF37]/10 py-2 px-4 font-medium text-[#D4AF37]">
                            {category.label}
                          </div>
                          <ul className="py-1">
                            {category.subcategories.map((subcategory) => (
                              <li key={subcategory.name}>
                                <Link
                                  href={`/collections?category=${subcategory.query}&group=${subcategory.group}`}
                                  className="block px-4 py-2 text-gray-700 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors"
                                >
                                  {subcategory.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side - Search, Cart, and Auth */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-4">
              <SearchBar />
            </div>

            <Link
              href="/cart"
              className="relative text-gray-800 hover:text-[#D4AF37] transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {isClient && items.length > 0 && (
                <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-[#D4AF37] text-white text-xs flex items-center justify-center">
                  {items.length > 9 ? '9+' : items.length}
                </div>
              )}
            </Link>

            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="relative h-8 w-8 bg-[#D4AF37] hover:bg-[#D4AF37]/80 rounded-full"
                  >
                    <div className="flex items-center justify-center h-full w-full bg-[#D4AF37] text-white rounded-full">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Derniére connexion: {new Date().toLocaleString()}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="w-full">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Mes commandes</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Deconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-[#D4AF37] transition-colors"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="bg-[#D4AF37] text-white hover:bg-[#B59851] transition-colors"
                  >
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className="lg:hidden fixed top-[64px] left-0 right-0 bottom-0 bg-white overflow-y-auto z-50 border-t border-[#D4AF37]/20"
          >
            {/* Sticky search bar at the top of mobile menu */}
            <div className="sticky top-0 p-4 bg-white shadow-md z-10">
              <SearchBar />
            </div>
            <div className="px-4 py-2">
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.label} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                    {category.url ? (
                      <Link
                        href={category.url}
                        className="block w-full py-3 text-gray-800 hover:text-[#D4AF37] transition-colors"
                        onClick={() => {
                          setIsOpen(false);
                          enableBodyScroll();
                        }}
                      >
                        {category.label}
                      </Link>
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.label)}
                          className="w-full flex items-center justify-between py-3 text-gray-800 hover:text-[#D4AF37] transition-colors"
                          aria-expanded={openCategory === category.label}
                          aria-controls={`mobile-submenu-${category.label}`}
                        >
                          <span>{category.label}</span>
                          {openCategory === category.label ? (
                            <X size={18} aria-hidden="true" />
                          ) : (
                            <Menu size={18} aria-hidden="true" />
                          )}
                        </button>
                        
                        {category.subcategories && openCategory === category.label && (
                          <div 
                            id={`mobile-submenu-${category.label}`}
                            className="ml-4 mt-1 border-l-2 border-[#D4AF37]/20 pl-4 relative"
                          >
                            <h3 className="sticky top-0 bg-white py-2 z-10 font-medium text-[#D4AF37] border-b border-[#D4AF37]/10 mb-2">
                              {category.label}
                            </h3>
                            <ul className="space-y-2">
                              {category.subcategories.slice(0, 10).map((subcategory) => (
                                <li key={subcategory.name}>
                                  <Link
                                    href={`/collections?category=${subcategory.query}&group=${subcategory.group}`}
                                    onClick={() => {
                                      setIsOpen(false);
                                      enableBodyScroll();
                                    }}
                                    className="block py-2 text-gray-600 hover:text-[#D4AF37] transition-colors"
                                  >
                                    {subcategory.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            {category.subcategories.length > 10 && (
                              <div className="mt-2">
                                <Link
                                  href={`/collections?group=${category.subcategories[0]?.group}`}
                                  onClick={() => {
                                    setIsOpen(false);
                                    enableBodyScroll();
                                  }}
                                  className="block py-2 text-[#D4AF37] font-medium hover:underline"
                                >
                                  Voir plus ({category.subcategories.length - 10})
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}