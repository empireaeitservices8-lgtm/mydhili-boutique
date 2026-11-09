import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque } from "next/font/google";
import { ArrowLeft, ArrowUpRight, CircleCheck, CircleX, RefreshCw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { DEFAULT_PRODUCTS } from "@/lib/constants/products";
import ProductPurchaseOptions from "@/components/cart/ProductPurchaseOptions";
import ProductGallery from "@/components/products/ProductGallery";

export const instant = false;

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-pdp",
  display: "swap",
});

interface ProductVariant {
  sku?: string;
  size?: string;
  color?: string;
  stock?: number;
}

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  variants?: ProductVariant[];
  isFeatured?: boolean;
  isActive?: boolean;
}

const eyebrow = "text-[10px] font-semibold uppercase tracking-[0.24em] text-[#946C2D] sm:text-xs";
const pill = "rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]";
const card = "rounded-2xl border border-[#E9DFD2] bg-white p-4";

const perks = [
  { icon: Truck, title: "Delivery", text: "Availability and charges are confirmed at checkout." },
  { icon: RefreshCw, title: "Returns", text: "Please review our returns policy before ordering." },
  { icon: ShieldCheck, title: "Support", text: "Need help choosing? Message us on Instagram." },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatCategory(category?: string) {
  if (!category) return "Boutique Collection";

  return category
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function getProduct(slug: string): Promise<ProductData | null> {
  const decodedSlug = decodeURIComponent(slug).trim();

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: decodedSlug, isActive: true },
          { id: decodedSlug, isActive: true },
        ],
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    if (product) {
      return {
        _id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description ?? undefined,
        shortDescription: product.shortDescription ?? undefined,
        category: product.category?.name ?? undefined,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
        images: Array.isArray(product.images) ? (product.images as string[]) : [],
        variants: Array.isArray(product.variants) ? (product.variants as unknown as ProductVariant[]) : [],
        isFeatured: product.isFeatured,
        isActive: product.isActive,
      };
    }
  } catch (error) {
    console.error("Failed to fetch product from database, falling back to default catalog:", error);
  }

  // Gracefully fallback to default products so product detail pages never 404 when DB is offline or empty
  const fallback = DEFAULT_PRODUCTS.find(
    (p) =>
      p.slug.toLowerCase() === decodedSlug.toLowerCase() ||
      p.id.toLowerCase() === decodedSlug.toLowerCase() ||
      p._id.toLowerCase() === decodedSlug.toLowerCase()
  );

  if (fallback) {
    return {
      _id: fallback.id || fallback._id,
      name: fallback.name,
      slug: fallback.slug,
      description: fallback.description,
      shortDescription: fallback.shortDescription,
      category: fallback.category?.name,
      price: fallback.price,
      compareAtPrice: fallback.compareAtPrice ?? undefined,
      images: fallback.images,
      variants: fallback.variants,
      isFeatured: fallback.isFeatured,
      isActive: fallback.isActive,
    };
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Mydhili Collections",
    };
  }

  return {
    title: `${product.name} | Mydhili Collections`,
    description: product.shortDescription || product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();

  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const images = product.images?.filter(Boolean) ?? [];
  const imageUrl = images[0] ?? "";
  const variants = product.variants ?? [];
  const totalStock = variants.reduce((sum, v) => sum + Number(v.stock ?? 0), 0);
  const inStock = variants.length > 0 ? totalStock > 0 : true;
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <main className={`${bricolage.variable} min-h-screen bg-[#FAF7F2] font-[family-name:var(--font-pdp)] text-[#380712]`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <Link href="/shop" className="group inline-flex items-center gap-2 transition hover:text-[#380712]">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Collection
          </Link>
          <span className="text-[#D4AF69]">/</span>
          <span className="line-clamp-1 font-medium text-[#380712]">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Gallery with Full Carousel, Arrow Controls & Thumbnails */}
          <ProductGallery
            name={product.name}
            images={images}
            hasDiscount={hasDiscount}
            discount={discount}
            isFeatured={product.isFeatured}
            isOutOfStock={!inStock}
          />

          {/* Information */}
          <section className="flex min-w-0 flex-col">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[#A27B35]" />
              <p className={eyebrow}>{formatCategory(product.category)}</p>
            </div>

            <h1 className="text-[clamp(2rem,3.8vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-4 text-sm font-light leading-7 text-stone-600 sm:text-base">{product.shortDescription}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-3xl font-semibold tracking-[-0.03em]">{formatPrice(product.price)}</span>
              {hasDiscount && <span className="text-base text-stone-400 line-through">{formatPrice(product.compareAtPrice!)}</span>}
              <span className={`inline-flex items-center gap-1.5 ${pill} ${inStock ? "bg-[#EAF4EC] text-[#2F6B3C] font-semibold" : "bg-rose-100 text-rose-700 font-bold border border-rose-200"}`}>
                {inStock ? <CircleCheck size={13} /> : <CircleX size={13} />}
                {inStock ? "In stock" : "Out of stock"}
              </span>
            </div>

            <div className="my-6 h-px bg-gradient-to-r from-[#D4AF69]/60 via-[#E9DFD2] to-transparent" />

            {/* Size, colour, quantity and cart controls */}
            <ProductPurchaseOptions
              productId={product._id}
              slug={product.slug}
              name={product.name}
              image={imageUrl}
              price={product.price}
              variants={variants}
            />

            {/* Perks */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {perks.map(({ icon: Icon, title, text }) => (
                <div key={title} className={card}>
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF3E8] text-[#9A6B35]">
                    <Icon size={18} strokeWidth={1.5} />
                  </span>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs font-light leading-5 text-stone-500">{text}</p>
                </div>
              ))}
            </div>

            <Link
              href="/shipping-returns"
              className="group mt-5 inline-flex w-fit items-center gap-2 border-b border-[#B99A61] pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A6B35] transition hover:text-[#380712]"
            >
              Shipping and returns policy
              <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

            {product.description && (
              <div className="mt-8 rounded-3xl border border-[#E9DFD2] bg-white p-6">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">Product details</h2>
                <p className="mt-3 whitespace-pre-line text-sm font-light leading-7 text-stone-600">{product.description}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}