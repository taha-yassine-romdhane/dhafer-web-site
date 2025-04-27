"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/product-grid";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define filter options based on navbar categories
const CATEGORIES = [
  { value: "Tous", label: "Voir Tous" },
  { value: "abaya", label: "ABAYA" },
  { value: "caftan", label: "CAFTAN" },
  { value: "robe-soire", label: "ROBE SOIRE" },
  { value: "jebba", label: "JEBBA" },
  { value: "enfants-caftan", label: "ENFANTS CAFTAN" },
  { value: "enfants-robe-soire", label: "ENFANTS ROBE SOIRE" },
  { value: "tabdila", label: "TABDILA" },
  { value: "chachia", label: "CHACHIA" },
  { value: "pochette", label: "POCHETTE" },
  { value: "eventaille", label: "EVENTAILLE" },
  { value: "foulard", label: "FOULARD" }
];

const CATEGORY_GROUPS = [
  {
    label: "Femme",
    categories: ["abaya", "caftan", "robe-soire", "jebba" ,"tabdila"]
  },
  {
    label: "Enfants",
    categories: ["enfants-caftan", "enfants-robe-soire", "tabdila"]
  },
  {
    label: "Accessoires",
    categories: ["chachia", "pochette", "eventaille", "foulard"]
  }
];

const SORT_OPTIONS = [
  { value: "featured", label: "Top Ventes" },
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix: Croissant" },
  { value: "price-desc", label: "Prix: Décroissant" }
];

export default function CollectionsPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "Tous",
    collaborator: searchParams.get("collaborator") || "all",
    sort: searchParams.get("sort") || "featured",
    product: searchParams.get("product") || ""
  });

  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      category: searchParams.get("category") || "all",
      collaborator: searchParams.get("collaborator") || "all",
      sort: searchParams.get("sort") || "featured",
      product: searchParams.get("product") || ""
    });
  }, [searchParams]);

  useEffect(() => {
    // Set active group based on selected category
    if (filters.category !== 'Tous') {
      const group = CATEGORY_GROUPS.find(group => 
        group.categories.includes(filters.category)
      );
      setActiveGroup(group?.label || null);
    } else {
      setActiveGroup(null);
    }
  }, [filters.category]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: "all",
      collaborator: "all",
      sort: "featured",
      product: ""
    });
    setActiveGroup(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {filters.product 
              ? filters.product.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
              : filters.category !== "Tous" 
                ? CATEGORIES.find(c => c.value === filters.category)?.label
                : "Toutes les Collections"
            }
          </h1>
          <p className="text-gray-600 mt-2">
            Découvrez notre dernière collection de pièces élégantes et intemporelles
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          {/* Category Groups and Categories */}
          <div className="flex flex-col gap-4">
            {/* Main Category Groups */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  handleFilterChange("category", "all");
                  setActiveGroup(null);
                }}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  filters.category === "all"
                    ? "bg-[#D4AF37] text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-[#D4AF37]/10"
                }`}
              >
                Voir Tous
              </button>
              {CATEGORY_GROUPS.map((group) => (
                <button
                  key={group.label}
                  onClick={() => setActiveGroup(activeGroup === group.label ? null : group.label)}
                  className={`px-4 py-2 rounded-full transition-all duration-200 ${
                    activeGroup === group.label
                      ? "bg-[#D4AF37] text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-[#D4AF37]/10"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            {/* Subcategories with animation */}
            {activeGroup && (
              <div className="flex flex-wrap gap-2 pl-2 animate-fadeIn">
                {CATEGORIES.filter(cat => 
                  CATEGORY_GROUPS.find(g => g.label === activeGroup)?.categories.includes(cat.value)
                ).map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleFilterChange("category", category.value)}
                    className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                      filters.category === category.value
                        ? "bg-[#D4AF37]/20 text-[#D4AF37] border-2 border-[#D4AF37] font-medium shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}

            {/* Sort and Clear Filters */}
            <div className="flex items-center justify-between mt-4 border-t pt-4">
              <div className="flex items-center gap-4">
                <Select
                  value={filters.sort}
                  onValueChange={(value) => handleFilterChange("sort", value)}
                >
                  <SelectTrigger className="w-[200px] bg-white border border-gray-200 hover:border-[#D4AF37] transition-colors">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="hover:bg-[#D4AF37]/10 cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(filters.category !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="border border-gray-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-gray-600 hover:text-[#D4AF37] transition-colors"
                  >
                    Effacer les filtres
                  </Button>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {/* You can add product count here if available */}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid filters={filters} />
      </div>
    </div>
  );
}