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
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;
    
    // Convert string group to CategoryGroup enum
    let group: CategoryGroup | undefined;
    if (groupParam) {
      if (groupParam.toUpperCase() === 'FEMME') group = CategoryGroup.FEMME;
      else if (groupParam.toUpperCase() === 'ENFANT') group = CategoryGroup.ENFANT;
      else if (groupParam.toUpperCase() === 'ACCESSOIRE') group = CategoryGroup.ACCESSOIRE;
    }

    console.log('API received params:', { category, group, collaborateur, sort, product });
    
    let where: any = {};

    // Category filter
    if (category && category !== "all" && category !== "Tous") {
      // First, fetch the category by name
      const categoryFilter = await prisma.category.findFirst({
        where: {
          name: {
            equals: category,
            mode: 'insensitive'
          },
          // If group is specified, filter by group as well
          ...(group && { group })
        }
      });

      if (categoryFilter) {
        where.categories = {
          some: {
            categoryId: categoryFilter.id
          }
        };
      } else {
        console.log(`Category not found: ${category}`);
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