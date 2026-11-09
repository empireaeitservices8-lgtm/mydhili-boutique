"use client";

import { useMemo, useState } from "react";
import { ShoppingBag, Minus, Plus, Check, CircleAlert, CircleX } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductVariant {
  sku?: string;
  size?: string;
  color?: string;
  stock?: number;
}

interface ProductPurchaseOptionsProps {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  variants: ProductVariant[];
}

export default function ProductPurchaseOptions({
  productId,
  slug,
  name,
  image,
  price,
  variants,
}: ProductPurchaseOptionsProps) {
  const { addToCart, isLoaded } = useCart();

  const totalStock = useMemo(
    () => variants.reduce((sum, v) => sum + Number(v.stock ?? 0), 0),
    [variants]
  );
  const isTotalOutOfStock = variants.length > 0 && totalStock <= 0;

  // Include ALL sizes & colors so customers can see what exists
  const allSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter((s): s is string => Boolean(s)))],
    [variants]
  );

  const allColors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter((c): c is string => Boolean(c)))],
    [variants]
  );

  // Default to the first in-stock variant if available
  const defaultVariant = useMemo(() => {
    const inStock = variants.find((v) => Number(v.stock ?? 0) > 0);
    return inStock || variants[0];
  }, [variants]);

  const [selectedSize, setSelectedSize] = useState(defaultVariant?.size ?? "");
  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return undefined;

    return (
      variants.find(
        (variant) =>
          (variant.size ?? "") === selectedSize &&
          (variant.color ?? "") === selectedColor
      ) ||
      variants.find((variant) => (variant.size ?? "") === selectedSize) ||
      variants[0]
    );
  }, [variants, selectedSize, selectedColor]);

  const currentStock = variants.length
    ? Number(selectedVariant?.stock ?? 0)
    : undefined;

  const isCurrentVariantOutOfStock =
    variants.length > 0 && (currentStock === undefined || currentStock <= 0);

  function isSizeInStock(size: string) {
    return variants.some(
      (v) => (v.size ?? "") === size && Number(v.stock ?? 0) > 0
    );
  }

  function isColorInStock(color: string, size?: string) {
    if (size) {
      return variants.some(
        (v) =>
          (v.color ?? "") === color &&
          (v.size ?? "") === size &&
          Number(v.stock ?? 0) > 0
      );
    }
    return variants.some(
      (v) => (v.color ?? "") === color && Number(v.stock ?? 0) > 0
    );
  }

  const canAdd =
    isLoaded &&
    !isTotalOutOfStock &&
    !isCurrentVariantOutOfStock &&
    (variants.length === 0 || Boolean(selectedVariant)) &&
    (currentStock === undefined || currentStock > 0);

  function handleAddToCart() {
    if (!canAdd) return;

    addToCart({
      productId,
      slug,
      name,
      image,
      price,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      stock: currentStock,
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  function changeSize(size: string) {
    setSelectedSize(size);

    const matchingVariants = variants.filter(
      (variant) => (variant.size ?? "") === size
    );

    const inStockMatch = matchingVariants.find(
      (v) => (v.color ?? "") === selectedColor && Number(v.stock ?? 0) > 0
    );

    if (!inStockMatch) {
      const firstInStock = matchingVariants.find(
        (v) => Number(v.stock ?? 0) > 0
      );
      if (firstInStock) {
        setSelectedColor(firstInStock.color ?? "");
      } else if (matchingVariants[0]) {
        setSelectedColor(matchingVariants[0].color ?? "");
      }
    }

    setQuantity(1);
  }

  function changeColor(color: string) {
    setSelectedColor(color);

    const matchingVariants = variants.filter(
      (variant) => (variant.color ?? "") === color
    );

    const targetVariant = matchingVariants[0];

    // Notify gallery to switch photo if a matching image is found
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("product-color-selected", {
          detail: {
            color,
            imageIndex: (targetVariant as any)?.imageIndex,
          },
        })
      );
    }

    const inStockMatch = matchingVariants.find(
      (v) => (v.size ?? "") === selectedSize && Number(v.stock ?? 0) > 0
    );

    if (!inStockMatch) {
      const firstInStock = matchingVariants.find(
        (v) => Number(v.stock ?? 0) > 0
      );
      if (firstInStock) {
        setSelectedSize(firstInStock.size ?? "");
      } else if (matchingVariants[0]) {
        setSelectedSize(matchingVariants[0].size ?? "");
      }
    }

    setQuantity(1);
  }

  const maxQuantity = currentStock ?? 99;

  return (
    <div className="mt-8 space-y-7">
      {/* Size selection */}
      {allSizes.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#380712]">Select size</h2>
            <span className="text-xs font-medium text-neutral-500">
              {selectedSize || "Choose a size"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {allSizes.map((size) => {
              const isSelected = selectedSize === size;
              const inStock = isSizeInStock(size);

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => changeSize(size)}
                  className={`group relative min-w-14 rounded-lg border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                    isSelected
                      ? inStock
                        ? "border-[#380712] bg-[#380712] text-white shadow-sm"
                        : "border-rose-600 bg-rose-600 text-white shadow-sm"
                      : inStock
                      ? "border-[#D8C9B7] bg-white text-[#380712] hover:border-[#9A6B35] hover:bg-[#FAF7F2]"
                      : "border-rose-200 bg-rose-50/60 text-stone-400 hover:border-rose-300"
                  }`}
                  aria-pressed={isSelected}
                  title={inStock ? `${size} (In stock)` : `${size} (Out of stock)`}
                >
                  <span className={!inStock ? "line-through opacity-75" : ""}>
                    {size}
                  </span>
                  {!inStock && (
                    <span className="ml-1.5 text-[9px] font-bold text-rose-600 no-underline">
                      (Sold out)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colour selection */}
      {allColors.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#380712]">Select colour</h2>
            <span className="text-xs font-medium text-neutral-500">
              {selectedColor || "Choose a colour"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {allColors.map((color) => {
              const isSelected = selectedColor === color;
              const inStock = isColorInStock(color, selectedSize);

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => changeColor(color)}
                  className={`rounded-lg border px-4 py-2.5 text-xs font-medium transition ${
                    isSelected
                      ? inStock
                        ? "border-[#380712] bg-[#380712] text-white shadow-sm"
                        : "border-rose-600 bg-rose-600 text-white shadow-sm"
                      : inStock
                      ? "border-[#D8C9B7] bg-white text-[#380712] hover:border-[#9A6B35] hover:bg-[#FAF7F2]"
                      : "border-stone-200 bg-stone-100 text-stone-400 line-through"
                  }`}
                  aria-pressed={isSelected}
                  title={inStock ? `${color} (In stock)` : `${color} (Out of stock)`}
                >
                  {color}
                  {!inStock && (
                    <span className="ml-1 text-[10px] text-rose-500 opacity-80">(Sold out)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock status indicator */}
      <div>
        {variants.length === 0 ? (
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Available for purchase
          </p>
        ) : isTotalOutOfStock ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <p className="flex items-center gap-2 text-sm font-bold text-rose-700">
              <CircleAlert size={17} /> Currently Out of Stock
            </p>
            <p className="mt-1 text-xs font-light leading-5 text-rose-600">
              All sizes and colors of this piece are currently sold out. We will restock soon!
            </p>
          </div>
        ) : isCurrentVariantOutOfStock ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800">
            <p className="flex items-center gap-2 text-sm font-bold text-rose-700">
              <CircleX size={16} />
              {selectedSize ? `Size ${selectedSize}` : "This option"} is Out of Stock
            </p>
            <p className="mt-0.5 text-xs text-rose-600">
              Please choose another available size or colour above.
            </p>
          </div>
        ) : currentStock !== undefined && currentStock > 0 ? (
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            {currentStock <= 5 ? (
              <span className="font-semibold text-amber-700">
                Only {currentStock} left in stock - order soon
              </span>
            ) : (
              <span>{currentStock} in stock and ready to dispatch</span>
            )}
          </p>
        ) : (
          <p className="text-sm font-medium text-rose-700">
            This combination is currently unavailable
          </p>
        )}
      </div>

      {/* Quantity - only shown when in stock */}
      {!isTotalOutOfStock && !isCurrentVariantOutOfStock && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[#380712]">Quantity</h2>

          <div className="inline-flex h-12 items-center rounded-lg border border-[#D8C9B7] bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="flex h-full w-12 items-center justify-center text-[#380712] transition hover:bg-[#FAF7F2] disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>

            <span className="min-w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>

            <button
              type="button"
              onClick={() =>
                setQuantity((q) => Math.min(maxQuantity, q + 1))
              }
              disabled={quantity >= maxQuantity}
              className="flex h-full w-12 items-center justify-center text-[#380712] transition hover:bg-[#FAF7F2] disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Add to cart / Out of stock button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canAdd}
        className={`flex min-h-14 w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-sm font-bold uppercase tracking-[0.15em] transition ${
          isTotalOutOfStock || isCurrentVariantOutOfStock
            ? "cursor-not-allowed border border-stone-200 bg-stone-200 text-stone-500 shadow-none"
            : "bg-[#380712] text-white shadow-md hover:bg-[#520D1D] active:scale-[0.99]"
        }`}
      >
        {isTotalOutOfStock || isCurrentVariantOutOfStock ? (
          <>
            <CircleAlert className="h-5 w-5 text-stone-400" />
            Out of Stock
          </>
        ) : added ? (
          <>
            <Check className="h-5 w-5" />
            Added to shopping bag
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            Add to shopping bag
          </>
        )}
      </button>
    </div>
  );
}
