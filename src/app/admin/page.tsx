import Link from "next/link";
import Image from "next/image";
import { connection } from "next/server";
import {
  Package,
  ShoppingBag,
  Users,
  Settings,
  ArrowUpRight,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Tags,
  ExternalLink,
  Mail,
} from "lucide-react";

import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export const instant = false;

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(date?: string | Date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    confirmed: "bg-blue-50 text-blue-800 border-blue-200",
    processing: "bg-purple-50 text-purple-800 border-purple-200",
    shipped: "bg-indigo-50 text-indigo-800 border-indigo-200",
    delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-800 border-rose-200",
    paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
    failed: "bg-rose-50 text-rose-800 border-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
        styles[status] || "bg-stone-100 text-stone-700 border-stone-200"
      }`}
    >
      {status}
    </span>
  );
}

export default async function AdminDashboardPage() {
  await connection();
  const session = await requireAdmin();

  let totalProducts = 0;
  let activeProducts = 0;
  let totalCategories = 0;
  let totalOrders = 0;
  let pendingOrders = 0;
  let totalRevenue = 0;
  let recentOrders: any[] = [];
  let recentProducts: any[] = [];
  let dbError: string | null = null;

  try {
    const [
      prodCount,
      activeProdCount,
      catCount,
      ordCount,
      pendOrdCount,
      paidOrders,
      recentOrdersRaw,
      recentProductsRaw,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: "pending" } }),
      prisma.order.findMany({ where: { paymentStatus: "paid" }, select: { total: true } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { category: { select: { name: true } } },
      }),
    ]);

    totalProducts = prodCount;
    activeProducts = activeProdCount;
    totalCategories = catCount;
    totalOrders = ordCount;
    pendingOrders = pendOrdCount;
    totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

    recentOrders = recentOrdersRaw.map((o) => {
      const cust = (o.customer as any) || {};
      return {
        _id: o.id,
        id: o.id,
        orderNumber: o.orderNumber,
        customer: cust,
        total: Number(o.total),
        orderStatus: o.orderStatus,
        paymentMethod: o.paymentMethod,
        items: o.items,
        createdAt: o.createdAt,
      };
    });

    recentProducts = recentProductsRaw.map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      price: Number(p.price),
      images: Array.isArray(p.images) ? (p.images as string[]) : [],
      isActive: p.isActive,
      category: p.category,
      createdAt: p.createdAt,
    }));
  } catch (error) {
    console.error("Admin dashboard database error:", error);
    dbError =
      error instanceof Error
        ? error.message
        : "Database connection failed or DATABASE_URL is not set.";
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Database Connection Alert (if database fails) */}
        {dbError && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-rose-900">
                  Database Connection Warning
                </p>
                <p className="text-xs text-rose-700">
                  The dashboard is currently running in offline fallback mode because the database could not be reached:
                </p>
                <p className="rounded bg-rose-100/70 p-2 font-mono text-[11px] text-rose-800">
                  {dbError}
                </p>
                <p className="text-xs text-rose-600">
                  Tip: Ensure <code className="font-semibold text-rose-800">DATABASE_URL</code> is properly configured in your Vercel project environment variables.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Header / Greeting */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#380712] sm:text-4xl">
              Boutique Overview
            </h1>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              Signed in as <span className="font-semibold text-stone-700">{session.email}</span> · {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF69]/50 bg-white px-4 py-2.5 text-xs font-semibold text-[#380712] shadow-sm transition hover:bg-[#FAF3E8]"
            >
              <ExternalLink size={14} className="text-[#9A6B35]" />
              Live Store
            </Link>

            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#380712] px-5 py-2.5 text-xs font-semibold text-[#F5DFC0] shadow-md transition hover:bg-[#520A1A]"
            >
              <Plus size={16} />
              Add Product
            </Link>
          </div>
        </div>

        {/* 4 Luxury KPI Stat Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Revenue */}
          <div className="relative overflow-hidden rounded-2xl border border-[#EDE4D9] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF69] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A6B35]">
                Total Revenue
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF3E8] text-[#8B2635]">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="mt-4 font-serif text-3xl font-bold text-[#380712]">
              {formatPrice(totalRevenue)}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                Paid orders
              </span>
              <span>across storefront</span>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="relative overflow-hidden rounded-2xl border border-[#EDE4D9] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF69] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A6B35]">
                Total Orders
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF3E8] text-[#8B2635]">
                <ShoppingBag size={20} />
              </div>
            </div>
            <p className="mt-4 font-serif text-3xl font-bold text-[#380712]">
              {totalOrders}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                pendingOrders > 0
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-50 text-emerald-700"
              }`}>
                {pendingOrders} Pending
              </span>
              <span>requiring review</span>
            </div>
          </div>

          {/* Card 3: Products */}
          <div className="relative overflow-hidden rounded-2xl border border-[#EDE4D9] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF69] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A6B35]">
                Active Products
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF3E8] text-[#8B2635]">
                <Package size={20} />
              </div>
            </div>
            <p className="mt-4 font-serif text-3xl font-bold text-[#380712]">
              {activeProducts}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
              <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                {totalProducts} Total
              </span>
              <span>in boutique collection</span>
            </div>
          </div>

          {/* Card 4: Categories */}
          <div className="relative overflow-hidden rounded-2xl border border-[#EDE4D9] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF69] hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A6B35]">
                Categories
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF3E8] text-[#8B2635]">
                <Tags size={20} />
              </div>
            </div>
            <p className="mt-4 font-serif text-3xl font-bold text-[#380712]">
              {totalCategories}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
              <span className="inline-flex items-center rounded-full bg-[#FAF3E8] px-2 py-0.5 text-[11px] font-semibold text-[#8B2635]">
                Curated
              </span>
              <span>sarees, kurtis &amp; more</span>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Recent Orders + Quick Management & Products */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Orders Table (2 Cols) */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-7 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9A6B35]">
                  Order Dispatch
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[#380712]">
                  Recent Orders
                </h2>
              </div>

              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#8B2635] hover:text-[#380712]"
              >
                View all orders
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-[#E9DFD2] bg-[#FAF7F2] py-12 text-center">
                <ShoppingBag size={36} className="mx-auto text-[#C6AD8A]" />
                <p className="mt-3 font-serif text-lg font-semibold text-[#380712]">
                  No orders placed yet
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  When customers purchase from the store, their orders will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#EEE7DE] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A6B35]">
                      <th className="pb-3 pr-4">Order Ref</th>
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Amount</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2ECE4]">
                    {recentOrders.map((order) => {
                      const ref =
                        order.orderNumber ||
                        `ORD-${order._id.toString().slice(-6).toUpperCase()}`;

                      return (
                        <tr key={order._id.toString()} className="transition hover:bg-[#FAF7F2]">
                          <td className="py-4 pr-4">
                            <span className="font-mono text-xs font-semibold text-[#380712]">
                              {ref}
                            </span>
                            <span className="block text-[11px] text-stone-400">
                              {formatDate(order.createdAt)}
                            </span>
                          </td>

                          <td className="py-4 pr-4">
                            <p className="font-medium text-[#380712]">
                              {order.customer?.name || "Boutique Guest"}
                            </p>
                            <p className="text-xs text-stone-400">
                              {order.customer?.phone || order.customer?.email}
                            </p>
                          </td>

                          <td className="py-4 pr-4 font-semibold text-[#380712]">
                            {formatPrice(order.total)}
                          </td>

                          <td className="py-4 pr-4">
                            <div className="flex flex-col gap-1">
                              <StatusBadge status={order.orderStatus || "pending"} />
                              <span className="text-[10px] uppercase tracking-wider text-stone-400">
                                {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 text-right">
                            <Link
                              href={`/admin/orders/${order._id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#D4AF69]/40 bg-[#FAF3E8] px-3 py-1.5 text-xs font-semibold text-[#380712] transition hover:bg-[#D4AF69]"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Quick Management & Recent Products (1 Col) */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#380712]">
                Quick Management
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Shortcuts to your primary boutique controls
              </p>

              <div className="mt-5 space-y-2.5">
                {[
                  {
                    label: "Add New Product",
                    desc: "Upload images, sizes & pricing",
                    href: "/admin/products/new",
                    icon: Plus,
                  },
                  {
                    label: "Manage Categories",
                    desc: "Curate sarees, kurtis & dresses",
                    href: "/admin/categories",
                    icon: Tags,
                  },
                  {
                    label: "Customer Directory",
                    desc: "Review buyer records & history",
                    href: "/admin/customers",
                    icon: Users,
                  },
                  {
                    label: "Store Settings",
                    desc: "Boutique profile, shipping & COD",
                    href: "/admin/settings",
                    icon: Settings,
                  },
                  {
                    label: "Newsletter Subscribers",
                    desc: "Audience emails & CSV export",
                    href: "/admin/newsletter",
                    icon: Mail,
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="group flex items-center justify-between rounded-2xl border border-[#EDE4D9] p-3.5 transition-all duration-200 hover:border-[#D4AF69] hover:bg-[#FAF7F2]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3E8] text-[#8B2635] transition group-hover:bg-[#380712] group-hover:text-[#F5DFC0]">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#380712]">
                            {action.label}
                          </p>
                          <p className="text-[11px] text-stone-400">
                            {action.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight
                        size={14}
                        className="text-[#9A6B35] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Latest Products preview */}
            <div className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-[#380712]">
                  Latest Products
                </h3>
                <Link
                  href="/admin/products"
                  className="text-xs font-semibold text-[#8B2635] hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {recentProducts.map((p) => (
                  <Link
                    key={p._id.toString()}
                    href={`/admin/products/${p._id}/edit`}
                    className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition hover:border-[#EDE4D9] hover:bg-[#FAF7F2]"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#FAF3E8]">
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#9A6B35]">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[#380712]">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-[#9A6B35]">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="border-t border-[#E9DFD2] pt-5 text-center text-xs text-stone-400">
          Mydhili Boutique · Administrative Control Suite · All systems operational
        </p>
      </div>
    </div>
  );
}
