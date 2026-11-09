"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bricolage_Grotesque } from "next/font/google";
import { Heart, ShoppingBag, ArrowRight, ArrowUpRight } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-products",
  display: "swap",
});

type Product = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  shortDescription?: string;
  isFeatured?: boolean;
  category?: {
    name: string;
    slug: string;
  };
};

// Used only when a product has no images. Replace with your own, e.g. "/products/fallback-1.jpg"
const fallbackImages = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85",
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85",
];

export default function FeaturedProducts() {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState<string[]>([]);

  // Load products
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Unable to load products");

        const data = await response.json();

        if (!cancelled && data.success && Array.isArray(data.products)) {
          const featured = data.products.filter(
            (product: Product) => product.isFeatured
          );
          setProducts((featured.length ? featured : data.products).slice(0, 4));
        }
      } catch (error) {
        console.error("Product loading failed:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const markBroken = (key: string) =>
    setBrokenImages((prev) => (prev.includes(key) ? prev : [...prev, key]));

  return (
    <section
      className={`${bricolage.variable} bg-[#FAF7F2] px-5 pt-6 pb-12 font-[family-name:var(--font-products)] sm:px-8 sm:pt-8 sm:pb-14 lg:px-10 lg:pt-8 lg:pb-16`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#A27B35]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#946C2D] sm:text-xs">
                A Little Something Special
              </p>
            </div>

            <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-[#380712]">
              The edit <span className="text-[#A27B35]">of the season.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm font-light leading-7 text-stone-600 sm:text-base">
              Pieces chosen to celebrate your individuality, elevate everyday
              moments, and make every occasion feel special.
            </p>
          </div>

          <Link
            href="/shop"
            className="group inline-flex w-fit items-center gap-2 border-b border-[#B99A61] pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#380712] transition hover:text-[#9A6B35]"
          >
            View All Collections
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[3/4] rounded-2xl bg-[#EEE5D9]" />
                <div className="mt-4 h-3 w-1/3 rounded bg-[#EEE5D9]" />
                <div className="mt-3 h-4 w-4/5 rounded bg-[#EEE5D9]" />
                <div className="mt-3 h-3 w-1/4 rounded bg-[#EEE5D9]" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-[#E7D9C7] bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF2E4] text-[#946C2D]">
              <ShoppingBag size={23} strokeWidth={1.4} />
            </div>
            <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#380712]">
              Beautiful things are on their way
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">
              Our collection is being curated. Visit us again soon to discover
              your next favourite.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#380712] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#5A1222]"
            >
              Explore the Shop <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
            {products.map((product, index) => {
              const productId = product.id || product._id || product.slug;
              const validImages = (product.images ?? []).filter(Boolean);
              const primary =
                validImages[0] || fallbackImages[index % fallbackImages.length];
              const secondary = validImages[1];

              const primaryBroken = brokenImages.includes(`${productId}-1`);
              const secondaryBroken = brokenImages.includes(`${productId}-2`);
              const isWishlisted = isInWishlist(productId);

              const hasDiscount =
                !!product.compareAtPrice && product.compareAtPrice > product.price;
              const discount = hasDiscount
                ? Math.round(
                    ((product.compareAtPrice! - product.price) /
                      product.compareAtPrice!) *
                      100
                  )
                : 0;

              return (
                <article key={productId} className="group min-w-0">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#380712] to-[#6D2636] shadow-[0_10px_30px_rgba(56,7,18,0.07)] transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_50px_rgba(56,7,18,0.22)]">
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative block aspect-[3/4] overflow-hidden"
                      aria-label={`View ${product.name}`}
                    >
                      {!primaryBroken && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={primary}
                          alt={product.name}
                          loading="lazy"
                          onError={() => markBroken(`${productId}-1`)}
                          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                            secondary && !secondaryBroken
                              ? "group-hover:scale-105 group-hover:opacity-0"
                              : "group-hover:scale-[1.07]"
                          }`}
                        />
                      )}

                      {/* Second image on hover */}
                      {secondary && !secondaryBroken && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={secondary}
                          alt=""
                          loading="lazy"
                          onError={() => markBroken(`${productId}-2`)}
                          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
                        />
                      )}

                      <span className="absolute inset-0 bg-gradient-to-t from-[#24040B]/35 via-transparent to-transparent" />
                    </Link>

                    {/* Badge */}
                    {hasDiscount ? (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-[#D4AF69] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#380712] sm:left-3 sm:top-3">
                        Save {discount}%
                      </span>
                    ) : product.isFeatured ? (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#380712] backdrop-blur-sm sm:left-3 sm:top-3">
                        Featured
                      </span>
                    ) : null}

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleWishlist({
                          productId,
                          slug: product.slug,
                          name: product.name,
                          price: product.price,
                          image: primary,
                          category: product.category?.name,
                        })
                      }
                      aria-label={
                        isWishlisted
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                      aria-pressed={isWishlisted}
                      className={`absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition duration-300 active:scale-90 sm:right-3 sm:top-3 ${
                        isWishlisted
                          ? "bg-[#380712] text-[#E6C47A]"
                          : "bg-white/90 text-[#380712] hover:bg-[#380712] hover:text-[#E6C47A]"
                      }`}
                    >
                      <Heart
                        size={17}
                        strokeWidth={1.6}
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </button>

                    {/* Hover action (desktop) */}
                    <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-3 opacity-0 transition-all duration-300 sm:block sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                      <Link
                        href={`/products/${product.slug}`}
                        className="pointer-events-auto flex items-center justify-center gap-2 rounded-full bg-white/95 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#380712] backdrop-blur-sm transition hover:bg-[#380712] hover:text-[#E6C47A]"
                      >
                        <ShoppingBag size={15} strokeWidth={1.7} />
                        Discover Piece
                      </Link>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-1 pt-4 sm:pt-5">
                    {product.category?.name && (
                      <Link
                        href={`/categories/${product.category.slug}`}
                        className="mb-1.5 inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A6B35] transition hover:text-[#380712]"
                      >
                        {product.category.name}
                      </Link>
                    )}

                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-2 block text-base font-medium leading-snug tracking-[-0.015em] text-[#380712] transition-colors hover:text-[#9A6B35] sm:text-lg"
                    >
                      {product.name}
                    </Link>

                    {product.shortDescription && (
                      <p className="mt-1.5 line-clamp-1 text-xs font-light text-stone-500 sm:text-sm">
                        {product.shortDescription}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <span className="text-base font-semibold text-[#380712] sm:text-lg">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>

                      {hasDiscount && (
                        <span className="text-xs text-stone-400 line-through sm:text-sm">
                          ₹{product.compareAtPrice!.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom link */}
        {!loading && products.length > 0 && (
          <div className="mt-12 text-center sm:mt-16">
            <Link
              href="/shop"
              className="group inline-flex h-14 items-center gap-4 rounded-full border border-[#380712]/25 py-1.5 pl-8 pr-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#380712] transition-all duration-300 hover:border-[#380712] hover:bg-[#380712] hover:text-white"
            >
              Find Your Style
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF69] text-[#380712] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight
                  size={17}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:-rotate-45"
                />
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}