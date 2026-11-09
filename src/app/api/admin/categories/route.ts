import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access." },
      { status: 401 }
    );
  }

  try {
    const rawCategories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });

    const categories = rawCategories.map((c: any) => ({
      _id: c.id,
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const image = String(body.image || "").trim();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required." },
        { status: 400 }
      );
    }

    const slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid category name." },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "This category already exists." },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        category: {
          _id: category.id,
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          isActive: category.isActive,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create category." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const categoryId = String(body.id || "").trim();

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category ID is required." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    const data: {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          { success: false, message: "Category name is required." },
          { status: 400 }
        );
      }

      const slug = createSlug(name);

      const duplicate = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id: categoryId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Another category uses this name." },
          { status: 409 }
        );
      }

      data.name = name;
      data.slug = slug;
    }

    if (body.description !== undefined) {
      data.description = String(body.description).trim();
    }

    if (body.image !== undefined) {
      data.image = String(body.image).trim();
    }

    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category: {
        _id: updated.id,
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        image: updated.image,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update category error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update category." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    let categoryId = searchParams.get("id");

    if (!categoryId) {
      try {
        const body = await request.json();
        categoryId = body?.id || body?.categoryId;
      } catch {
        // empty body ok
      }
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category ID is required." },
        { status: 400 }
      );
    }

    // Set categoryId to null on associated products first so foreign keys don't block
    await prisma.product.updateMany({
      where: { categoryId },
      data: { categoryId: null },
    });

    const deleted = await prisma.category.deleteMany({
      where: {
        OR: [{ id: categoryId }, { slug: categoryId }],
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, message: "Category not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete category." },
      { status: 500 }
    );
  }
}
