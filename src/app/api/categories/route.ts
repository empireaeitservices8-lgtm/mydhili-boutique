import { NextResponse, connection } from "next/server";
import { fetchStoreCategories, DEFAULT_CATEGORIES } from "@/lib/categories";

export async function GET() {
  await connection();
  try {
    const categories = await fetchStoreCategories();

    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        categories,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    return NextResponse.json({
      success: true,
      count: DEFAULT_CATEGORIES.length,
      categories: DEFAULT_CATEGORIES,
    });
  }
}