"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/product-grid";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: number;
  name: string;
  description?: string;
  group?: string;
}

interface CategoryGroup {
  label: string;
  categories: Category[];
}

// Default category for "All"
const ALL_CATEGORY = { value: "Tous", label: "Voir Tous" };

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
    product: searchParams.get("product") || "",
    page: parseInt(searchParams.get("page") || "1")
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(filters.page);
  const [totalPages, setTotalPages] = useState(1);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const data = await response.json();
        setCategories(data.categories || []);
        
        // Organize categories into groups based on the group field from the database
        const femmeCategories = data.categories.filter((cat: Category) => 
          cat.group === 'FEMME'
        );
        
        const enfantsCategories = data.categories.filter((cat: Category) => 
          cat.group === 'ENFANT'
        );
        
        const accessoiresCategories = data.categories.filter((cat: Category) => 
          cat.group === 'ACCESSOIRE'
        );
        
        setCategoryGroups([
          { label: 'Femme', categories: femmeCategories },
          { label: 'Enfants', categories: enfantsCategories },
          { label: 'Accessoires', categories: accessoiresCategories }
        ]);
        
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Update filters when URL params change
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    setFilters({
      category: searchParams.get("category") || "Tous",
      collaborator: searchParams.get("collaborator") || "all",
      sort: searchParams.get("sort") || "featured",
      product: searchParams.get("product") || "",
      page: page
    });
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    // Set active group based on selected category
    if (filters.category !== 'Tous') {
      const group = categoryGroups.find(group => 
        group.categories.some(cat => cat.name.toLowerCase() === filters.category.toLowerCase())
      );
      setActiveGroup(group?.label || null);
    } else {
      setActiveGroup(null);
    }
  }, [filters.category, categoryGroups]);

  const handleFilterChange = (key: string, value: string) => {
    // Reset to page 1 when changing filters
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? parseInt(value) : 1 }));
    if (key !== 'page') {
      setCurrentPage(1);
    } else {
      setCurrentPage(parseInt(value));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      category: "all",
      collaborator: "all",
      sort: "featured",
      product: "",
      page: 1
    });
    setCurrentPage(1);
    setActiveGroup(null);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    handleFilterChange('page', page.toString());
  };
  
  // Update total pages
  const handleTotalPagesChange = (pages: number) => {
    console.log('Total pages received:', pages);
    setTotalPages(pages);
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
                ? categories.find(c => c.name.toLowerCase() === filters.category.toLowerCase())?.name.toUpperCase()
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
                  handleFilterChange("category", "Tous");
                  setActiveGroup(null);
                }}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  filters.category === "Tous"
                    ? "bg-[#D4AF37] text-white shadow-md"
                    : "bg-gray-50 text-gray-700 hover:bg-[#D4AF37]/10"
                }`}
              >
                Voir Tous
              </button>
              {categoryGroups.map((group) => (
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
                {categoryGroups
                  .find(g => g.label === activeGroup)?.categories
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange("category", category.name.toLowerCase())}
                      className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                        filters.category === category.name.toLowerCase()
                          ? "bg-[#D4AF37]/20 text-[#D4AF37] border-2 border-[#D4AF37] font-medium shadow-sm"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      }`}
                    >
                      {category.name.toUpperCase()}
                    </button>
                  ))}
              </div>
            )}

            {/* Search Bar */}
            <div className="mt-4 border-t pt-4">
              <div className="relative w-full max-w-md mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-2 border border-gray-200 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] w-full"
                />
                {searchQuery && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Sort and Clear Filters */}
            <div className="flex items-center justify-between">
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

                {(filters.category !== "Tous" || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleClearFilters();
                      setSearchQuery("");
                    }}
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
        <ProductGrid 
          filters={{...filters, group: activeGroup, searchQuery: searchQuery}} 
          onPageChange={handlePageChange}
          onTotalPagesChange={handleTotalPagesChange}
        />
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="border-[#D4AF37]/20 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37] hover:border-[#D4AF37]"
            >
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-[#D4AF37]/20 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37] hover:border-[#D4AF37]"
            >
              ‹
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // If near start, show first 5 pages
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // If near end, show last 5 pages
                  pageNum = totalPages - 4 + i;
                } else {
                  // Otherwise show 2 before and 2 after current page
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={currentPage === pageNum 
                      ? "bg-[#D4AF37] text-white hover:bg-[#D4AF37]/90" 
                      : "border-[#D4AF37]/20 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37] hover:border-[#D4AF37]"}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-[#D4AF37]/20 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37] hover:border-[#D4AF37]"
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="border-[#D4AF37]/20 hover:bg-[#D4AF37]/5 hover:text-[#D4AF37] hover:border-[#D4AF37]"
            >
              »
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}