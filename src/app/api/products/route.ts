import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PRODUCTS } from "@/lib/constants/products";

export async function GET() {
  await connection();
  try {
    const rawProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = rawProducts.map((p) => ({
      ...p,
      _id: p.id,
      id: p.id,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      category: p.category
        ? {
            ...p.category,
            _id: p.category.id,
          }
        : null,
    }));

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products: products.length > 0 ? products : DEFAULT_PRODUCTS,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3, stale-while-revalidate=10",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/products failed, serving default products:", error);

    // Gracefully serve default products so storefront never displays an empty error
    return NextResponse.json(
      {
        success: true,
        count: DEFAULT_PRODUCTS.length,
        products: DEFAULT_PRODUCTS,
        isFallback: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  }
}

