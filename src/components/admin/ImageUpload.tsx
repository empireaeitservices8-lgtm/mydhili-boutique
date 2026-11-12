"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import {
  UploadCloud,
  ImagePlus,
  Trash2,
  Link2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";

interface ImageUploadProps {
  label?: string;
  helperText?: string;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export default function ImageUpload({
  label = "Upload Image",
  helperText = "Drag & drop or browse image files from your computer (PNG, JPG, WebP, SVG up to 15MB)",
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Normalize current images to an array
  const currentImages: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : value
    ? [value]
    : [];

  async function handleFileUpload(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (fileArray.length === 0) {
      setError("Please select valid image files (JPG, PNG, WebP, etc.).");
      return;
    }

    if (!multiple && fileArray.length > 1) {
      setError("Only single image upload is supported here.");
      return;
    }

    if (multiple && currentImages.length + fileArray.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload file(s).");
      }

      if (multiple) {
        const newUrls = (data.urls as string[]) || [data.url];
        onChange([...currentImages, ...newUrls]);
      } else {
        onChange(data.url || (data.urls && data.urls[0]) || "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  }

  function normalizeImageUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim().replace(/^["']+|["']+$/g, "");
    if (!trimmed) return "";

    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const parsed = new URL(trimmed);

        const embeddedUrl =
          parsed.searchParams.get("imgurl") ||
          parsed.searchParams.get("mediaurl");
        if (embeddedUrl && /^https?:\/\//i.test(embeddedUrl)) {
          return embeddedUrl;
        }

        if (parsed.hostname.includes("drive.google.com")) {
          const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
          const fileId = match?.[1] || parsed.searchParams.get("id");
          if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
          }
        }
      }
    } catch {
      // Keep original trimmed string if URL parsing fails
    }

    return trimmed;
  }

  function handleAddUrl() {
    const normalized = normalizeImageUrl(urlInput);
    if (!normalized) return;

    if (multiple) {
      if (!currentImages.includes(normalized)) {
        onChange([...currentImages, normalized]);
      }
    } else {
      onChange(normalized);
    }

    setUrlInput("");
    setShowUrlInput(false);
  }

  function handleRemove(indexToRemove: number) {
    if (multiple) {
      const updated = currentImages.filter((_, i) => i !== indexToRemove);
      onChange(updated);
    } else {
      onChange("");
    }
  }

  return (
    <div className="space-y-3">
      {/* Label and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          {label && (
            <label className="block text-xs font-semibold text-[#380712]">
              {label}
            </label>
          )}
          {helperText && (
            <p className="mt-0.5 text-[11px] text-stone-500">{helperText}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF69]/40 bg-[#FAF3E8] px-2.5 py-1 text-[11px] font-semibold text-[#380712] transition hover:bg-[#D4AF69]"
        >
          <Link2 size={12} />
          {showUrlInput ? "Hide URL input" : "Or paste image link"}
        </button>
      </div>

      {/* Manual URL Input Option */}
      {showUrlInput && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#D4AF69]/30 bg-[#FCFAF7] p-2.5">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={() => {
              if (urlInput.trim()) {
                handleAddUrl();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            placeholder="Paste public image link (e.g. https://... or /logo/logo.png)"
            className="flex-1 rounded-xl border border-[#E9DFD2] bg-white px-3.5 py-2 text-xs text-[#380712] placeholder:text-stone-400 outline-none focus:border-[#9A6B35]"
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleAddUrl}
            className="rounded-xl bg-[#380712] px-4 py-2 text-xs font-semibold text-[#F5DFC0] transition hover:bg-[#520A1A]"
          >
            Apply
          </button>
        </div>
      )}

      {/* Single image uploaded state */}
      {!multiple && currentImages.length > 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-[#E9DFD2] bg-white p-3 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E9DFD2] bg-[#FAF7F2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImages[0]}
                alt="Selected preview"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                <span>Image uploaded</span>
              </div>
              <p
                className="mt-0.5 truncate text-[11px] text-stone-500"
                title={currentImages[0]}
              >
                {currentImages[0].startsWith("/uploads/")
                  ? currentImages[0].replace("/uploads/", "")
                  : currentImages[0]}
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  <UploadCloud size={12} />
                  Change
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(currentImages[0])}
                  className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  <Eye size={12} />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(0)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
            isDragging
              ? "border-[#9A6B35] bg-[#FAF3E8]/80 scale-[1.01]"
              : "border-[#D4AF69]/40 bg-[#FAF7F2]/60 hover:border-[#9A6B35] hover:bg-[#FAF3E8]/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-[#E9DFD2]">
            {uploading ? (
              <Loader2 size={24} className="animate-spin text-[#9A6B35]" />
            ) : (
              <UploadCloud size={24} className="text-[#8B2635]" />
            )}
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold text-[#380712]">
              {uploading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span>
                  <span className="text-[#8B2635] underline decoration-[#D4AF69] underline-offset-4">
                    Click to upload
                  </span>{" "}
                  or drag and drop files here
                </span>
              )}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">
              PNG, JPG, WebP, SVG up to 15MB
              {multiple ? ` · Up to ${maxFiles} images` : " · Single image"}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto rounded-md p-1 hover:bg-red-100"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Multiple Images Preview Section */}
      {multiple && currentImages.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              {multiple
                ? `Uploaded Images (${currentImages.length})`
                : "Active Image Preview"}
            </span>
            {multiple && currentImages.length > 1 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] font-medium text-red-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div
            className={`grid gap-3 ${
              multiple
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                : "grid-cols-1 sm:max-w-xs"
            }`}
          >
            {currentImages.map((imgUrl, idx) => (
              <div
                key={`${imgUrl}-${idx}`}
                className="group relative overflow-hidden rounded-2xl border border-[#E9DFD2] bg-white p-1.5 shadow-xs transition hover:border-[#D4AF69] hover:shadow-md"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FAF7F2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Uploaded thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition duration-200 group-hover:opacity-100 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModalUrl(imgUrl);
                      }}
                      title="View full preview"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-700 shadow-md transition hover:bg-[#FAF3E8]"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(idx);
                      }}
                      title="Delete image"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-md transition hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-1.5 flex items-center justify-between px-1">
                  <p
                    className="max-w-[120px] truncate text-[10px] text-stone-500"
                    title={imgUrl}
                  >
                    {imgUrl.startsWith("/uploads/")
                      ? imgUrl.replace("/uploads/", "")
                      : imgUrl}
                  </p>
                  <span className="flex items-center text-[10px] text-emerald-600 font-medium">
                    <CheckCircle2 size={11} className="mr-0.5" />
                    Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox / Full Preview Modal */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl border border-[#D4AF69]/40 bg-white p-3 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black"
            >
              <X size={18} />
            </button>
            <div className="relative aspect-square max-h-[80vh] w-full overflow-hidden rounded-2xl bg-[#FAF7F2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalUrl}
                alt="Enlarged preview"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-3 flex items-center justify-between px-2 text-xs text-stone-600">
              <span className="font-mono text-[11px] truncate max-w-md">
                {previewModalUrl}
              </span>
              <a
                href={previewModalUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#8B2635] hover:underline"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
