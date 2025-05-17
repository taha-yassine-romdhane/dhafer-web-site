import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategoryGroup } from "@prisma/client";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const groupParam = searchParams.get("group");
    const collaborateur = searchParams.get("collaborateur");
    const sort = searchParams.get("sort");
    const product = searchParams.get("product");
    const searchQuery = searchParams.get("search");
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;
    
    // Convert string group to CategoryGroup enum
    let group: CategoryGroup | undefined;
    if (groupParam) {
      if (groupParam.toUpperCase() === 'FEMME') group = CategoryGroup.FEMME;
      else if (groupParam.toUpperCase() === 'ENFANT') group = CategoryGroup.ENFANT;
      else if (groupParam.toUpperCase() === 'ACCESSOIRE') group = CategoryGroup.ACCESSOIRE;
    }
    let where: any = {};
    
    // Category filter
    if (category && category !== "all" && category !== "Tous") {
      // Create a more specific where clause that matches both name and group exactly
      let categoryWhereClause: any = {};
      
      // Always add name filter
      categoryWhereClause.name = {
        equals: category,
        mode: 'insensitive'
      };
      
      // If group is specified, add it as a strict equality condition
      if (group) {
        // Explicitly add the group filter
        categoryWhereClause.group = group;
      }
      
      
      
      // First try an exact match approach
      const categoryFilter = await prisma.category.findFirst({
        where: categoryWhereClause
      });

      if (categoryFilter) {
        where.categories = {
          some: {
            categoryId: categoryFilter.id
          }
        };
      } else {
        where.id = {
          in: [] // Empty array means no IDs will match
        };
      }
    } else if (group) {
      // If only group is specified (no specific category), get all categories in that group
      const groupCategories = await prisma.category.findMany({
        where: {
          group
        }
      });
      
      if (groupCategories.length > 0) {
        const categoryIds = groupCategories.map(cat => cat.id);
        where.categories = {
          some: {
            categoryId: {
              in: categoryIds
            }
          }
        };
      } else {
        where.id = {
          in: [] // Empty array means no IDs will match
        };
      }
    }
    
    // Collaborateur filter
    if (collaborateur && collaborateur !== "all") {
      where.collaborateur = {
        equals: collaborateur,
        mode: 'insensitive'
      };
    }

    // Product name filter
    if (product) {
      const productName = product
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .replace(/-/g, " ");
      
      where.name = {
        contains: productName,
        mode: 'insensitive'
      };
    }
    
    // Search query filter
    if (searchQuery && searchQuery.trim() !== "") {
      // If we already have a name filter, we need to combine them with OR
      if (where.name) {
        // Create an OR condition with both filters
        where.OR = [
          { name: where.name },  // Keep existing name filter
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ];
        
        // Remove the original name filter since it's now in the OR condition
        delete where.name;
      } else {
        // If no existing name filter, create a simple OR condition
        where.OR = [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ];
      }
    }
    
    // Get total count of products matching the filters
    const totalCount = await prisma.product.count({ where });
    
    // Get products with their color variants and images with pagination
    const products = await prisma.product.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        colorVariants: {
          include: {
            images: true
          }
        }
      },
      orderBy: sort === "price-asc" 
        ? { price: "asc" }
        : sort === "price-desc"
        ? { price: "desc" }
        : sort === "newest"
        ? { createdAt: "desc" }
        : { id: "asc" },
      skip,
      take: limit
    });
    // Return products with pagination metadata
    return NextResponse.json({
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}