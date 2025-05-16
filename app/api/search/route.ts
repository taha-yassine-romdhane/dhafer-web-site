import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Get the query parameter - support both 'q' and 'query' for compatibility
    const query = searchParams.get("query") || searchParams.get("q") || "";
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "relevance";

    // Handle invalid queries
    if (!query || query.trim() === "") {
      // For empty query, return empty results
      return NextResponse.json({
        products: [],
        metadata: {
          categories: [],
          priceRange: { min: 0, max: 0 },
          total: 0,
        }
      });
    }
    
    // Build search condition with true case-insensitive search
    const where: any = {
      OR: [
        // Search in name with case insensitivity
        { name: { contains: query, mode: 'insensitive' } },
        // Search in description with case insensitivity
        { description: { contains: query, mode: 'insensitive' } },
        // Also search in category names
        {
          categories: {
            some: {
              category: {
                name: { contains: query, mode: 'insensitive' }
              }
            }
          }
        },
      ],
    };
    
    // Log the search query for debugging
    console.log('Search query:', query);
    console.log('Search where condition:', where);

    // Add category filter
    if (category && category !== "all") {
      where.categories = {
        some: {
          category: {
            name: category
          }
        }
      };
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sortBy) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      default:
        // For relevance, we'll use the default order
        orderBy = { id: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        colorVariants: {
          include: {
            images: true
          }
        }
      },
    });

    // Get unique categories for filters
    const categories = await prisma.category.findMany({
      select: {
        name: true,
      },
    });

    // Get price range for filters
    const priceRange = await prisma.product.aggregate({
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    return NextResponse.json({
      products,
      metadata: {
        categories: categories.map(c => c.name),
        priceRange: {
          min: priceRange._min.price,
          max: priceRange._max.price,
        },
        total: products.length,
      }
    });
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
