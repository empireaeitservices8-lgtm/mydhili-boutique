"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Truck,
  CreditCard,
  ArrowUpRight,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

interface DailyTrendItem {
  date: string;
  label: string;
  revenue: number;
  orders: number;
  units: number;
}

interface TopProductItem {
  name: string;
  slug: string;
  image: string;
  quantity: number;
  revenue: number;
}

interface CategoryItem {
  name: string;
  count: number;
  percentage: number;
}

interface RecentOrderItem {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  itemCount: number;
  createdAt: string;
}

interface AnalyticsData {
  period: string;
  kpis: {
    totalRevenue: number;
    todayRevenue: number;
    totalOrdersCount: number;
    averageOrderValue: number;
    totalUnitsSold: number;
    fulfillmentRate: number;
    uniqueCustomersCount: number;
    activeCatalogProducts: number;
  };
  dailyTrend: DailyTrendItem[];
  orderStatuses: {
    counts: Record<string, number>;
    total: number;
  };
  paymentBreakdown: {
    cod: number;
    online: number;
    paid: number;
  };
  topProducts: TopProductItem[];
  categoryDistribution: CategoryItem[];
  recentOrders: RecentOrderItem[];
}

type ActiveMetric = "revenue" | "orders" | "aov" | "units";

const statusMeta: Record<string, { label: string; dot: string; bar: string; badge: string }> = {
  delivered: {
    label: "Delivered",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  shipped: {
    label: "Shipped",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
  },
  processing: {
    label: "Processing",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-indigo-500",
    bar: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  pending: {
    label: "Pending",
    dot: "bg-stone-400",
    bar: "bg-stone-400",
    badge: "bg-stone-100 text-stone-700 border-stone-200",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-rose-500",
    bar: "bg-rose-400",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDateRel(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>("revenue");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/analytics?period=${period}`, {
        cache: "no-store",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to load analytics");
      }
      setData(result.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Daily trend calculations for SVG Spline Curve
  const points = useMemo(() => {
    const list = data?.dailyTrend || [];
    if (list.length === 0) return [];

    return list.map((item) => {
      let val = item.revenue;
      if (activeMetric === "orders") val = item.orders;
      else if (activeMetric === "units") val = item.units;
      else if (activeMetric === "aov") val = item.orders > 0 ? Math.round(item.revenue / item.orders) : 0;
      return { ...item, value: val };
    });
  }, [data?.dailyTrend, activeMetric]);

  const maxValue = useMemo(() => {
    if (points.length === 0) return 100;
    const max = Math.max(...points.map((p) => p.value));
    return max > 0 ? max * 1.15 : 100;
  }, [points]);

  // Generate SVG path coordinates
  const chartHeight = 220;
  const chartWidth = 900;
  const paddingX = 20;
  const paddingBottom = 30;
  const paddingTop = 20;

  const svgCoordinates = useMemo(() => {
    if (points.length === 0) return [];
    const stepX = (chartWidth - paddingX * 2) / Math.max(points.length - 1, 1);
    const usableHeight = chartHeight - paddingTop - paddingBottom;

    return points.map((p, i) => {
      const x = paddingX + i * stepX;
      const normalized = p.value / maxValue;
      const y = paddingTop + (1 - normalized) * usableHeight;
      return { x, y, ...p };
    });
  }, [points, maxValue, chartWidth, chartHeight]);

  // Build smooth bezier path string
  const { linePath, areaPath } = useMemo(() => {
    if (svgCoordinates.length === 0) return { linePath: "", areaPath: "" };
    if (svgCoordinates.length === 1) {
      const p = svgCoordinates[0];
      return {
        linePath: `M ${p.x} ${p.y} L ${chartWidth - paddingX} ${p.y}`,
        areaPath: `M ${p.x} ${chartHeight - paddingBottom} L ${p.x} ${p.y} L ${chartWidth - paddingX} ${p.y} L ${chartWidth - paddingX} ${chartHeight - paddingBottom} Z`,
      };
    }

    let d = `M ${svgCoordinates[0].x} ${svgCoordinates[0].y}`;
    for (let i = 0; i < svgCoordinates.length - 1; i++) {
      const p0 = svgCoordinates[i === 0 ? 0 : i - 1];
      const p1 = svgCoordinates[i];
      const p2 = svgCoordinates[i + 1];
      const p3 = svgCoordinates[i + 2 < svgCoordinates.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }

    const first = svgCoordinates[0];
    const last = svgCoordinates[svgCoordinates.length - 1];
    const baseline = chartHeight - paddingBottom;
    const a = `${d} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`;

    return { linePath: d, areaPath: a };
  }, [svgCoordinates, chartWidth, chartHeight, paddingX, paddingBottom]);

  // Active inspected day
  const inspectedDay = hoverIndex !== null && svgCoordinates[hoverIndex]
    ? svgCoordinates[hoverIndex]
    : svgCoordinates[svgCoordinates.length - 1] || null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Authentic Header */}
        <header className="flex flex-col justify-between gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Analytics
            </h1>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              Real-time sales velocity, fulfillment metrics, and boutique demand.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Segmented Period Switcher */}
            <div className="inline-flex rounded-xl bg-stone-200/70 p-1 text-xs">
              {(
                [
                  { key: "7d", label: "7 days" },
                  { key: "30d", label: "30 days" },
                  { key: "90d", label: "90 days" },
                  { key: "all", label: "All time" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setPeriod(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    period === tab.key
                      ? "bg-white text-stone-900 shadow-xs font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchAnalytics}
              disabled={loading}
              title="Refresh data"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-xs transition hover:bg-stone-50 hover:text-stone-900 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin text-stone-900" : ""}
              />
            </button>

            {/* Live Storefront link */}
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 shadow-xs transition hover:bg-stone-50 hover:text-stone-900"
            >
              <span>View storefront</span>
              <ExternalLink size={12} className="text-stone-400" />
            </Link>
          </div>
        </header>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
            <button
              onClick={fetchAnalytics}
              className="font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* 4 Top KPI Metric Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition hover:border-stone-300">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Total Sales
              </span>
              <DollarSign size={16} className="text-stone-400" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {formatPrice(data?.kpis.totalRevenue || 0)}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Net revenue excl. cancellations
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition hover:border-stone-300">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Total Orders
              </span>
              <ShoppingBag size={16} className="text-stone-400" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {data?.kpis.totalOrdersCount || 0}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Customer orders received
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition hover:border-stone-300">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Average Order Value
              </span>
              <TrendingUp size={16} className="text-stone-400" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {formatPrice(data?.kpis.averageOrderValue || 0)}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Average ticket size
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition hover:border-stone-300">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Units Dispatched
              </span>
              <Package size={16} className="text-stone-400" />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {data?.kpis.totalUnitsSold || 0}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Apparel items ordered
            </p>
          </div>
        </div>

        {/* REPLACED MODERN SECTION: Interactive Performance Hub with Smooth Spline Area Curve */}
        <section className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
          {/* Multi-Metric Switcher Tabs (Stripe / Shopify style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-stone-200/80 divide-x divide-stone-200/80 bg-stone-50/40">
            <button
              type="button"
              onClick={() => setActiveMetric("revenue")}
              className={`p-4 sm:p-5 text-left transition-colors ${
                activeMetric === "revenue"
                  ? "bg-white border-b-2 border-b-[#380712] shadow-xs"
                  : "hover:bg-stone-50"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Sales Trajectory
              </span>
              <p className="mt-1.5 text-xl font-bold tracking-tight text-stone-900">
                {formatPrice(data?.kpis.totalRevenue || 0)}
              </p>
              <span className="mt-0.5 inline-block text-[11px] text-stone-400">
                Gross sales in period
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMetric("orders")}
              className={`p-4 sm:p-5 text-left transition-colors ${
                activeMetric === "orders"
                  ? "bg-white border-b-2 border-b-[#380712] shadow-xs"
                  : "hover:bg-stone-50"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Order Frequency
              </span>
              <p className="mt-1.5 text-xl font-bold tracking-tight text-stone-900">
                {data?.kpis.totalOrdersCount || 0} orders
              </p>
              <span className="mt-0.5 inline-block text-[11px] text-stone-400">
                Volume across dates
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMetric("aov")}
              className={`p-4 sm:p-5 text-left transition-colors ${
                activeMetric === "aov"
                  ? "bg-white border-b-2 border-b-[#380712] shadow-xs"
                  : "hover:bg-stone-50"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Avg. Basket Size
              </span>
              <p className="mt-1.5 text-xl font-bold tracking-tight text-stone-900">
                {formatPrice(data?.kpis.averageOrderValue || 0)}
              </p>
              <span className="mt-0.5 inline-block text-[11px] text-stone-400">
                Revenue per order
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMetric("units")}
              className={`p-4 sm:p-5 text-left transition-colors ${
                activeMetric === "units"
                  ? "bg-white border-b-2 border-b-[#380712] shadow-xs"
                  : "hover:bg-stone-50"
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                Inventory Dispatched
              </span>
              <p className="mt-1.5 text-xl font-bold tracking-tight text-stone-900">
                {data?.kpis.totalUnitsSold || 0} items
              </p>
              <span className="mt-0.5 inline-block text-[11px] text-stone-400">
                Dispatched pieces
              </span>
            </button>
          </div>

          {/* Chart Header Info */}
          <div className="p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-base font-semibold text-stone-900">
                  {activeMetric === "revenue" && "Daily sales revenue trajectory"}
                  {activeMetric === "orders" && "Daily orders frequency"}
                  {activeMetric === "aov" && "Average transaction value trend"}
                  {activeMetric === "units" && "Apparel inventory dispatched"}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Hover across the timeline curve to scrub daily order details and transaction amounts.
                </p>
              </div>

              {inspectedDay && (
                <div className="inline-flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs text-stone-700">
                  <span className="font-medium text-stone-500">{inspectedDay.label}:</span>
                  <span className="font-bold text-[#380712]">
                    {activeMetric === "revenue" || activeMetric === "aov"
                      ? formatPrice(inspectedDay.value)
                      : `${inspectedDay.value} ${activeMetric === "orders" ? "orders" : "items"}`}
                  </span>
                  <span className="text-stone-400">
                    ({inspectedDay.orders} {inspectedDay.orders === 1 ? "order" : "orders"} · {inspectedDay.units} pcs)
                  </span>
                </div>
              )}
            </div>

            {/* Continuous Spline Area Chart */}
            <div className="relative mt-6">
              {/* Grid Lines */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between h-[180px] border-b border-stone-100 text-[10px] text-stone-300">
                <div className="border-b border-dashed border-stone-100 w-full" />
                <div className="border-b border-dashed border-stone-100 w-full" />
                <div className="border-b border-dashed border-stone-100 w-full" />
              </div>

              {/* Responsive SVG Chart */}
              <div className="relative w-full overflow-hidden">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-52 sm:h-60"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#380712" stopOpacity="0.18" />
                      <stop offset="50%" stopColor="#8B2635" stopOpacity="0.06" />
                      <stop offset="100%" stopColor="#8B2635" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area Fill */}
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="url(#chartGradient)"
                      className="transition-all duration-300"
                    />
                  )}

                  {/* Baseline Axis */}
                  <line
                    x1={paddingX}
                    y1={chartHeight - paddingBottom}
                    x2={chartWidth - paddingX}
                    y2={chartHeight - paddingBottom}
                    stroke="#E5E5E5"
                    strokeWidth="1"
                  />

                  {/* Smooth Spline Curve Line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#380712"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Vertical Crosshair Line when hovering */}
                  {hoverIndex !== null && svgCoordinates[hoverIndex] && (
                    <line
                      x1={svgCoordinates[hoverIndex].x}
                      y1={paddingTop}
                      x2={svgCoordinates[hoverIndex].x}
                      y2={chartHeight - paddingBottom}
                      stroke="#380712"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="opacity-70"
                    />
                  )}

                  {/* Highlight Dots for Days with Non-Zero Sales */}
                  {svgCoordinates.map((pt, i) => {
                    const isHovered = hoverIndex === i;
                    const hasData = pt.value > 0;
                    if (!hasData && !isHovered) return null;

                    return (
                      <g key={pt.date || i}>
                        {isHovered && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="8"
                            fill="#380712"
                            opacity="0.15"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? "5.5" : "3.5"}
                          fill="#380712"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Invisible Hover Overlay Trigger Columns for smooth scrubbing */}
                <div className="absolute inset-0 flex">
                  {svgCoordinates.map((pt, idx) => (
                    <div
                      key={pt.date || idx}
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseLeave={() => setHoverIndex(null)}
                      className="flex-1 h-full cursor-pointer"
                    />
                  ))}
                </div>
              </div>

              {/* Clean, Well-Spaced X-Axis Dates (Sampled every 5-6 points) */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400 font-medium px-2">
                {svgCoordinates.length > 0 ? (
                  svgCoordinates
                    .filter((_, idx) => {
                      if (svgCoordinates.length <= 7) return true;
                      const step = Math.ceil(svgCoordinates.length / 6);
                      return idx % step === 0 || idx === svgCoordinates.length - 1;
                    })
                    .map((pt) => (
                      <span key={pt.date} className="truncate max-w-[60px] text-center">
                        {pt.label}
                      </span>
                    ))
                ) : (
                  <span>No data</span>
                )}
              </div>
            </div>

            {/* Performance Summary Sub-Bar */}
            <div className="mt-6 pt-5 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block text-[11px]">Today&apos;s Revenue</span>
                <span className="font-semibold text-stone-800 text-sm">
                  {formatPrice(data?.kpis.todayRevenue || 0)}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[11px]">Fulfillment Velocity</span>
                <span className="font-semibold text-emerald-700 text-sm">
                  {data?.kpis.fulfillmentRate || 100}% completed
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[11px]">Unique Patrons</span>
                <span className="font-semibold text-stone-800 text-sm">
                  {data?.kpis.uniqueCustomersCount || 0} customers
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[11px]">Active Collections</span>
                <span className="font-semibold text-stone-800 text-sm">
                  {data?.kpis.activeCatalogProducts || 0} live pieces
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2-Column Section: Status & Payments */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Order Fulfillment Status */}
          <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-stone-900">
                  Fulfillment status
                </h2>
                <p className="text-xs text-stone-500">
                  Breakdown across {data?.orderStatuses.total || 0} customer orders
                </p>
              </div>
              <Truck size={18} className="text-stone-400" />
            </div>

            {/* Segmented bar */}
            <div className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
              {Object.entries(data?.orderStatuses.counts || {}).map(
                ([status, count]) => {
                  if (count === 0 || !data?.orderStatuses.total) return null;
                  const pct = (count / data.orderStatuses.total) * 100;
                  const meta = statusMeta[status] || statusMeta.pending;
                  return (
                    <div
                      key={status}
                      style={{ width: `${pct}%` }}
                      className={`${meta.bar}`}
                      title={`${meta.label}: ${count} (${Math.round(pct)}%)`}
                    />
                  );
                }
              )}
            </div>

            {/* Status list */}
            <div className="mt-5 space-y-2">
              {Object.entries(data?.orderStatuses.counts || {}).map(
                ([status, count]) => {
                  const meta = statusMeta[status] || statusMeta.pending;
                  const total = data?.orderStatuses.total || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs transition hover:bg-stone-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                        <span className="font-medium text-stone-700">
                          {meta.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-stone-900">
                          {count}
                        </span>
                        <span className="w-10 text-right text-stone-400">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          {/* Payment Method & Collection */}
          <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-stone-900">
                  Payment channels
                </h2>
                <p className="text-xs text-stone-500">
                  Online payments vs Cash on Delivery (COD)
                </p>
              </div>
              <CreditCard size={18} className="text-stone-400" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <span className="text-[11px] font-medium text-stone-500">
                  Online Payments
                </span>
                <p className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
                  {data?.paymentBreakdown.online || 0}
                </p>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  UPI, Cards &amp; NetBanking
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                <span className="text-[11px] font-medium text-stone-500">
                  Cash on Delivery (COD)
                </span>
                <p className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
                  {data?.paymentBreakdown.cod || 0}
                </p>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  Doorstep settlement
                </p>
              </div>
            </div>

            {/* Catalog collection distribution */}
            <div className="mt-6 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-medium text-stone-700">
                  Catalog collection distribution
                </span>
                <span className="text-stone-400">
                  {data?.kpis.activeCatalogProducts || 0} active products
                </span>
              </div>

              <div className="space-y-3">
                {data?.categoryDistribution && data.categoryDistribution.length > 0 ? (
                  data.categoryDistribution.slice(0, 4).map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-600">{cat.name}</span>
                        <span className="font-medium text-stone-900">
                          {cat.count} items ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className="h-full rounded-full bg-[#380712]"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400">No categories active.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Live Recent Transactions Feed */}
        {data?.recentOrders && data.recentOrders.length > 0 && (
          <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
              <div>
                <h2 className="text-base font-semibold text-stone-900">
                  Recent transactions feed
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Latest customer orders and fulfillment progress.
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-stone-900"
              >
                <span>All orders</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-stone-100">
              {data.recentOrders.map((order) => {
                const meta = statusMeta[order.orderStatus] || statusMeta.pending;
                return (
                  <div
                    key={order._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 hover:bg-stone-50/60 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 font-serif font-bold text-xs text-[#380712]">
                        {order.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-stone-900">
                            {order.customerName}
                          </p>
                          <span className="font-mono text-[11px] text-stone-400">
                            #{order.orderNumber}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · {order.paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"} · {formatDateRel(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className={`inline-flex rounded-md border px-2.5 py-0.5 text-[11px] font-medium capitalize ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <span className="font-semibold text-stone-900 text-sm">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Top Performing Products Table */}
        <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Top products by units sold
              </h2>
              <p className="mt-0.5 text-xs text-stone-500">
                Best-performing apparel pieces by sales volume and revenue.
              </p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-stone-900"
            >
              <span>View catalog</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {data?.topProducts && data.topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 text-center font-medium">Units sold</th>
                    <th className="pb-3 text-right font-medium">Revenue</th>
                    <th className="pb-3 pr-2 text-right font-medium">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.topProducts.map((prod, i) => (
                    <tr key={`${prod.name}-${i}`} className="hover:bg-stone-50/70">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                            {prod.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[9px] text-stone-400">
                                None
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900 line-clamp-1">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-stone-400">
                              Rank #{i + 1}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center font-medium text-stone-700">
                        {prod.quantity}
                      </td>
                      <td className="py-3 text-right font-semibold text-stone-900">
                        {formatPrice(prod.revenue)}
                      </td>
                      <td className="py-3 pr-2 text-right">
                        {prod.slug ? (
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900"
                          >
                            <span>Store</span>
                            <ExternalLink size={11} />
                          </Link>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-500">
              <ShoppingBag size={20} className="mx-auto text-stone-400 mb-2" />
              No sales recorded for this timeframe yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
