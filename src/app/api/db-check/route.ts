import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await connection();
  try {
    await prisma.$queryRawUnsafe("SELECT 1;");
    const [categoriesCount, productsCount, ordersCount] = await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      success: true,
      database: "MySQL",
      message: "MySQL database connected successfully via Prisma",
      counts: {
        categories: categoriesCount,
        products: productsCount,
        orders: ordersCount,
      },
    });
  } catch (error) {
    console.error("MySQL connection failed:", error);

    return NextResponse.json(
      {
        success: false,
        database: "MySQL",
        message: "Could not connect to MySQL database",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
