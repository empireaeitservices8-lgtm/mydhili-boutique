"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { ArrowRight, ArrowUpRight, Check, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist, WishlistItem } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-wishlist", display: "swap" });

const quickLinks = [
  { label: "Sarees", href: "/categories/sarees" },
  { label: "Kurtis", href: "/categories/kurtis" },
  { label: "Ethnic Wear", href: "/categories/ethnic-wear" },
  { label: "Dresses", href: "/categories/dresses" },
];

const goldBtn = "group inline-flex h-14 items-center gap-4 rounded-full bg-gradient-to-r from-[#E6C47A] via-[#D4AF69] to-[#B8893F] py-1.5 pl-8 pr-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#380712] shadow-[0_10px_30px_rgba(212,175,105,0.35)] transition-all duration-300 hover:-translate-y-0.5";
const arrowCircle = "flex h-11 w-11 items-center justify-center rounded-full bg-[#380712] text-[#E6C47A] transition-transform duration-300 group-hover:rotate-[-45deg]";
const toolBtn = "inline-flex h-10 items-center gap-2 rounded-full border border-[#380712]/20 bg-white px-4 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300";

export default function WishlistPage() {
  const { items, itemCount, isLoaded, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function triggerToast(message: string) {
    if (timer.current) clearTimeout(timer.current);
    setToastMessage(message);
    timer.current = setTimeout(() => setToastMessage(null), 3500);
  }

  function handleMoveToCart(item: WishlistItem) {
    addToCart({ productId: item.productId, slug: item.slug, name: item.name, image: item.image, price: item.price, quantity: 1 });
    triggerToast(`Added "${item.name}" to your shopping bag.`);
  }

  const subtitle = !isLoaded
    ? "Loading your saved favourites..."
    : itemCount === 0
      ? "Your saved items will appear here."
      : `${itemCount} saved ${itemCount === 1 ? "piece" : "pieces"} waiting for you.`;

  return (
    <main className={`${bricolage.variable} min-h-screen bg-[#FAF7F2] font-[family-name:var(--font-wishlist)] text-[#380712]`}>
      {toastMessage && (
        <aside aria-live="polite" className="fixed inset-x-4 bottom-4 z-50 flex items-center gap-3 rounded-2xl border border-[#D4AF69]/40 bg-[#380712] px-5 py-3.5 text-sm text-[#FAF7F2] shadow-[0_20px_50px_rgba(56,7,18,0.35)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6C47A] text-[#380712]"><Check size={15} strokeWidth={2.5} /></span>
          <span className="min-w-0 flex-1 font-light">{toastMessage}</span>
          <Link href="/cart" className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#E6C47A] underline underline-offset-4 hover:text-white">View bag</Link>
        </aside>
      )}

      {/* Header */}
      <section className="relative overflow-hidden bg-[#380712] px-5 py-14 text-center text-white sm:py-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#D4AF69]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[#8B2635]/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF69]/60 to-transparent" />
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#D4AF69]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#E6C47A] sm:text-xs">Personal Collection</p>
            <span className="h-px w-8 bg-[#D4AF69]" />
          </div>
          <h1 className="text-[clamp(2.2rem,5.5vw,4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">My <span className="text-[#E6C47A]">wishlist.</span></h1>
          <p className="mx-auto mt-4 max-w-md text-sm font-light leading-7 text-white/75 sm:text-base">{subtitle}</p>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="relative z-10 mx-auto -mt-8 max-w-7xl">
          {!isLoaded ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-3xl border border-[#E9DFD2] bg-white p-3">
                  <div className="aspect-[3/4] w-full rounded-2xl bg-[#EEE5D9]" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-[#EEE5D9]" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-[#EEE5D9]" />
                  <div className="mt-5 h-12 w-full rounded-full bg-[#EEE5D9]" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-[#E9DFD2] bg-white px-6 py-12 text-center shadow-[0_30px_80px_rgba(56,7,18,0.1)] sm:px-12 sm:py-14">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF3E8] text-[#9A6B35]"><Heart size={36} strokeWidth={1.3} /></span>
              <h2 className="mt-6 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">Your wishlist is <span className="text-[#A27B35]">empty.</span></h2>
              <p className="mx-auto mt-3 max-w-md text-sm font-light leading-7 text-stone-600">Discover something beautiful from our sarees, kurtis and festive ensembles, and tap the heart to save it here.</p>
              <Link href="/shop" className={`${goldBtn} mt-8`}>
                Explore the shop
                <span className={arrowCircle}><ArrowRight size={17} strokeWidth={2} /></span>
              </Link>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 border-t border-[#380712]/10 pt-6">
                <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.22em] text-stone-400">Popular</span>
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-full border border-[#D4AF69]/40 px-4 py-2 text-xs font-medium transition-all duration-300 hover:border-[#D4AF69] hover:bg-[#D4AF69]">{link.label}</Link>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Toolbar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E9DFD2] bg-white px-5 py-4 shadow-[0_16px_40px_rgba(56,7,18,0.08)]">
                <div>
                  <p className="text-sm font-semibold">{itemCount} {itemCount === 1 ? "item" : "items"} in your wishlist</p>
                  <p className="text-xs font-light text-stone-500">Saved on this device until you remove them.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link href="/shop" className={`${toolBtn} hover:border-[#380712] hover:bg-[#380712] hover:text-[#E6C47A]`}>
                    Continue shopping <ArrowUpRight size={14} />
                  </Link>
                  {showClearConfirm ? (
                    <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 p-1 pl-4">
                      <span className="text-xs font-medium text-red-700">Clear all?</span>
                      <button type="button" onClick={() => { clearWishlist(); setShowClearConfirm(false); }} className="h-8 rounded-full bg-red-700 px-4 text-xs font-semibold text-white transition hover:bg-red-800">Yes, clear</button>
                      <button type="button" onClick={() => setShowClearConfirm(false)} className="h-8 rounded-full border border-stone-200 bg-white px-4 text-xs text-stone-600 transition hover:bg-stone-50">Cancel</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowClearConfirm(true)} className={`${toolBtn} text-stone-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700`}>
                      <Trash2 size={14} /> Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <article key={item.productId} className="group flex min-w-0 flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br from-[#380712] to-[#6D2636] shadow-[0_10px_30px_rgba(56,7,18,0.07)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_22px_50px_rgba(56,7,18,0.18)]">
                      <Link href={`/products/${item.slug}`} className="block h-full w-full" aria-label={`View ${item.name}`}>
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[#E6C47A]/70"><ShoppingBag size={34} strokeWidth={1.2} /></span>
                        )}
                        <span className="absolute inset-0 bg-gradient-to-t from-[#24040B]/35 via-transparent to-transparent" />
                      </Link>
                      <button type="button" onClick={() => removeFromWishlist(item.productId)} aria-label={`Remove ${item.name} from wishlist`} className="absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#380712] shadow-sm backdrop-blur-sm transition duration-300 hover:bg-[#FDECEC] hover:text-[#8B1E2D] active:scale-90 sm:right-3 sm:top-3">
                        <Trash2 size={16} strokeWidth={1.7} />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col px-1 pt-4">
                      {item.category && <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A6B35]">{item.category}</p>}
                      <Link href={`/products/${item.slug}`} className="line-clamp-2 text-base font-medium leading-snug tracking-[-0.015em] transition-colors hover:text-[#9A6B35] sm:text-lg">{item.name}</Link>
                      <p className="mt-2 text-base font-semibold sm:text-lg">₹{Number(item.price || 0).toLocaleString("en-IN")}</p>

                      <button type="button" onClick={() => handleMoveToCart(item)} className="group/btn mt-4 flex h-12 w-full items-center justify-between rounded-full border border-[#380712]/20 bg-white py-1 pl-5 pr-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:border-[#380712] hover:bg-[#380712] hover:text-white active:scale-[0.98]">
                        Move to bag
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF69] text-[#380712]"><ShoppingBag size={16} strokeWidth={1.8} /></span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}