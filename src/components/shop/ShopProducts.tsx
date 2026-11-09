"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { ArrowUpRight, ChevronDown, Heart, RefreshCw, Search, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { CATEGORY_GROUPS, normalizeCategorySlug, matchesCategoryFilter } from "@/lib/constants/categories";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-shop-products", display: "swap" });

type Category = { _id?: string; name: string; slug: string };
type Product = {
  id?: string; _id?: string; name: string; slug: string; description?: string; shortDescription?: string;
  category?: Category | string | null; price: number; compareAtPrice?: number; images?: string[];
  variants?: { sku?: string; size?: string; color?: string; stock?: number }[];
  isFeatured?: boolean; createdAt?: string;
};
type SortOption = "newest" | "price-low" | "price-high";

const fallbackImage = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85";
const formatPrice = (price: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

const pill = "rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]";
const fieldCls = "h-12 rounded-full border border-[#E5DDD2] bg-white text-sm outline-none transition focus:border-[#D4AF69] focus:ring-4 focus:ring-[#D4AF69]/20";
const chipCls = "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300";
const chipOn = "border-[#380712] bg-[#380712] text-[#E6C47A]";
const chipOff = "border-[#380712]/15 bg-white hover:border-[#D4AF69]";

interface ShopProductsProps { initialCategory?: string }

export default function ShopProducts({ initialCategory = "all" }: ShopProductsProps = {}) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => { if (initialCategory) setSelectedCategory(initialCategory); }, [initialCategory]);

  const loadShopData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "Unable to load products.");
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      console.error("Shop loading failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadShopData(); }, [loadShopData]);

  // Lock page scroll and allow Escape while the mobile filter sheet is open
  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFiltersOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [filtersOpen]);

  const isActive = (slug: string) => selectedCategory === slug || normalizeCategorySlug(selectedCategory) === slug;

  const activeLabel = useMemo(() => {
    if (selectedCategory === "all") return "";
    for (const g of CATEGORY_GROUPS) {
      if (g.slug === selectedCategory || normalizeCategorySlug(selectedCategory) === g.slug) return g.name;
      const sub = g.subcategories.find((s) => s.slug === selectedCategory || normalizeCategorySlug(selectedCategory) === s.slug);
      if (sub) return sub.name;
    }
    return selectedCategory;
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter((product) => {
      const catRaw = typeof product.category === "object" && product.category ? product.category.slug : typeof product.category === "string" ? product.category : "";
      const catName = typeof product.category === "object" && product.category ? product.category.name.toLowerCase() : "";
      const searchMatches = !query || product.name.toLowerCase().includes(query) || (product.description || "").toLowerCase().includes(query) || (product.shortDescription || "").toLowerCase().includes(query) || catName.includes(query);
      return matchesCategoryFilter(catRaw, selectedCategory) && searchMatches;
    });
    return result.sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    });
  }, [products, selectedCategory, search, sort]);

  const handleToggleWishlist = (product: Product) => {
    const productId = product.id || product._id || product.slug;
    const validImage = product.images?.find((img) => typeof img === "string" && img.trim().length > 0) || fallbackImage;
    toggleWishlist({ productId, slug: product.slug, name: product.name, price: product.price, image: validImage, category: typeof product.category === "object" ? product.category?.name : undefined });
  };

  const choose = (slug: string) => { setSelectedCategory(slug); setFiltersOpen(false); };
  const clearAll = () => { setSearch(""); setSelectedCategory("all"); };
  const hasFilters = selectedCategory !== "all" || search.trim() !== "";

  const tree = (
    <nav aria-label="Product categories" className="space-y-1">
      <button type="button" onClick={() => choose("all")} className={`flex w-full items-center justify-between rounded-full px-4 py-2.5 text-left text-sm font-semibold transition ${selectedCategory === "all" ? "bg-[#380712] text-[#E6C47A]" : "hover:bg-[#FAF3E8]"}`}>
        All products
        <span className="text-xs font-medium opacity-70">{products.length || ""}</span>
      </button>

      {CATEGORY_GROUPS.map((group) => {
        const groupActive = isActive(group.slug) || group.subcategories.some((s) => isActive(s.slug));
        const open = openGroups.includes(group.slug) || groupActive;
        return (
          <div key={group.slug}>
            <div className={`flex items-center rounded-full transition ${groupActive ? "bg-[#FAF3E8]" : "hover:bg-[#FAF3E8]"}`}>
              <button type="button" onClick={() => choose(group.slug)} className={`flex-1 px-4 py-2.5 text-left text-sm font-semibold ${isActive(group.slug) ? "text-[#9A6B35]" : ""}`}>{group.name}</button>
              <button type="button" aria-label={`${open ? "Collapse" : "Expand"} ${group.name}`} aria-expanded={open} onClick={() => setOpenGroups((g) => (g.includes(group.slug) ? g.filter((s) => s !== group.slug) : [...g, group.slug]))} className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-stone-500 hover:text-[#380712]">
                <ChevronDown size={16} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
              </button>
            </div>
            {open && (
              <div className="ml-5 mt-1 space-y-0.5 border-l border-[#D4AF69]/40 pl-3">
                {group.subcategories.map((sub) => (
                  <button key={sub.slug} type="button" onClick={() => choose(sub.slug)} className={`block w-full rounded-full px-3 py-2 text-left text-sm transition ${isActive(sub.slug) ? "bg-[#380712] font-semibold text-[#E6C47A]" : "font-light text-stone-600 hover:text-[#380712]"}`}>{sub.name}</button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <section className={`${bricolage.variable} mx-auto max-w-7xl px-4 py-8 font-[family-name:var(--font-shop-products)] text-[#380712] sm:px-6 sm:py-12 lg:px-8`}>
      {/* Heading */}
      <div className="mb-6 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-[#A27B35]" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#946C2D] sm:text-xs">Find your style</p>
        </div>
        <h2 className="mt-2 text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.035em]">Our <span className="text-[#A27B35]">collection.</span></h2>
        <p className="mt-2 text-sm font-light text-stone-500" aria-live="polite">{loading ? "Loading products..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? "piece" : "pieces"} to explore`}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search size={18} strokeWidth={1.6} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9A6B35]" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sarees, kurtis..." aria-label="Search products" className={`${fieldCls} w-full pl-11 pr-11 placeholder:text-stone-400 [&::-webkit-search-cancel-button]:hidden`} />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"><X size={15} /></button>}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setFiltersOpen(true)} className={`${fieldCls} inline-flex flex-1 items-center justify-center gap-2 px-5 font-semibold sm:flex-none lg:hidden`}>
            <SlidersHorizontal size={16} /> Filters
            {selectedCategory !== "all" && <span className="h-2 w-2 rounded-full bg-[#D4AF69]" />}
          </button>
          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Sort products</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className={`${fieldCls} w-full cursor-pointer appearance-none pl-5 pr-10 font-medium`}>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9A6B35]" />
          </label>
        </div>
      </div>

      {/* Quick category chips (mobile and tablet) */}
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden">
        <button type="button" onClick={() => choose("all")} className={`${chipCls} ${selectedCategory === "all" ? chipOn : chipOff}`}>All</button>
        {CATEGORY_GROUPS.map((g) => (
          <button key={g.slug} type="button" onClick={() => choose(g.slug)} className={`${chipCls} ${isActive(g.slug) || g.subcategories.some((s) => isActive(s.slug)) ? chipOn : chipOff}`}>{g.name}</button>
        ))}
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-stone-400">Showing</span>
          {selectedCategory !== "all" && <button type="button" onClick={() => setSelectedCategory("all")} className="inline-flex items-center gap-1.5 rounded-full bg-[#380712] px-3.5 py-1.5 text-xs font-semibold text-[#E6C47A]">{activeLabel} <X size={13} /></button>}
          {search.trim() && <button type="button" onClick={() => setSearch("")} className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF69]/60 bg-[#FAF3E8] px-3.5 py-1.5 text-xs font-semibold">&ldquo;{search.trim()}&rdquo; <X size={13} /></button>}
          <button type="button" onClick={clearAll} className="text-xs font-semibold text-[#9A6B35] underline underline-offset-4 hover:text-[#380712]">Clear all</button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100svh-8rem)] overflow-y-auto rounded-3xl border border-[#E9DFD2] bg-white p-4 shadow-[0_10px_30px_rgba(56,7,18,0.05)] [scrollbar-color:#D4AF69_transparent] [scrollbar-width:thin]">
            <h3 className="mb-3 px-2 text-lg font-semibold tracking-[-0.02em]">Categories</h3>
            {tree}
            <div className="mt-5 rounded-2xl bg-[#380712] p-4 text-white">
              <p className="text-sm font-semibold">Need help choosing?</p>
              <p className="mt-1 text-xs font-light leading-5 text-white/70">Our team can help you find the right style for your occasion.</p>
              <a href="https://www.instagram.com/mydhilicollections2010/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E6C47A] hover:text-white">Contact our boutique <ArrowUpRight size={13} /></a>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-3xl bg-[#EEE5D9]" />
                  <div className="mt-4 h-3 w-1/3 rounded bg-[#EEE5D9]" />
                  <div className="mt-3 h-4 w-4/5 rounded bg-[#EEE5D9]" />
                  <div className="mt-3 h-3 w-1/4 rounded bg-[#EEE5D9]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="rounded-3xl border border-[#E9DFD2] bg-white px-6 py-16 text-center">
              <h3 className="text-2xl font-semibold tracking-[-0.025em]">We couldn&apos;t load the collection</h3>
              <p className="mx-auto mt-3 max-w-md text-sm font-light text-stone-500">{error}</p>
              <button type="button" onClick={() => void loadShopData()} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#380712] px-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#E6C47A] transition hover:bg-[#5A1222]"><RefreshCw size={15} /> Try again</button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-[#E9DFD2] bg-white px-6 py-16 text-center">
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF3E8] text-[#9A6B35]"><ShoppingBag size={26} strokeWidth={1.4} /></span>
              <h3 className="text-2xl font-semibold tracking-[-0.025em]">No pieces found</h3>
              <p className="mt-3 text-sm font-light text-stone-500">Try another search or explore a different category.</p>
              <button type="button" onClick={clearAll} className="mt-6 inline-flex h-12 items-center rounded-full border border-[#380712]/25 px-7 text-xs font-semibold uppercase tracking-[0.14em] transition hover:border-[#380712] hover:bg-[#380712] hover:text-white">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-11">
              {filteredProducts.map((product) => {
                const imgs = (product.images || []).filter((i) => typeof i === "string" && i.trim().length > 0);
                const image = imgs[0] || fallbackImage;
                const second = imgs[1];
                const hasDiscount = typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;
                const discount = hasDiscount ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100) : 0;
                const categoryName = typeof product.category === "object" && product.category ? product.category.name : "";
                const productId = product.id || product._id || product.slug;
                const wished = isInWishlist(productId);
                const variants = Array.isArray(product.variants) ? product.variants : [];
                const totalStock = variants.reduce((sum, v) => sum + Number(v.stock ?? 0), 0);
                const soldOut = variants.length > 0 && totalStock <= 0;
                const sizes = Array.from(new Set(variants.map((v) => v.size).filter((s): s is string => Boolean(s)))).slice(0, 4);

                return (
                  <article key={productId} className="group min-w-0">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#380712] to-[#6D2636] shadow-[0_10px_30px_rgba(56,7,18,0.07)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_22px_50px_rgba(56,7,18,0.18)]">
                      <Link href={`/products/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden" aria-label={`View ${product.name}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image} alt={product.name} loading="lazy" className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${soldOut ? "opacity-70 grayscale-[35%]" : ""} ${second ? "group-hover:scale-105 group-hover:opacity-0" : "group-hover:scale-[1.07]"}`} />
                        {second && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={second} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100" />
                        )}
                        <span className="absolute inset-0 bg-gradient-to-t from-[#24040B]/35 via-transparent to-transparent" />
                      </Link>

                      <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
                        {soldOut && <span className={`${pill} bg-rose-700 font-bold uppercase tracking-wider text-white shadow-md`}>Out of Stock</span>}
                        {hasDiscount && !soldOut && <span className={`${pill} bg-[#D4AF69]`}>Save {discount}%</span>}
                        {product.isFeatured && !soldOut && !hasDiscount && <span className={`${pill} bg-white/90 backdrop-blur-sm`}>Featured</span>}
                      </div>

                      <button type="button" onClick={() => handleToggleWishlist(product)} aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} aria-pressed={wished} className={`absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition duration-300 active:scale-90 sm:right-3 sm:top-3 ${wished ? "bg-[#380712] text-[#E6C47A]" : "bg-white/90 text-[#380712] hover:bg-[#380712] hover:text-[#E6C47A]"}`}>
                        <Heart size={17} strokeWidth={1.6} fill={wished ? "currentColor" : "none"} />
                      </button>

                      <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-3 opacity-0 transition-all duration-300 sm:block sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                        <Link href={`/products/${product.slug}`} className={`pointer-events-auto flex items-center justify-center gap-2 rounded-full py-3 text-[11px] font-semibold uppercase tracking-[0.15em] backdrop-blur-sm transition ${soldOut ? "border border-rose-300 bg-white/95 text-rose-700 hover:bg-rose-700 hover:text-white" : "bg-white/95 text-[#380712] hover:bg-[#380712] hover:text-[#E6C47A]"}`}><ShoppingBag size={15} strokeWidth={1.7} /> {soldOut ? "Out of stock · View" : "View product"}</Link>
                      </div>
                    </div>

                    <div className="px-1 pt-3.5 sm:pt-4">
                      {categoryName && <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A6B35]">{categoryName}</p>}
                      <Link href={`/products/${product.slug}`} className="line-clamp-2 block text-sm font-medium leading-snug tracking-[-0.015em] transition-colors hover:text-[#9A6B35] sm:text-base">{product.name}</Link>
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-base font-semibold sm:text-lg">{formatPrice(product.price)}</span>
                        {hasDiscount && <span className="text-xs text-stone-400 line-through sm:text-sm">{formatPrice(product.compareAtPrice!)}</span>}
                        {soldOut && (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                            Out of stock
                          </span>
                        )}
                      </div>
                      {sizes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {sizes.map((s) => {
                            const sizeStock = variants
                              .filter((v) => v.size === s)
                              .reduce((sum, v) => sum + Number(v.stock ?? 0), 0);
                            const isSizeOut = variants.some((v) => v.size === s) && sizeStock <= 0;
                            return (
                              <span
                                key={s}
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition ${
                                  isSizeOut
                                    ? "border-rose-200 bg-rose-50/70 text-stone-400 line-through"
                                    : "border-[#E9DFD2] bg-[#FAF7F2] text-stone-600"
                                }`}
                                title={isSizeOut ? `${s} (Out of stock)` : `${s} (In stock)`}
                              >
                                {s}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Category filters">
          <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="absolute inset-0 bg-[#24040B]/60 backdrop-blur-sm" />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col rounded-t-3xl bg-white shadow-[0_-20px_60px_rgba(56,7,18,0.3)]">
            <div className="flex items-center justify-between border-b border-[#E9DFD2] px-5 py-4">
              <h3 className="text-lg font-semibold tracking-[-0.02em]">Categories</h3>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF3E8] text-[#380712]"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">{tree}</div>
            <div className="flex gap-3 border-t border-[#E9DFD2] px-5 py-4">
              <button type="button" onClick={() => { clearAll(); setFiltersOpen(false); }} className="h-12 flex-1 rounded-full border border-[#380712]/20 text-xs font-semibold uppercase tracking-[0.14em]">Reset</button>
              <button type="button" onClick={() => setFiltersOpen(false)} className="h-12 flex-[2] rounded-full bg-gradient-to-r from-[#E6C47A] via-[#D4AF69] to-[#B8893F] text-xs font-semibold uppercase tracking-[0.14em] text-[#380712]">Show {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}