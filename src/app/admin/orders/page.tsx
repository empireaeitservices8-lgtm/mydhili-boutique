"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  IndianRupee,
  Eye,
  AlertCircle,
  ExternalLink,
  Filter,
  Trash2,
} from "lucide-react";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  _id: string;
  orderNumber?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  total: number;
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: string;
};

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = ["pending", "paid", "failed"];

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(date: string) {
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function handleDeleteOrder(order: Order) {
    const oId = order._id;
    const ref = order.orderNumber || oId;
    if (
      !window.confirm(
        `Are you sure you want to delete order #${ref}? This action cannot be reversed.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(oId);
      const res = await fetch(
        `/api/admin/orders?id=${encodeURIComponent(oId)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete order.");
      }
      setOrders((prev) => prev.filter((o) => o._id !== oId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete order.");
    } finally {
      setDeletingId("");
    }
  }

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/orders", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load orders");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      console.error("ORDERS PAGE ERROR:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrder = async (
    orderId: string,
    field: "orderStatus" | "paymentStatus",
    value: string
  ) => {
    try {
      setUpdatingId(orderId);

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          [field]: value,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not update order");
      }

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId
            ? { ...order, [field]: value }
            : order
        )
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update order"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderReference =
        order.orderNumber || order._id.slice(-8).toUpperCase();

      const searchText = [
        orderReference,
        order.customer?.name,
        order.customer?.email,
        order.customer?.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const pendingCount = orders.filter(
    (order) => order.orderStatus === "pending"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.orderStatus === "delivered"
  ).length;

  const paidRevenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-[#A27B35]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9A6B35]">
                Order Fulfillment
              </p>
            </div>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#380712] sm:text-4xl">
              Customer Orders
            </h1>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              Review customer orders, update tracking status, and generate boutique invoices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF69]/40 bg-white px-4 py-2.5 text-xs font-semibold text-[#380712] shadow-sm transition hover:bg-[#FAF3E8]"
            >
              <ExternalLink size={14} className="text-[#9A6B35]" />
              Live Store
            </Link>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#380712] px-5 py-2.5 text-xs font-semibold text-[#F5DFC0] shadow-md transition hover:bg-[#520A1A] disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin text-[#D4AF69]" : "text-[#D4AF69]"}
              />
              Refresh Orders
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A6B35]">
                Total Orders
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3E8] text-[#8B2635]">
                <ShoppingBag size={18} />
              </div>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#380712]">
              {orders.length}
            </p>
            <p className="mt-1 text-xs text-stone-400">Lifetime storefront orders</p>
          </div>

          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Pending Orders
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Clock size={18} />
              </div>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#380712]">
              {pendingCount}
            </p>
            <p className="mt-1 text-xs text-stone-400">Awaiting processing</p>
          </div>

          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Delivered Orders
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-[#380712]">
              {deliveredCount}
            </p>
            <p className="mt-1 text-xs text-stone-400">Successfully received</p>
          </div>

          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#9A6B35]">
                Settled Revenue
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF3E8] text-[#8B2635]">
                <IndianRupee size={18} />
              </div>
            </div>
            <p className="mt-3 font-serif text-2xl font-bold text-[#380712]">
              {formatPrice(paidRevenue)}
            </p>
            <p className="mt-1 text-xs text-stone-400">Total collected payments</p>
          </div>
        </div>

        {/* Orders Table Section */}
        <section className="overflow-hidden rounded-3xl border border-[#EDE4D9] bg-white shadow-sm">
          {/* Table Header Filter bar */}
          <div className="flex flex-col gap-4 border-b border-[#EEE7DE] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-[#380712]">
                Order Registry
              </h2>
              <span className="rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-xs text-stone-500">
                {filteredOrders.length} records
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order #, customer, phone..."
                  className="w-full rounded-xl border border-[#E9DFD2] py-2 pl-9 pr-4 text-xs text-[#380712] outline-none transition placeholder:text-stone-400 focus:border-[#9A6B35] sm:w-64"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[#9A6B35]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-[#E9DFD2] bg-white px-3 py-2 text-xs font-medium capitalize text-[#380712] outline-none transition focus:border-[#9A6B35]"
                >
                  <option value="all">All statuses</option>
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="font-semibold">Could not load orders</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-sm text-stone-500">
              <RefreshCw size={20} className="animate-spin text-[#9A6B35]" />
              Loading customer orders...
            </div>
          ) : !error && filteredOrders.length === 0 ? (
            <div className="px-5 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF3E8]">
                <ShoppingBag size={28} className="text-[#9A6B35]" />
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold text-[#380712]">
                {orders.length === 0 ? "No orders placed yet" : "No matching orders found"}
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-stone-500">
                {orders.length === 0
                  ? "Orders will automatically appear here once buyers check out on the storefront."
                  : "Try resetting your search query or choosing another status filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#EEE7DE] bg-[#FCFAF7] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A6B35]">
                    <th className="px-6 py-4">Order Ref</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Fulfillment Status</th>
                    <th className="px-6 py-4 text-right">Invoice &amp; View</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F2ECE4]">
                  {filteredOrders.map((order) => {
                    const reference =
                      order.orderNumber ||
                      `ORD-${order._id.slice(-6).toUpperCase()}`;

                    return (
                      <tr key={order._id} className="transition hover:bg-[#FAF7F2]">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-[#380712]">
                            {reference}
                          </span>
                          <span className="block text-[11px] text-stone-400">
                            {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-[#380712]">
                            {order.customer?.name || "Boutique Guest"}
                          </p>
                          <p className="text-xs text-stone-400">
                            {order.customer?.phone || order.customer?.email || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-xs text-stone-600">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-5 py-4 font-semibold text-[#380712]">
                          {formatPrice(order.total)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                          </span>
                          <select
                            value={order.paymentStatus}
                            disabled={updatingId === order._id}
                            onChange={(e) =>
                              updateOrder(order._id, "paymentStatus", e.target.value)
                            }
                            className="rounded-lg border border-[#E9DFD2] bg-white px-2.5 py-1 text-xs capitalize text-[#380712] outline-none transition focus:border-[#9A6B35] disabled:opacity-50"
                          >
                            {paymentStatuses.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <div className="mb-1">
                            <StatusBadge status={order.orderStatus} />
                          </div>
                          <select
                            value={order.orderStatus}
                            disabled={updatingId === order._id}
                            onChange={(e) =>
                              updateOrder(order._id, "orderStatus", e.target.value)
                            }
                            className="rounded-lg border border-[#E9DFD2] bg-white px-2.5 py-1 text-xs capitalize text-[#380712] outline-none transition focus:border-[#9A6B35] disabled:opacity-50"
                          >
                            {orderStatuses.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/orders/${order._id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF69]/40 bg-[#FAF3E8] px-3.5 py-1.5 text-xs font-semibold text-[#380712] shadow-sm transition hover:bg-[#D4AF69]"
                            >
                              <Eye size={13} />
                              Manage
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order)}
                              disabled={deletingId === order._id}
                              aria-label={`Delete order #${order.orderNumber || order._id}`}
                              className="inline-flex items-center rounded-xl border border-red-200 bg-white p-2 text-red-600 shadow-sm transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
