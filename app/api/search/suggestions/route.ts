import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    console.log("[SUGGESTIONS_API] Query:", query);

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], categories: [] });
    }

    // Get matching products with their images through colorVariants
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { 
            categories: {
              some: {
                category: {
                  name: { contains: query, mode: "insensitive" }
                }
              }
            }
          },
        ],
      },
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        categories: {
          select: {
            category: {
              select: {
                name: true
              }
            }
          },
          take: 1
        },
        colorVariants: {
          select: {
            images: {
              where: {
                isMain: true,
              },
              select: {
                url: true,
              },
              take: 1,
            },
          },
          take: 1,
        },
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log("[SUGGESTIONS_API] Found products:", products);

    // Get matching categories
    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
      },
      take: 3,
      orderBy: {
        name: 'asc',
      },
    });

    console.log("[SUGGESTIONS_API] Found categories:", categories);

    // Format suggestions
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.categories[0]?.category.name || 'Uncategorized',
      price: product.price,
      salePrice: product.salePrice,
      imageUrl: product.colorVariants[0]?.images[0]?.url || null,
      type: 'product' as const
    }));

    const formattedCategories = categories.map(cat => ({
      name: cat.name,
      type: 'category' as const
    }));

    const response = {
      products: formattedProducts,
      categories: formattedCategories
    };

    console.log("[SUGGESTIONS_API] Final response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[SUGGESTIONS_API_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}