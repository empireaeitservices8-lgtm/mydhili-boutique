"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Package,
  RefreshCw,
  ExternalLink,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";

type CategoryInfo = {
  _id?: string;
  name?: string;
};

type Product = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: CategoryInfo | string;
  variants: {
    sku: string;
    size: string;
    color: string;
    stock: number;
  }[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
};

type Category = {
  _id: string;
  name: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("saved")) {
        setJustSaved(true);
        window.history.replaceState({}, "", "/admin/products");
      }
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/products?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load products.");
      }

      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleDeleteConfirmed() {
    if (!productToDelete) return;
    setDeletingId(productToDelete.id);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${encodeURIComponent(productToDelete.id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete product.");
      }

      setProducts((prev) =>
        prev.filter((p) => p._id !== productToDelete.id && p.id !== productToDelete.id)
      );
      setProductToDelete(null);
      loadProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to delete product.";
      setError(msg);
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase());

      const catId =
        typeof product.category === "object"
          ? product.category?._id
          : product.category;

      const matchesCategory =
        selectedCategory === "all" || catId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  function getCategoryName(category: Product["category"]) {
    if (typeof category === "object" && category?.name) {
      return category.name;
    }
    if (typeof category === "string") {
      const found = categories.find((c) => c._id === category);
      if (found) return found.name;
    }

    return "Boutique Collection";
  }

  function getStock(product: Product) {
    return (product.variants || []).reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0
    );
  }

  const inStockCount = products.filter((p) => getStock(p) > 0).length;
  const outOfStockCount = products.filter((p) => getStock(p) === 0).length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-[#A27B35]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9A6B35]">
                Inventory Management
              </p>
            </div>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#380712] sm:text-4xl">
              Boutique Catalog
            </h1>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              Manage your sarees, ethnic wear, jewelry, variants, and stock availability.
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
              Storefront
            </Link>

            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#380712] px-5 py-2.5 text-xs font-semibold text-[#F5DFC0] shadow-md transition hover:bg-[#5A1020]"
            >
              <Plus size={16} />
              Add Product
            </Link>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9A6B35]">
              Total Products
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-serif text-3xl font-bold text-[#380712]">
                {products.length}
              </span>
              <span className="rounded-full bg-[#FAF3E8] px-2.5 py-0.5 text-[11px] font-semibold text-[#8B2635]">
                {products.filter((p) => p.isFeatured).length} Featured
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              In Stock &amp; Active
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-serif text-3xl font-bold text-[#380712]">
                {inStockCount}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                {products.filter((p) => p.isActive).length} Visible
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Attention Required
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-serif text-3xl font-bold text-[#380712]">
                {outOfStockCount}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                outOfStockCount > 0
                  ? "bg-rose-50 text-rose-700"
                  : "bg-stone-100 text-stone-600"
              }`}>
                {outOfStockCount > 0 ? "Out of Stock" : "All Stocked"}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <section className="rounded-2xl border border-[#EDE4D9] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by title or slug..."
                className="w-full rounded-xl border border-[#E9DFD2] py-2.5 pl-10 pr-4 text-sm text-[#380712] outline-none transition placeholder:text-stone-400 focus:border-[#9A6B35] focus:ring-2 focus:ring-[#D4AF69]/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-[#9A6B35]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-[#E9DFD2] bg-white px-3.5 py-2.5 text-sm text-[#380712] outline-none transition focus:border-[#9A6B35] focus:ring-2 focus:ring-[#D4AF69]/20"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={loadProducts}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E9DFD2] bg-[#FAF7F2] px-4 py-2.5 text-sm font-semibold text-[#380712] transition hover:bg-[#FAF3E8] disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin text-[#9A6B35]" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Just Saved Notification */}
        {justSaved && (
          <div
            role="status"
            className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-4 text-emerald-900 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-bold">
                  Product successfully saved and added to catalog!
                </p>
                <p className="text-xs text-emerald-700">
                  Your new piece is now displayed below in the active product catalog.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setJustSaved(false)}
              className="text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* Main Products Table */}
        <section className="overflow-hidden rounded-3xl border border-[#EDE4D9] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#EEE7DE] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-lg font-bold text-[#380712]">
                Active Catalog
              </h2>
              <button
                type="button"
                onClick={() => loadProducts()}
                title="Refresh catalog list"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E9DFD2] bg-white text-stone-500 transition hover:border-[#D4AF69] hover:text-[#380712]"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-[#9A6B35]" : ""} />
              </button>
            </div>

            <span className="rounded-full bg-[#FAF7F2] px-3 py-1 text-xs font-semibold text-stone-600">
              Showing {filteredProducts.length} of {products.length} items
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-sm text-stone-500">
              <RefreshCw size={20} className="animate-spin text-[#9A6B35]" />
              Loading boutique collection...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <Package size={40} className="mx-auto text-[#C6AD8A]" />
              <h3 className="mt-3 font-serif text-xl font-bold text-[#380712]">
                No products match your criteria
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-stone-500">
                {products.length === 0
                  ? "Start building your boutique collection by adding your first product."
                  : "Try clearing your search query or picking a different category."}
              </p>
              {products.length === 0 && (
                <Link
                  href="/admin/products/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#380712] px-5 py-2.5 text-xs font-semibold text-[#F5DFC0] hover:bg-[#520A1A]"
                >
                  <Plus size={16} />
                  Add First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#EEE7DE] bg-[#FCFAF7] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A6B35]">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Inventory</th>
                    <th className="px-5 py-4">Visibility</th>
                    <th className="px-5 py-4">Store Preview</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE4]">
                  {filteredProducts.map((product) => {
                    const totalStock = getStock(product);
                    const isOutOfStock = totalStock === 0;
                    const isLowStock = totalStock > 0 && totalStock <= 5;

                    return (
                      <tr
                        key={product._id}
                        className="transition-colors hover:bg-[#FAF7F2]"
                      >
                        {/* Product Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#E9DFD2] bg-[#FAF7F2]">
                              {product.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#C6AD8A]">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 max-w-xs">
                              <p className="truncate font-serif text-sm font-bold text-[#380712]">
                                {product.name}
                              </p>
                              <p className="truncate text-xs font-mono text-stone-400">
                                /{product.slug}
                              </p>
                              {product.variants?.length > 0 && (
                                <p className="mt-0.5 text-[11px] text-[#9A6B35]">
                                  {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category Column */}
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-[#FAF3E8] px-3 py-1 text-xs font-semibold text-[#8B2635]">
                            {getCategoryName(product.category)}
                          </span>
                        </td>

                        {/* Price Column */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#380712]">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </p>
                          {product.compareAtPrice &&
                            product.compareAtPrice > product.price && (
                              <p className="text-xs text-stone-400 line-through">
                                ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
                              </p>
                            )}
                        </td>

                        {/* Stock Column */}
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-medium ${
                              isOutOfStock
                                ? "text-rose-600 font-semibold"
                                : isLowStock
                                ? "text-amber-700"
                                : "text-stone-700"
                            }`}
                          >
                            {isOutOfStock
                              ? "0 in stock"
                              : `${totalStock} in stock`}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium ${
                                product.isActive
                                  ? "text-emerald-700"
                                  : "text-stone-500"
                              }`}
                            >
                              {product.isActive ? "Active" : "Draft"}
                            </span>

                            {product.isFeatured && (
                              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Store Link Column */}
                        <td className="px-5 py-4">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B2635] transition hover:text-[#380712] hover:underline"
                          >
                            Live view
                            <ExternalLink size={12} />
                          </Link>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF69]/40 bg-[#FAF3E8] px-3.5 py-2 text-xs font-semibold text-[#380712] shadow-sm transition hover:bg-[#D4AF69]"
                            >
                              <Pencil size={13} />
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                const pId = product._id || product.id || "";
                                setProductToDelete({
                                  id: pId,
                                  name: product.name,
                                });
                              }}
                              aria-label={`Delete ${product.name}`}
                              className="inline-flex items-center rounded-xl border border-red-200 bg-white p-2 text-red-600 shadow-sm transition hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={14} />
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E9DFD2] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#380712]">
                  Delete Product?
                </h3>
                <p className="text-xs text-stone-500">
                  This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            <p className="mt-4 rounded-xl bg-[#FAF7F2] p-3 text-sm text-stone-700">
              Are you sure you want to delete <span className="font-bold text-[#380712]">&ldquo;{productToDelete.name}&rdquo;</span> from your boutique catalog?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={Boolean(deletingId)}
                className="rounded-xl border border-[#E9DFD2] px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirmed}
                disabled={Boolean(deletingId)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId && <RefreshCw size={13} className="animate-spin" />}
                {deletingId ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
