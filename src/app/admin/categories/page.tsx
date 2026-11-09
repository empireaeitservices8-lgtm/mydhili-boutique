"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Folder,
  Loader2,
  Pencil,
  Plus,
  Search,
  X,
  ImageIcon,
  ExternalLink,
  Trash2,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  image: "",
  isActive: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleDeleteCategory(category: Category) {
    const catId = category._id;
    if (!catId) return;

    if (
      !window.confirm(
        `Are you sure you want to delete "${category.name}"? This action cannot be reversed.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(catId);
      setError("");

      const response = await fetch(
        `/api/admin/categories?id=${encodeURIComponent(catId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete category.");
      }

      setCategories((prev) => prev.filter((c) => c._id !== catId));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unable to delete category.";
      setError(msg);
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  }

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load categories.");
      }

      setCategories(data.categories || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(category: Category) {
    setEditingId(category._id);
    setForm({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive,
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const url = "/api/admin/categories";
      const method = editingId ? "PUT" : "POST";

      const payload = editingId ? { ...form, id: editingId } : form;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        throw new Error(`Server returned HTTP ${response.status} ${response.statusText}`);
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to save category.");
      }

      setSuccess(
        editingId
          ? "Category updated successfully."
          : "Category created successfully."
      );

      closeForm();
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(category: Category) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: category._id,
          isActive: !category.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update category status.");
      }

      setSuccess(
        `${category.name} ${
          !category.isActive ? "activated" : "deactivated"
        } successfully.`
      );

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update status."
      );
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = categories.filter((category) => category.isActive).length;
  const inactiveCount = categories.length - activeCount;

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-[#A27B35]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9A6B35]">
                Curated Collections
              </p>
            </div>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#380712] sm:text-4xl">
              Store Categories
            </h1>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              Organise your boutique products into sarees, kurtis, dresses, and festive edits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF69]/40 bg-white px-4 py-2.5 text-xs font-semibold text-[#380712] shadow-sm transition hover:bg-[#FAF3E8]"
            >
              <ExternalLink size={14} className="text-[#9A6B35]" />
              Shop Collections
            </Link>

            <button
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#380712] px-5 py-2.5 text-xs font-semibold text-[#F5DFC0] shadow-md transition hover:bg-[#520A1A]"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9A6B35]">
              Total Categories
            </p>
            <p className="mt-2 font-serif text-3xl font-bold text-[#380712]">
              {categories.length}
            </p>
            <p className="mt-1 text-xs text-stone-400">Available across catalog</p>
          </div>

          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Active in Navigation
            </p>
            <p className="mt-2 font-serif text-3xl font-bold text-emerald-700">
              {activeCount}
            </p>
            <p className="mt-1 text-xs text-stone-400">Visible on storefront</p>
          </div>

          <div className="rounded-2xl border border-[#EDE4D9] bg-white p-5 shadow-sm transition hover:border-[#D4AF69]">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Hidden / Draft
            </p>
            <p className="mt-2 font-serif text-3xl font-bold text-stone-600">
              {inactiveCount}
            </p>
            <p className="mt-1 text-xs text-stone-400">Archived collections</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-2xl border border-[#EDE4D9] bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name..."
            className="w-full text-sm text-[#380712] outline-none placeholder:text-stone-400"
          />
        </div>

        {error && !showForm && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && !showForm && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Categories Table */}
        <section className="overflow-hidden rounded-3xl border border-[#EDE4D9] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#EEE7DE] px-6 py-4">
            <h2 className="font-serif text-lg font-bold text-[#380712]">
              Categories Registry
            </h2>
            <span className="text-xs text-stone-400">
              {filteredCategories.length} items
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#9A6B35]" size={24} />
              <span className="text-sm text-stone-500">Loading categories...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Folder className="mx-auto text-[#C6AD8A]" size={40} />
              <h3 className="mt-4 font-serif text-xl font-bold text-[#380712]">
                No categories found
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                Create your first category to organise your boutique products.
              </p>
              <button
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#380712] px-5 py-2.5 text-xs font-semibold text-[#F5DFC0]"
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#EEE7DE] bg-[#FCFAF7] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A6B35]">
                    <th className="px-6 py-4">Category</th>
                    <th className="px-5 py-4">Route Slug</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F2ECE4]">
                  {filteredCategories.map((category) => (
                    <tr key={category._id} className="transition hover:bg-[#FAF7F2]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E9DFD2] bg-[#FAF7F2]">
                            {category.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="text-[#9A6B35]" size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-serif text-sm font-bold text-[#380712]">
                              {category.name}
                            </p>
                            <p className="mt-0.5 max-w-xs truncate text-xs text-stone-400">
                              {category.description || "No description provided"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-stone-500">
                        /{category.slug}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            category.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {category.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(category)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF69]/40 bg-[#FAF3E8] px-3.5 py-1.5 text-xs font-semibold text-[#380712] transition hover:bg-[#D4AF69]"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          <button
                            onClick={() => toggleStatus(category)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                              category.isActive
                                ? "border border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100/80"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {category.isActive ? "Hide" : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={deletingId === category._id}
                            aria-label={`Delete ${category.name}`}
                            className="inline-flex items-center rounded-xl border border-red-200 bg-white p-2 text-red-600 shadow-sm transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal for Add / Edit Category */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 sm:p-6 backdrop-blur-xs">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#E9DFD2] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-[#EEE7DE] px-6 py-5 sm:px-8">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9A6B35]">
                  Category Form
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[#380712]">
                  {editingId ? "Edit Category" : "Add New Category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body & Sticky Footer */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 sm:px-8">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#380712]">
                    Category Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Sarees, Kurtis, Ethnic Gowns"
                    className="w-full rounded-xl border border-[#E9DFD2] px-4 py-2.5 text-sm outline-none transition focus:border-[#9A6B35] focus:ring-2 focus:ring-[#D4AF69]/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#380712]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Short note about the collection..."
                    className="w-full rounded-xl border border-[#E9DFD2] px-4 py-2.5 text-sm outline-none transition focus:border-[#9A6B35] focus:ring-2 focus:ring-[#D4AF69]/20"
                  />
                </div>

                <div>
                  <ImageUpload
                    value={form.image}
                    onChange={(img) =>
                      setForm({ ...form, image: (img as string) || "" })
                    }
                    label="Category Cover Image"
                    helperText="Upload a featured banner image for this collection from your computer or link."
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E9DFD2] bg-[#FCFAF7] p-3 text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-[#380712]"
                  />
                  Active (Displayed on storefront category navigation)
                </label>
              </div>

              {/* Sticky Submit Footer */}
              <div className="flex shrink-0 justify-end gap-3 border-t border-[#EEE7DE] bg-[#FCFAF7] px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-[#E9DFD2] bg-white px-5 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#380712] px-6 py-2.5 text-xs font-semibold text-[#F5DFC0] shadow-md transition hover:bg-[#520A1A] disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin text-[#D4AF69]" />}
                  {saving ? "Saving..." : editingId ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
