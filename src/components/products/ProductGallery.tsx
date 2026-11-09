"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

interface ProductGalleryProps {
  name: string;
  images: string[];
  hasDiscount?: boolean;
  discount?: number;
  isFeatured?: boolean;
  isOutOfStock?: boolean;
}

export default function ProductGallery({
  name,
  images,
  hasDiscount = false,
  discount = 0,
  isFeatured = false,
  isOutOfStock = false,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const cleanImages = (images || []).filter(
    (img) => typeof img === "string" && img.trim().length > 0
  );
  const total = cleanImages.length;
  const currentImage = cleanImages[activeIndex] || "";

  // Listen to colour selection events from ProductPurchaseOptions
  useEffect(() => {
    function handleColorChange(event: Event) {
      const customEvent = event as CustomEvent<{ color: string; imageIndex?: number }>;
      const { color, imageIndex } = customEvent.detail || {};

      // 1. Direct photo index link from variant
      if (typeof imageIndex === "number" && imageIndex >= 0 && imageIndex < cleanImages.length) {
        setActiveIndex(imageIndex);
        return;
      }

      const selectedColor = (color || "").toLowerCase().trim();
      if (!selectedColor || cleanImages.length <= 1) return;

      // 2. Try matching by filename (e.g. "kids-green.jpg", "green_dress.png")
      const matchedByFilenameIndex = cleanImages.findIndex((url) => {
        const filename = url.toLowerCase().split("/").pop() || "";
        return (
          filename.includes(selectedColor) ||
          filename.includes(selectedColor.replace(/\s+/g, "-")) ||
          filename.includes(selectedColor.replace(/\s+/g, "_"))
        );
      });

      if (matchedByFilenameIndex >= 0) {
        setActiveIndex(matchedByFilenameIndex);
      }
    }

    window.addEventListener("product-color-selected", handleColorChange);
    return () => {
      window.removeEventListener("product-color-selected", handleColorChange);
    };
  }, [cleanImages]);

  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const pill =
    "rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]";

  return (
    <section className="min-w-0 lg:sticky lg:top-28 lg:self-start">
      {/* Main Image Container with Navigation Arrows */}
      <div className="group relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#380712] to-[#6D2636] shadow-[0_24px_60px_rgba(56,7,18,0.14)]">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={`${name} - photo ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition-all duration-500 ease-out ${isOutOfStock ? "opacity-75 grayscale-[25%]" : ""}`}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 px-8 text-center text-[#E6C47A]">
            <ShoppingBag size={52} strokeWidth={1.1} />
            <p className="text-xl font-semibold tracking-[-0.02em]">
              Mydhili Collections
            </p>
            <p className="text-sm font-light text-white/60">
              Product image coming soon
            </p>
          </div>
        )}

        {/* Badges (Out of Stock, Discount & Featured) */}
        <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
          {isOutOfStock && (
            <span className={`${pill} bg-rose-700 text-white font-bold tracking-wider shadow-md`}>
              Out of Stock
            </span>
          )}
          {hasDiscount && !isOutOfStock && (
            <span className={`${pill} bg-[#D4AF69] text-[#380712]`}>
              Save {discount}%
            </span>
          )}
          {isFeatured && !isOutOfStock && (
            <span className={`${pill} bg-white/90 text-[#380712] backdrop-blur-sm`}>
              Featured
            </span>
          )}
        </div>

        {/* Left Arrow Button */}
        {total > 1 && (
          <button
            type="button"
            onClick={prevImage}
            aria-label="Previous image"
            className="absolute left-3.5 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-[#D4AF69] hover:bg-[#380712] hover:text-[#E6C47A] active:scale-95"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        )}

        {/* Right Arrow Button */}
        {total > 1 && (
          <button
            type="button"
            onClick={nextImage}
            aria-label="Next image"
            className="absolute right-3.5 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-[#D4AF69] hover:bg-[#380712] hover:text-[#E6C47A] active:scale-95"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        )}

        {/* Indicator Pill at Bottom */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-[11px] font-medium tracking-wider text-white backdrop-blur-md">
            {activeIndex + 1} / {total}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {total > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cleanImages.map((image, index) => {
            const isSelected = activeIndex === index;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View photo ${index + 1}`}
                aria-pressed={isSelected}
                className={`group/thumb relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-[#380712] ring-2 ring-[#D4AF69] ring-offset-2 ring-offset-[#FAF7F2]"
                    : "border-transparent opacity-70 hover:border-[#D4AF69] hover:opacity-100"
                }`}
              >
                <Image
                  src={image}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
