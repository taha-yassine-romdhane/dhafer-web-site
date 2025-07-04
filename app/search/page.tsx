"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import Image from "next/image";
import Link from "next/link";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchProduct {
  id: number;
  name: string;
  price: number;
  salePrice: number | null;
  description: string;
  category: string;
  colorVariants: {
    color: string;
    images: {
      url: string;
      isMain: boolean;
    }[];
  }[];
}

interface SearchMetadata {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  total: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Get query from URL parameters - could be 'query' or 'q'
  const searchQuery = searchParams.get("query") || "";
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [metadata, setMetadata] = useState<SearchMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("relevance");



  // Track if the component is mounted to prevent state updates after unmounting
  const isMounted = React.useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Use a stable reference for the search query to prevent unnecessary re-renders
  const searchQueryRef = React.useRef(searchQuery);
  
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);
  
  // Separate effect for fetching search results to better control dependencies
  useEffect(() => {
    const fetchSearchResults = async () => {
      // Prevent API calls if component is unmounted
      if (!isMounted.current) return;
      
      try {
        setLoading(true);
        // Skip API call for empty or invalid queries
        if (!searchQuery || searchQuery.trim() === "") {
          setProducts([]);
          setLoading(false);
          return;
        }
        
        const params = new URLSearchParams({
          query: searchQuery, // Use 'query' parameter consistently
          ...(selectedCategory !== "all" && { category: selectedCategory }),
          ...(sortBy !== "relevance" && { sortBy }),
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
        });

        console.log('Fetching search results with params:', params.toString());
        
        // Fetch search results with timeout protection
        const fetchData = async () => {
          const response = await fetch(`/api/search?${params.toString()}`);
          
          // Add timeout to prevent infinite loading
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Search request timed out')), 10000);
          });
          
          // Race between the fetch and the timeout
          const data = await Promise.race([
            response.json(),
            timeoutPromise
          ]) as any;
          
          console.log('Search API response status:', response.status);
          
          if (!response.ok) {
            throw new Error(data.error || `Failed to fetch search results: ${response.status}`);
          }
          
          // Log the number of products returned
          console.log(`Search returned ${data.products?.length || 0} products`);
          
          return data;
        };
        
        // Execute the fetch and get results
        const result = await fetchData();
        
        // Check if we have valid data
        if (!result || !result.products) {
          console.error('Invalid search response data:', result);
          throw new Error('Invalid search response data');
        }
        
        setProducts(result.products);
        setMetadata(result.metadata);

        // Initialize price range if not set
        if (result.metadata?.priceRange && priceRange[1] === 1000) {
          setPriceRange([
            result.metadata.priceRange.min || 0,
            result.metadata.priceRange.max || 1000
          ]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setError("Failed to load search results");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  // Only re-run when these dependencies actually change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, sortBy, priceRange[0], priceRange[1]]);

  const sortOptions = [
    { label: "Relevance", value: "relevance" },
    { label: "Prix: Faible au Fort", value: "price-asc" },
    { label: "Prix: Fort au Faible", value: "price-desc" },
    { label: "Nouveau", value: "newest" },
  ];

  return (
    <Container>
      <div className="space-y-4 py-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Recherche Resultat</h1>
            {searchQuery && (
              <p className="text-sm text-gray-500">
                Recherche pour: <span className="font-medium text-[#7c3f61]">{searchQuery}</span>
              </p>
            )}
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="border-[#7c3f61]/20 hover:border-[#7c3f61] hover:text-[#7c3f61]"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Filters Section */}
        <div className={cn(
          "grid gap-4 transition-all duration-300",
          showFilters ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}>
          <div className="overflow-hidden">
            <div className="bg-white p-4 rounded-lg border border-[#7c3f61]/20 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categories */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm",
                        selectedCategory === "all"
                          ? "bg-[#7c3f61] text-white"
                          : "bg-gray-100 hover:bg-[#7c3f61]/10"
                      )}
                    >
                      Tous
                    </button>
                    {metadata?.categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm",
                          selectedCategory === category
                            ? "bg-[#7c3f61] text-white"
                            : "bg-gray-100 hover:bg-[#7c3f61]/10"
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>


                {/* Sort Options */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Filtrage par</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-md border border-[#7c3f61]/20 px-3 py-1.5 text-sm focus:border-[#7c3f61] focus:outline-none focus:ring-1 focus:ring-[#7c3f61]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== "all" && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#7c3f61]/10 text-sm">
                    <span>Categorie: {selectedCategory}</span>
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="text-[#7c3f61] hover:text-[#B4941F]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {sortBy !== "relevance" && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#7c3f61]/10 text-sm">
                    <span>Filtrage par: {sortOptions.find(o => o.value === sortBy)?.label}</span>
                    <button
                      onClick={() => setSortBy("relevance")}
                      className="text-[#7c3f61] hover:text-[#B4941F]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-[#7c3f61]" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <p className="text-lg text-gray-500">Aucun produit trouvé</p>
            <p className="text-sm text-gray-400">Essayez de ajuster vos filtres ou recherchez avec des mots-clés différents</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              Trouvé {metadata?.total} produits
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group"
                >
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 border border-[#7c3f61]/20 group-hover:border-[#7c3f61] transition-colors">
                    {product.colorVariants[0]?.images[0] && (
                      <>
                        <Image
                          src={product.colorVariants[0].images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.salePrice && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#7c3f61] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {product.salePrice ? (
                        <>
                          <span className="text-sm font-medium text-[#7c3f61]">
                            TND {product.salePrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            TND {product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-[#7c3f61]">
                          TND {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
