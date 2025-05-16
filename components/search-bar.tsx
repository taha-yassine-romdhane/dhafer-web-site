"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  colorVariants: {
    color: string;
    images: {
      url: string;
    }[];
  }[];
}

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.products || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    setShowSuggestions(false);
    router.push(`/product/${productId}`);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          placeholder="Recherchez ici ..."
          className="w-full px-4 py-2 rounded-full border border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#D4AF37] hover:text-[#B4941F] transition-colors"
        >
          <Search size={20} />
        </button>
      </form>

      {showSuggestions && searchQuery.length >= 2 && (
        <div className="absolute z-50 w-full md:w-[150%] left-0 md:-left-1/4 mt-2 bg-white rounded-xl shadow-2xl border border-[#D4AF37]/20 max-h-[80vh] md:max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 md:p-6 text-center text-gray-500">Chargement...</div>
          ) : suggestions && suggestions.length > 0 ? (
            <ul className="divide-y divide-[#D4AF37]/10">
              {suggestions.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.id.toString())}
                  className="flex items-center gap-3 md:gap-6 p-4 md:p-6 hover:bg-[#D4AF37]/5 cursor-pointer transition-colors duration-200"
                >
                  {product.colorVariants[0]?.images[0] && (
                    <div className="relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0">
                      <Image
                        src={product.colorVariants[0].images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-base md:text-lg font-semibold text-[#D4AF37]">
                      TND {product.price.toFixed(2)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                      {product.category}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 md:p-6 text-center text-gray-500">Aucun résultat trouvé</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 