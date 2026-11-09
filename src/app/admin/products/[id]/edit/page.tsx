"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Trash2,
  ImagePlus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

type Variant = {
  sku: string;
  size: string;
  color: string;
  stock: number;
};

type Category = {
  _id: string;
  name: string;
};

type Product = {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  category: string | { _id: string; name: string };
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: Variant[];
  isFeatured: boolean;
  isActive: boolean;
};

const emptyVariant: Variant = {
  sku: "",
  size: "",
  color: "",
  stock: 0,
};

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [slug, setSlug] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    category: "",
    price: "",
    compareAtPrice: "",
    variants: [{ ...emptyVariant }],
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (productId) loadProduct();
  }, [productId]);

  async function loadProduct() {
    try {
      setLoading(true);
      setError("");

      const [productResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/admin/products/${productId}`, { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
      ]);

      const productData = await productResponse.json();
      const categoriesData = await categoriesResponse.json();

      if (!productResponse.ok || !productData.success || !productData.product) {
        throw new Error(productData.message || "Unable to load product.");
      }

      const product: Product = productData.product;

      const categoryId =
        typeof product.category === "string"
          ? product.category
          : product.category?._id || "";

      setSlug(product.slug || "");

      setForm({
        name: product.name || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        category: categoryId,
        price: String(product.price ?? ""),
        compareAtPrice:
          product.compareAtPrice != null
            ? String(product.compareAtPrice)
            : "",
        variants:
          product.variants?.length > 0
            ? product.variants.map((variant) => ({
                sku: variant.sku || "",
                size: variant.size || "",
                color: variant.color || "",
                stock: Number(variant.stock || 0),
              }))
            : [{ ...emptyVariant }],
        isFeatured: Boolean(product.isFeatured),
        isActive: product.isActive !== false,
      });

      setImages(product.images || []);

      if (categoriesResponse.ok && categoriesData.success) {
        setCategories(categoriesData.categories || []);
      } else {
        throw new Error(
          categoriesData.message || "Unable to load product categories."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateVariant(
    index: number,
    field: keyof Variant,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [...current.variants, { ...emptyVariant }],
    }));
  }

  function removeVariant(index: number) {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.category || !form.price) {
      setError("Please complete the product name, category and price.");
      return;
    }

    const variants = form.variants
      .filter(
        (variant) =>
          variant.sku.trim() ||
          variant.size.trim() ||
          variant.color.trim()
      );

    const incompleteVariant = variants.some(
      (variant) =>
        !variant.sku.trim() ||
        !variant.size.trim() ||
        !variant.color.trim() ||
        !Number.isFinite(Number(variant.stock)) ||
        Number(variant.stock) < 0
    );

    if (incompleteVariant) {
      setError("Complete the SKU, size, color and valid stock for each variant.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description,
          shortDescription: form.shortDescription,
          category: form.category,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice
            ? Number(form.compareAtPrice)
            : undefined,
          images: images.filter(Boolean),
          variants: variants.map((variant) => ({
            ...variant,
            stock: Number(variant.stock),
          })),
          isFeatured: form.isFeatured,
          isActive: form.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update product.");
      }

      setSuccess("Product updated successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider text-[#380712]";

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#E9DFD2] bg-white px-4 py-3 text-sm font-medium text-[#380712] outline-none transition placeholder:text-stone-400 focus:border-[#9A6B35] focus:ring-2 focus:ring-[#D4AF69]/20";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#9A6B35]" size={32} />
        <p className="text-xs font-medium text-stone-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#380712] sm:text-3xl">
              {form.name || "Edit Product"}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {slug && (
              <Link
                href={`/products/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 shadow-xs transition hover:bg-stone-50"
              >
                <span>Live view</span>
                <ExternalLink size={12} className="text-stone-400" />
              </Link>
            )}

            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 shadow-xs transition hover:bg-stone-50"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span className="flex-1">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Core Details */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <div className="border-b border-stone-100 pb-4 mb-5">
              <h2 className="font-serif text-lg font-bold text-[#380712]">
                Product Details
              </h2>
              <p className="mt-0.5 text-xs text-stone-500">
                Primary title, collection assignment, and descriptions.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Product Title *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Vintage Banarasi Silk Saree"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Short Tagline / Subtitle</label>
                  <input
                    value={form.shortDescription}
                    onChange={(e) =>
                      updateField("shortDescription", e.target.value)
                    }
                    placeholder="e.g. Pure Zari Weave with Handloom Border"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Full Product Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the fabric, craft, occasion, and care instructions..."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>
          </section>

          {/* Card 2: Pricing */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <div className="border-b border-stone-100 pb-4 mb-5">
              <h2 className="font-serif text-lg font-bold text-[#380712]">
                Pricing &amp; Value
              </h2>
              <p className="mt-0.5 text-xs text-stone-500">
                Selling price and optional compare-at strikethrough rate.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Selling Price (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="3499"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Compare-at Price (₹, optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={(e) =>
                    updateField("compareAtPrice", e.target.value)
                  }
                  placeholder="4999 (shows as strikethrough)"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Card 3: Gallery Photography with Local Image Upload */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#380712]">
                  Gallery Images
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Upload photos from your computer or provide URLs. First image is the primary cover.
                </p>
              </div>
              <ImagePlus size={20} className="text-[#9A6B35]" />
            </div>

            <ImageUpload
              multiple
              value={images}
              onChange={(newImages) => setImages(newImages as string[])}
              label="Product Photography"
              helperText="Upload angles, close-ups, and fabric texture shots directly from your device."
            />
          </section>

          {/* Card 4: Variants & Inventory with Clean Clear Columns */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#380712]">
                  Variants &amp; Inventory
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Set available stock for sizes, colors, and SKUs.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF69]/40 bg-[#FAF3E8] px-3.5 py-1.5 text-xs font-semibold text-[#380712] transition hover:bg-[#D4AF69]"
              >
                <Plus size={14} />
                <span>Add Variant</span>
              </button>
            </div>

            {/* Variant Rows with Explicit Visible Labels */}
            <div className="space-y-3">
              {form.variants.map((variant, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-stone-200/90 bg-[#FAF7F2]/60 p-4 transition hover:border-[#D4AF69]"
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-9 lg:items-end">
                    <div className="lg:col-span-3">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 block mb-1">
                        SKU
                      </label>
                      <input
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(index, "sku", e.target.value)
                        }
                        placeholder="e.g. VBS-RED-M"
                        className="w-full rounded-xl border border-[#E9DFD2] bg-white px-3 py-2 text-xs font-semibold text-[#380712] outline-none transition focus:border-[#9A6B35]"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                          Size
                        </label>
                        <span className="text-[10px] text-stone-400">Quick pick</span>
                      </div>
                      <input
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(index, "size", e.target.value)
                        }
                        placeholder="e.g. Free Size, S, M, XL"
                        className="w-full rounded-xl border border-[#E9DFD2] bg-white px-3 py-2 text-xs font-semibold text-[#380712] outline-none transition focus:border-[#9A6B35]"
                      />
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {["Free Size", "S", "M", "L", "XL", "XXL", "36", "38"].map((sz) => {
                          const currentSizes = String(variant.size || "").split(",").map((s) => s.trim()).filter(Boolean);
                          const isPicked = currentSizes.includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                if (isPicked) {
                                  updateVariant(index, "size", currentSizes.filter((s) => s !== sz).join(", "));
                                } else {
                                  updateVariant(index, "size", currentSizes.length ? `${currentSizes.join(", ")}, ${sz}` : sz);
                                }
                              }}
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-medium transition ${
                                isPicked
                                  ? "border-[#380712] bg-[#380712] text-[#E6C47A]"
                                  : "border-stone-200 bg-white text-stone-600 hover:border-[#D4AF69] hover:bg-[#FAF7F2]"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 block mb-1">
                        Color
                      </label>
                      <input
                        value={variant.color}
                        onChange={(e) =>
                          updateVariant(index, "color", e.target.value)
                        }
                        placeholder="e.g. Royal Maroon"
                        className="w-full rounded-xl border border-[#E9DFD2] bg-white px-3 py-2 text-xs font-semibold text-[#380712] outline-none transition focus:border-[#9A6B35]"
                      />
                      {images.length > 0 && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
                          <span className="text-[10px] uppercase tracking-wider text-[#9A6B35]">Link Photo:</span>
                          <select
                            value={(variant as any).imageIndex ?? ""}
                            onChange={(e) => {
                              const imgIdx = e.target.value === "" ? undefined : Number(e.target.value);
                              updateVariant(index, "imageIndex" as any, imgIdx as any);
                            }}
                            className="rounded border border-[#E9DFD2] bg-white px-1.5 py-0.5 text-[11px] text-[#380712] outline-none"
                          >
                            <option value="">Default (Photo 1)</option>
                            {images.map((img, i) => (
                              <option key={img} value={i}>
                                Photo {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 block mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(index, "stock", Number(e.target.value))
                        }
                        placeholder="0"
                        className="w-full rounded-xl border border-[#E9DFD2] bg-white px-3 py-2 text-xs font-semibold text-[#380712] outline-none transition focus:border-[#9A6B35]"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={form.variants.length <= 1}
                        className="inline-flex h-9 w-full lg:w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none"
                        title="Remove variant"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Card 5: Storefront Display Options */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <div className="border-b border-stone-100 pb-4 mb-4">
              <h2 className="font-serif text-lg font-bold text-[#380712]">
                Visibility &amp; Curation
              </h2>
              <p className="mt-0.5 text-xs text-stone-500">
                Control active storefront status and homepage showcase placement.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-[#FAF7F2]/50 p-4 transition hover:bg-[#FAF3E8]/50">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-[#380712]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#380712] block">
                    Product Active in Store
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Customers can browse, add to bag, and purchase this product.
                  </span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-[#FAF7F2]/50 p-4 transition hover:bg-[#FAF3E8]/50">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    updateField("isFeatured", e.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded accent-[#380712]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#380712] block">
                    Featured Collection
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Showcase prominently on the boutique homepage banner.
                  </span>
                </div>
              </label>
            </div>
          </section>

          {/* Sticky Bottom Save Actions */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-lg backdrop-blur-md">
            <Link
              href="/admin/products"
              className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#380712] px-7 py-2.5 text-xs font-semibold text-[#F5DFC0] shadow-md transition hover:bg-[#520A1A] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin text-[#D4AF69]" />
              ) : (
                <Save size={15} />
              )}
              <span>{saving ? "Saving Changes..." : "Save Product Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
