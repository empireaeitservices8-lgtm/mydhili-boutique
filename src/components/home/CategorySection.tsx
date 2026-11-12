"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import {
  Shirt,
  Crown,
  Flower2,
  ShoppingBag,
  Gem,
  Gift,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  DEFAULT_CATEGORIES,
  normalizeCategorySlug,
} from "@/lib/constants/categories";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-category",
  display: "swap",
});

type Category = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string; // optional: if your API returns an image, it is used first
};

type CategoryStyle = { subtitle: string; icon: typeof Shirt; image: string };

// Best results: replace these with your own photos, e.g. "/categories/sarees.jpg"
const categoryStyles: Record<string, CategoryStyle> = {
  // Main Department Categories
  gents: {
    subtitle: "Shirts, mundu, lungi & more",
    icon: Shirt,
    image: "/categories/gents.jpg",
  },
  ladies: {
    subtitle: "Churidars, kurthies, sarees & more",
    icon: Flower2,
    image: "/categories/saree.jpg",
  },
  kids: {
    subtitle: "Boys & girls collection",
    icon: Crown,
    image: "/categories/kids.jpg",
  },
  accessories: {
    subtitle: "Belts, socks, caps & perfumes",
    icon: Gift,
    image: "/categories/accessories.jpg",
  },

  // Gents collections
  shirts: {
    subtitle: "Crisp tailored cuts",
    icon: Shirt,
    image: "/categories/shirts.jpg",
  },
  "t-shirts": {
    subtitle: "Comfortable everyday wear",
    icon: Shirt,
    image: "/categories/tshirts.jpg",
  },
  pants: {
    subtitle: "Smart formal & casual fit",
    icon: Shirt,
    image: "/categories/pants.jpg",
  },
  "gents-pants": {
    subtitle: "Smart formal & casual fit",
    icon: Shirt,
    image: "/categories/pants.jpg",
  },
  "track-suit": {
    subtitle: "Active & loungewear",
    icon: Shirt,
    image: "/categories/tracksuit.jpg",
  },
  "three-forth": {
    subtitle: "Relaxed 3/4th comfort",
    icon: Shirt,
    image: "/categories/pants.jpg",
  },
  shorts: {
    subtitle: "Casual breathable fit",
    icon: Shirt,
    image: "/categories/pants.jpg",
  },
  lungi: {
    subtitle: "Classic cotton lungis",
    icon: Shirt,
    image: "/categories/lungi.jpg",
  },
  mundu: {
    subtitle: "Traditional Kerala wear",
    icon: Shirt,
    image: "/categories/mundu.jpg",
  },

  // Ladies collections
  "readymade-churidars": {
    subtitle: "Graceful festive silhouettes",
    icon: Shirt,
    image: "/categories/salvarsuits.jpg",
  },
  "cot-set": {
    subtitle: "Chic contemporary sets",
    icon: ShoppingBag,
    image: "/categories/cotset.jpg",
  },
  "ladies-pants": {
    subtitle: "Tailored ladies trousers",
    icon: Shirt,
    image: "/categories/pants.jpg",
  },
  "night-wears": {
    subtitle: "Soft breathable loungewear",
    icon: Shirt,
    image: "/categories/nightwears.jpg",
  },
  "boys-girls": {
    subtitle: "Cute celebration wear",
    icon: Crown,
    image: "/categories/kids.jpg",
  },

  // Accessories collections
  belts: {
    subtitle: "Finely finished belts",
    icon: Gift,
    image: "/categories/accessories.jpg",
  },
  socks: {
    subtitle: "Cotton comfort socks",
    icon: Gift,
    image: "/categories/accessories.jpg",
  },
  caps: {
    subtitle: "Classic stylish caps",
    icon: Gift,
    image: "/categories/accessories.jpg",
  },
  "baby-shoes": {
    subtitle: "Gentle cushioned shoes",
    icon: Gift,
    image: "/categories/accessories.jpg",
  },
  perfumes: {
    subtitle: "Signature boutique scents",
    icon: Gift,
    image: "/categories/perfumes.jpg",
  },

  // Classic collections
  kurtis: {
    subtitle: "Everyday elegance",
    icon: Shirt,
    image: "/categories/kurtis.avif",
  },
  kurti: {
    subtitle: "Everyday elegance",
    icon: Shirt,
    image: "/categories/kurtis.avif",
  },
  sarees: {
    subtitle: "Timeless traditions",
    icon: Flower2,
    image: "/categories/saree.jpg",
  },
  saree: {
    subtitle: "Timeless traditions",
    icon: Flower2,
    image: "/categories/saree.jpg",
  },
  "ethnic-wear": {
    subtitle: "Celebrate in style",
    icon: Crown,
    image: "/categories/ethnicwear.jpg",
  },
  ethnicwear: {
    subtitle: "Celebrate in style",
    icon: Crown,
    image: "/categories/ethnicwear.jpg",
  },
  dresses: {
    subtitle: "Modern silhouettes",
    icon: ShoppingBag,
    image: "/categories/dresses.jpg",
  },
  dress: {
    subtitle: "Modern silhouettes",
    icon: ShoppingBag,
    image: "/categories/dresses.jpg",
  },
  blouses: {
    subtitle: "Beautiful finishing touches",
    icon: Gem,
    image: "/categories/blouse.webp",
  },
  blouse: {
    subtitle: "Beautiful finishing touches",
    icon: Gem,
    image: "/categories/blouse.webp",
  },
  lehengas: {
    subtitle: "Royal celebrations",
    icon: Crown,
    image: "/categories/lehenga.jpg",
  },
  lehenga: {
    subtitle: "Royal celebrations",
    icon: Crown,
    image: "/categories/lehenga.jpg",
  },
  "salwar-suits": {
    subtitle: "Graceful silhouettes",
    icon: Shirt,
    image: "/categories/salvarsuits.jpg",
  },
  salwarsuits: {
    subtitle: "Graceful silhouettes",
    icon: Shirt,
    image: "/categories/salvarsuits.jpg",
  },
  "salwar-suit": {
    subtitle: "Graceful silhouettes",
    icon: Shirt,
    image: "/categories/salvarsuits.jpg",
  },
};

const fallbackStyle: CategoryStyle = {
  subtitle: "Explore the collection",
  icon: ShoppingBag,
  image: "/categories/saree.jpg",
};

// 1.5 cards on mobile, 2 on small, 3 on tablet, 4 on desktop
const cardBasis =
  "shrink-0 snap-start basis-[72%] sm:basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)]";

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [brokenImages, setBrokenImages] = useState<string[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Unable to fetch categories");

        const data = await response.json();
        if (!cancelled && data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Category loading failed:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateArrows = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [categories, loading, updateArrows]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-[#380712]/20 text-[#380712] transition-all duration-300 hover:border-[#380712] hover:bg-[#380712] hover:text-[#E6C47A] disabled:pointer-events-none disabled:opacity-30";

  return (
    <section
      className={`${bricolage.variable} bg-[#FAF7F2] px-5 pt-10 pb-6 font-[family-name:var(--font-category)] sm:px-8 sm:pt-14 sm:pb-8 lg:px-10 lg:pt-16 lg:pb-10`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#A27B35]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#946C2D] sm:text-xs">
                Discover Your Style
              </p>
            </div>

            <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-[#380712]">
              Find your <span className="text-[#A27B35]">expression.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm font-light leading-7 text-stone-600 sm:text-base">
              From graceful traditional wear to contemporary favourites,
              explore collections that make every moment your own.
            </p>
          </div>

          <div className="flex items-center justify-between gap-6 sm:justify-end">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 border-b border-[#B99A61] pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#380712] transition hover:text-[#9A6B35]"
            >
              Explore Everything
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>

            {categories.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollByCards(-1)}
                  disabled={!canPrev}
                  aria-label="Previous categories"
                  className={arrowClass}
                >
                  <ChevronLeft size={18} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCards(1)}
                  disabled={!canNext}
                  aria-label="Next categories"
                  className={arrowClass}
                >
                  <ChevronRight size={18} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`${cardBasis} aspect-[3/4] animate-pulse rounded-2xl bg-[#EEE5D9]`}
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-[#E7D9C7] bg-white px-6 py-14 text-center">
            <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#380712]">
              Something beautiful is coming
            </h3>
            <p className="mt-3 text-sm text-stone-500">
              Our collections will be available here soon.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#946C2D]"
            >
              Visit the shop <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div
            ref={scroller}
            onScroll={updateArrows}
            className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category, index) => {
              const categoryId = category.id || category._id || category.slug;
              const normalized = normalizeCategorySlug(category.slug);
              const style =
                categoryStyles[normalized] ??
                categoryStyles[category.slug] ??
                fallbackStyle;
              const Icon = style.icon;
              const imageBroken = brokenImages.includes(categoryId);
              const customImage = category.image?.trim();
              const hasValidCustomImage =
                !!customImage &&
                (customImage.startsWith("http://") ||
                  customImage.startsWith("https://") ||
                  customImage.startsWith("/"));
              const src = imageBroken
                ? style.image
                : hasValidCustomImage
                ? customImage
                : style.image;

              return (
                <Link
                  key={categoryId}
                  href={`/categories/${category.slug}`}
                  className={`${cardBasis} group block`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-[#380712] to-[#6D2636] shadow-[0_10px_30px_rgba(56,7,18,0.08)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_rgba(56,7,18,0.22)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={category.name}
                      loading="lazy"
                      onError={() => {
                        if (!imageBroken) {
                          setBrokenImages((prev) => [...prev, categoryId]);
                        }
                      }}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                    />

                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#24040B]/90 via-[#380712]/15 to-[#24040B]/25 transition-opacity duration-500" />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 transition-all duration-500 group-hover:ring-[#D4AF69]/60" />

                    {/* Top row */}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors duration-300 group-hover:border-[#E6C47A] group-hover:bg-[#D4AF69] group-hover:text-[#380712]">
                        <Icon size={17} strokeWidth={1.5} />
                      </span>
                      <span className="text-xs font-medium tabular-nums tracking-[0.2em] text-white/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-5">
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-semibold leading-tight tracking-[-0.02em] sm:text-2xl">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-xs font-light text-white/75 sm:text-sm">
                          {style.subtitle}
                        </p>
                      </div>

                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4AF69] text-[#380712] transition-all duration-300 group-hover:rotate-45 group-hover:bg-white">
                        <ArrowUpRight
                          size={18}
                          strokeWidth={2}
                          className="transition-transform duration-300 group-hover:-rotate-45"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}