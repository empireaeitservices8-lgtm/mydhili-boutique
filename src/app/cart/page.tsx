"use client";

import Image from "next/image";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Headset,
  Lock,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { getCartItemKey, useCart } from "@/context/CartContext";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-cart",
  display: "swap",
});

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const steps = [
  { label: "Bag", icon: ShoppingBag, active: true },
  { label: "Checkout", icon: Lock, active: false },
  { label: "Confirmation", icon: CircleCheck, active: false },
];

const assurances = [
  {
    icon: Truck,
    title: "Delivery estimate",
    text: "1–4 days within India for ready-to-dispatch items",
  },
  {
    icon: ShieldCheck,
    title: "Order protection",
    text: "Help with damaged or incorrect deliveries",
  },
  {
    icon: Headset,
    title: "Personal support",
    text: "Mon–Sat, 10:00 AM–7:00 PM IST",
  },
];

export default function CartPage() {
  const {
    items,
    subtotal,
    itemCount,
    isLoaded,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const hasOutOfStockItems = items.some(
    (item) => typeof item.stock === "number" && item.stock <= 0
  );

  const fontClass = `${bricolage.variable} font-[family-name:var(--font-cart)]`;

  /* ---------- Loading ---------- */
  if (!isLoaded) {
    return (
      <main
        className={`${fontClass} min-h-[60vh] bg-[#FAF7F2] px-5 py-16 sm:px-8 lg:px-12`}
      >
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-4 w-40 rounded bg-[#EEE5D9]" />
          <div className="mt-4 h-10 w-72 rounded bg-[#EEE5D9]" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="h-40 rounded-3xl bg-[#EEE5D9]" />
              ))}
            </div>
            <div className="h-80 rounded-3xl bg-[#EEE5D9]" />
          </div>
        </div>
      </main>
    );
  }

  /* ---------- Empty ---------- */
  if (items.length === 0) {
    return (
      <main
        className={`${fontClass} flex min-h-[70vh] items-center justify-center bg-[#FAF7F2] px-5 py-16 text-[#380712]`}
      >
        <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#E9DFD2] bg-white px-6 py-14 text-center shadow-[0_24px_60px_rgba(56,7,18,0.07)] sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#D4AF69]/15 blur-3xl" />

          <span className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FAF3E8] text-[#9A6B35]">
            <ShoppingBag size={36} strokeWidth={1.3} />
          </span>

          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#D4AF69]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#946C2D]">
              Your shopping bag
            </p>
            <span className="h-px w-8 bg-[#D4AF69]" />
          </div>

          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Your bag is <span className="text-[#A27B35]">empty.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm font-light leading-7 text-stone-600">
            Discover timeless styles and find something special for your
            collection.
          </p>

          <Link
            href="/shop"
            className="group relative mt-8 inline-flex h-14 items-center gap-4 overflow-hidden rounded-full bg-gradient-to-r from-[#E6C47A] via-[#D4AF69] to-[#B8893F] py-1.5 pl-8 pr-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#380712] shadow-[0_10px_30px_rgba(212,175,105,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(212,175,105,0.5)]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/40 opacity-0 blur-[2px] transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
            />
            <span className="relative">Explore Collection</span>
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#380712] text-[#E6C47A] transition-transform duration-300 group-hover:rotate-[-45deg]">
              <ArrowRight size={18} strokeWidth={2} />
            </span>
          </Link>
        </div>
      </main>
    );
  }

  /* ---------- Cart ---------- */
  return (
    <main
      className={`${fontClass} min-h-screen bg-[#FAF7F2] px-5 py-10 text-[#380712] sm:px-8 lg:px-12 lg:py-14`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[#A27B35]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#946C2D] sm:text-xs">
                Mydhili Collections
              </p>
            </div>

            <h1 className="text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
              Your shopping <span className="text-[#A27B35]">bag.</span>
            </h1>

            <p className="mt-3 inline-flex items-center gap-2 text-sm font-light text-stone-500">
              <Package size={17} strokeWidth={1.5} className="text-[#9A6B35]" />
              {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
            </p>
          </div>

          {/* Steps */}
          <ol
            aria-label="Checkout progress"
            className="flex items-center gap-2 sm:gap-3"
          >
            {steps.map(({ label, icon: Icon, active }, index) => (
              <li key={label} className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    active
                      ? "bg-[#380712] text-[#E6C47A]"
                      : "border border-[#380712]/15 bg-white text-[#380712]/55"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  <Icon size={15} strokeWidth={1.8} />
                  <span className={active ? "" : "hidden sm:inline"}>
                    {label}
                  </span>
                </span>
                {index < steps.length - 1 && (
                  <span className="h-px w-3 bg-[#D4AF69]/60 sm:w-6" />
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start xl:gap-10">
          {/* Items */}
          <section aria-label="Items in your bag">
            <div className="space-y-4">
              {items.map((item) => {
                const key = getCartItemKey(item);
                const isOutOfStock =
                  typeof item.stock === "number" && item.stock <= 0;
                const lowStock =
                  typeof item.stock === "number" &&
                  item.stock > 0 &&
                  item.stock <= 5;
                const maxReached =
                  typeof item.stock === "number" &&
                  item.quantity >= item.stock;

                return (
                  <article
                    key={key}
                    className="group relative rounded-3xl border border-[#E9DFD2] bg-white p-4 shadow-[0_10px_30px_rgba(56,7,18,0.04)] transition-all duration-300 hover:border-[#D4AF69]/60 hover:shadow-[0_18px_44px_rgba(56,7,18,0.09)] sm:p-5"
                  >
                    <div className="flex gap-4 sm:gap-6">
                      {/* Image */}
                      <Link
                        href={`/products/${item.slug}`}
                        className="relative h-36 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#380712] to-[#6D2636] sm:h-44 sm:w-36"
                        aria-label={`View ${item.name}`}
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(min-width: 640px) 144px, 112px"
                            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                              isOutOfStock ? "opacity-60 grayscale-[40%]" : ""
                            }`}
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[#E6C47A]/70">
                            <ShoppingBag size={30} strokeWidth={1.3} />
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="absolute left-2 top-2 rounded-full bg-rose-700 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                            Sold out
                          </span>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="line-clamp-2 text-base font-medium leading-snug tracking-[-0.015em] transition-colors hover:text-[#9A6B35] sm:text-lg"
                            >
                              {item.name}
                            </Link>

                            <p className="mt-1.5 text-sm font-light text-stone-500">
                              {formatPrice(item.price)}
                              <span className="text-stone-400"> each</span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(key)}
                            aria-label={`Remove ${item.name} from bag`}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-[#FDECEC] hover:text-[#8B1E2D]"
                          >
                            <Trash2 size={18} strokeWidth={1.6} />
                          </button>
                        </div>

                        {(item.size || item.color) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.size && (
                              <span className="rounded-full border border-[#E9DFD2] bg-[#FAF7F2] px-3 py-1 text-xs font-medium text-[#380712]/80">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="rounded-full border border-[#E9DFD2] bg-[#FAF7F2] px-3 py-1 text-xs font-medium text-[#380712]/80">
                                Colour: {item.color}
                              </span>
                            )}
                          </div>
                        )}

                        {isOutOfStock ? (
                          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                            <CircleAlert size={15} strokeWidth={2} />
                            Out of stock — Please remove this item to checkout
                          </p>
                        ) : lowStock ? (
                          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#B45309]">
                            <CircleAlert size={15} strokeWidth={1.8} />
                            Only {item.stock} left in stock
                          </p>
                        ) : null}

                        {/* Quantity + total */}
                        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
                          <div>
                            {!isOutOfStock ? (
                              <div className="flex items-center rounded-full border border-[#380712]/15 bg-[#FAF7F2] p-1">
                                <button
                                  type="button"
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  onClick={() =>
                                    updateQuantity(key, item.quantity - 1)
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#380712] transition-colors hover:bg-[#380712] hover:text-[#E6C47A] active:scale-95"
                                >
                                  <Minus size={15} strokeWidth={2} />
                                </button>

                                <span
                                  className="min-w-9 text-center text-sm font-semibold tabular-nums"
                                  aria-live="polite"
                                >
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  aria-label={`Increase quantity of ${item.name}`}
                                  disabled={maxReached}
                                  onClick={() =>
                                    updateQuantity(key, item.quantity + 1)
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#380712] transition-colors hover:bg-[#380712] hover:text-[#E6C47A] active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                                >
                                  <Plus size={15} strokeWidth={2} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-rose-600">Unavailable</span>
                            )}
                            {maxReached && !isOutOfStock && (
                              <p className="mt-1.5 pl-3 text-[11px] font-light text-stone-500">
                                Maximum available
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-400">
                              Item total
                            </p>
                            <p className="text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link
              href="/shop"
              className="group mt-7 inline-flex items-center gap-2.5 border-b border-[#B99A61] pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#380712] transition hover:text-[#9A6B35]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              Continue shopping
            </Link>
          </section>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-3xl bg-[#380712] p-6 text-white shadow-[0_24px_60px_rgba(56,7,18,0.22)] sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#D4AF69]/15 blur-3xl" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF69]/60 to-transparent" />

              <div className="relative">
                <h2 className="text-2xl font-semibold tracking-[-0.025em]">
                  Order summary
                </h2>

                <div className="mt-6 space-y-4 border-b border-white/10 pb-6 text-sm">
                  <div className="flex justify-between gap-4 text-white/75">
                    <span>
                      Subtotal ({itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium text-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-white/75">
                    <span className="inline-flex items-center gap-2">
                      <Truck
                        size={17}
                        strokeWidth={1.6}
                        className="text-[#E6C47A]"
                      />
                      Shipping
                    </span>
                    <span className="text-xs font-light">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-4 py-6">
                  <span className="text-sm font-medium text-white/85">
                    Estimated total
                  </span>
                  <span className="text-3xl font-semibold tracking-[-0.03em] text-[#E6C47A]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {hasOutOfStockItems ? (
                  <div className="rounded-2xl border border-rose-400/40 bg-rose-950/60 p-4 text-center">
                    <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-300">
                      <CircleAlert size={16} /> Item(s) out of stock
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-white/70">
                      Please remove the out-of-stock items from your bag to proceed to checkout.
                    </p>
                  </div>
                ) : (
                  <Link
                    href="/checkout"
                    className="group relative flex h-14 w-full items-center justify-between overflow-hidden rounded-full bg-gradient-to-r from-[#E6C47A] via-[#D4AF69] to-[#B8893F] py-1.5 pl-8 pr-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#380712] shadow-[0_10px_30px_rgba(212,175,105,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(212,175,105,0.45)]"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/40 opacity-0 blur-[2px] transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
                    />
                    <span className="relative inline-flex items-center gap-2.5">
                      <Lock size={16} strokeWidth={1.9} />
                      Proceed to checkout
                    </span>
                    <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#380712] text-[#E6C47A] transition-transform duration-300 group-hover:rotate-[-45deg]">
                      <ArrowRight size={18} strokeWidth={2} />
                    </span>
                  </Link>
                )}

                <p className="mt-5 text-center text-xs font-light leading-6 text-white/55">
                  Shipping charges and the final order total will be confirmed
                  at checkout.
                </p>
              </div>
            </div>

            {/* Assurances */}
            <ul className="mt-4 space-y-3 rounded-3xl border border-[#E9DFD2] bg-white p-5">
              {assurances.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAF3E8] text-[#9A6B35]">
                    <Icon size={19} strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.01em]">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs font-light leading-5 text-stone-500">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}