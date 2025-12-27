'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductFiltersProps {
  brands: string[];
  colors: string[];
  sizes: string[];
}

export default function ProductFilters({
  brands,
  colors,
  sizes,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brands')?.split(',').filter(Boolean) || []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('colors')?.split(',').filter(Boolean) || []
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get('sizes')?.split(',').filter(Boolean) || []
  );

  // Auto-apply filters when selections change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','));
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }, [selectedBrands, selectedColors, selectedSizes, router]);

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    startTransition(() => {
      router.push('?');
    });
  };

  const toggleSelection = (
    item: string,
    selected: string[],
    setSelected: (items: string[]) => void
  ) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const hasActiveFilters = selectedBrands.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-[#112D4E]">
          Filtry
          {isPending && (
            <div className="w-4 h-4 border-2 border-[#3F72AF] border-t-transparent rounded-full animate-spin" />
          )}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#3F72AF] hover:text-[#112D4E] underline disabled:opacity-50"
            disabled={isPending}
          >
            Wyczyść
          </button>
        )}
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Marki</label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() =>
                    toggleSelection(brand, selectedBrands, setSelectedBrands)
                  }
                  className="mr-2"
                  disabled={isPending}
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Kolory</label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {colors.map((color) => (
              <label key={color} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() =>
                    toggleSelection(color, selectedColors, setSelectedColors)
                  }
                  className="mr-2"
                  disabled={isPending}
                />
                <span className="text-sm">{color}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Rozmiary</label>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {sizes.map((size) => (
              <label key={size} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSelection(size, selectedSizes, setSelectedSizes)}
                  className="mr-2"
                  disabled={isPending}
                />
                <span className="text-sm">{size}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
