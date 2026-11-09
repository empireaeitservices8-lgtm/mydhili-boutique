"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  BarChart3,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
];

const managementNavigation = [
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to log out.");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile Top App Bar */}
      <div className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#E9DFD2] bg-[#380712] px-4 text-white shadow-md lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[#D4AF69]/40 bg-[#210309] p-1 shadow-inner">
            <Image
              src="/logo/logo.png"
              alt="Mydhili Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-serif text-base font-semibold tracking-wide text-[#F5DFC0]">
              Mydhili
            </span>
            <span className="block text-[8px] uppercase tracking-[0.28em] text-[#D4AF69]">
              Admin
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-lg border border-[#D4AF69]/40 bg-white/10 px-2.5 py-1.5 text-xs text-[#F5DFC0] transition hover:bg-white/20"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Store</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 shrink-0 flex-col border-r border-[#D4AF69]/20 bg-[#210309] text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="relative border-b border-[#D4AF69]/15 px-6 py-6">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#D4AF69]/10 blur-2xl" />

          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              onClick={closeMobileMenu}
              className="group flex items-center gap-3.5"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#D4AF69]/40 bg-[#150105] p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo/logo.png"
                  alt="Mydhili Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>

              <div>
                <h1 className="font-serif text-lg font-bold tracking-wide text-[#F5DFC0] transition-colors group-hover:text-white">
                  Mydhili
                </h1>
                <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#D4AF69]">
                  Boutique Admin
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close sidebar"
              className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick link to live store */}
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-between rounded-xl border border-[#D4AF69]/30 bg-[#380712]/80 px-3.5 py-2 text-xs font-medium text-[#F5DFC0] transition-all duration-200 hover:border-[#D4AF69] hover:bg-[#380712] hover:text-white"
          >
            <span>View live store</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-white/10">
          <div>
            <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF69]/70">
              Main Menu
            </p>

            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-[#D4AF69] to-[#E8CD8A] font-semibold text-[#210309] shadow-[0_4px_16px_rgba(212,175,105,0.25)]"
                        : "text-white/70 hover:bg-white/8 hover:text-[#F5DFC0]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={active ? "text-[#210309]" : "text-[#D4AF69]"}
                      />
                      {item.name}
                    </span>

                    {active && <ChevronRight size={15} strokeWidth={2.5} />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF69]/70">
              Management
            </p>

            <div className="space-y-1">
              {managementNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-[#D4AF69] to-[#E8CD8A] font-semibold text-[#210309] shadow-[0_4px_16px_rgba(212,175,105,0.25)]"
                        : "text-white/70 hover:bg-white/8 hover:text-[#F5DFC0]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={active ? "text-[#210309]" : "text-[#D4AF69]"}
                      />
                      {item.name}
                    </span>

                    {active && <ChevronRight size={15} strokeWidth={2.5} />}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer Logout */}
        <div className="border-t border-[#D4AF69]/15 bg-[#170104] p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-red-500/25 bg-red-950/20 px-3.5 py-2.5 text-xs font-semibold text-red-300 transition-all duration-200 hover:border-red-500/50 hover:bg-red-900/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut size={15} />
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
