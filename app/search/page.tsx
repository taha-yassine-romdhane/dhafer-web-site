"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import Image from "next/image";
import Link from "next/link";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SearchProduct {
  id: number;
  name: string;
  price: number;
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
  const searchQuery = searchParams.get("q") || "";
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [metadata, setMetadata] = useState<SearchMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("relevance");

  const updateSearchParams = (params: Record<string, string | null>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value);
      }
    });
    router.push(`/search?${newSearchParams.toString()}`);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          q: searchQuery,
          ...(selectedCategory !== "all" && { category: selectedCategory }),
          ...(sortBy !== "relevance" && { sortBy }),
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
        });

        const response = await fetch(`/api/search?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch search results");
        }

        setProducts(data.products);
        setMetadata(data.metadata);

        // Initialize price range if not set
        if (data.metadata.priceRange && priceRange[1] === 1000) {
          setPriceRange([
            data.metadata.priceRange.min,
            data.metadata.priceRange.max
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
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const sortOptions = [
    { label: "Relevance", value: "relevance" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Newest", value: "newest" },
  ];

  return (
    <Container>
      <div className="space-y-4 py-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
            {searchQuery && (
              <p className="text-sm text-gray-500">
                Showing results for: <span className="font-medium text-[#7c3f61]">{searchQuery}</span>
              </p>
            )}
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="border-[#7c3f61]/20 hover:border-[#7c3f61] hover:text-[#7c3f61]"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
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
                      All
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

                {/* Price Range */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      defaultValue={[priceRange[0], priceRange[1]]}
                      max={metadata?.priceRange.max || 1000}
                      min={metadata?.priceRange.min || 0}
                      step={10}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="w-full [&_[role=slider-track]]:bg-[#7c3f61] [&_[role=slider]]:bg-[#7c3f61] [&_[role=slider]]:border-[#7c3f61]"
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-500">
                      <span>TND {priceRange[0]}</span>
                      <span>TND {priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Sort By</h3>
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
                    <span>Category: {selectedCategory}</span>
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
                    <span>Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
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
            <p className="text-lg text-gray-500">No products found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters or search with different keywords</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              Found {metadata?.total} products
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
                      <Image
                        src={product.colorVariants[0].images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#7c3f61] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm font-medium text-[#7c3f61]">
                      TND {product.price.toFixed(2)}
                    </p>
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
