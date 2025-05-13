import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategoryGroup } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received product data:', JSON.stringify(data, null, 2));
    
    // Create the product
    const productData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      category: data.category.toLowerCase(),
      colors: data.colors,
      sizes: data.sizes,
      collaborateur: data.collaborateur,
      images: {
        create: data.images.map((imageUrl: string, index: number) => ({
          url: imageUrl,
          isMain: index === 0
        }))
      }
    };

    console.log('Processed product data:', JSON.stringify(productData, null, 2));

    const product = await prisma.product.create({
      data: productData,

    });

    console.log('Created product:', JSON.stringify(product, null, 2));
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

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
    
    console.log(`API pagination: page=${page}, limit=${limit}, skip=${skip}`);
    
    // Convert string group to CategoryGroup enum
    let group: CategoryGroup | undefined;
    if (groupParam) {
      if (groupParam.toUpperCase() === 'FEMME') group = CategoryGroup.FEMME;
      else if (groupParam.toUpperCase() === 'ENFANT') group = CategoryGroup.ENFANT;
      else if (groupParam.toUpperCase() === 'ACCESSOIRE') group = CategoryGroup.ACCESSOIRE;
    }

    console.log('API received params:', { category, group, collaborateur, sort, product, searchQuery });
    
    let where: any = {};

    // Category filter
    if (category && category !== "all" && category !== "Tous") {
      // First, fetch the category by name
      let categoryWhereClause: any = {
        name: {
          equals: category,
          mode: 'insensitive'
        }
      };
      
      // Add group filter if specified
      if (group) {
        categoryWhereClause.group = group;
      }
      
      // Log the category search criteria for debugging
      console.log('Searching for category with criteria:', JSON.stringify(categoryWhereClause, null, 2));
      
      const categoryFilter = await prisma.category.findFirst({
        where: categoryWhereClause
      });

      if (categoryFilter) {
        console.log(`Found category: ${categoryFilter.name} in group: ${categoryFilter.group} with ID: ${categoryFilter.id}`);
        where.categories = {
          some: {
            categoryId: categoryFilter.id
          }
        };
      } else {
        console.log(`Category not found: ${category}${group ? ' in group: ' + group : ''}`);
        // Instead of returning an error, we'll return no products by using a valid Prisma condition
        // that will never match any products
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
        console.log(`No categories found for group: ${groupParam}`);
        // Return no products by using a valid Prisma condition
        // that will never match any products
        where.id = {
          in: [] // Empty array means no IDs will match
        };
      }
      console.log(`Using group filter: ${group} - found ${groupCategories.length} categories`);
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

    // Log the final where clause and pagination params
    console.log('Final query parameters:', { where, skip, limit, sort });
    
    // Get total count of products matching the filters
    const totalCount = await prisma.product.count({ where });
    console.log('Total product count:', totalCount);
    
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
    
    console.log(`Returning ${products.length} products, page ${page} of ${Math.ceil(totalCount / limit)}`);

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