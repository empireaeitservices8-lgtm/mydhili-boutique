import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function authorizeAdmin() {
  const session = await getAdminSession();
  return Boolean(session);
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateVariants(input: unknown, productName = "") {
  if (!Array.isArray(input)) {
    return { valid: false, variants: [] as { sku: string; size: string; color: string; stock: number }[], message: "Invalid variants." };
  }

  const variants: { sku: string; size: string; color: string; stock: number }[] = [];

  for (const item of input) {
    const rawSku = String(item?.sku || "").trim();
    const rawSize = String(item?.size || "").trim();
    const color = String(item?.color || "").trim();

    // Ignore completely empty variant rows.
    if (!rawSku && !rawSize && !color && (item?.stock === "" || item?.stock == null)) {
      continue;
    }

    if (!rawSize || !color) {
      return {
        valid: false,
        variants: [],
        message: "Every variant must have a size and color.",
      };
    }

    const rawStock = Number(item?.stock ?? 0);

    if (!Number.isInteger(rawStock) || rawStock < 0) {
      return {
        valid: false,
        variants: [],
        message: "Variant stock must be a non-negative whole number.",
      };
    }

    // Auto-split comma-separated sizes like "S, M, L" into distinct variants
    const sizeList = rawSize.includes(",")
      ? rawSize.split(",").map((s) => s.trim()).filter(Boolean)
      : [rawSize];

    const perStock = sizeList.length > 1
      ? Math.max(0, Math.floor(rawStock / sizeList.length))
      : rawStock;

    sizeList.forEach((sz, idx) => {
      const sku = rawSku && sizeList.length === 1
        ? rawSku
        : `${createSlug(productName || "VAR")
            .toUpperCase()
            .slice(0, 8)}-${sz.toUpperCase().replace(/\s+/g, "")}-${color
            .toUpperCase()
            .replace(/\s+/g, "")}`;

      variants.push({
        sku,
        size: sz,
        color,
        stock: idx === 0 && sizeList.length > 1 ? rawStock - perStock * (sizeList.length - 1) : perStock,
      });
    });
  }

  return { valid: true, variants, message: "" };
}

// GET: Fetch one product
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    if (!(await authorizeAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: {
        _id: product.id,
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        images: product.images,
        variants: product.variants,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        category: product.category ? { _id: product.category.id, id: product.category.id, name: product.category.name } : null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get product error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch product." },
      { status: 500 }
    );
  }
}

// PUT: Update one product
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    if (!(await authorizeAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const shortDescription = String(body.shortDescription || "").trim();
    const categoryId = String(body.category || "");
    const price = Number(body.price);
    const compareAtPrice =
      body.compareAtPrice === "" || body.compareAtPrice == null
        ? null
        : Number(body.compareAtPrice);

    if (!name || !description || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, description and category are required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Enter a valid product price." },
        { status: 400 }
      );
    }

    if (
      compareAtPrice !== null &&
      (!Number.isFinite(compareAtPrice) || compareAtPrice < price)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Compare-at price must be greater than or equal to the selling price.",
        },
        { status: 400 }
      );
    }

    const variantResult = validateVariants(body.variants || [], name);

    if (!variantResult.valid) {
      return NextResponse.json(
        { success: false, message: variantResult.message },
        { status: 400 }
      );
    }

    const images = Array.isArray(body.images)
      ? body.images
          .map((image: unknown) => String(image).trim())
          .filter(Boolean)
      : [];

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Selected category was not found." },
        { status: 400 }
      );
    }

    // Only regenerate slug if product name has changed
    let slug = existingProduct.slug;
    if (existingProduct.name !== name) {
      const baseSlug = createSlug(name);
      slug = baseSlug;
      let suffix = 1;

      while (await prisma.product.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${suffix}`;
        suffix++;
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        shortDescription,
        categoryId,
        price,
        compareAtPrice,
        images,
        variants: variantResult.variants,
        isFeatured: Boolean(body.isFeatured),
        isActive: Boolean(body.isActive),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: {
        _id: updated.id,
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        shortDescription: updated.shortDescription,
        price: Number(updated.price),
        compareAtPrice: updated.compareAtPrice ? Number(updated.compareAtPrice) : null,
        images: updated.images,
        variants: updated.variants,
        isFeatured: updated.isFeatured,
        isActive: updated.isActive,
        category: updated.category ? { _id: updated.category.id, id: updated.category.id, name: updated.category.name } : null,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update product." },
      { status: 500 }
    );
  }
}

// DELETE: Delete one product
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    if (!(await authorizeAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const rawId = (await params).id;
    const id = decodeURIComponent(rawId || "");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID." },
        { status: 400 }
      );
    }

    const result = await prisma.product.deleteMany({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete product." },
      { status: 500 }
    );
  }
}
