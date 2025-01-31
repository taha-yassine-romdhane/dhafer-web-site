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
          placeholder="Search products..."
          className="w-full px-4 py-2 rounded-full border border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 bg-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#D4AF37] hover:text-[#B4941F] transition-colors"
        >
          <Search size={20} />
        </button>
      </form>

      {showSuggestions && (searchQuery.length >= 2) && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-[#D4AF37]/20 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : suggestions && suggestions.length > 0 ? (
            <ul>
              {suggestions.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.id.toString())}
                  className="flex items-center gap-3 p-3 hover:bg-[#D4AF37]/5 cursor-pointer border-b border-[#D4AF37]/10 last:border-b-0"
                >
                  {product.colorVariants[0]?.images[0] && (
                    <div className="relative w-12 h-12">
                      <Image
                        src={product.colorVariants[0].images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-[#D4AF37]">
                      TND{product.price.toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
