import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function authorizeAdmin() {
  const session = await getAdminSession();
  return Boolean(session);
}

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// GET: Fetch products and categories
export async function GET() {
  await connection();
  try {
    if (!(await authorizeAdmin())) {
      return NextResponse.json(
        { success: false, message: "Admin authentication required." },
        { status: 401, headers: noCacheHeaders }
      );
    }

    const [productsRaw, categories] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.category.findMany({
        select: { id: true, name: true, isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const products = productsRaw.map((p: any) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      images: p.images,
      variants: p.variants,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      category: p.category
        ? { _id: p.category.id, id: p.category.id, name: p.category.name }
        : null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        products,
        categories: categories.map((c: any) => ({
          _id: c.id,
          id: c.id,
          name: c.name,
          isActive: c.isActive,
        })),
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Fetch products error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch products." },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

// POST: Create product
export async function POST(request: NextRequest) {
  try {
    if (!(await authorizeAdmin())) {
      return NextResponse.json(
        { success: false, message: "Admin authentication required." },
        { status: 401, headers: noCacheHeaders }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Product name is required." },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid selling price." },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const shortDescription = String(body.shortDescription ?? "").trim();
    const rawDescription = String(body.description ?? "").trim();
    const description = rawDescription || shortDescription || name;

    const compareAtPrice =
      body.compareAtPrice === "" || body.compareAtPrice == null
        ? null
        : Number(body.compareAtPrice);

    let categoryId: string | null = String(body.category ?? "").trim() || null;
    if (categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!cat) {
        // Fallback to first active category if provided ID doesn't exist
        const defaultCat = await prisma.category.findFirst({
          where: { isActive: true },
        });
        categoryId = defaultCat ? defaultCat.id : null;
      }
    } else {
      const defaultCat = await prisma.category.findFirst({
        where: { isActive: true },
      });
      categoryId = defaultCat ? defaultCat.id : null;
    }

    const images = Array.isArray(body.images)
      ? body.images
          .map((image: unknown) => String(image).trim())
          .filter(Boolean)
      : [];

    // Parse variants safely
    const submittedVariants = Array.isArray(body.variants)
      ? body.variants
      : [];

    const variants: {
      sku: string;
      size: string;
      color: string;
      stock: number;
    }[] = [];

    for (const variant of submittedVariants) {
      const rawSku = String(variant?.sku ?? "").trim();
      const rawSize = String(variant?.size ?? "").trim();
      const rawColor = String(variant?.color ?? "").trim();
      const rawStock = Number(variant?.stock ?? 0);

      // If comma-separated sizes like "S, M, L", split them
      const sizeList = rawSize.includes(",")
        ? rawSize.split(",").map((s) => s.trim()).filter(Boolean)
        : [rawSize || "Free Size"];

      const perStock =
        sizeList.length > 1
          ? Math.max(0, Math.floor(rawStock / sizeList.length))
          : Math.max(0, rawStock);

      sizeList.forEach((sz, idx) => {
        const sku =
          rawSku && sizeList.length === 1
            ? rawSku
            : `${createSlug(name || "VAR")
                .toUpperCase()
                .slice(0, 8)}-${sz.toUpperCase().replace(/\s+/g, "")}-${(rawColor || "STD")
                .toUpperCase()
                .replace(/\s+/g, "")}`;

        variants.push({
          sku,
          size: sz || "Free Size",
          color: rawColor || "Standard",
          stock:
            idx === 0 && sizeList.length > 1
              ? Math.max(0, rawStock - perStock * (sizeList.length - 1))
              : perStock,
        });
      });
    }

    // If no variants were configured, provide a default in-stock variant
    if (variants.length === 0) {
      variants.push({
        sku: `${createSlug(name).toUpperCase().slice(0, 8)}-STD`,
        size: "Free Size",
        color: "Standard",
        stock: 10,
      });
    }

    const baseSlug = createSlug(name) || `prod-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;

    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription: shortDescription || null,
        categoryId: categoryId,
        price,
        compareAtPrice:
          compareAtPrice !== null && compareAtPrice >= price
            ? compareAtPrice
            : null,
        images,
        variants,
        isFeatured: Boolean(body.isFeatured),
        isActive: body.isActive !== false,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        product: {
          _id: product.id,
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice
            ? Number(product.compareAtPrice)
            : null,
          images: product.images,
          variants: product.variants,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          category: product.category
            ? {
                _id: product.category.id,
                id: product.category.id,
                name: product.category.name,
              }
            : null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      },
      { status: 201, headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to create product.",
      },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
