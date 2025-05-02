import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CategoryWithProducts = {
  id: number;
  name: string;
  description: string | null;
  group: string; // Add the group field
  products: Array<{ productId: number; categoryId: number }>;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET() {
  try {
    // Fetch all categories with their related products
    const categories = await prisma.category.findMany({
      include: {
        products: true // Include the related ProductCategory junction records
      }
    });

    // Transform the data to include product counts and group
    const categoriesWithCount = categories.map((category: CategoryWithProducts) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      group: category.group, // Include the group in the response
      productCount: category.products.length
    }));

    return NextResponse.json({ 
      categories: categoriesWithCount 
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
