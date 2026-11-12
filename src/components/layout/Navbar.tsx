
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  UserRound,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  DEFAULT_CATEGORIES,
  CATEGORY_GROUPS,
} from "@/lib/constants/categories";

type Category = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
};

const mobileLinks = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop" },
  { label: "Our Story", href: "/our-story" },
  { label: "Contact Us", href: "/contact" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "My Account", href: "/account" },
  { label: "Shopping Cart", href: "/cart" },
];

const INSTAGRAM_URL = "https://www.instagram.com/mydhilicollections2010/";

export default function Navbar() {
  const { itemCount, isLoaded } = useCart();
  const { itemCount: wishlistCount, isLoaded: isWishlistLoaded } = useWishlist();

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Unable to load categories");

        const data = await response.json();

        if (!cancelled && data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Navbar categories failed to load:", error);
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setScrolled((prev) => (y > 45 ? true : y < 15 ? false : prev));
          ticking = false;
        });

        ticking = true;
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setCategoryMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  const closeMenus = () => {
    setMenuOpen(false);
    setCategoryMenuOpen(false);
  };

  const customCategories = categories.filter((c) => {
    const slug = (c.slug || "").toLowerCase();
    return !CATEGORY_GROUPS.some(
      (g) =>
        g.slug === slug ||
        g.subcategories.some((sub) => sub.slug === slug)
    );
  });

  const navLinkClass =
    "relative flex h-full items-center text-[11px] font-medium uppercase tracking-[0.16em] text-[#380712]/80 transition-colors duration-300 hover:text-[#9A6B35] after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#D4AF69] after:transition-all after:duration-300 hover:after:w-full";

  const iconBtnClass =
    "flex h-9 w-9 items-center justify-center rounded-full text-[#380712] transition-colors duration-300 hover:bg-[#380712]/[0.06] hover:text-[#9A6B35]";

  return (
    <>
      {/* Announcement Strip */}
      <div className="bg-[#380712] py-2 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-[#F5DFC0] sm:text-[11px] sm:tracking-[0.25em]">
        <span>A little tradition, a lot of elegance</span>
      </div>

      <header
        className={`sticky top-0 z-50 bg-[#FAF7F2]/95 text-[#380712] backdrop-blur-md transition-shadow duration-300 ${scrolled
            ? "shadow-[0_8px_30px_rgba(56,7,18,0.08)] bg-[#FAF7F2]/98"
            : ""
          }`}
      >
        {/* Header container */}
        <div className="relative mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:h-24 lg:px-10">
          {/* Left: Mobile hamburger / Desktop logo */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`${iconBtnClass} -ml-2 lg:hidden`}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? (
                <X size={20} strokeWidth={1.5} />
              ) : (
                <Menu size={20} strokeWidth={1.5} />
              )}
            </button>

            {/* Desktop Logo */}
            <Link
              href="/"
              onClick={closeMenus}
              className="group hidden shrink-0 items-center lg:flex"
              aria-label="Mydhili Boutique home"
            >
              <div className="relative flex items-center transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo/logo.png"
                  alt="Mydhili Boutique logo"
                  width={759}
                  height={566}
                  priority
                  className="h-16 w-auto object-contain lg:h-18 xl:h-20"
                />
              </div>
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
            <Link
              href="/"
              onClick={closeMenus}
              className="group flex items-center justify-center"
              aria-label="Mydhili Boutique home"
            >
              <Image
                src="/logo/logo.png"
                alt="Mydhili Boutique logo"
                width={759}
                height={566}
                priority
                className="h-[52px] w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-14"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden h-full items-stretch gap-8 lg:flex xl:gap-10"
          >
            <Link href="/shop" className={navLinkClass}>
              Shop All
            </Link>

            <div
              className="group relative flex items-stretch"
              onMouseEnter={() => setCategoryMenuOpen(true)}
              onMouseLeave={() => setCategoryMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setCategoryMenuOpen(false);
                }}
                className={`${navLinkClass} gap-1.5`}
                aria-expanded={categoryMenuOpen}
                aria-haspopup="true"
              >
                Categories
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-300 ${categoryMenuOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <div
                className={`absolute left-1/2 top-full z-50 w-[780px] xl:w-[840px] -translate-x-1/2 transition-all duration-200 ${
                  categoryMenuOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                }`}
              >
                <div className="mt-px border border-[#D4AF69]/30 bg-white p-6 shadow-[0_20px_45px_rgba(56,7,18,0.12)]">
                  <div className="mb-4 flex items-center justify-between border-b border-[#380712]/10 pb-3">
                    <div>
                      <p className="font-serif text-lg text-[#380712]">
                        Curated Collections
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#9A6B35]">
                        Gents, Ladies, Kids & Accessories
                      </p>
                    </div>
                    <Link
                      href="/shop"
                      onClick={closeMenus}
                      className="group/all flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#380712] transition hover:text-[#9A6B35]"
                    >
                      <span>Explore All Products</span>
                      <ArrowUpRight
                        size={13}
                        className="transition group-hover/all:translate-x-0.5 group-hover/all:-translate-y-0.5"
                      />
                    </Link>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    {CATEGORY_GROUPS.map((group) => (
                      <div key={group.slug} className="flex flex-col">
                        <Link
                          href={`/categories/${group.slug}`}
                          onClick={closeMenus}
                          className="group/group-title mb-2.5 flex items-center justify-between border-b border-[#380712]/10 pb-1.5 font-serif text-base font-medium text-[#380712] transition hover:text-[#9A6B35]"
                        >
                          <span>{group.name}</span>
                          <ArrowUpRight
                            size={12}
                            className="text-[#9A6B35] opacity-0 transition group-hover/group-title:opacity-100"
                          />
                        </Link>
                        <div className="flex flex-col space-y-1.5">
                          {group.subcategories.map((sub) => (
                            <Link
                              key={sub.slug}
                              href={`/categories/${sub.slug}`}
                              onClick={closeMenus}
                              className="text-xs text-stone-600 transition hover:translate-x-0.5 hover:text-[#9A6B35]"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {customCategories.length > 0 && (
                    <div className="mt-5 border-t border-[#380712]/10 pt-4">
                      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A6B35]">
                        More Collections
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {customCategories.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/categories/${cat.slug}`}
                            onClick={closeMenus}
                            className="rounded-full border border-[#E9DFD2] bg-[#FAF7F2] px-3.5 py-1 text-xs font-medium text-[#380712] transition hover:border-[#D4AF69] hover:bg-[#380712] hover:text-[#E6C47A]"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link href="/our-story" className={navLinkClass}>
              Our Story
            </Link>

            <Link href="/contact" className={navLinkClass}>
              Contact
            </Link>

            <Link
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${navLinkClass} gap-1`}
            >
              Instagram
              <ArrowUpRight size={12} />
            </Link>
          </nav>

          {/* Right: Action icons */}
          <div className="flex items-center justify-end gap-0.5">
            <Link
              href="/shop"
              aria-label="Search products"
              className={iconBtnClass}
            >
              <Search size={19} strokeWidth={1.5} />
            </Link>

            <Link
              href="/wishlist"
              aria-label={`Wishlist with ${wishlistCount} items`}
              className={`${iconBtnClass} relative flex`}
            >
              <Heart size={19} strokeWidth={1.5} />
              {isWishlistLoaded && wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#380712] px-1 text-[9px] font-semibold leading-none text-white ring-2 ring-[#FAF7F2]">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              aria-label="My account"
              className={`${iconBtnClass} hidden lg:flex`}
            >
              <UserRound size={19} strokeWidth={1.5} />
            </Link>

            {/* Cart icon with live item count */}
            <Link
              href="/cart"
              aria-label={`Shopping cart with ${itemCount} items`}
              className={`${iconBtnClass} relative`}
            >
              <ShoppingBag size={19} strokeWidth={1.5} />

              {isLoaded && itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#380712] px-1 text-[9px] font-semibold leading-none text-white ring-2 ring-[#FAF7F2]">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Gold hairline */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF69]/50 to-transparent" />

        {/* Mobile navigation */}
        <div
          id="mobile-navigation"
          className={`absolute left-0 right-0 top-full z-50 overflow-hidden border-t border-[#D4AF69]/30 bg-[#FAF7F2] shadow-[0_20px_35px_rgba(56,7,18,0.12)] transition-all duration-300 ease-in-out lg:hidden ${menuOpen
              ? "visible max-h-[80vh] overflow-y-auto opacity-100"
              : "invisible max-h-0 opacity-0"
            }`}
          aria-hidden={!menuOpen}
        >
          <nav
            aria-label="Mobile navigation"
            className="px-5 pb-6 pt-3 sm:px-8"
          >
            <div className="mb-4 flex items-center justify-between border-b border-[#380712]/[0.08] pb-4 pt-1">
              <Link href="/" onClick={closeMenus} className="flex items-center">
                <Image
                  src="/logo/logo.png"
                  alt="Mydhili Boutique logo"
                  width={759}
                  height={566}
                  className="h-14 w-auto object-contain"
                />
              </Link>

              <p className="text-[8px] font-medium uppercase tracking-[0.24em] text-[#9A6B35]">
                A little tradition, a lot of elegance
              </p>
            </div>

            <p className="mb-1 px-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9A6B35]">
              Explore Mydhili
            </p>

            {mobileLinks.map((item) => {
              const isWishlist = item.href === "/wishlist";
              const isCart = item.href === "/cart";
              const count = isWishlist
                ? isWishlistLoaded
                  ? wishlistCount
                  : 0
                : isCart
                ? isLoaded
                  ? itemCount
                  : 0
                : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenus}
                  tabIndex={menuOpen ? 0 : -1}
                  className="group flex items-center justify-between border-b border-[#380712]/[0.08] py-3 text-sm text-[#380712] transition hover:pl-2 hover:text-[#9A6B35]"
                >
                  <span className="flex items-center gap-2">
                    {item.label}
                    {count > 0 && (
                      <span className="rounded-full bg-[#380712] px-2 py-0.5 text-[10px] font-semibold text-[#E6C47A]">
                        {count}
                      </span>
                    )}
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="text-[#9A6B35] opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              );
            })}

            <div className="border-b border-[#380712]/[0.08] py-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9A6B35]">
                Shop by Department
              </p>

              <div className="space-y-4">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.slug} className="space-y-1.5">
                    <Link
                      href={`/categories/${group.slug}`}
                      onClick={closeMenus}
                      tabIndex={menuOpen ? 0 : -1}
                      className="flex items-center justify-between font-serif text-base text-[#380712] hover:text-[#9A6B35]"
                    >
                      <span>{group.name}</span>
                      <ArrowUpRight size={14} className="text-[#9A6B35]" />
                    </Link>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 pl-1">
                      {group.subcategories.map((sub) => (
                        <Link
                          key={sub.slug}
                          href={`/categories/${sub.slug}`}
                          onClick={closeMenus}
                          tabIndex={menuOpen ? 0 : -1}
                          className="text-xs text-stone-600 transition hover:text-[#9A6B35]"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {customCategories.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="font-serif text-base text-[#380712]">
                      More Collections
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 pl-1">
                      {customCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/categories/${cat.slug}`}
                          onClick={closeMenus}
                          tabIndex={menuOpen ? 0 : -1}
                          className="text-xs text-stone-600 transition hover:text-[#9A6B35]"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenus}
              tabIndex={menuOpen ? 0 : -1}
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#380712] transition hover:text-[#9A6B35]"
            >
              Follow us on Instagram
              <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
