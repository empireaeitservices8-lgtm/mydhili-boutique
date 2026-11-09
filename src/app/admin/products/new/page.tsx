"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

type Category = {
  _id: string;
  name: string;
};

type Variant = {
  sku: string;
  size: string;
  color: string;
  stock: string;
};

const initialForm = {
  name: "",
  shortDescription: "",
  description: "",
  category: "",
  price: "",
  compareAtPrice: "",
  isFeatured: false,
  isActive: true,
};

const initialVariants: Variant[] = [
  { sku: "", size: "Free Size", color: "Standard", stock: "10" },
];

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageInput, setImageInput] = useState("");

  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>(initialVariants);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`/api/admin/products?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load categories.");
        }

        setCategories(data.categories || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function clearAllFields() {
    setForm(initialForm);
    setImages([]);
    setImageInput("");
    setVariants([{ sku: "", size: "Free Size", color: "Standard", stock: "10" }]);
    setError("");
  }

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addImage() {
    const value = imageInput.trim();
    if (!value) return;

    if (value.startsWith("/")) {
      setImages((current) => [...current, value]);
      setImageInput("");
      setError("");
      return;
    }

    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Invalid URL");
      }
      setImages((current) => [...current, value]);
      setImageInput("");
      setError("");
    } catch {
      setError("Please enter a valid image URL (e.g. https://... or /products/image.jpg).");
    }
  }

  function updateVariant(
    index: number,
    field: keyof Variant,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      { sku: "", size: "Free Size", color: "Standard", stock: "10" },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
          images,
          variants: variants.map((variant) => ({
            ...variant,
            size: variant.size.trim() || "Free Size",
            color: variant.color.trim() || "Standard",
            stock: Number(variant.stock || 0),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create product.");
      }

      const savedProductName = data.product?.name || form.name || "Product";

      // 1. Clear every input box so they are completely blank for the next entry
      clearAllFields();

      // 2. Display success message
      setSuccess(`Product "${savedProductName}" saved successfully! All boxes have been cleared. Redirecting to product list...`);

      // 3. Refresh and redirect to the catalog list
      router.refresh();
      window.setTimeout(() => {
        router.push("/admin/products?saved=" + encodeURIComponent(data.product?._id || "true"));
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#E9DFD2] bg-white px-4 py-3 text-sm text-[#380712] outline-none transition placeholder:text-stone-400 focus:border-[#9A6B35] focus:ring-2 focus:ring-[#D4AF69]/20";

  const labelClass =
    "text-sm font-semibold text-[#380712]";

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#8B2635] transition hover:text-[#380712]"
        >
          <ArrowLeft size={16} />
          Back to boutique catalog
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <span className="h-px w-6 bg-[#A27B35]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9A6B35]">
              New Creation
            </p>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#380712] sm:text-4xl">
            Add Boutique Product
          </h1>
          <p className="mt-1 text-xs text-stone-500 sm:text-sm">
            Publish a new saree, kurti, ethnic attire or accessory to your Mydhili Collections store.
          </p>
        </div>

        {/* Success notification */}
        {success && (
          <div
            role="status"
            className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <CheckCircle2 size={22} className="shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-900">
                  {success}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  The product is now saved and available in your catalog. Redirecting to product list...
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                  >
                    View in Product List <ArrowRight size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSuccess("")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Add Another Product
                  </button>
                </div>
              </div>
            </div>
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

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Basic Info Card */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-xl font-bold text-[#380712]">
              Basic Information
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Provide product titles, category, and descriptive storytelling.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Product Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Royal Maroon Kanjivaram Silk Saree"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Short Description (Catalog subtitle)</label>
                <input
                  value={form.shortDescription}
                  onChange={(e) =>
                    updateField("shortDescription", e.target.value)
                  }
                  placeholder="e.g. Handwoven pure silk with authentic zari weave"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Full Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Describe the silhouette, fabric quality, weave heritage, occasion styling, and care guidance..."
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a boutique collection (optional)...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Pricing Card */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-xl font-bold text-[#380712]">
              Pricing &amp; Value
            </h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Enter customer retail price and optional strikethrough compare-at price.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                  onChange={(e) => updateField("compareAtPrice", e.target.value)}
                  placeholder="4999 (shows as strikethrough discount)"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Images Card */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#380712]">
                  Gallery Images
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Upload images from your computer or paste image links. First image becomes the primary cover.
                </p>
              </div>
              <ImagePlus size={22} className="text-[#9A6B35]" />
            </div>

            <ImageUpload
              multiple
              value={images}
              onChange={(newImages) => setImages(newImages as string[])}
              label="Product Photography"
              helperText="Upload angles, close-ups, and fabric texture shots directly from your device."
            />
          </section>

          {/* Variants Card */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#380712]">
                  Product Variants &amp; Inventory
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Configure sizes, colors, and stock quantities. SKU will be auto-generated if omitted.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF69] bg-[#FAF3E8] px-4 py-2 text-xs font-semibold text-[#380712] transition hover:bg-[#D4AF69]"
              >
                <Plus size={15} />
                Add Variant
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid gap-3.5 rounded-2xl border border-[#EDE4D9] bg-[#FCFAF7] p-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <div>
                    <label className={labelClass}>SKU (Optional)</label>
                    <input
                      value={variant.sku}
                      onChange={(e) =>
                        updateVariant(index, "sku", e.target.value)
                      }
                      placeholder="Auto-generated if empty"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Size</label>
                      <span className="text-[10px] text-stone-400">Quick pick:</span>
                    </div>
                    <input
                      value={variant.size}
                      onChange={(e) =>
                        updateVariant(index, "size", e.target.value)
                      }
                      placeholder="e.g. Free Size, S, M, L"
                      className={inputClass}
                    />
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {["Free Size", "S", "M", "L", "XL", "XXL", "36", "38"].map((sz) => {
                        const currentSizes = variant.size.split(",").map((s) => s.trim()).filter(Boolean);
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
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition ${
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

                  <div>
                    <label className={labelClass}>Colour</label>
                    <input
                      value={variant.color}
                      onChange={(e) =>
                        updateVariant(index, "color", e.target.value)
                      }
                      placeholder="e.g. Standard, Red, Green"
                      className={inputClass}
                    />
                    {images.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-stone-500">
                        <span className="text-[10px] uppercase tracking-wider text-[#9A6B35]">Link Photo:</span>
                        <select
                          value={(variant as any).imageIndex ?? ""}
                          onChange={(e) => {
                            const imgIdx = e.target.value === "" ? undefined : Number(e.target.value);
                            updateVariant(index, "imageIndex" as any, imgIdx as any);
                          }}
                          className="rounded border border-[#E9DFD2] bg-white px-2 py-0.5 text-xs text-[#380712] outline-none"
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

                  <div>
                    <label className={labelClass}>Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", e.target.value)
                      }
                      placeholder="10"
                      className={inputClass}
                    />
                  </div>

                  {variants.length > 1 && (
                    <div className="flex justify-end sm:col-span-2 lg:col-span-4">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 transition hover:text-red-800"
                      >
                        <Trash2 size={13} />
                        Remove this variant
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Visibility Card */}
          <section className="rounded-3xl border border-[#EDE4D9] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-xl font-bold text-[#380712]">
              Storefront Display Options
            </h2>

            <div className="mt-5 space-y-4">
              <label className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-[#EDE4D9] bg-[#FCFAF7] p-4 text-sm font-medium text-stone-700 transition hover:border-[#D4AF69]">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                  className="h-4 w-4 rounded accent-[#380712]"
                />
                <div>
                  <span className="font-semibold text-[#380712]">Active in Store</span>
                  <p className="text-xs text-stone-500">
                    Product is immediately discoverable, visible and purchasable by customers.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-[#EDE4D9] bg-[#FCFAF7] p-4 text-sm font-medium text-stone-700 transition hover:border-[#D4AF69]">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => updateField("isFeatured", e.target.checked)}
                  className="h-4 w-4 rounded accent-[#380712]"
                />
                <div>
                  <span className="font-semibold text-[#380712]">Featured Collection</span>
                  <p className="text-xs text-stone-500">
                    Showcase prominently on the Homepage featured spotlight carousel.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* Action CTAs */}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={clearAllFields}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E9DFD2] bg-white px-5 py-3 text-center text-sm font-semibold text-stone-600 transition hover:bg-[#FAF7F2]"
            >
              <RotateCcw size={15} />
              Clear All Boxes
            </button>

            <Link
              href="/admin/products"
              className="rounded-xl border border-[#E9DFD2] bg-white px-6 py-3 text-center text-sm font-semibold text-stone-600 transition hover:bg-[#FAF7F2]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#380712] px-8 py-3 text-sm font-semibold text-[#F5DFC0] shadow-md transition hover:bg-[#520A1A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#D4AF69]" />
                  Publishing product...
                </>
              ) : (
                "Publish Product to Store"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
