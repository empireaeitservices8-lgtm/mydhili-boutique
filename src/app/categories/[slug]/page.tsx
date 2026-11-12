import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import { Bricolage_Grotesque } from "next/font/google";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ShopProducts from "@/components/shop/ShopProducts";
import {
  findCategoryBySlug,
  fetchStoreCategories,
  DEFAULT_CATEGORIES,
  normalizeCategorySlug,
} from "@/lib/categories";

export const instant = false;

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-category-page",
  display: "swap",
});

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

type CategoryLink = { name: string; slug: string };

const categoryBackgrounds: Record<string, string> = {
  // Main Departments
  gents: "/categories/gents.jpg",
  gent: "/categories/gents.jpg",
  men: "/categories/gents.jpg",
  mens: "/categories/gents.jpg",
  ladies: "/categories/saree.jpg",
  lady: "/categories/saree.jpg",
  women: "/categories/saree.jpg",
  kids: "/categories/kids.jpg",
  kid: "/categories/kids.jpg",
  accessories: "/categories/accessories.jpg",
  accessory: "/categories/accessories.jpg",

  // Gents collections
  shirts: "/categories/shirts.jpg",
  shirt: "/categories/shirts.jpg",
  "t-shirts": "/categories/tshirts.jpg",
  "t-shirt": "/categories/tshirts.jpg",
  pants: "/categories/pants.jpg",
  pant: "/categories/pants.jpg",
  "gents-pants": "/categories/pants.jpg",
  "track-suit": "/categories/tracksuit.jpg",
  "three-forth": "/categories/pants.jpg",
  shorts: "/categories/pants.jpg",
  lungi: "/categories/lungi.jpg",
  mundu: "/categories/mundu.jpg",

  // Ladies collections
  "readymade-churidars": "/categories/salvarsuits.jpg",
  "readymade-churidar": "/categories/salvarsuits.jpg",
  sarees: "/categories/saree.jpg",
  saree: "/categories/saree.jpg",
  kurtis: "/categories/kurtis.avif",
  kurti: "/categories/kurtis.avif",
  kurthies: "/categories/kurtis.avif",
  kurthi: "/categories/kurtis.avif",
  "cot-set": "/categories/cotset.jpg",
  "ladies-pants": "/categories/pants.jpg",
  blouses: "/categories/blouse.webp",
  blouse: "/categories/blouse.webp",
  "night-wears": "/categories/nightwears.jpg",
  "night-wear": "/categories/nightwears.jpg",

  // Kids collections
  "boys-girls": "/categories/kids.jpg",
  "boys-and-girls": "/categories/kids.jpg",

  // Accessories collections
  belts: "/categories/accessories.jpg",
  belt: "/categories/accessories.jpg",
  socks: "/categories/accessories.jpg",
  caps: "/categories/accessories.jpg",
  cap: "/categories/accessories.jpg",
  "baby-shoes": "/categories/accessories.jpg",
  perfumes: "/categories/perfumes.jpg",
  perfume: "/categories/perfumes.jpg",

  // Classic collections
  "ethnic-wear": "/categories/ethnicwear.jpg",
  ethnicwear: "/categories/ethnicwear.jpg",
  dresses: "/categories/dresses.jpg",
  dress: "/categories/dresses.jpg",
  lehengas: "/categories/lehenga.jpg",
  lehenga: "/categories/lehenga.jpg",
  "salwar-suits": "/categories/salvarsuits.jpg",
  salwarsuits: "/categories/salvarsuits.jpg",
  "salvar-suits": "/categories/salvarsuits.jpg",
  salvarsuit: "/categories/salvarsuits.jpg",
  "salwar-suit": "/categories/salvarsuits.jpg",
  jeans: "/categories/dresses.jpg",
};

const fallbackBackground = "/categories/saree.jpg";

function formatTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function fallbackDescription(slug: string) {
  return `Explore our handcrafted collection of ${formatTitle(slug).toLowerCase()} designed for grace, comfort, and timeless beauty.`;
}

function normalizeImageUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/^["']+|["']+$/g, "");
  if (!trimmed) return "";

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const parsed = new URL(trimmed);

      const embeddedUrl =
        parsed.searchParams.get("imgurl") ||
        parsed.searchParams.get("mediaurl") ||
        parsed.searchParams.get("imgrefurl");
      if (embeddedUrl && /^https?:\/\//i.test(embeddedUrl)) {
        return embeddedUrl;
      }

      if (parsed.hostname.includes("drive.google.com")) {
        const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
        const fileId = match?.[1] || parsed.searchParams.get("id");
        if (fileId) {
          return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }
    }
  } catch {
    // Keep original trimmed string if URL parsing fails
  }

  return trimmed;
}

async function getCategoryInfo(slug: string) {
  const normalizedSlug = normalizeCategorySlug(slug);
  const defaultBg = categoryBackgrounds[normalizedSlug] || categoryBackgrounds[slug.toLowerCase()] || fallbackBackground;

  try {
    const category = await findCategoryBySlug(slug);

    if (category) {
      const img = normalizeImageUrl(category.image ?? "");
      const hasCustomImage =
        img.length > 0 &&
        (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/"));

      return {
        name: category.name || formatTitle(slug),
        description: category.description || fallbackDescription(slug),
        image: hasCustomImage ? img : defaultBg,
      };
    }
  } catch (error) {
    console.error("Failed to fetch category info:", error);
  }

  return { name: formatTitle(slug), description: fallbackDescription(slug), image: defaultBg };
}

async function getAllCategories(): Promise<CategoryLink[]> {
  try {
    const list = await fetchStoreCategories();
    return list.map((c) => ({ name: c.name, slug: c.slug }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return DEFAULT_CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }));
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const category = await getCategoryInfo(slug);

  return {
    title: `${category.name} Collection | Mydhili Collections`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  await connection();
  const { slug } = await params;
  const [category, categories] = await Promise.all([getCategoryInfo(slug), getAllCategories()]);
  const activeSlug = slug.toLowerCase();

  return (
    <div className={`${bricolage.variable} min-h-screen bg-[#FAF7F2] font-[family-name:var(--font-category-page)] text-[#380712]`}>
      <style>{`
        @keyframes catZoom { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes catUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .cat-zoom { animation: catZoom 12s ease-out forwards; }
        .cat-up { opacity: 0; animation: catUp .8s cubic-bezier(.2,.7,.2,1) forwards; }
        @media (prefers-reduced-motion: reduce) { .cat-zoom, .cat-up { animation: none; } .cat-up { opacity: 1; } }
      `}</style>

      <section className="relative isolate flex min-h-[400px] items-center justify-center overflow-hidden bg-[#24040B] px-5 py-14 text-center text-white sm:min-h-[460px] sm:py-20">
        <div className="absolute inset-0 -z-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.image}
            alt={category.name}
            className="cat-zoom h-full w-full object-cover object-center"
          />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 -z-10 bg-[#24040B]/45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#24040B] via-[#24040B]/35 to-[#24040B]/30" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(36,4,11,0.55)_100%)]" />
        <div className="pointer-events-none absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-[#D4AF69]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 -z-10 h-72 w-72 rounded-full bg-[#D4AF69]/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF69]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D4AF69]/70 to-transparent" />

        <div className="relative mx-auto max-w-3xl">
          <nav aria-label="Breadcrumbs" className="cat-up mb-5 flex items-center justify-center gap-2 text-xs text-[#E6C47A]">
            <Link href="/" className="transition hover:text-white">Home</Link>
            <ChevronRight size={12} className="text-[#D4AF69]" />
            <Link href="/shop" className="transition hover:text-white">Collections</Link>
            <ChevronRight size={12} className="text-[#D4AF69]" />
            <span className="font-semibold tracking-wide text-white">{category.name}</span>
          </nav>

          <div className="cat-up mb-4 flex items-center justify-center gap-3" style={{ animationDelay: "0.08s" }}>
            <span className="h-px w-8 bg-[#D4AF69]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6C47A] sm:text-xs">Mydhili Signature Collection</span>
            <span className="h-px w-8 bg-[#D4AF69]" />
          </div>

          <h1
            className="cat-up text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-[1.05] tracking-[-0.035em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
            style={{ animationDelay: "0.16s" }}
          >
            {category.name}
            <span className="text-[#E6C47A]">.</span>
          </h1>

          <p
            className="cat-up mx-auto mt-4 max-w-xl text-sm font-light leading-7 text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] sm:text-base"
            style={{ animationDelay: "0.24s" }}
          >
            {category.description}
          </p>

          {categories.length > 1 && (
            <nav
              aria-label="Browse categories"
              className="cat-up mt-8 flex flex-wrap items-center justify-center gap-2.5"
              style={{ animationDelay: "0.32s" }}
            >
              {categories.map((c) => {
                const active = c.slug.toLowerCase() === activeSlug;
                return (
                  <Link
                    key={c.slug}
                    href={`/categories/${c.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-md transition-all duration-300 ${
                      active
                        ? "border-[#D4AF69] bg-[#D4AF69] font-semibold text-[#380712] shadow-md"
                        : "border-white/30 bg-black/40 text-white hover:border-[#D4AF69] hover:bg-[#D4AF69]/25 hover:text-[#E6C47A]"
                    }`}
                  >
                    {c.name}
                  </Link>
                );
              })}
            </nav>
          )}

          <Link
            href="/shop"
            className="cat-up group mt-7 inline-flex items-center gap-2 border-b border-[#D4AF69] pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E6C47A] transition hover:border-white hover:text-white"
            style={{ animationDelay: "0.4s" }}
          >
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
            Browse all collections
          </Link>
        </div>
      </section>

      <main className="py-2">
        <ShopProducts initialCategory={slug} />
      </main>
    </div>
  );
}