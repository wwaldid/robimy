'use client';

import { useState } from 'react';
import { ProductVariant } from '@/types/product';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
}

export default function ProductVariantSelector({ variants }: ProductVariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    variants.length > 0 ? variants[0].color : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    variants.length > 0 ? variants[0].size : null
  );

  // Get unique colors
  const uniqueColors = Array.from(
    new Map(
      variants
        .filter((v) => v.color)
        .map((v) => [v.color, v])
    ).values()
  );

  // Get available sizes for selected color
  const availableSizes = Array.from(
    new Set(
      variants
        .filter((v) => !selectedColor || v.color === selectedColor)
        .map((v) => v.size)
        .filter((s): s is string => s !== null && s !== '')
    )
  );

  return (
    <>
      {/* Color Selection */}
      {uniqueColors.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            Wybierz kolor:
            {selectedColor && (
              <span className="ml-2 text-blue-600">{selectedColor}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((variant) => (
              <button
                key={variant.id}
                onClick={() => {
                  setSelectedColor(variant.color);
                  // Reset size if not available for this color
                  if (
                    selectedSize &&
                    !variants.some(
                      (v) => v.color === variant.color && v.size === selectedSize
                    )
                  ) {
                    setSelectedSize(null);
                  }
                }}
                className={`px-4 py-2 rounded-md border-2 transition-all flex items-center gap-2 ${
                  selectedColor === variant.color
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {variant.hexColor && (
                  <span
                    className="w-4 h-4 shrink-0 rounded-sm border-2 border-gray-400"
                    style={{
                      backgroundColor: `#${variant.hexColor}`,
                    }}
                  />
                )}
                {variant.color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            Wybierz rozmiar:
            {selectedSize && (
              <span className="ml-2 text-blue-600">{selectedSize}</span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-md border-2 transition-all ${
                  selectedSize === size
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden inputs for form submission if needed */}
      <input type="hidden" name="selectedColor" value={selectedColor || ''} />
      <input type="hidden" name="selectedSize" value={selectedSize || ''} />
    </>
  );
}
